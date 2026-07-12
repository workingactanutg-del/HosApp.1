import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const patientId = searchParams.get('patient_id') || '';

    // If looking up a specific patient profile
    if (patientId) {
      // 1. Get patient details
      const patients = await query(
        `SELECT u.id, u.email, u.full_name, p.phone, p.gender, p.date_of_birth, p.blood_group, p.emergency_contact, p.insurance_provider, p.insurance_policy_number
         FROM users u
         JOIN patients p ON u.id = p.id
         WHERE u.id = $1`,
        [patientId]
      );

      if (patients.length === 0) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
      }

      // 2. Get medical history (records)
      const medicalRecords = await query(
        `SELECT mr.id, mr.date, mr.diagnosis, mr.notes, u.full_name as doctor_name
         FROM medical_records mr
         JOIN users u ON mr.doctor_id = u.id
         WHERE mr.patient_id = $1
         ORDER BY mr.date DESC`,
        [patientId]
      );

      // 3. Get prescriptions
      const prescriptions = await query(
        `SELECT pr.id, pr.date, pr.notes, u.full_name as doctor_name
         FROM prescriptions pr
         JOIN users u ON pr.doctor_id = u.id
         WHERE pr.patient_id = $1
         ORDER BY pr.date DESC`,
        [patientId]
      );

      for (const presc of prescriptions) {
        const items = await query(
          'SELECT medicine_name, dosage, frequency, duration, instructions FROM prescription_items WHERE prescription_id = $1',
          [presc.id]
        );
        presc.items = items;
      }

      // 4. Get reports
      const reports = await query(
        `SELECT id, title, report_type, summary, created_at FROM reports WHERE patient_id = $1 ORDER BY created_at DESC`,
        [patientId]
      );

      return NextResponse.json({
        profile: patients[0],
        medicalRecords,
        prescriptions,
        reports
      });
    }

    // Else: general list of patients
    let patientList;
    if (q) {
      patientList = await query(
        `SELECT u.id, u.email, u.full_name, p.phone, p.gender, p.blood_group 
         FROM users u 
         JOIN patients p ON u.id = p.id 
         WHERE u.full_name ILIKE $1 OR u.email ILIKE $1
         ORDER BY u.full_name ASC`,
        [`%${q}%`]
      );
    } else {
      patientList = await query(
        `SELECT u.id, u.email, u.full_name, p.phone, p.gender, p.blood_group 
         FROM users u 
         JOIN patients p ON u.id = p.id 
         ORDER BY u.full_name ASC`
      );
    }

    return NextResponse.json(patientList);

  } catch (error: any) {
    console.error('Error fetching patients for doctor:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
