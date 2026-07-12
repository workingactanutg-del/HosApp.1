import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const beds = await query(
      `SELECT b.id, b.ward_name, b.bed_number, b.status, b.patient_id, u.full_name as patient_name, u.email as patient_email
       FROM beds b
       LEFT JOIN users u ON b.patient_id = u.id
       ORDER BY b.ward_name ASC, b.bed_number ASC`
    );
    return NextResponse.json(beds);
  } catch (error: any) {
    console.error('Error fetching beds:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { wardName, bedNumber } = await request.json();

    if (!wardName || !bedNumber) {
      return NextResponse.json({ error: 'Ward Name and Bed Number are required' }, { status: 400 });
    }

    // Insert new bed
    await query(
      `INSERT INTO beds (ward_name, bed_number, status)
       VALUES ($1, $2, 'AVAILABLE')`,
      [wardName, bedNumber]
    );

    return NextResponse.json({ success: true, message: 'Bed added successfully' });
  } catch (error: any) {
    console.error('Error creating bed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { bedId, status, patientId } = await request.json();

    if (!bedId || !status) {
      return NextResponse.json({ error: 'Bed ID and status are required' }, { status: 400 });
    }

    // Update bed status and assignment
    await query(
      `UPDATE beds SET 
        status = $1, 
        patient_id = $2 
       WHERE id = $3`,
      [status, patientId || null, bedId]
    );

    // Send notifications if occupied
    if (status === 'OCCUPIED' && patientId) {
      const details = await query('SELECT ward_name, bed_number FROM beds WHERE id = $1', [bedId]);
      const bed = details[0];
      if (bed) {
        await query(
          `INSERT INTO notifications (user_id, title, message)
           VALUES ($1, 'Bed Allocated', 'You have been admitted to ${bed.ward_name}, Bed ${bed.bed_number}.')`,
          [patientId]
        );
      }
    } else if (status === 'DIRTY') {
      // Find patient who occupied it before
      const prevBeds = await query('SELECT patient_id, ward_name, bed_number FROM beds WHERE id = $1', [bedId]);
      const prevBed = prevBeds[0];
      if (prevBed && prevBed.patient_id) {
        await query(
          `INSERT INTO notifications (user_id, title, message)
           VALUES ($1, 'Discharged', 'You have been discharged from ${prevBed.ward_name}, Bed ${prevBed.bed_number}. The bed is now scheduled for sanitation.')`,
          [prevBed.patient_id]
        );
      }
    }

    return NextResponse.json({ success: true, message: 'Bed allocation updated successfully' });

  } catch (error: any) {
    console.error('Error updating bed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Bed ID is required' }, { status: 400 });
    }

    await query('DELETE FROM beds WHERE id = $1', [id]);
    return NextResponse.json({ success: true, message: 'Bed deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting bed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
