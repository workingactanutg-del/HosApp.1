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

    const doctors = await query(
      'SELECT availability FROM doctors WHERE id = $1',
      [doctorId]
    );

    if (doctors.length === 0) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    return NextResponse.json(doctors[0].availability || {});

  } catch (error: any) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
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

    const { working_hours, slots } = await request.json();

    if (!working_hours || !slots || !Array.isArray(slots)) {
      return NextResponse.json(
        { error: 'working_hours and slots array are required' },
        { status: 400 }
      );
    }

    const availability = { working_hours, slots };

    await query(
      'UPDATE doctors SET availability = $1 WHERE id = $2',
      [JSON.stringify(availability), doctorId]
    );

    return NextResponse.json({
      success: true,
      message: 'Availability updated successfully',
      availability
    });

  } catch (error: any) {
    console.error('Error updating availability:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
