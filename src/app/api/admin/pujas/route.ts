import { NextResponse } from 'next/server';
import { fetchAdminPujas, saveAdminPuja } from '@/lib/pujaData';

// GET /api/admin/pujas — List all pujas with metrics
export async function GET() {
  try {
    const pujas = await fetchAdminPujas();
    return NextResponse.json({ success: true, pujas });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch pujas' }, { status: 500 });
  }
}

// POST /api/admin/pujas — Create a new puja with packages
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { packages, ...pujaData } = body;

    if (!pujaData.title || !pujaData.location_name) {
      return NextResponse.json({ error: 'Title and location are required' }, { status: 400 });
    }

    if (!pujaData.slug) {
      pujaData.slug = pujaData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const saved = await saveAdminPuja(pujaData, packages || []);
    return NextResponse.json({ success: true, puja: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create puja' }, { status: 500 });
  }
}
