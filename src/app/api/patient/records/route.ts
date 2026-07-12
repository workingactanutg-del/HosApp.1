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

    // 1. Fetch medical records
    const medicalRecords = await query(
      `SELECT mr.id, mr.date, mr.diagnosis, mr.notes, u.full_name as doctor_name, d.specialization
       FROM medical_records mr
       JOIN users u ON mr.doctor_id = u.id
       JOIN doctors d ON mr.doctor_id = d.id
       WHERE mr.patient_id = $1
       ORDER BY mr.date DESC`,
      [patientId]
    );

    // 2. Fetch prescriptions
    const prescriptions = await query(
      `SELECT p.id, p.date, p.notes, u.full_name as doctor_name
       FROM prescriptions p
       JOIN users u ON p.doctor_id = u.id
       WHERE p.patient_id = $1
       ORDER BY p.date DESC`,
      [patientId]
    );

    // Fetch items for each prescription
    for (const presc of prescriptions) {
      const items = await query(
        `SELECT medicine_name, dosage, frequency, duration, instructions
         FROM prescription_items
         WHERE prescription_id = $1`,
        [presc.id]
      );
      presc.items = items;
    }

    // 3. Fetch lab reports
    const reports = await query(
      `SELECT id, title, report_type, file_url, summary, created_at
       FROM reports
       WHERE patient_id = $1
       ORDER BY created_at DESC`,
      [patientId]
    );

    return NextResponse.json({
      medicalRecords,
      prescriptions,
      reports
    });

  } catch (error: any) {
    console.error('Error fetching patient medical records:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
