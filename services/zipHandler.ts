
import { IMAGE_EXTENSIONS } from '../types.ts';
import { getFileExtension } from './utilities.ts';

export const extractImagesFromZip = async (zipFile: File): Promise<File[]> => {
  if (!window.JSZip) {
    throw new Error("ZIP processing library (JSZip) not loaded.");
  }

  const jszip = new window.JSZip();
  const loadedZip = await jszip.loadAsync(zipFile);
  const imageFiles: File[] = [];

  const filePromises: Promise<void>[] = [];

  loadedZip.forEach((relativePath, zipEntry) => {
    if (!zipEntry.dir) {
      const extension = getFileExtension(zipEntry.name);
      if (IMAGE_EXTENSIONS.includes(extension)) {
        const promise = zipEntry.async('blob').then(blob => {
          // Ensure the blob has the correct MIME type if possible, or use original file type
          // For simplicity, we are creating a File object with the original name
          const extractedFile = new File([blob], zipEntry.name, { type: blob.type || undefined });
          imageFiles.push(extractedFile);
        }).catch(error => {
          console.error(`Error extracting ${zipEntry.name} from ZIP:`, error);
          // Optionally, handle this error, e.g., by logging or skipping the file
        });
        filePromises.push(promise);
      }
    }
  });

  await Promise.all(filePromises);
  return imageFiles;
};