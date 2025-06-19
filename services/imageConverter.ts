
import { getFileExtension } from './utilities';

export const convertToPng = async (file: File): Promise<Blob> => {
  const extension = getFileExtension(file.name);

  if (extension === 'heic' || extension === 'heif') {
    if (!window.heic2any) {
      throw new Error("HEIC conversion library (heic2any) not loaded.");
    }
    try {
      const conversionResult = await window.heic2any({
        blob: file,
        toType: "image/png",
        quality: 0.9, // Adjust quality as needed
      });
      // heic2any can return Blob or Blob[]
      const resultBlob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
      if (!resultBlob) {
        throw new Error("HEIC conversion failed to produce a blob.");
      }
      return resultBlob;
    } catch (error) {
      console.error("Error converting HEIC/HEIF to PNG:", error);
      throw new Error(`HEIC/HEIF conversion failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  } else if (extension === 'webp') {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Failed to get canvas context for WebP conversion."));
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("WebP to PNG conversion failed (canvas.toBlob returned null)."));
          }
        }, 'image/png', 0.9); // Adjust quality as needed
        URL.revokeObjectURL(img.src); 
      };
      img.onerror = (error) => {
        URL.revokeObjectURL(img.src);
        console.error("Error loading WebP image for conversion:", error);
        reject(new Error("Failed to load WebP image for conversion."));
      };
      img.src = URL.createObjectURL(file);
    });
  } else {
    throw new Error(`Unsupported file type for conversion: ${extension}`);
  }
};
    