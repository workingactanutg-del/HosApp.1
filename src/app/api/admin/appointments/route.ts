import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const appointments = await query(
      `SELECT a.id, a.date, a.time_slot, a.status, a.reason, a.doctor_id, a.patient_id,
              u_pat.full_name as patient_name, u_doc.full_name as doctor_name, d.specialization
       FROM appointments a
       JOIN users u_pat ON a.patient_id = u_pat.id
       JOIN users u_doc ON a.doctor_id = u_doc.id
       JOIN doctors d ON a.doctor_id = d.id
       ORDER BY a.date DESC, a.time_slot DESC`
    );
    return NextResponse.json(appointments);
  } catch (error: any) {
    console.error('Error fetching admin appointments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
