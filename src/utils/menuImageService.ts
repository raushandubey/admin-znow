import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  storagePath: string;
  fileName: string;
}

export const uploadMenuImage = async (pngBlob: Blob, coffeeName: string): Promise<UploadResult> => {
  const sanitizedName = coffeeName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'menu-item';

  const uniqueId = uuidv4();
  const fileName = `${sanitizedName}-${uniqueId}.png`;

  const { error } = await supabase.storage
    .from('menu_images')
    .upload(fileName, pngBlob, {
      contentType: 'image/png',
      upsert: false,
    });

  if (error) {
    if (error.message?.toLowerCase().includes('bucket not found')) {
      throw new Error(`Storage bucket 'menu_images' does not exist in Supabase. Please create a public bucket named 'menu_images' in your Supabase Storage Dashboard.`);
    }
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  return {
    storagePath: `menu_images/${fileName}`,
    fileName,
  };
};

export const deleteMenuImage = async (imagePath: string | null | undefined): Promise<void> => {
  if (!imagePath) return;
  if (
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://') ||
    imagePath.startsWith('data:')
  ) {
    return;
  }

  const fileName = imagePath.startsWith('menu_images/')
    ? imagePath.replace(/^menu_images\//, '')
    : imagePath;

  if (!fileName) return;

  const { error } = await supabase.storage.from('menu_images').remove([fileName]);
  if (error) {
    console.warn(`Failed to cleanup storage image ${fileName}:`, error.message);
  }
};
