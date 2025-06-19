import React, { useState, useEffect, useCallback } from 'react';
import FileDropzone from './components/FileDropzone';
import FileListItem from './components/FileListItem';
import FullScreenLoader from './components/FullScreenLoader';
import { FileJob, FileJobStatus, ALLOWED_EXTENSIONS, IMAGE_EXTENSIONS } from './types';
import { convertToPng } from './services/imageConverter';
import { extractImagesFromZip } from './services/zipHandler';
import { getFileNameWithoutExtension, getFileExtension, downloadBlob } from './services/utilities';
// import { ArrowDownTrayIcon } from './components/Icons'; // Not used directly in App.tsx template

const App: React.FC = () => {
  const [fileJobs, setFileJobs] = useState<FileJob[]>([]);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const checkScripts = () => {
      if (window.heic2any && window.JSZip) {
        setScriptsLoaded(true);
      } else {
        setTimeout(checkScripts, 100);
      }
    };
    checkScripts();
  }, []);

  const updateJob = useCallback((jobId: string, updates: Partial<FileJob>) => {
    setFileJobs(prevJobs =>
      prevJobs.map(j => (j.id === jobId ? { ...j, ...updates } : j))
    );
  }, []);

  const processFileJob = useCallback(async (job: FileJob) => {
    const extension = getFileExtension(job.originalFile.name);

    if (extension === 'zip') {
      updateJob(job.id, { status: 'extracting_zip', message: 'Extracting images from ZIP...' });
      try {
        const imagesInZip = await extractImagesFromZip(job.originalFile);
        if (imagesInZip.length === 0) {
          updateJob(job.id, { status: 'skipped', message: 'No supported images found in ZIP.' });
          return;
        }
        
        const newJobs: FileJob[] = imagesInZip.map(imgFile => ({
          id: crypto.randomUUID(),
          originalFile: imgFile,
          status: 'queued',
        }));

        setFileJobs(prevJobs => [
          ...prevJobs.filter(j => j.id !== job.id), // Remove the original ZIP job
          ...newJobs // Add new jobs for extracted images
        ]);

      } catch (error) {
        console.error('Error processing ZIP:', error);
        updateJob(job.id, { status: 'error', message: error instanceof Error ? error.message : 'ZIP extraction failed' });
      }
    } else if (IMAGE_EXTENSIONS.includes(extension)) {
      updateJob(job.id, { status: 'processing', message: 'Converting image...' });
      try {
        const pngBlob = await convertToPng(job.originalFile);
        const newFileName = `${getFileNameWithoutExtension(job.originalFile.name)}.png`;
        downloadBlob(pngBlob, newFileName);
        updateJob(job.id, { 
          status: 'converted', 
          message: `Converted to ${newFileName}`, 
          convertedBlob: pngBlob, 
          convertedFileName: newFileName 
        });
      } catch (error) {
        console.error('Error converting image:', error);
        updateJob(job.id, { status: 'error', message: error instanceof Error ? error.message : 'Image conversion failed' });
      }
    } else {
      updateJob(job.id, { status: 'skipped', message: `Unsupported file type: ${extension}` });
    }
  }, [updateJob]);


  useEffect(() => {
    const jobToProcess = fileJobs.find(j => j.status === 'queued');
    if (jobToProcess) {
      if (!isProcessing) { 
        setIsProcessing(true); 
        processFileJob(jobToProcess).finally(() => {
           setIsProcessing(false); 
        });
      }
    } else {
      const anyProcessing = fileJobs.some(j => ['extracting_zip', 'processing'].includes(j.status));
      if (!anyProcessing) {
        setIsProcessing(false);
      }
    }
  }, [fileJobs, processFileJob, isProcessing]);

  const handleFilesSelected = (selectedFiles: File[]) => {
    const newJobs: FileJob[] = selectedFiles.map(file => ({
      id: crypto.randomUUID(),
      originalFile: file,
      status: 'queued',
    }));
    setFileJobs(prevJobs => [...prevJobs, ...newJobs]);
  };

  const handleClearCompleted = () => {
    setFileJobs(prevJobs => prevJobs.filter(job => 
      job.status === 'queued' || job.status === 'processing' || job.status === 'extracting_zip'
    ));
  };
  
  const hasCompletedJobs = fileJobs.some(job => ['converted', 'error', 'skipped'].includes(job.status));


  if (!scriptsLoaded) {
    return <FullScreenLoader message="Loading conversion libraries..." />;
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-100">Image Format Converter</h1>
          <p className="mt-2 text-lg text-slate-300">
            Convert HEIF/HEIC and WebP images to PNG. Drag & drop or select files.
          </p>
        </header>

        <main>
          <section className="mb-8">
            <FileDropzone onFilesSelected={handleFilesSelected} disabled={isProcessing} />
            <p className="text-xs text-slate-400 mt-2 text-center">
              Supported: {ALLOWED_EXTENSIONS.join(', ').toUpperCase()}. ZIP files will be scanned for images.
            </p>
          </section>

          {fileJobs.length > 0 && (
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-slate-200">Conversion Queue</h2>
                {hasCompletedJobs && (
                   <button
                    onClick={handleClearCompleted}
                    className="px-4 py-2 text-sm font-medium text-blue-300 bg-blue-700 hover:bg-blue-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isProcessing && !fileJobs.every(j => j.status !== 'queued' && j.status !== 'processing' && j.status !== 'extracting_zip')}
                    title="Clear completed or errored files from the list"
                  >
                    Clear Completed
                  </button>
                )}
              </div>
              <ul className="space-y-3">
                {fileJobs.map(job => (
                  <FileListItem key={job.id} job={job} />
                ))}
              </ul>
            </section>
          )}
        </main>
        <footer className="text-center mt-12 py-6 border-t border-slate-700">
          <p className="text-sm text-slate-400">
            All processing is done in your browser. No files are uploaded to any server.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;