import React from 'react';
import { Win95Button } from '../Win95Button';
import { XIcon, FileIcon, FolderIcon } from 'lucide-react';

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

interface FileDetailsProps {
  file: FileItem;
  onClose: () => void;
}

export function FileDetails({ file, onClose }: FileDetailsProps) {
  // Format file size
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '0 B';
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // Format date
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-mono font-bold">Properties</h3>
        <Win95Button className="h-6 w-6 flex items-center justify-center p-0" onClick={onClose}>
          <XIcon className="w-4 h-4" />
        </Win95Button>
      </div>
      
      <div className="flex items-center justify-center mb-4">
        {file.type === 'folder' ? (
          <FolderIcon className="w-16 h-16 text-yellow-600" />
        ) : file.extension === 'png' || file.extension === 'jpg' || file.extension === 'jpeg' || file.extension === 'gif' ? (
          <div className="w-16 h-16 border border-gray-400 overflow-hidden">
            <img 
              src={file.url || 'https://via.placeholder.com/100'} 
              alt={file.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <FileIcon className="w-16 h-16 text-blue-600" />
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <table className="w-full">
          <tbody>
            <tr>
              <td className="font-mono text-sm font-bold p-1">Name:</td>
              <td className="font-mono text-sm p-1">{file.name}</td>
            </tr>
            <tr>
              <td className="font-mono text-sm font-bold p-1">Type:</td>
              <td className="font-mono text-sm p-1">
                {file.type === 'folder' ? 'Folder' : `${file.extension?.toUpperCase() || 'Unknown'} File`}
              </td>
            </tr>
            {file.type === 'file' && (
              <tr>
                <td className="font-mono text-sm font-bold p-1">Size:</td>
                <td className="font-mono text-sm p-1">{formatFileSize(file.size)}</td>
              </tr>
            )}
            <tr>
              <td className="font-mono text-sm font-bold p-1">Location:</td>
              <td className="font-mono text-sm p-1">{file.parentFolder}</td>
            </tr>
            <tr>
              <td className="font-mono text-sm font-bold p-1">Created:</td>
              <td className="font-mono text-sm p-1">{formatDate(file.dateCreated)}</td>
            </tr>
            <tr>
              <td className="font-mono text-sm font-bold p-1">Modified:</td>
              <td className="font-mono text-sm p-1">{formatDate(file.dateModified)}</td>
            </tr>
            {file.description && (
              <tr>
                <td className="font-mono text-sm font-bold p-1">Description:</td>
                <td className="font-mono text-sm p-1">{file.description}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
