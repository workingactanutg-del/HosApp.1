import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const demoUsers = [
      { email: 'admin@hosapp.com', password: 'admin123', role: 'ADMIN' },
      { email: 'doctor@hosapp.com', password: 'doctor123', role: 'DOCTOR' },
      { email: 'patient@hosapp.com', password: 'patient123', role: 'PATIENT' },
      { email: 'chen@hosapp.com', password: 'doctor123', role: 'DOCTOR' },
      { email: 'miller@hosapp.com', password: 'doctor123', role: 'DOCTOR' },
      { email: 'taylor@hosapp.com', password: 'doctor123', role: 'DOCTOR' },
      { email: 'carter@hosapp.com', password: 'doctor123', role: 'DOCTOR' },
      { email: 'wang@hosapp.com', password: 'doctor123', role: 'DOCTOR' },
      { email: 'amara@hosapp.com', password: 'patient123', role: 'PATIENT' },
      { email: 'benjamin@hosapp.com', password: 'patient123', role: 'PATIENT' },
      { email: 'lisa.wong@hosapp.com', password: 'patient123', role: 'PATIENT' },
      { email: 'patien1t@hosapp.com', password: 'patient123', role: 'PATIENT' },
      { email: 'malipart04@gmail.com', password: 'patient123', role: 'PATIENT' },
    ];

    const results: string[] = [];

    for (const u of demoUsers) {
      // 1. Get current user from db
      const dbUsers = await query(
        'SELECT id, email, full_name, role FROM users WHERE email = $1',
        [u.email.toLowerCase().trim()]
      );

      if (dbUsers.length === 0) {
        results.push(`User ${u.email} not found in database, skipping.`);
        continue;
      }

      const dbUser = dbUsers[0];
      const oldId = dbUser.id;
      let newId = '';

      // 2. Register in Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: u.email.toLowerCase().trim(),
        password: u.password,
        options: {
          data: {
            role: u.role,
            full_name: dbUser.full_name
          }
        }
      });

      if (signUpError) {
        // If already registered, login to fetch the correct user ID
        if (signUpError.message.includes('already registered') || signUpError.message.includes('already exists')) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: u.email.toLowerCase().trim(),
            password: u.password
          });
          if (signInError || !signInData.user) {
            results.push(`Sign in failed for existing user ${u.email}: ${signInError?.message || 'Unknown error'}`);
            continue;
          }
          newId = signInData.user.id;
        } else {
          results.push(`Sign up failed for ${u.email}: ${signUpError.message}`);
          continue;
        }
      } else if (signUpData.user) {
        newId = signUpData.user.id;
      }

      if (!newId) {
        results.push(`Could not resolve ID for ${u.email}`);
        continue;
      }

      if (newId === oldId) {
        results.push(`User ${u.email} already has matching ID ${newId}`);
        continue;
      }

      // 3. Update database IDs in transaction
      try {
        await query('ALTER TABLE patients DISABLE TRIGGER ALL');
        await query('ALTER TABLE doctors DISABLE TRIGGER ALL');
        await query('ALTER TABLE admins DISABLE TRIGGER ALL');
        await query('ALTER TABLE appointments DISABLE TRIGGER ALL');
        await query('ALTER TABLE medical_records DISABLE TRIGGER ALL');
        await query('ALTER TABLE prescriptions DISABLE TRIGGER ALL');
        await query('ALTER TABLE reports DISABLE TRIGGER ALL');
        await query('ALTER TABLE notifications DISABLE TRIGGER ALL');
        await query('ALTER TABLE pill_reminders DISABLE TRIGGER ALL');
        await query('ALTER TABLE blood_requests DISABLE TRIGGER ALL');
        await query('ALTER TABLE users DISABLE TRIGGER ALL');

        await query('UPDATE users SET id = $1 WHERE id = $2', [newId, oldId]);
        await query('UPDATE patients SET id = $1 WHERE id = $2', [newId, oldId]);
        await query('UPDATE doctors SET id = $1 WHERE id = $2', [newId, oldId]);
        await query('UPDATE admins SET id = $1 WHERE id = $2', [newId, oldId]);
        await query('UPDATE appointments SET patient_id = $1 WHERE patient_id = $2', [newId, oldId]);
        await query('UPDATE appointments SET doctor_id = $1 WHERE doctor_id = $2', [newId, oldId]);
        await query('UPDATE medical_records SET patient_id = $1 WHERE patient_id = $2', [newId, oldId]);
        await query('UPDATE medical_records SET doctor_id = $1 WHERE doctor_id = $2', [newId, oldId]);
        await query('UPDATE prescriptions SET patient_id = $1 WHERE patient_id = $2', [newId, oldId]);
        await query('UPDATE prescriptions SET doctor_id = $1 WHERE doctor_id = $2', [newId, oldId]);
        await query('UPDATE reports SET patient_id = $1 WHERE patient_id = $2', [newId, oldId]);
        await query('UPDATE notifications SET user_id = $1 WHERE user_id = $2', [newId, oldId]);
        await query('UPDATE pill_reminders SET patient_id = $1 WHERE patient_id = $2', [newId, oldId]);
        await query('UPDATE blood_requests SET patient_id = $1 WHERE patient_id = $2', [newId, oldId]);

        await query('ALTER TABLE patients ENABLE TRIGGER ALL');
        await query('ALTER TABLE doctors ENABLE TRIGGER ALL');
        await query('ALTER TABLE admins ENABLE TRIGGER ALL');
        await query('ALTER TABLE appointments ENABLE TRIGGER ALL');
        await query('ALTER TABLE medical_records ENABLE TRIGGER ALL');
        await query('ALTER TABLE prescriptions ENABLE TRIGGER ALL');
        await query('ALTER TABLE reports ENABLE TRIGGER ALL');
        await query('ALTER TABLE notifications ENABLE TRIGGER ALL');
        await query('ALTER TABLE pill_reminders ENABLE TRIGGER ALL');
        await query('ALTER TABLE blood_requests ENABLE TRIGGER ALL');
        await query('ALTER TABLE users ENABLE TRIGGER ALL');

        results.push(`Successfully migrated ${u.email} from ${oldId} to ${newId}`);
      } catch (dbErr: any) {
        results.push(`Failed database updates for ${u.email}: ${dbErr.message}`);
      }
    }

    return NextResponse.json({ success: true, results });

  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
