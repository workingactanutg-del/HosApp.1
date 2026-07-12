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
      // Admin sees all requests with patient details
      const requests = await query(
        `SELECT r.id, r.blood_group, r.units, r.status, r.reason, r.created_at, u.full_name as patient_name, u.email as patient_email
         FROM blood_requests r
         JOIN users u ON r.patient_id = u.id
         ORDER BY r.created_at DESC`
      );
      return NextResponse.json(requests);
    } else {
      // Patient sees only their own requests
      const requests = await query(
        `SELECT id, blood_group, units, status, reason, created_at
         FROM blood_requests
         WHERE patient_id = $1
         ORDER BY created_at DESC`,
        [user.id]
      );
      return NextResponse.json(requests);
    }
  } catch (error: any) {
    console.error('Error fetching blood requests:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await verifyAuth(request);
    if (!user || user.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Only patients can request blood' }, { status: 401 });
    }

    const { bloodGroup, units, reason } = await request.json();

    if (!bloodGroup || !units) {
      return NextResponse.json({ error: 'Blood Group and Units are required' }, { status: 400 });
    }

    // Insert blood request
    const res = await query(
      `INSERT INTO blood_requests (patient_id, blood_group, units, reason, status)
       VALUES ($1, $2, $3, $4, 'PENDING')
       RETURNING id`,
      [user.id, bloodGroup, parseInt(units, 10), reason || '']
    );

    // Create notification for patient
    await query(
      `INSERT INTO notifications (user_id, title, message)
       VALUES ($1, 'Blood Request Dispatched', 'Your request for ${units} units of ${bloodGroup} blood has been submitted to the admin desk.')`,
      [user.id]
    );

    return NextResponse.json({ success: true, message: 'Blood request submitted successfully', requestId: res[0].id });

  } catch (error: any) {
    console.error('Error creating blood request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await verifyAuth(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can approve blood requests' }, { status: 401 });
    }

    const { requestId, status } = await request.json();

    if (!requestId || !status) {
      return NextResponse.json({ error: 'Request ID and status are required' }, { status: 400 });
    }

    // Get current request details
    const requests = await query(
      'SELECT patient_id, blood_group, units FROM blood_requests WHERE id = $1',
      [requestId]
    );
    const req = requests[0];
    if (!req) {
      return NextResponse.json({ error: 'Blood request not found' }, { status: 404 });
    }

    if (status === 'APPROVED') {
      // Verify stock
      const stockRes = await query(
        'SELECT stock_units FROM blood_bank WHERE blood_group = $1',
        [req.blood_group]
      );
      const stock = stockRes[0]?.stock_units || 0;

      if (stock < req.units) {
        return NextResponse.json({ error: `Insufficient stock of blood group ${req.blood_group} (Available: ${stock} units, Requested: ${req.units} units)` }, { status: 400 });
      }

      // Deduct stock
      await query(
        'UPDATE blood_bank SET stock_units = stock_units - $1, updated_at = CURRENT_TIMESTAMP WHERE blood_group = $2',
        [req.units, req.blood_group]
      );

      // Approve request
      await query(
        "UPDATE blood_requests SET status = 'APPROVED' WHERE id = $1",
        [requestId]
      );

      // Notify Patient
      await query(
        `INSERT INTO notifications (user_id, title, message)
         VALUES ($1, 'Blood Request Approved', 'Your request for ${req.units} units of ${req.blood_group} blood has been approved and issued.')`,
        [req.patient_id]
      );

    } else if (status === 'REJECTED') {
      // Reject request
      await query(
        "UPDATE blood_requests SET status = 'REJECTED' WHERE id = $1",
        [requestId]
      );

      // Notify Patient
      await query(
        `INSERT INTO notifications (user_id, title, message)
         VALUES ($1, 'Blood Request Rejected', 'Your request for ${req.units} units of ${req.blood_group} blood was rejected.')`,
        [req.patient_id]
      );
    }

    return NextResponse.json({ success: true, message: `Request status updated to ${status}` });

  } catch (error: any) {
    console.error('Error updating blood request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
