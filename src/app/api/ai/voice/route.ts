import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    let patientId = '';

    const user = await verifyAuth(request);
    if (user) {
      patientId = user.id;
    } else {
      const { searchParams } = new URL(request.url);
      const paramId = searchParams.get('patient_id');
      if (paramId) {
        patientId = paramId;
      }
    }

    const { command } = await request.json();

    if (!command) {
      return NextResponse.json({ error: 'Command text is required' }, { status: 400 });
    }

    const text = command.toLowerCase().trim();
    let responseText = '';
    let action = 'NONE';
    let data: any = {};

    // 1. Keyword check for Emergency
    if (text.includes('emergency') || text.includes('chest pain') || text.includes('heart attack') || text.includes('accident')) {
      if (text.includes('chest pain') || text.includes('heart attack')) {
        // Find cardiologist
        const cardDocs = await query(
          "SELECT u.id, u.full_name FROM users u JOIN doctors d ON u.id = d.id WHERE d.specialization = 'Cardiology' LIMIT 1"
        );
        
        responseText = "I detected symptoms of chest pain. I highly recommend booking an immediate consultation with a Cardiologist. I have prepared the booking form for Dr. Sarah Jenkins.";
        action = 'BOOK_APPOINTMENT';
        data = {
          specialization: 'Cardiology',
          doctorId: cardDocs[0]?.id || '',
          doctorName: cardDocs[0]?.full_name || 'Dr. Sarah Jenkins'
        };
      } else {
        responseText = "Emergency protocols triggered. Directing you to Emergency services and placing a mock emergency call to the reception.";
        action = 'CALL_EMERGENCY';
      }
    }
    // 2. Map navigation highlighting
    else if (text.includes('map') || text.includes('where is') || text.includes('navigate to') || text.includes('take me to') || text.includes('show pharmacy') || text.includes('show lab') || text.includes('show icu') || text.includes('show reception') || text.includes('show radiology')) {
      let target = 'Reception';
      if (text.includes('pharmacy')) target = 'Pharmacy';
      else if (text.includes('lab') || text.includes('laboratory')) target = 'Lab';
      else if (text.includes('icu') || text.includes('intensive care')) target = 'ICU';
      else if (text.includes('emergency')) target = 'Emergency';
      else if (text.includes('radiology') || text.includes('xray') || text.includes('x-ray')) target = 'Radiology';
      
      responseText = `I have highlighted the ${target} on your interactive hospital map. Follow the flashing visual path.`;
      action = 'HIGHLIGHT_MAP';
      data = { target };
    }
    // 3. Read prescription
    else if (text.includes('prescription') || text.includes('medicine') || text.includes('pills') || text.includes('dosage') || text.includes('take lisinopril')) {
      if (!patientId) {
        responseText = "I can read prescriptions once you are logged in as a patient.";
      } else {
        const prescriptions = await query(
          `SELECT pi.medicine_name, pi.dosage, pi.frequency, pi.duration, pi.instructions
           FROM prescriptions p
           JOIN prescription_items pi ON p.id = pi.prescription_id
           WHERE p.patient_id = $1
           ORDER BY p.date DESC`,
          [patientId]
        );

        if (prescriptions.length === 0) {
          responseText = "You do not have any active digital prescriptions logged in the system.";
        } else {
          const list = prescriptions.map((p: any) => `${p.medicine_name} (${p.dosage}, ${p.frequency} for ${p.duration}): ${p.instructions}`).join('; ');
          responseText = `Your current prescription contains: ${list}. Please follow the instructions carefully.`;
          action = 'READ_PRESCRIPTION';
          data = { prescriptions };
        }
      }
    }
    // 4. View lab reports
    else if (text.includes('report') || text.includes('lab test') || text.includes('blood test') || text.includes('ecg') || text.includes('results')) {
      if (!patientId) {
        responseText = "I can retrieve your lab reports once you are logged in.";
      } else {
        const reports = await query(
          `SELECT title, report_type, summary 
           FROM reports 
           WHERE patient_id = $1 
           ORDER BY created_at DESC`,
          [patientId]
        );

        if (reports.length === 0) {
          responseText = "No laboratory or diagnostic reports were found on file.";
        } else {
          const summaries = reports.map((r: any) => `${r.title} (${r.report_type}): ${r.summary}`).join('. ');
          responseText = `Here are your latest reports: ${summaries}`;
          action = 'SHOW_REPORTS';
          data = { reports };
        }
      }
    }
    // 5. Booking appointments
    else if (text.includes('book') || text.includes('schedule') || text.includes('appointment')) {
      // Find default doctor (Cardiology)
      const docs = await query(
        "SELECT u.id, u.full_name, d.specialization FROM users u JOIN doctors d ON u.id = d.id WHERE d.specialization = 'Cardiology' LIMIT 1"
      );
      responseText = "Opening the appointment booking console. Please select your preferred doctor, slot, and reason.";
      action = 'BOOK_APPOINTMENT';
      data = {
        specialization: docs[0]?.specialization || 'Cardiology',
        doctorId: docs[0]?.id || '',
        doctorName: docs[0]?.full_name || 'Dr. Sarah Jenkins'
      };
    }
    // 6. When is appointment
    else if (text.includes('when is my') || text.includes('next appointment') || text.includes('upcoming appointment')) {
      if (!patientId) {
        responseText = "Please log in to check your upcoming appointments.";
      } else {
        const appointments = await query(
          `SELECT a.date, a.time_slot, u.full_name as doctor_name
           FROM appointments a
           JOIN users u ON a.doctor_id = u.id
           WHERE a.patient_id = $1 AND a.date >= CURRENT_DATE AND a.status IN ('PENDING', 'CONFIRMED')
           ORDER BY a.date ASC LIMIT 1`,
          [patientId]
        );

        if (appointments.length === 0) {
          responseText = "You have no upcoming appointments scheduled.";
        } else {
          const dateStr = new Date(appointments[0].date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
          responseText = `You have an appointment with ${appointments[0].doctor_name} on ${dateStr} at ${appointments[0].time_slot}.`;
        }
      }
    }
    // 7. General FAQs
    else {
      if (text.includes('hours') || text.includes('timing') || text.includes('open')) {
        responseText = "HOSAPP Clinical Center is open 24/7 for Emergency and ICU services. Regular outpatient consultations are held from Monday to Saturday, 09:00 AM to 05:00 PM.";
      } else if (text.includes('insurance')) {
        responseText = "We accept all major insurance providers including BlueCross, Aetna, Cigna, and UnitedHealth. You can review your insurance details in your Profile section.";
      } else if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
        responseText = "Hello! I am your HOSAPP voice assistant. You can ask me to book appointments, view reports, read prescriptions, or guide you to departments on the map.";
      } else {
        responseText = "I understand you said: '" + command + "'. I can help you book appointments, display laboratory reports, explain prescriptions, or find departments like Pharmacy or Lab. What would you like me to do?";
      }
    }

    return NextResponse.json({
      response: responseText,
      action,
      data
    });

  } catch (error: any) {
    console.error('Error in voice assistant API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
