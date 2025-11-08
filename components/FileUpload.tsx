
import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
  onFileUpload: (content: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        onFileUpload(text);
        setFileName(file.name);
      };
      reader.readAsText(file);
    } else {
        setFileName('');
        onFileUpload('');
    }
  }, [onFileUpload]);

  return (
    <div className="w-full">
      <label
        htmlFor="file-upload"
        className="relative cursor-pointer bg-brand-bg rounded-md border-2 border-dashed border-border-color hover:border-primary transition-colors flex flex-col justify-center items-center p-6 text-center"
      >
        <UploadIcon className="w-10 h-10 text-text-secondary mb-2" />
        <span className="text-primary font-semibold">Upload a file</span>
        <span className="text-xs text-text-secondary mt-1">
            {fileName || 'TXT, MD, or other plain text files'}
        </span>
        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".txt,.md,text/plain" />
      </label>
    </div>
  );
};
