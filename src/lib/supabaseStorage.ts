import { supabase } from './supabase';

const BUCKET_NAME = 'hiwi-fashion-assets';

/**
 * Upload an image File to Supabase Storage bucket
 * Returns the public URL of the uploaded image
 */
export async function uploadImageToSupabase(file: File): Promise<{ url: string | null; error: string | null }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.warn('Supabase storage upload error:', error.message);
      return { url: null, error: error.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    console.error('Storage upload exception:', err);
    return { url: null, error: err.message || 'Image upload failed' };
  }
}
