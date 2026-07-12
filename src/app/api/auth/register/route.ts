import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const {
      email,
      password,
      fullName,
      phone,
      gender,
      dateOfBirth,
      bloodGroup,
      emergencyContact,
      insuranceProvider,
      insurancePolicyNumber
    } = await request.json();

    // 1. Basic validation
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password and full name are required' },
        { status: 400 }
      );
    }

    // 2. Register user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          role: 'PATIENT'
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

    // 3. Insert into public.users table with a placeholder password_hash
    const dummyPasswordHash = await bcrypt.hash('SUPABASE_AUTH_USER', 10);
    await query(
      'INSERT INTO users (id, email, password_hash, full_name, role) VALUES ($1, $2, $3, $4, $5)',
      [userId, email.toLowerCase().trim(), dummyPasswordHash, fullName.trim(), 'PATIENT']
    );

    // 4. Insert details into patients table
    await query(
      `INSERT INTO patients (id, phone, gender, date_of_birth, blood_group, emergency_contact, insurance_provider, insurance_policy_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId,
        phone || null,
        gender || null,
        dateOfBirth || null,
        bloodGroup || null,
        emergencyContact || null,
        insuranceProvider || null,
        insurancePolicyNumber || null
      ]
    );

    // 5. Send automatic confirmation notification to patient
    await query(
      'INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)',
      [userId, 'Welcome to HOSAPP', `Hi ${fullName}, welcome to HOSAPP! You can now book appointments and access medical records.`]
    );

    return NextResponse.json({
      success: true,
      message: 'Registration successful'
    });

  } catch (error: any) {
    console.error('Error during register API:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
