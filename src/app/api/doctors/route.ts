import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const doctors = await query(
      `SELECT u.id, u.full_name as name, d.specialization, d.room_number, d.availability, d.bio, dept.name as department_name
       FROM users u
       JOIN doctors d ON u.id = d.id
       LEFT JOIN departments dept ON d.department_id = dept.id
       WHERE u.role = 'DOCTOR'`
    );

    return NextResponse.json(doctors);
  } catch (error: any) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
