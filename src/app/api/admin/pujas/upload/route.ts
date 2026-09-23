import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// POST /api/admin/pujas/upload — Upload single or multiple images to Supabase Storage
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const singleFile = formData.get('file') as File | null;

    const filesToUpload: File[] = [];
    if (files && files.length > 0) {
      filesToUpload.push(...files);
    } else if (singleFile) {
      filesToUpload.push(singleFile);
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
      const cleanExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '');
      const safeName = file.name
        .substring(0, 30)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-');
      const uniqueFileName = `puja-${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${safeName}.${cleanExt}`;

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
