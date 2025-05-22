import React from 'react';
import { DialogWindow } from '../DialogWindow';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  extension?: string;
  url?: string;
  description?: string;
  dateCreated: number;
  dateModified: number;
  parentFolder: string;
  content?: any;
}

interface FilePreviewProps {
  file: FileItem;
  onClose: () => void;
}

export function FilePreview({ file, onClose }: FilePreviewProps) {
  // Render content based on file type
  const renderContent = () => {
    if (file.type === 'folder') {
      return (
        <div className="p-4 text-center">
          <p className="font-mono">Cannot preview folders.</p>
        </div>
      );
    }
    
    switch (file.extension) {
      case 'txt':
        return (
          <div className="p-4 bg-white font-mono text-sm whitespace-pre-wrap">
            {file.content || 'No content available.'}
          </div>
        );
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return (
          <div className="p-4 flex justify-center">
            <img 
              src={file.url || 'https://via.placeholder.com/400x300'} 
              alt={file.name}
              className="max-w-full max-h-[60vh] object-contain border-2 border-gray-400"
            />
          </div>
        );
      default:
        return (
          <div className="p-4 text-center">
            <p className="font-mono">Preview not available for this file type.</p>
            {file.description && (
              <p className="font-mono mt-2">{file.description}</p>
            )}
          </div>
        );
    }
  };

  return (
    <DialogWindow
      title={`Preview: ${file.name}`}
      onClose={onClose}
      style={{ width: 600, height: 'auto' }}
    >
      <div className="bg-gray-200 p-4">
        {renderContent()}
        
        {file.description && file.extension !== 'txt' && (
          <div className="mt-4 p-2 bg-gray-100 border-2 border-gray-300">
            <p className="font-mono text-sm">{file.description}</p>
          </div>
        )}
      </div>
    </DialogWindow>
  );
}
