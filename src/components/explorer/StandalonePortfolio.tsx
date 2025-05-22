import React, { useState } from 'react';
import { Win95Button } from '../Win95Button';
import {
  FolderIcon,
  FileIcon,
  ArrowUpIcon,
  ListIcon,
  GridIcon,
  HomeIcon
} from 'lucide-react';

// Define the file item interface
interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  extension?: string;
  url?: string;
  description?: string;
  content?: string;
  parentPath: string;
  children?: string[]; // IDs of child files/folders
}

// Hard-coded portfolio data
const PORTFOLIO_DATA: Record<string, FileItem> = {
  'root': {
    id: 'root',
    name: 'Portfolio',
    type: 'folder',
    parentPath: '',
    children: ['web_projects', 'mobile_apps', 'design_work', 'overview', 'contact', 'logo']
  },
  'web_projects': {
    id: 'web_projects',
    name: 'Web Projects',
    type: 'folder',
    parentPath: 'root',
    children: ['ecommerce', 'portfolio_site']
  },
  'mobile_apps': {
    id: 'mobile_apps',
    name: 'Mobile Apps',
    type: 'folder',
    parentPath: 'root',
    children: ['food_delivery', 'fitness_tracker']
  },
  'design_work': {
    id: 'design_work',
    name: 'Design Work',
    type: 'folder',
    parentPath: 'root',
    children: ['brand_identity', 'ui_ux_design', 'logo_design']
  },
  'overview': {
    id: 'overview',
    name: 'Portfolio Overview',
    type: 'file',
    extension: 'txt',
    size: 2048,
    parentPath: 'root',
    description: 'An overview of my portfolio and skills',
    content: `# Portfolio Overview

Welcome to my portfolio! I specialize in web development, mobile app development, and UI/UX design.

## Skills
- Frontend: React, Vue, Angular
- Backend: Node.js, Express, Firebase
- Mobile: React Native, Flutter
- Design: Figma, Adobe XD, Photoshop

## Experience
I have over 5 years of experience building web and mobile applications for clients across various industries.

Feel free to explore my projects in the folders!`
  },
  'contact': {
    id: 'contact',
    name: 'Contact Information',
    type: 'file',
    extension: 'txt',
    size: 1024,
    parentPath: 'root',
    description: 'My contact information',
    content: `# Contact Information

Email: contact@example.com
Phone: (123) 456-7890
Website: www.example.com

## Social Media
- LinkedIn: linkedin.com/in/example
- GitHub: github.com/example
- Twitter: @example

Feel free to reach out for collaboration opportunities!`
  },
  'logo': {
    id: 'logo',
    name: 'Company Logo',
    type: 'file',
    extension: 'png',
    size: 1048576,
    url: 'https://via.placeholder.com/500x500?text=Logo',
    parentPath: 'root',
    description: 'Company logo design'
  },
  'ecommerce': {
    id: 'ecommerce',
    name: 'E-commerce Website',
    type: 'file',
    extension: 'txt',
    size: 1536,
    parentPath: 'web_projects',
    description: 'E-commerce website project details',
    content: `# E-commerce Website

## Project Overview
A fully responsive e-commerce website built with React and Node.js.

## Features
- User authentication
- Product catalog
- Shopping cart
- Payment processing
- Order tracking

## Technologies
- Frontend: React, Redux, Tailwind CSS
- Backend: Node.js, Express, MongoDB
- Payment: Stripe API
- Hosting: AWS

## Timeline
Development completed in 3 months.`
  },
  'portfolio_site': {
    id: 'portfolio_site',
    name: 'Portfolio Website',
    type: 'file',
    extension: 'txt',
    size: 1280,
    parentPath: 'web_projects',
    description: 'Portfolio website project details',
    content: `# Portfolio Website

## Project Overview
A personal portfolio website with a unique Windows 95 aesthetic.

## Features
- Interactive desktop interface
- Project showcase
- Contact form
- Blog section

## Technologies
- React
- Firebase
- Tailwind CSS
- Framer Motion

## Timeline
Development completed in 2 months.`
  },
  'food_delivery': {
    id: 'food_delivery',
    name: 'Food Delivery App',
    type: 'file',
    extension: 'txt',
    size: 1792,
    parentPath: 'mobile_apps',
    description: 'Food delivery app project details',
    content: `# Food Delivery App

## Project Overview
A mobile app for food ordering and delivery tracking.

## Features
- User registration and profiles
- Restaurant browsing
- Menu viewing and ordering
- Real-time delivery tracking
- Payment integration

## Technologies
- React Native
- Firebase
- Google Maps API
- Stripe

## Timeline
Development completed in 4 months.`
  },
  'fitness_tracker': {
    id: 'fitness_tracker',
    name: 'Fitness Tracker',
    type: 'file',
    extension: 'txt',
    size: 1408,
    parentPath: 'mobile_apps',
    description: 'Fitness tracker app project details',
    content: `# Fitness Tracker App

## Project Overview
A mobile app for tracking workouts, nutrition, and fitness goals.

## Features
- Workout planning and tracking
- Nutrition logging
- Progress visualization
- Goal setting
- Social sharing

## Technologies
- Flutter
- Firebase
- HealthKit/Google Fit integration
- Charts.js

## Timeline
Development completed in 3 months.`
  },
  'brand_identity': {
    id: 'brand_identity',
    name: 'Brand Identity',
    type: 'file',
    extension: 'txt',
    size: 1664,
    parentPath: 'design_work',
    description: 'Brand identity project details',
    content: `# Brand Identity Project

## Project Overview
Complete brand identity design for a tech startup.

## Deliverables
- Logo design
- Color palette
- Typography
- Brand guidelines
- Marketing materials
- Website design

## Process
1. Research and discovery
2. Concept development
3. Design refinement
4. Final delivery

## Timeline
Project completed in 6 weeks.`
  },
  'ui_ux_design': {
    id: 'ui_ux_design',
    name: 'UI/UX Design',
    type: 'file',
    extension: 'txt',
    size: 1920,
    parentPath: 'design_work',
    description: 'UI/UX design project details',
    content: `# UI/UX Design Project

## Project Overview
User interface and experience design for a financial app.

## Deliverables
- User research
- User personas
- User flows
- Wireframes
- High-fidelity mockups
- Interactive prototype

## Tools
- Figma
- Adobe XD
- Miro
- InVision

## Timeline
Project completed in 2 months.`
  },
  'logo_design': {
    id: 'logo_design',
    name: 'Logo Design',
    type: 'file',
    extension: 'png',
    size: 1048576,
    url: 'https://via.placeholder.com/500x500?text=Logo+Design',
    parentPath: 'design_work',
    description: 'Logo design for a client'
  }
};

