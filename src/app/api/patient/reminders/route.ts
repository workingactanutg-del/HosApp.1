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

    const reminders = await query(
      `SELECT id, medicine_name, time_of_day, dosage, active, created_at
       FROM pill_reminders
       WHERE patient_id = $1
       ORDER BY time_of_day ASC`,
      [patientId]
    );

    return NextResponse.json(reminders);
  } catch (error: any) {
    console.error('Error fetching reminders:', error);
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
      const { searchParams } = new URL(request.url);
      const paramId = searchParams.get('patient_id');
      if (paramId) {
        patientId = paramId;
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const { medicineName, timeOfDay, dosage } = await request.json();

    if (!medicineName || !timeOfDay) {
      return NextResponse.json(
        { error: 'Medicine name and time of day are required' },
        { status: 400 }
      );
    }

    const res = await query(
      `INSERT INTO pill_reminders (patient_id, medicine_name, time_of_day, dosage)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [patientId, medicineName, timeOfDay, dosage || '']
    );

    // Auto-create a welcome notification for reminders set
    await query(
      `INSERT INTO notifications (user_id, title, message)
       VALUES ($1, 'Medication Reminder Configured', 'Reminder set for ${medicineName} (${dosage || '1 unit'}) at ${timeOfDay}.')`,
      [patientId]
    );

    return NextResponse.json({
      success: true,
      message: 'Reminder created successfully',
      reminderId: res[0].id
    });

  } catch (error: any) {
    console.error('Error creating reminder:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Reminder ID is required' }, { status: 400 });
    }

    await query('DELETE FROM pill_reminders WHERE id = $1', [id]);
    return NextResponse.json({ success: true, message: 'Reminder deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting reminder:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
