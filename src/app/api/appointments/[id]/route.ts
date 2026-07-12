import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, doctorId } = await request.json();

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Verify user role if needed, or allow for demonstration
    // Update appointment status
    let updateQuery = 'UPDATE appointments SET status = $1';
    const queryParams: any[] = [status];

    if (doctorId) {
      updateQuery += ', doctor_id = $2 WHERE id = $3';
      queryParams.push(doctorId, id);
    } else {
      updateQuery += ' WHERE id = $2';
      queryParams.push(id);
    }

    await query(updateQuery, queryParams);

    // Fetch appointment detail to notify
    const appts = await query(
      `SELECT a.patient_id, a.doctor_id, a.date, a.time_slot, u.full_name as doctor_name
       FROM appointments a
       JOIN users u ON a.doctor_id = u.id
       WHERE a.id = $1`,
      [id]
    );

    if (appts.length > 0) {
      const appt = appts[0];
      const patientId = appt.patient_id;
      const doctorId = appt.doctor_id;
      const dateStr = new Date(appt.date).toISOString().split('T')[0];

      // Send appropriate notification based on status
      let notifyTitle = '';
      let notifyMsg = '';

      if (status === 'CANCELLED') {
        notifyTitle = 'Appointment Cancelled';
        notifyMsg = `The appointment on ${dateStr} at ${appt.time_slot} has been cancelled.`;
      } else if (status === 'CONFIRMED') {
        notifyTitle = 'Appointment Confirmed';
        notifyMsg = `Your appointment with ${appt.doctor_name} on ${dateStr} at ${appt.time_slot} is now confirmed.`;
      } else if (status === 'REJECTED') {
        notifyTitle = 'Appointment Rejected';
        notifyMsg = `Your appointment request with ${appt.doctor_name} on ${dateStr} at ${appt.time_slot} was declined.`;
      } else if (status === 'COMPLETED') {
        notifyTitle = 'Appointment Completed';
        notifyMsg = `Your consultation with ${appt.doctor_name} has been marked as completed. Thank you!`;
      }

      if (notifyTitle) {
        // Notify patient
        await query(
          'INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)',
          [patientId, notifyTitle, notifyMsg]
        );
        // Also notify doctor if cancelled by patient
        if (status === 'CANCELLED') {
          await query(
            'INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)',
            [doctorId, 'Patient Cancelled Appointment', `The appointment for ${dateStr} at ${appt.time_slot} was cancelled by the patient.`]
          );
        }
      }
    }

    return NextResponse.json({ success: true, message: `Appointment status updated to ${status}` });

  } catch (error: any) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
