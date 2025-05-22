import React, { useState, useEffect } from 'react';
import { Win95Button } from '../Win95Button';
import { database } from '../../firebase/config';
import { ref, set, onValue, off } from 'firebase/database';
import {
  FolderIcon,
  FileIcon,
  ArrowUpIcon,
  RefreshCwIcon,
  ListIcon,
  GridIcon,
  DatabaseIcon
} from 'lucide-react';

// Sample portfolio data
const samplePortfolioData = {
  'folder1': {
    id: 'folder1',
    name: 'Web Projects',
    type: 'folder',
    dateCreated: Date.now() - 30 * 24 * 60 * 60 * 1000,
    dateModified: Date.now() - 5 * 24 * 60 * 60 * 1000,
    parentFolder: '/'
  },
  'folder2': {
    id: 'folder2',
    name: 'Mobile Apps',
    type: 'folder',
    dateCreated: Date.now() - 60 * 24 * 60 * 60 * 1000,
    dateModified: Date.now() - 10 * 24 * 60 * 60 * 1000,
    parentFolder: '/'
  },
  'folder3': {
    id: 'folder3',
    name: 'Design Work',
    type: 'folder',
    dateCreated: Date.now() - 90 * 24 * 60 * 60 * 1000,
    dateModified: Date.now() - 15 * 24 * 60 * 60 * 1000,
    parentFolder: '/'
  },
  'file1': {
    id: 'file1',
    name: 'Portfolio Overview',
    type: 'file',
    extension: 'txt',
    size: 2048,
    dateCreated: Date.now() - 120 * 24 * 60 * 60 * 1000,
    dateModified: Date.now() - 20 * 24 * 60 * 60 * 1000,
    parentFolder: '/',
    description: 'An overview of my portfolio and skills',
    content: 'Welcome to my portfolio! I specialize in web development, mobile app development, and UI/UX design.'
  },
  'file2': {
    id: 'file2',
    name: 'Contact Information',
    type: 'file',
    extension: 'txt',
    size: 1024,
    dateCreated: Date.now() - 150 * 24 * 60 * 60 * 1000,
    dateModified: Date.now() - 25 * 24 * 60 * 60 * 1000,
    parentFolder: '/',
    description: 'My contact information',
    content: 'Email: contact@example.com\nPhone: (123) 456-7890\nWebsite: www.example.com'
  },
  'file3': {
    id: 'file3',
    name: 'Company Logo',
    type: 'file',
    extension: 'png',
    size: 1048576,
    url: 'https://via.placeholder.com/500x500?text=Logo',
    dateCreated: Date.now() - 180 * 24 * 60 * 60 * 1000,
    dateModified: Date.now() - 30 * 24 * 60 * 60 * 1000,
    parentFolder: '/',
    description: 'Company logo design'
  },
  'webproject1': {
    id: 'webproject1',
    name: 'E-commerce Website',
    type: 'file',
    extension: 'txt',
    size: 1536,
    dateCreated: Date.now() - 45 * 24 * 60 * 60 * 1000,
    dateModified: Date.now() - 5 * 24 * 60 * 60 * 1000,
    parentFolder: '/Web Projects',
    description: 'E-commerce website project details',
    content: 'A fully responsive e-commerce website built with React and Node.js.'
  },
  'mobileapp1': {
    id: 'mobileapp1',
    name: 'Food Delivery App',
    type: 'file',
    extension: 'txt',
    size: 1792,
    dateCreated: Date.now() - 55 * 24 * 60 * 60 * 1000,
    dateModified: Date.now() - 15 * 24 * 60 * 60 * 1000,
    parentFolder: '/Mobile Apps',
    description: 'Food delivery app project details',
    content: 'A mobile app for food ordering and delivery tracking.'
  },
  'design1': {
    id: 'design1',
    name: 'Brand Identity',
    type: 'file',
    extension: 'txt',
    size: 1664,
    dateCreated: Date.now() - 65 * 24 * 60 * 60 * 1000,
    dateModified: Date.now() - 25 * 24 * 60 * 60 * 1000,
    parentFolder: '/Design Work',
    description: 'Brand identity project details',
    content: 'Complete brand identity design for a tech startup.'
  }
};

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
  content?: string;
}

interface SimpleFileExplorerProps {
  onClose: () => void;
}

