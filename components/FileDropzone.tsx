import React, { useCallback, useState } from 'react';
import { DocumentArrowUpIcon } from './Icons';
import { ALLOWED_EXTENSIONS } from '../types';

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ onFilesSelected, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileProcessing = useCallback((fileList: FileList | null) => {
    if (fileList) {
      const files = Array.from(fileList).filter(file => {
        const extension = file.name.split('.').pop()?.toLowerCase() || '';
        return ALLOWED_EXTENSIONS.includes(extension);
      });
      if (files.length > 0) {
        onFilesSelected(files);
      }
    }
  }, [onFilesSelected]);

  const onDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const onDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled && event.dataTransfer.items && event.dataTransfer.items.length > 0) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }, [disabled]);

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    setIsDragging(false);
    handleFileProcessing(event.dataTransfer.files);
  }, [disabled, handleFileProcessing]);

  const onFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileProcessing(event.target.files);
    event.target.value = ''; 
  }, [handleFileProcessing]);

  const baseClasses = "flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors";
  const idleClasses = "border-slate-600 hover:border-blue-500 bg-slate-800 hover:bg-slate-700";
  const draggingClasses = "border-blue-500 bg-blue-900"; // A darker shade of blue for dragging state on dark bg
  const disabledClasses = "border-slate-700 bg-slate-800 cursor-not-allowed opacity-60";


  return (
    <div
      className={`${baseClasses} ${disabled ? disabledClasses : (isDragging ? draggingClasses : idleClasses)}`}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={() => !disabled && document.getElementById('fileInput')?.click()}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label="File upload dropzone"
    >
      <DocumentArrowUpIcon className={`w-12 h-12 mb-3 ${isDragging ? 'text-blue-400' : 'text-slate-500'}`} />
      <p className={`mb-2 text-sm ${isDragging ? 'text-blue-300' : 'text-slate-400'}`}>
        <span className="font-semibold">Click to upload</span> or drag and drop
      </p>
      <p className={`text-xs ${isDragging ? 'text-blue-400' : 'text-slate-500'}`}>
        HEIC, HEIF, WEBP, or ZIP files
      </p>
      <input
        id="fileInput"
        type="file"
        multiple
        className="hidden"
        onChange={onFileChange}
        accept=".heic,.heif,.webp,.zip"
        disabled={disabled}
        aria-hidden="true"
      />
    </div>
  );
};

export default FileDropzone;