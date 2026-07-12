import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    let patientId = '';

    const user = await verifyAuth(request);
    if (user && user.role === 'PATIENT') {
      patientId = user.id;
    } else {
      const { searchParams } = new URL(request.url);
      const paramId = searchParams.get('patient_id');
      if (paramId) {
        patientId = paramId;
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const patient = await query(
      `SELECT u.id, u.email, u.full_name, p.phone, p.gender, p.date_of_birth, p.blood_group, p.emergency_contact, p.insurance_provider, p.insurance_policy_number
       FROM users u
       JOIN patients p ON u.id = p.id
       WHERE u.id = $1`,
      [patientId]
    );

    if (patient.length === 0) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json(patient[0]);

  } catch (error: any) {
    console.error('Error fetching patient profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    let patientId = '';

    const user = await verifyAuth(request);
    if (user && user.role === 'PATIENT') {
      patientId = user.id;
    } else {
      const { searchParams } = new URL(request.url);
      const paramId = searchParams.get('patient_id');
      if (paramId) {
        patientId = paramId;
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const {
      fullName,
      phone,
      gender,
      dateOfBirth,
      bloodGroup,
      emergencyContact,
      insuranceProvider,
      insurancePolicyNumber
    } = await request.json();

    // Update users table for name
    if (fullName) {
      await query('UPDATE users SET full_name = $1 WHERE id = $2', [fullName, patientId]);
    }

    // Update patients table
    await query(
      `UPDATE patients SET 
        phone = COALESCE($1, phone),
        gender = COALESCE($2, gender),
        date_of_birth = COALESCE($3, date_of_birth),
        blood_group = COALESCE($4, blood_group),
        emergency_contact = COALESCE($5, emergency_contact),
        insurance_provider = COALESCE($6, insurance_provider),
        insurance_policy_number = COALESCE($7, insurance_policy_number)
       WHERE id = $8`,
      [
        phone || null,
        gender || null,
        dateOfBirth || null,
        bloodGroup || null,
        emergencyContact || null,
        insuranceProvider || null,
        insurancePolicyNumber || null,
        patientId
      ]
    );

    return NextResponse.json({ success: true, message: 'Profile updated successfully' });

  } catch (error: any) {
    console.error('Error updating patient profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
