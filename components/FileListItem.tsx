
import React from 'react';
import { FileJob } from '../types.ts';
import Spinner from './Spinner.tsx';
import { CheckCircleIcon, XCircleIcon, DocumentIcon, ArchiveBoxIcon } from './Icons.tsx'; // Removed ArrowDownTrayIcon as it's not used here

interface FileListItemProps {
  job: FileJob;
}

const getFileExtension = (fileName: string): string => {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) return '';
  return fileName.substring(lastDot + 1).toLowerCase();
};

const FileListItem: React.FC<FileListItemProps> = ({ job }) => {
  const getStatusIcon = () => {
    switch (job.status) {
      case 'queued':
        return <Spinner size="w-5 h-5" color="text-slate-400" />;
      case 'processing':
      case 'extracting_zip':
        return <Spinner size="w-5 h-5" color="text-blue-400" />;
      case 'converted':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-400" />;
      case 'skipped':
        return <DocumentIcon className="w-5 h-5 text-slate-500" />; 
      default:
        return <DocumentIcon className="w-5 h-5 text-slate-400" />;
    }
  };

  const getFileIcon = () => {
    const extension = getFileExtension(job.originalFile.name);
    if (extension === 'zip') {
      return <ArchiveBoxIcon className="w-6 h-6 text-yellow-400" />;
    }
    return <DocumentIcon className="w-6 h-6 text-blue-400" />;
  };

  const getStatusColor = () => {
    switch (job.status) {
      case 'error': return 'text-red-400';
      case 'converted': return 'text-green-400';
      case 'skipped': return 'text-slate-400';
      case 'processing':
      case 'extracting_zip': return 'text-blue-400';
      default: return 'text-slate-300';
    }
  };
  
  const statusTextMap: Record<FileJob['status'], string> = {
    queued: 'Queued',
    extracting_zip: 'Extracting ZIP...',
    processing: 'Converting...',
    converted: 'Converted & Downloaded',
    error: 'Error',
    skipped: 'Skipped',
  };

  return (
    <li className="flex items-center justify-between p-4 bg-slate-800 border border-slate-700 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-150">
      <div className="flex items-center space-x-3 min-w-0">
        <div className="flex-shrink-0">
          {getFileIcon()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-100 truncate" title={job.originalFile.name}>
            {job.originalFile.name}
          </p>
          <p className={`text-xs ${getStatusColor()} truncate`} title={job.message}>
            {statusTextMap[job.status]}
            {job.status === 'error' && job.message ? `: ${job.message}` : ''}
            {job.status === 'skipped' && job.message ? `: ${job.message}` : ''}
          </p>
        </div>
      </div>
      <div className="flex-shrink-0 ml-3">
        {getStatusIcon()}
      </div>
    </li>
  );
};

export default FileListItem;