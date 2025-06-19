
import React from 'react';
import Spinner from './Spinner.tsx';

interface FullScreenLoaderProps {
  message?: string;
}

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-85 flex flex-col items-center justify-center z-50">
      <Spinner size="w-12 h-12" color="text-blue-400" />
      {message && <p className="mt-4 text-lg text-slate-200">{message}</p>}
    </div>
  );
};

export default FullScreenLoader;