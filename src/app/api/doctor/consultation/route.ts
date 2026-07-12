import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: Request) {
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

    const { patientId, diagnosis, notes, medicines, appointmentId } = await request.json();

    if (!patientId || !diagnosis) {
      return NextResponse.json(
        { error: 'Patient ID and diagnosis are required' },
        { status: 400 }
      );
    }

    // 1. Insert into medical_records
    await query(
      `INSERT INTO medical_records (patient_id, doctor_id, diagnosis, notes)
       VALUES ($1, $2, $3, $4)`,
      [patientId, doctorId, diagnosis, notes || '']
    );

    // 2. If medicines are included, insert prescription
    if (medicines && Array.isArray(medicines) && medicines.length > 0) {
      const prescResult = await query(
        `INSERT INTO prescriptions (patient_id, doctor_id, notes)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [patientId, doctorId, notes || 'Instructions logged in prescription items.']
      );
      
      const prescriptionId = prescResult[0].id;

      // Insert prescription items
      for (const med of medicines) {
        await query(
          `INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration, instructions)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            prescriptionId,
            med.medicineName,
            med.dosage || '1 pill',
            med.frequency || 'Once daily',
            med.duration || '7 days',
            med.instructions || 'Take with water.'
          ]
        );
      }
    }

    // 3. Mark appointment completed if ID provided
    if (appointmentId) {
      await query(
        "UPDATE appointments SET status = 'COMPLETED' WHERE id = $1",
        [appointmentId]
      );
    }

    // Fetch doctor name for notifications
    const docUser = await query('SELECT full_name FROM users WHERE id = $1', [doctorId]);
    const doctorName = docUser[0]?.full_name || 'Your doctor';

    // 4. Send notification to patient
    await query(
      `INSERT INTO notifications (user_id, title, message)
       VALUES ($1, 'New Medical Prescription Logged', 'Dr. ${doctorName} has updated your EMR and issued a new prescription.')`,
      [patientId]
    );

    return NextResponse.json({
      success: true,
      message: 'Consultation notes and prescription logged successfully'
    });

  } catch (error: any) {
    console.error('Error logging consultation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function GET(request: Request) {
  // Returns doctor specific consultation history
  try {
    let doctorId = '';
    const user = await verifyAuth(request);
    if (user && user.role === 'DOCTOR') {
      doctorId = user.id;
    } else {
      const { searchParams } = new URL(request.url);
      const paramId = searchParams.get('doctor_id');
      if (paramId) doctorId = paramId;
      else return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const history = await query(
      `SELECT mr.id, mr.date, mr.diagnosis, mr.notes, u.full_name as patient_name
       FROM medical_records mr
       JOIN users u ON mr.patient_id = u.id
       WHERE mr.doctor_id = $1
       ORDER BY mr.date DESC`,
      [doctorId]
    );
    return NextResponse.json(history);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
