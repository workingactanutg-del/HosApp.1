import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role === 'ADMIN') {
      const apptCount = await query("SELECT COUNT(*) FROM appointments WHERE status = 'PENDING'");
      const bloodCount = await query("SELECT COUNT(*) FROM blood_requests WHERE status = 'PENDING'");
      const bedCount = await query("SELECT COUNT(*) FROM beds WHERE status = 'DIRTY'");

      return NextResponse.json({
        pendingAppointments: parseInt(apptCount[0]?.count || '0', 10),
        pendingBloodRequests: parseInt(bloodCount[0]?.count || '0', 10),
        dirtyBeds: parseInt(bedCount[0]?.count || '0', 10)
      });
    } else if (user.role === 'DOCTOR') {
      const apptCount = await query(
        "SELECT COUNT(*) FROM appointments WHERE status = 'PENDING' AND doctor_id = $1",
        [user.id]
      );
      return NextResponse.json({
        pendingAppointments: parseInt(apptCount[0]?.count || '0', 10)
      });
    } else {
      return NextResponse.json({ success: true });
    }

  } catch (error: any) {
    console.error('Error fetching sidebar alerts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
