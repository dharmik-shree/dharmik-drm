import { NextResponse } from 'next/server';
import { fetchAdminPujaById, saveAdminPuja, deleteAdminPuja } from '@/lib/pujaData';

interface RouteProps {
  params: Promise<{ id: string }>;
}

// GET /api/admin/pujas/[id] — Single puja with packages
export async function GET(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const puja = await fetchAdminPujaById(id);

    if (!puja) {
      return NextResponse.json({ error: 'Puja not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, puja });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch puja' }, { status: 500 });
  }
}

// PATCH /api/admin/pujas/[id] — Update puja & packages
export async function PATCH(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { packages, ...pujaData } = body;

    const updated = await saveAdminPuja({ ...pujaData, id }, packages);
    return NextResponse.json({ success: true, puja: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update puja' }, { status: 500 });
  }
}

// DELETE /api/admin/pujas/[id] — Delete puja
export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    await deleteAdminPuja(id);
    return NextResponse.json({ success: true, message: 'Puja deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete puja' }, { status: 500 });
  }
}