export function SimpleFileExplorer({ onClose }: SimpleFileExplorerProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState('/');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [loading, setLoading] = useState(true);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>(['/']);

  // Initialize portfolio data
  const initializePortfolio = async () => {
    setLoading(true);
    try {
      const portfolioRef = ref(database, 'portfolio');
      await set(portfolioRef, samplePortfolioData);
      console.log('Portfolio data initialized successfully');
      
      // Convert the sample data to an array
      const fileArray = Object.values(samplePortfolioData);
      setFiles(fileArray);
    } catch (error) {
      console.error('Error initializing portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load files from Firebase or initialize if empty
  useEffect(() => {
    setLoading(true);
    
    const portfolioRef = ref(database, 'portfolio');
    
    const handleData = (snapshot: any) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const fileArray = Object.values(data) as FileItem[];
        setFiles(fileArray);
      } else {
        // If no data exists, initialize with sample data
        initializePortfolio();
      }
      
      setLoading(false);
    };
    
    onValue(portfolioRef, handleData);
    
    return () => {
      off(portfolioRef);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get files for the current folder
  const getCurrentFolderFiles = () => {
    return files.filter(file => file.parentFolder === currentFolder);
  };

  // Handle folder navigation
  const navigateToFolder = (folder: FileItem) => {
    const newPath = folder.parentFolder === '/' 
      ? `/${folder.name}` 
      : `${folder.parentFolder}/${folder.name}`;
    
    setCurrentFolder(newPath);
    setSelectedFile(null);
    
    // Update breadcrumbs
    const newBreadcrumbs = [...breadcrumbs, newPath];
    setBreadcrumbs(newBreadcrumbs);
  };

  // Navigate up one level
  const navigateUp = () => {
    if (currentFolder === '/') return;
    
    const parts = currentFolder.split('/');
    parts.pop(); // Remove the last part
    
    const parentFolder = parts.length === 1 ? '/' : parts.join('/');
    setCurrentFolder(parentFolder);
    setSelectedFile(null);
    
    // Update breadcrumbs
    const newBreadcrumbs = breadcrumbs.slice(0, breadcrumbs.length - 1);
    setBreadcrumbs(newBreadcrumbs);
  };

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
    return new Date(timestamp).toLocaleDateString();
  };

  // Get file icon
  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') {
      return <FolderIcon className="w-5 h-5 text-yellow-600" />;
    }
    
    switch (file.extension) {
      case 'txt':
        return <FileIcon className="w-5 h-5 text-blue-600" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return <FileIcon className="w-5 h-5 text-green-600" />;
      default:
        return <FileIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  // Handle file click
  const handleFileClick = (file: FileItem) => {
    if (file.type === 'folder') {
      navigateToFolder(file);
    } else {
      setSelectedFile(file);
    }
  };

  // Render file details
  const renderFileDetails = () => {
    if (!selectedFile) return null;
    
    return (
      <div className="border-t-2 border-gray-400 p-4 bg-gray-100">
        <h3 className="font-mono font-bold mb-2">{selectedFile.name}</h3>
        
        <div className="grid grid-cols-2 gap-2 font-mono text-sm">
          <div>Type:</div>
          <div>{selectedFile.type === 'folder' ? 'Folder' : `${selectedFile.extension?.toUpperCase() || 'Unknown'} File`}</div>
          
          {selectedFile.type === 'file' && (
            <>
              <div>Size:</div>
              <div>{formatFileSize(selectedFile.size)}</div>
            </>
          )}
          
          <div>Created:</div>
          <div>{formatDate(selectedFile.dateCreated)}</div>
          
          <div>Modified:</div>
          <div>{formatDate(selectedFile.dateModified)}</div>
        </div>
        
        {selectedFile.description && (
          <div className="mt-2">
            <div className="font-mono font-bold">Description:</div>
            <div className="font-mono text-sm">{selectedFile.description}</div>
          </div>
        )}
        
        {selectedFile.content && (
          <div className="mt-2">
            <div className="font-mono font-bold">Content:</div>
            <div className="font-mono text-sm bg-white p-2 border border-gray-300 mt-1 whitespace-pre-wrap">
              {selectedFile.content}
            </div>
          </div>
        )}
        
        {selectedFile.url && (
          <div className="mt-2">
            <div className="font-mono font-bold">Preview:</div>
            <div className="mt-1">
              <img 
                src={selectedFile.url} 
                alt={selectedFile.name}
                className="max-w-full max-h-48 object-contain border border-gray-300"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-gray-200 border-b-2 border-gray-400 p-2 flex flex-wrap items-center gap-2">
        <Win95Button 
          className="px-2 py-1 font-mono text-sm flex items-center"
          onClick={navigateUp}
          disabled={currentFolder === '/'}
        >
          <ArrowUpIcon className="w-4 h-4 mr-1" />
          Up
        </Win95Button>
        
        <Win95Button 
          className="px-2 py-1 font-mono text-sm flex items-center"
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 500);
          }}
        >
          <RefreshCwIcon className="w-4 h-4 mr-1" />
          Refresh
        </Win95Button>
        
        <Win95Button 
          className="px-2 py-1 font-mono text-sm flex items-center"
          onClick={initializePortfolio}
        >
          <DatabaseIcon className="w-4 h-4 mr-1" />
          Initialize Data
        </Win95Button>
        
        <div className="flex items-center space-x-1 ml-auto">
          <Win95Button 
            className={`px-2 py-1 font-mono text-sm flex items-center ${viewMode === 'list' ? 'bg-blue-100' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <ListIcon className="w-4 h-4" />
          </Win95Button>
          
          <Win95Button 
            className={`px-2 py-1 font-mono text-sm flex items-center ${viewMode === 'grid' ? 'bg-blue-100' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <GridIcon className="w-4 h-4" />
          </Win95Button>
        </div>
      </div>
      
      {/* Address Bar */}
      <div className="bg-white border-b-2 border-gray-400 p-2 flex items-center">
        <span className="font-mono text-sm mr-2">Location:</span>
        <div className="flex-1 bg-white border-2 border-gray-400 px-2 py-1">
          <span className="font-mono text-sm">{currentFolder}</span>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-white p-2">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="font-mono text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Loading...</p>
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'list' ? (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="font-mono text-left p-2 border-b-2 border-gray-300">Name</th>
                    <th className="font-mono text-left p-2 border-b-2 border-gray-300">Type</th>
                    <th className="font-mono text-left p-2 border-b-2 border-gray-300">Size</th>
                    <th className="font-mono text-left p-2 border-b-2 border-gray-300">Modified</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentFolderFiles().map((file) => (
                    <tr 
                      key={file.id}
                      className={`border-b border-gray-200 cursor-pointer ${selectedFile?.id === file.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                      onClick={() => handleFileClick(file)}
                    >
                      <td className="p-2 font-mono">
                        <div className="flex items-center">
                          {getFileIcon(file)}
                          <span className="ml-2">{file.name}</span>
                        </div>
                      </td>
                      <td className="p-2 font-mono">
                        {file.type === 'folder' ? 'Folder' : file.extension?.toUpperCase() || 'File'}
                      </td>
                      <td className="p-2 font-mono">
                        {file.type === 'folder' ? '' : formatFileSize(file.size)}
                      </td>
                      <td className="p-2 font-mono">
                        {formatDate(file.dateModified)}
                      </td>
                    </tr>
                  ))}
                  {getCurrentFolderFiles().length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center font-mono">
                        This folder is empty.
                        <div className="mt-4">
                          <Win95Button
                            className="px-4 py-2 font-mono flex items-center mx-auto"
                            onClick={initializePortfolio}
                          >
                            <DatabaseIcon className="w-4 h-4 mr-2" />
                            Initialize Portfolio Data
                          </Win95Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-2">
                {getCurrentFolderFiles().map((file) => (
                  <div
                    key={file.id}
                    className={`flex flex-col items-center p-2 cursor-pointer ${selectedFile?.id === file.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                    onClick={() => handleFileClick(file)}
                  >
                    <div className="w-16 h-16 flex items-center justify-center">
                      {file.type === 'folder' ? (
                        <FolderIcon className="w-12 h-12 text-yellow-600" />
                      ) : (
                        file.extension === 'png' || file.extension === 'jpg' || file.extension === 'jpeg' || file.extension === 'gif' ? (
                          <div className="w-12 h-12 border border-gray-400 overflow-hidden">
                            <img 
                              src={file.url || 'https://via.placeholder.com/100'} 
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <FileIcon className="w-12 h-12 text-blue-600" />
                        )
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p className="font-mono text-xs truncate max-w-full">{file.name}</p>
                      <p className="font-mono text-xs text-gray-500">
                        {file.type === 'folder' ? 'Folder' : file.extension?.toUpperCase() || 'File'}
                      </p>
                    </div>
                  </div>
                ))}
                {getCurrentFolderFiles().length === 0 && (
                  <div className="col-span-full p-4 text-center font-mono">
                    This folder is empty.
                    <div className="mt-4">
                      <Win95Button
                        className="px-4 py-2 font-mono flex items-center mx-auto"
                        onClick={initializePortfolio}
                      >
                        <DatabaseIcon className="w-4 h-4 mr-2" />
                        Initialize Portfolio Data
                      </Win95Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Status Bar */}
      <div className="bg-gray-200 border-t-2 border-gray-400 p-2 flex items-center justify-between">
        <div className="font-mono text-sm">
          {getCurrentFolderFiles().length} {getCurrentFolderFiles().length === 1 ? 'item' : 'items'}
        </div>
      </div>
      
      {/* File Details */}
      {selectedFile && renderFileDetails()}
    </div>
  );
}