interface StandalonePortfolioProps {
  onClose: () => void;
}

export function StandalonePortfolio({ onClose }: StandalonePortfolioProps) {
  const [currentFolderId, setCurrentFolderId] = useState('root');
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['root']);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Get the current folder
  const currentFolder = PORTFOLIO_DATA[currentFolderId];

  // Get the files in the current folder
  const getCurrentFolderFiles = (): FileItem[] => {
    if (!currentFolder || !currentFolder.children) return [];
    
    return currentFolder.children.map(id => PORTFOLIO_DATA[id]);
  };

  // Get the selected file
  const selectedFile = selectedFileId ? PORTFOLIO_DATA[selectedFileId] : null;

  // Handle file/folder click
  const handleItemClick = (fileId: string) => {
    const file = PORTFOLIO_DATA[fileId];
    
    if (file.type === 'folder') {
      // Navigate to folder
      setCurrentFolderId(fileId);
      setSelectedFileId(null);
      
      // Update navigation history
      const newHistory = [...navigationHistory.slice(0, historyIndex + 1), fileId];
      setNavigationHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } else {
      // Select file
      setSelectedFileId(fileId);
    }
  };

  // Navigate up one level
  const navigateUp = () => {
    if (currentFolderId === 'root') return;
    
    const parentId = currentFolder.parentPath;
    if (parentId) {
      setCurrentFolderId(parentId);
      setSelectedFileId(null);
      
      // Update navigation history
      const newHistory = [...navigationHistory.slice(0, historyIndex + 1), parentId];
      setNavigationHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  // Navigate to root
  const navigateToRoot = () => {
    setCurrentFolderId('root');
    setSelectedFileId(null);
    
    // Update navigation history
    const newHistory = [...navigationHistory.slice(0, historyIndex + 1), 'root'];
    setNavigationHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Navigate back in history
  const navigateBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentFolderId(navigationHistory[newIndex]);
      setSelectedFileId(null);
    }
  };

  // Navigate forward in history
  const navigateForward = () => {
    if (historyIndex < navigationHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentFolderId(navigationHistory[newIndex]);
      setSelectedFileId(null);
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

  // Build breadcrumb path
  const getBreadcrumbPath = (): { id: string; name: string }[] => {
    const path: { id: string; name: string }[] = [];
    let currentId = currentFolderId;
    
    while (currentId) {
      const folder = PORTFOLIO_DATA[currentId];
      path.unshift({ id: currentId, name: folder.name });
      
      if (currentId === 'root' || !folder.parentPath) break;
      currentId = folder.parentPath;
    }
    
    return path;
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
          <span className="mr-1">←</span>
          Back
        </Win95Button>
        
        <Win95Button 
          className="px-2 py-1 font-mono text-sm flex items-center"
          onClick={navigateForward}
          disabled={historyIndex >= navigationHistory.length - 1}
        >
          <span className="mr-1">→</span>
          Forward
        </Win95Button>
        
        <Win95Button 
          className="px-2 py-1 font-mono text-sm flex items-center"
          onClick={navigateUp}
          disabled={currentFolderId === 'root'}
        >
          <ArrowUpIcon className="w-4 h-4 mr-1" />
          Up
        </Win95Button>
        
        <Win95Button 
          className="px-2 py-1 font-mono text-sm flex items-center"
          onClick={navigateToRoot}
        >
          <HomeIcon className="w-4 h-4 mr-1" />
          Home
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
      <div className="bg-white border-b-2 border-gray-400 p-2">
        <div className="flex items-center">
          <span className="font-mono text-sm mr-2">Address:</span>
          <div className="flex-1 bg-white border-2 border-gray-400 px-2 py-1 flex items-center overflow-x-auto">
            {getBreadcrumbPath().map((item, index) => (
              <React.Fragment key={item.id}>
                {index > 0 && <span className="mx-1 text-gray-500">\</span>}
                <button 
                  className="font-mono text-sm text-blue-800 hover:underline"
                  onClick={() => handleItemClick(item.id)}
                >
                  {item.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-white p-2">
        {viewMode === 'list' ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="font-mono text-left p-2 border-b-2 border-gray-300">Name</th>
                <th className="font-mono text-left p-2 border-b-2 border-gray-300">Type</th>
                <th className="font-mono text-left p-2 border-b-2 border-gray-300">Size</th>
              </tr>
            </thead>
            <tbody>
              {getCurrentFolderFiles().map((file) => (
                <tr 
                  key={file.id}
                  className={`border-b border-gray-200 cursor-pointer ${selectedFileId === file.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  onClick={() => handleItemClick(file.id)}
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
                </tr>
              ))}
              {getCurrentFolderFiles().length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center font-mono">
                    This folder is empty.
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
                className={`flex flex-col items-center p-2 cursor-pointer ${selectedFileId === file.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                onClick={() => handleItemClick(file.id)}
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
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Status Bar */}
      <div className="bg-gray-200 border-t-2 border-gray-400 p-2 flex items-center justify-between">
        <div className="font-mono text-sm">
          {getCurrentFolderFiles().length} {getCurrentFolderFiles().length === 1 ? 'item' : 'items'}
        </div>
      </div>
      
      {/* File Details */}
      {selectedFile && (
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
      )}
    </div>
  );
}
