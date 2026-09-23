import { NextResponse } from 'next/server';
import { fetchAdminEnrollments, updateEnrollmentPayment } from '@/lib/pujaData';

// GET /api/admin/pujas/enrollments — List filtered enrollments
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const puja_id = searchParams.get('puja_id') || undefined;
    const payment_status = searchParams.get('payment_status') || undefined;
    const search = searchParams.get('search') || undefined;

    const enrollments = await fetchAdminEnrollments({ puja_id, payment_status, search });
    return NextResponse.json({ success: true, enrollments });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch enrollments' }, { status: 500 });
  }
}

// PATCH /api/admin/pujas/enrollments — Update payment status and notes
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, payment_status, payment_amount_collected, payment_mode, payment_notes } = body;

    if (!id || !payment_status) {
      return NextResponse.json({ error: 'Enrollment ID and payment status required' }, { status: 400 });
    }

    await updateEnrollmentPayment(
      id,
      payment_status,
      payment_amount_collected !== undefined ? Number(payment_amount_collected) : undefined,
      payment_mode,
      payment_notes
    );

    return NextResponse.json({ success: true, message: 'Payment status updated' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update payment status' }, { status: 500 });
  }
}
