import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    let patientId = '';

    // Verify JWT
    const user = await verifyAuth(request);
    if (user && user.role === 'PATIENT') {
      patientId = user.id;
    } else {
      // Fallback for easy API testing via query param
      const { searchParams } = new URL(request.url);
      const paramId = searchParams.get('patient_id');
      if (paramId) {
        patientId = paramId;
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // 1. Fetch patient profile details
    const patients = await query(
      `SELECT u.full_name, u.email, p.phone, p.gender, p.blood_group, p.insurance_provider 
       FROM users u 
       JOIN patients p ON u.id = p.id 
       WHERE u.id = $1`,
      [patientId]
    );

    if (patients.length === 0) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const patient = patients[0];

    // 2. Fetch upcoming appointments
    const appointments = await query(
      `SELECT a.id, a.date, a.time_slot, a.status, a.reason, u.full_name as doctor_name, d.room_number
       FROM appointments a
       JOIN users u ON a.doctor_id = u.id
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.patient_id = $1 AND a.date >= CURRENT_DATE AND a.status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS')
       ORDER BY a.date ASC, a.time_slot ASC
       LIMIT 1`,
      [patientId]
    );

    const upcomingAppointment = appointments[0] || null;

    // 3. Fetch latest health records (diagnoses)
    const records = await query(
      `SELECT mr.id, mr.date, mr.diagnosis, mr.notes, u.full_name as doctor_name
       FROM medical_records mr
       JOIN users u ON mr.doctor_id = u.id
       WHERE mr.patient_id = $1
       ORDER BY mr.date DESC
       LIMIT 1`,
      [patientId]
    );

    const latestRecord = records[0] || null;

    // 4. Fetch latest prescription items
    const prescriptions = await query(
      `SELECT p.id, p.date, u.full_name as doctor_name, pi.medicine_name, pi.dosage, pi.frequency, pi.duration
       FROM prescriptions p
       JOIN users u ON p.doctor_id = u.id
       JOIN prescription_items pi ON p.id = pi.prescription_id
       WHERE p.patient_id = $1
       ORDER BY p.date DESC
       LIMIT 3`,
      [patientId]
    );

    // 5. Fetch notifications
    const notifications = await query(
      `SELECT id, title, message, read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 5`,
      [patientId]
    );

    return NextResponse.json({
      patient,
      upcomingAppointment,
      latestRecord,
      prescriptions,
      notifications
    });

  } catch (error: any) {
    console.error('Error in patient dashboard API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
