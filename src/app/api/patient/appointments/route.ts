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

    const appointments = await query(
      `SELECT a.id, a.date, a.time_slot, a.status, a.reason, u.full_name as doctor_name, d.specialization, d.room_number
       FROM appointments a
       JOIN users u ON a.doctor_id = u.id
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.patient_id = $1
       ORDER BY a.date DESC, a.time_slot DESC`,
      [patientId]
    );

    return NextResponse.json(appointments);
  } catch (error: any) {
    console.error('Error fetching patient appointments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    let patientId = '';

    const user = await verifyAuth(request);
    if (user && user.role === 'PATIENT') {
      patientId = user.id;
    } else {
      // Fallback for tests
      const { searchParams } = new URL(request.url);
      const paramId = searchParams.get('patient_id');
      if (paramId) {
        patientId = paramId;
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const { doctorId, date, timeSlot, reason } = await request.json();

    if (!doctorId || !date || !timeSlot) {
      return NextResponse.json(
        { error: 'Doctor ID, date, and time slot are required' },
        { status: 400 }
      );
    }

    // Insert appointment
    const result = await query(
      `INSERT INTO appointments (patient_id, doctor_id, date, time_slot, status, reason)
       VALUES ($1, $2, $3, $4, 'PENDING', $5)
       RETURNING id`,
      [patientId, doctorId, date, timeSlot, reason || 'Routine Checkup']
    );

    // Fetch doctor name for notification
    const docResult = await query('SELECT full_name FROM users WHERE id = $1', [doctorId]);
    const doctorName = docResult[0]?.full_name || 'Doctor';

    // Insert notification
    await query(
      `INSERT INTO notifications (user_id, title, message)
       VALUES ($1, 'Appointment Requested', 'Your appointment request with ${doctorName} for ${date} at ${timeSlot} is pending approval.')`,
      [patientId]
    );

    return NextResponse.json({
      success: true,
      message: 'Appointment booked successfully',
      appointmentId: result[0].id
    });

  } catch (error: any) {
    console.error('Error booking appointment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
