import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    let doctorId = '';

    const user = await verifyAuth(request);
    if (user && user.role === 'DOCTOR') {
      doctorId = user.id;
    } else {
      const { searchParams } = new URL(request.url);
      const paramId = searchParams.get('doctor_id');
      if (paramId) {
        doctorId = paramId;
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // 1. Fetch doctor details
    const doctors = await query(
      `SELECT u.full_name, d.specialization, d.room_number, d.availability
       FROM users u
       JOIN doctors d ON u.id = d.id
       WHERE u.id = $1`,
      [doctorId]
    );

    if (doctors.length === 0) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    const doctor = doctors[0];

    // 2. Fetch today's appointments
    const today = new Date().toISOString().split('T')[0];
    const appointments = await query(
      `SELECT a.id, a.date, a.time_slot, a.status, a.reason, u.id as patient_id, u.full_name as patient_name, p.gender, p.blood_group
       FROM appointments a
       JOIN users u ON a.patient_id = u.id
       JOIN patients p ON a.patient_id = p.id
       WHERE a.doctor_id = $1 AND a.date = $2
       ORDER BY a.time_slot ASC`,
      [doctorId, today]
    );

    // Calculate quick stats
    const totalToday = appointments.length;
    const pendingToday = appointments.filter((a: any) => a.status === 'PENDING').length;
    const confirmedToday = appointments.filter((a: any) => a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS').length;

    // Fetch total unique patients count
    const uniquePatientsResult = await query(
      `SELECT COUNT(DISTINCT patient_id) as count FROM appointments WHERE doctor_id = $1`,
      [doctorId]
    );
    const totalPatients = parseInt(uniquePatientsResult[0]?.count || '0', 10);

    return NextResponse.json({
      doctor,
      appointments,
      stats: {
        totalToday,
        pendingToday,
        confirmedToday,
        totalPatients
      }
    });

  } catch (error: any) {
    console.error('Error in doctor dashboard API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
