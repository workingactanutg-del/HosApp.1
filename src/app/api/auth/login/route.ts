import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-hosapp-jwt';

export async function POST(request: Request) {
  try {
    const { email, password, role } = await request.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password and role are required' },
        { status: 400 }
      );
    }

    // 1. Attempt Supabase Auth login first
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (!authError && authData?.user && authData?.session) {
        // Fetch user details & role from public.users
        const users = await query(
          'SELECT id, email, full_name, role FROM users WHERE id = $1',
          [authData.user.id]
        );

        if (users.length > 0) {
          const user = users[0];
          if (user.role.toUpperCase() === role.toUpperCase().trim()) {
            return NextResponse.json({
              message: 'Login successful',
              token: authData.session.access_token,
              user: {
                id: user.id,
                email: user.email,
                name: user.full_name,
                role: user.role.toLowerCase()
              }
            });
          } else {
            await supabase.auth.signOut();
          }
        }
      }
    } catch (err) {
      console.log('Supabase login failed, trying fallback...');
    }

    // 2. Fallback: Authenticate against public.users table using bcrypt
    // This allows existing demo accounts to log in without hitting Supabase rate limits
    const dbUsers = await query(
      'SELECT id, email, password_hash, full_name, role FROM users WHERE email = $1 AND role = $2',
      [email.toLowerCase().trim(), role.toUpperCase().trim()]
    );

    if (dbUsers.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = dbUsers[0];

    // Validate password hash
    const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate custom JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.full_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      message: 'Login successful (Demo Mode)',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        role: user.role.toLowerCase()
      }
    });

  } catch (error: any) {
    console.error('Error during login API:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
