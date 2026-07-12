import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, password, role } = await request.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password and role are required' },
        { status: 400 }
      );
    }

    // 1. Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (authError || !authData.user || !authData.session) {
      return NextResponse.json(
        { error: authError?.message || 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 2. Fetch user details & role from public.users
    const users = await query(
      'SELECT id, email, full_name, role FROM users WHERE id = $1',
      [authData.user.id]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User record not found in database' },
        { status: 404 }
      );
    }

    const user = users[0];

    // 3. Verify role matches the login attempt
    if (user.role.toUpperCase() !== role.toUpperCase().trim()) {
      // Sign out since the role is incorrect
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: `You do not have access as a ${role}` },
        { status: 403 }
      );
    }

    // 4. Return success with the Supabase access token
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

  } catch (error: any) {
    console.error('Error during login API:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
