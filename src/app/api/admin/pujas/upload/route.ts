import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { deleteStorageImages } from '@/lib/pujaData';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/admin/pujas/upload — Upload single or multiple images to Supabase Storage
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const filesToUpload: File[] = [];

    // Collect all valid files from any form key (file, files, etc.)
    for (const [, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        filesToUpload.push(value);
      }
    }

    if (filesToUpload.length === 0) {
      return NextResponse.json({ error: 'No files provided for upload' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Ensure bucket exists
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some((b) => b.name === 'pujas');
      if (!bucketExists) {
        await supabase.storage.createBucket('pujas', { public: true });
      }
    } catch (bErr) {
      console.warn('Bucket check/create notice:', bErr);
    }

    const uploadedUrls: string[] = [];

    for (const file of filesToUpload) {
      const rawExt = file.name.split('.').pop() || 'jpg';
      const cleanExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
      const safeBase = file.name
        .replace(/\.[^/.]+$/, '')
        .substring(0, 30)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/(^-|-$)/g, '');
      const uniqueFileName = `puja-${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${safeBase || 'photo'}.${cleanExt}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('pujas')
        .upload(uniqueFileName, buffer, {
          contentType: file.type || 'image/jpeg',
          upsert: true,
          cacheControl: '31536000',
        });

      if (uploadErr) {
        console.error('Error uploading file to Supabase storage:', uploadErr);
        throw new Error(`Failed to upload ${file.name}: ${uploadErr.message}`);
      }

      const { data: pubData } = supabase.storage
        .from('pujas')
        .getPublicUrl(uploadData.path || uniqueFileName);

      if (pubData?.publicUrl) {
        uploadedUrls.push(pubData.publicUrl);
      }
    }

    return NextResponse.json({
      success: true,
      url: uploadedUrls[0] || '',
      urls: uploadedUrls,
      count: uploadedUrls.length,
    });
  } catch (err: any) {
    console.error('Upload handler error:', err);
    return NextResponse.json(
      { error: err.message || 'Image upload failed. Please try again.' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/pujas/upload — Remove image(s) from Supabase Storage
export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawItems: string[] = [];

    if (typeof body.url === 'string') rawItems.push(body.url);
    if (typeof body.path === 'string') rawItems.push(body.path);
    if (Array.isArray(body.urls)) {
      rawItems.push(...body.urls.filter((u: any) => typeof u === 'string'));
    }
    if (Array.isArray(body.paths)) {
      rawItems.push(...body.paths.filter((p: any) => typeof p === 'string'));
    }

    if (rawItems.length === 0) {
      return NextResponse.json(
        { error: 'No image URL or path provided for deletion' },
        { status: 400 }
      );
    }

    const removed = await deleteStorageImages(rawItems, 'pujas');

    return NextResponse.json({
      success: true,
      message: 'Image(s) deleted from storage successfully',
      removedCount: removed.length,
      removedPaths: removed,
    });
  } catch (err: any) {
    console.error('Delete upload handler error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to delete image from storage' },
      { status: 500 }
    );
  }
}
