import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get('role') || ''; // 'PATIENT', 'DOCTOR', 'ADMIN' or empty

    let usersQuery = `
      SELECT u.id, u.email, u.full_name, u.role, u.created_at,
             p.phone as patient_phone, p.gender as patient_gender, p.blood_group as patient_blood,
             d.specialization as doctor_spec, d.room_number as doctor_room
      FROM users u
      LEFT JOIN patients p ON u.id = p.id
      LEFT JOIN doctors d ON u.id = d.id
    `;

    const params = [];
    if (roleFilter) {
      usersQuery += ' WHERE u.role = $1';
      params.push(roleFilter.toUpperCase());
    }

    usersQuery += ' ORDER BY u.created_at DESC';

    const users = await query(usersQuery, params);
    return NextResponse.json(users);

  } catch (error: any) {
    console.error('Error in admin users GET:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email, password, fullName, role, phone, gender, dateOfBirth, bloodGroup, specialization, roomNumber, bio } = await request.json();

    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ error: 'All primary fields are required' }, { status: 400 });
    }

    // 1. Register user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          role: role.toUpperCase()
        }
      }
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || 'Registration failed' },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    // 2. Insert into public.users table with a placeholder password_hash
    const dummyPasswordHash = await bcrypt.hash('SUPABASE_AUTH_USER', 10);
    await query(
      'INSERT INTO users (id, email, password_hash, full_name, role) VALUES ($1, $2, $3, $4, $5)',
      [userId, email.toLowerCase().trim(), dummyPasswordHash, fullName.trim(), role.toUpperCase()]
    );

    // Insert role-specific profile
    if (role.toUpperCase() === 'PATIENT') {
      await query(
        `INSERT INTO patients (id, phone, gender, date_of_birth, blood_group)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, phone || null, gender || null, dateOfBirth || null, bloodGroup || null]
      );
    } else if (role.toUpperCase() === 'DOCTOR') {
      await query(
        `INSERT INTO doctors (id, phone, specialization, bio, room_number, availability)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          phone || null,
          specialization || null,
          bio || null,
          roomNumber || null,
          JSON.stringify({ working_hours: '09:00 AM - 05:00 PM', slots: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'] })
        ]
      );
    } else if (role.toUpperCase() === 'ADMIN') {
      await query('INSERT INTO admins (id, phone) VALUES ($1, $2)', [userId, phone || null]);
    }

    return NextResponse.json({ success: true, message: 'User created successfully', id: userId });

  } catch (error: any) {
    console.error('Error in admin users POST:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await query('DELETE FROM users WHERE id = $1', [userId]);
    return NextResponse.json({ success: true, message: 'User deleted successfully' });

  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
