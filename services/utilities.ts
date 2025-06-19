
export const getFileNameWithoutExtension = (fileName: string): string => {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) return fileName;
  return fileName.substring(0, lastDot);
};

export const getFileExtension = (fileName: string): string => {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) return '';
  return fileName.substring(lastDot + 1).toLowerCase();
};

export const downloadBlob = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
    