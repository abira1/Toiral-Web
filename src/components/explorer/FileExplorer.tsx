import React, { useState, useEffect } from 'react';
import { Win95Button } from '../Win95Button';
import { database } from '../../firebase/config';
import { ref, onValue, off, set } from 'firebase/database';
import {
  FolderIcon,
  FileIcon,
  ArrowUpIcon,
  RefreshCwIcon,
  ListIcon,
  GridIcon,
  SearchIcon,
  InfoIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LoaderIcon,
  DatabaseIcon
} from 'lucide-react';
import { FileDetails } from './FileDetails';
import { FilePreview } from './FilePreview';
import { portfolioData } from '../../scripts/initializePortfolioData';

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

interface ExplorerProps {
  onClose: () => void;
}

export function FileExplorer({ onClose }: ExplorerProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState('/');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'size' | 'date'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['/']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showInitButton, setShowInitButton] = useState(false);

  // Load files from Firebase
  useEffect(() => {
    setLoading(true);

    const portfolioRef = ref(database, 'portfolio');

    const handleData = (snapshot: any) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const allFiles: FileItem[] = [];

        // Process the data to create file items
        Object.keys(data).forEach(key => {
          const item = data[key];

          // Create a file item
          const fileItem: FileItem = {
            id: key,
            name: item.name || 'Unnamed',
            type: item.type || 'file',
            size: item.size,
            extension: item.extension,
            url: item.url,
            description: item.description,
            dateCreated: item.dateCreated || Date.now(),
            dateModified: item.dateModified || Date.now(),
            parentFolder: item.parentFolder || '/',
            content: item.content
          };

          allFiles.push(fileItem);
        });

        console.log('Loaded files from Firebase:', allFiles);
        console.log('Root files:', allFiles.filter(f => f.parentFolder === '/'));

        setFiles(allFiles);
        setShowInitButton(false);
      } else {
        // If no data exists, show the initialize button
        setShowInitButton(true);
        console.log('No portfolio data found in Firebase. Showing initialize button.');

        // Initialize with the portfolio data directly
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

  // Filter files based on current folder and search query
  const filteredFiles = files.filter(file => {
    // For root folder, match files with parentFolder = '/'
    // For other folders, match files with parentFolder = '/FolderName'
    const matchesFolder = file.parentFolder === currentFolder;

    const matchesSearch = searchQuery === '' ||
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (file.description && file.description.toLowerCase().includes(searchQuery.toLowerCase()));

    // Debug logging to help diagnose issues
    console.log(`File: ${file.name}, parentFolder: ${file.parentFolder}, currentFolder: ${currentFolder}, matches: ${matchesFolder}`);

    return matchesFolder && matchesSearch;
  });

  // Sort files
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    // Always put folders before files
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1;
    }

    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'type':
        comparison = (a.extension || '').localeCompare(b.extension || '');
        break;
      case 'size':
        comparison = (a.size || 0) - (b.size || 0);
        break;
      case 'date':
        comparison = a.dateModified - b.dateModified;
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Handle file/folder click
  const handleItemClick = (file: FileItem) => {
    if (file.type === 'folder') {
      // Navigate to folder
      const newPath = currentFolder === '/' ? `/${file.name}` : `${currentFolder}/${file.name}`;
      console.log(`Navigating to folder: ${newPath}`);

      // Update navigation history
      const newHistory = [...navigationHistory.slice(0, historyIndex + 1), newPath];
      setNavigationHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      setCurrentFolder(newPath);
      setSelectedFile(null);

      // Log the files that should be in this folder
      const filesInFolder = files.filter(f => f.parentFolder === newPath);
      console.log(`Files in folder ${newPath}:`, filesInFolder);
    } else {
      // Select file
      setSelectedFile(file);
    }
  };

  // Handle double click
  const handleItemDoubleClick = (file: FileItem) => {
    if (file.type === 'folder') {
      // Already handled by single click
      return;
    } else {
      // Open file preview
      setShowPreview(true);
    }
  };

  // Navigate up one folder
  const navigateUp = () => {
    if (currentFolder === '/') return;

    const lastSlashIndex = currentFolder.lastIndexOf('/');
    const parentFolder = lastSlashIndex <= 0 ? '/' : currentFolder.substring(0, lastSlashIndex);

    // Update navigation history
    const newHistory = [...navigationHistory.slice(0, historyIndex + 1), parentFolder];
    setNavigationHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    setCurrentFolder(parentFolder);
    setSelectedFile(null);
  };

  // Navigate back in history
  const navigateBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentFolder(navigationHistory[newIndex]);
      setSelectedFile(null);
    }
  };

  // Navigate forward in history
  const navigateForward = () => {
    if (historyIndex < navigationHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentFolder(navigationHistory[newIndex]);
      setSelectedFile(null);
    }
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

  // Initialize portfolio data
  const initializePortfolio = async () => {
    setLoading(true);
    try {
      // Create a modified version of the portfolio data with corrected parentFolder paths
      const modifiedPortfolioData = { ...portfolioData };

      // Fix the parentFolder paths for files in subfolders
      Object.keys(modifiedPortfolioData).forEach(key => {
        const item = modifiedPortfolioData[key];

        // If the parentFolder is not the root folder, make sure it has the correct format
        if (item.parentFolder && item.parentFolder !== '/') {
          // Remove any leading slash to standardize the format
          const folderName = item.parentFolder.replace(/^\//, '');

          // Set the parentFolder to the correct format: /FolderName
          modifiedPortfolioData[key].parentFolder = `/${folderName}`;
        }
      });

      // Save the modified data to Firebase
      const portfolioRef = ref(database, 'portfolio');
      await set(portfolioRef, modifiedPortfolioData);
      console.log('Portfolio data initialized successfully');

      // Refresh the file list
      const allFiles: FileItem[] = [];
      Object.keys(modifiedPortfolioData).forEach(key => {
        const item = modifiedPortfolioData[key];

        const fileItem: FileItem = {
          id: key,
          name: item.name,
          type: item.type,
          size: item.size,
          extension: item.extension,
          url: item.url,
          description: item.description,
          dateCreated: item.dateCreated,
          dateModified: item.dateModified,
          parentFolder: item.parentFolder,
          content: item.content
        };

        allFiles.push(fileItem);
      });

      // Log the files for debugging
      console.log('All files:', allFiles);
      console.log('Root files:', allFiles.filter(f => f.parentFolder === '/'));

      setFiles(allFiles);
      setShowInitButton(false);
    } catch (error) {
      console.error('Error initializing portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get file icon based on type and extension
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

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-gray-200 border-b-2 border-gray-400 p-2 flex flex-wrap items-center gap-2">
        <Win95Button
          className="px-2 py-1 font-mono text-sm flex items-center"
          onClick={navigateBack}
          disabled={historyIndex <= 0}
        >
          <ChevronLeftIcon className="w-4 h-4 mr-1" />
          Back
        </Win95Button>

        <Win95Button
          className="px-2 py-1 font-mono text-sm flex items-center"
          onClick={navigateForward}
          disabled={historyIndex >= navigationHistory.length - 1}
        >
          <ChevronRightIcon className="w-4 h-4 mr-1" />
          Forward
        </Win95Button>

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

        <div className="flex-1 min-w-[200px] ml-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full px-2 py-1 border-2 border-gray-400 font-mono text-sm"
            />
            <SearchIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" />
          </div>
        </div>

        <div className="flex items-center space-x-1">
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
        <span className="font-mono text-sm mr-2">Address:</span>
        <div className="flex-1 bg-white border-2 border-gray-400 px-2 py-1">
          <span className="font-mono text-sm">{currentFolder}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* File List */}
        <div className="flex-1 overflow-auto bg-white p-2">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <LoaderIcon className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              {viewMode === 'list' ? (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-200">
                      <th
                        className="font-mono text-left p-2 border-b-2 border-gray-300 cursor-pointer"
                        onClick={() => {
                          if (sortBy === 'name') {
                            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortBy('name');
                            setSortDirection('asc');
                          }
                        }}
                      >
                        Name {sortBy === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
                      </th>
                      <th
                        className="font-mono text-left p-2 border-b-2 border-gray-300 cursor-pointer"
                        onClick={() => {
                          if (sortBy === 'type') {
                            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortBy('type');
                            setSortDirection('asc');
                          }
                        }}
                      >
                        Type {sortBy === 'type' && (sortDirection === 'asc' ? '▲' : '▼')}
                      </th>
                      <th
                        className="font-mono text-left p-2 border-b-2 border-gray-300 cursor-pointer"
                        onClick={() => {
                          if (sortBy === 'size') {
                            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortBy('size');
                            setSortDirection('asc');
                          }
                        }}
                      >
                        Size {sortBy === 'size' && (sortDirection === 'asc' ? '▲' : '▼')}
                      </th>
                      <th
                        className="font-mono text-left p-2 border-b-2 border-gray-300 cursor-pointer"
                        onClick={() => {
                          if (sortBy === 'date') {
                            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortBy('date');
                            setSortDirection('asc');
                          }
                        }}
                      >
                        Modified {sortBy === 'date' && (sortDirection === 'asc' ? '▲' : '▼')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedFiles.map((file) => (
                      <tr
                        key={file.id}
                        className={`border-b border-gray-200 cursor-pointer ${selectedFile?.id === file.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                        onClick={() => handleItemClick(file)}
                        onDoubleClick={() => handleItemDoubleClick(file)}
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
                    {sortedFiles.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center font-mono">
                          {searchQuery ? 'No files match your search.' : 'This folder is empty.'}
                          {showInitButton && currentFolder === '/' && (
                            <div className="mt-4">
                              <Win95Button
                                className="px-4 py-2 font-mono flex items-center mx-auto"
                                onClick={initializePortfolio}
                              >
                                <DatabaseIcon className="w-4 h-4 mr-2" />
                                Initialize Portfolio Data
                              </Win95Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-2">
                  {sortedFiles.map((file) => (
                    <div
                      key={file.id}
                      className={`flex flex-col items-center p-2 cursor-pointer ${selectedFile?.id === file.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                      onClick={() => handleItemClick(file)}
                      onDoubleClick={() => handleItemDoubleClick(file)}
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
                  {sortedFiles.length === 0 && (
                    <div className="col-span-full p-4 text-center font-mono">
                      {searchQuery ? 'No files match your search.' : 'This folder is empty.'}
                      {showInitButton && currentFolder === '/' && (
                        <div className="mt-4">
                          <Win95Button
                            className="px-4 py-2 font-mono flex items-center mx-auto"
                            onClick={initializePortfolio}
                          >
                            <DatabaseIcon className="w-4 h-4 mr-2" />
                            Initialize Portfolio Data
                          </Win95Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Details Panel (optional) */}
        {selectedFile && showDetails && (
          <div className="w-64 border-l-2 border-gray-400 bg-gray-100 p-2 overflow-y-auto">
            <FileDetails file={selectedFile} onClose={() => setShowDetails(false)} />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-gray-200 border-t-2 border-gray-400 p-2 flex items-center justify-between">
        <div className="font-mono text-sm">
          {sortedFiles.length} {sortedFiles.length === 1 ? 'item' : 'items'}
        </div>

        <div className="flex items-center">
          {selectedFile && (
            <Win95Button
              className="px-2 py-1 font-mono text-sm flex items-center"
              onClick={() => setShowDetails(!showDetails)}
            >
              <InfoIcon className="w-4 h-4 mr-1" />
              {showDetails ? 'Hide Details' : 'Details'}
            </Win95Button>
          )}
        </div>
      </div>

      {/* File Preview Dialog */}
      {selectedFile && showPreview && (
        <FilePreview
          file={selectedFile}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
