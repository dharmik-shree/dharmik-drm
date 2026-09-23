import { NextResponse } from 'next/server';
import { sendWhatsAppMessage, generateWhatsAppLink } from '@/lib/whatsapp';
import { markMeetingLinkSent } from '@/lib/pujaData';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { enrollment_id, phone, devotee_name, gotra, puja_title, meeting_link } = body;

    if (!enrollment_id || !phone) {
      return NextResponse.json({ error: 'Enrollment ID and Phone are required' }, { status: 400 });
    }

    const liveLink = meeting_link || 'https://meet.google.com/dharmik-puja-live';
    const devoteeGotra = gotra || 'Kashyap';

    const message = `नमस्ते ${devotee_name} जी 🙏\n\nआपकी '${puja_title}' आज पवित्र तीर्थ क्षेत्र में संपन्न हो रही है।\n\nपंडितजी द्वारा आपके नाम और गोत्र (${devoteeGotra}) का विशेष वैदिक संकल्प व आहुति दी जाएगी।\n\n🔴 पूजा में लाइव जुड़ने हेतु लिंक:\n${liveLink}\n\nपूजा उपरांत सम्पूर्ण वीडियो व प्रसाद की जानकारी भी इसी व्हाट्सएप नंबर पर प्रेषित की जाएगी।\n\nजय श्री महाकाल 🙏\n- आचार्य धार्मिक श्री`;

    const waResult = await sendWhatsAppMessage({ phone, message });
    await markMeetingLinkSent(enrollment_id);

    return NextResponse.json({
      success: true,
      channel: waResult.channel,
      link: waResult.link || generateWhatsAppLink(phone, message),
      message: 'Meeting link dispatched and recorded',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to dispatch meeting link' }, { status: 500 });
  }
}
