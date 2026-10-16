import { supabase } from '../lib/supabase';

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp)$/i.test(file.name);
  if (!isImage) {
    return { valid: false, error: 'Please select a valid image file.' };
  }
  return { valid: true };
};

export const validatePngFile = validateImageFile;

export const optimizeImageToPngBlob = (
  file: File,
  targetMaxSizeBytes = 950 * 1024
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = async () => {
        const origWidth = img.width;
        const origHeight = img.height;

        // If file is PNG, already <= targetMaxSizeBytes, and within 800x800 bounds, use directly to preserve quality
        if (file.type === 'image/png' && file.size <= targetMaxSizeBytes && origWidth <= 800 && origHeight <= 800) {
          resolve(file);
          return;
        }

        // Progressive maximum dimension steps: 800 -> 700 -> 600 -> 500 -> 400 -> 300
        const dimensionSteps = [800, 700, 600, 500, 400, 300];

        for (const maxDim of dimensionSteps) {
          let width = origWidth;
          let height = origHeight;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) continue;

          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          const blob = await new Promise<Blob | null>((res) =>
            canvas.toBlob((b) => res(b), 'image/png')
          );

          if (blob && blob.size <= targetMaxSizeBytes) {
            resolve(blob);
            return;
          }
        }

        reject(new Error('Image could not be reduced below 1 MB limit after optimization attempts. Please select a different image.'));
      };
      img.onerror = () => reject(new Error('Failed to load image for processing.'));
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
  });
};

export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return 'https://via.placeholder.com/150';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith('menu_images/')
    ? imagePath.replace(/^menu_images\//, '')
    : imagePath;

  const { data } = supabase.storage.from('menu_images').getPublicUrl(cleanPath);
  return data.publicUrl;
};

export const compressImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not found'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        let outType = 'image/jpeg';
        if (file.type === 'image/png' || file.type === 'image/webp') {
          outType = file.type;
        }

        resolve(canvas.toDataURL(outType, quality));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

