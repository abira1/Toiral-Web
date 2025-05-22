import React, { useState, useEffect, useRef } from 'react';
import { Win95Button } from '../Win95Button';
import { useContent } from '../../contexts/ContentContext';
import {
  TrashIcon,
  PlusIcon,
  GripVerticalIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SaveIcon,
  CheckIcon,
  AlertTriangleIcon,
  RefreshCwIcon
} from 'lucide-react';
import { PortfolioItem } from '../../types';
import { database } from '../../firebase/config';
import { ref, get } from 'firebase/database';

export function NewPortfolioManager() {
  const { content, updateContent } = useContent();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [databaseStatus, setDatabaseStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [databaseItems, setDatabaseItems] = useState<PortfolioItem[]>([]);
  const originalItemsRef = useRef<PortfolioItem[]>([]);

  // Check Firebase connection directly
  const checkFirebaseConnection = async () => {
    try {
      setDatabaseStatus('checking');
      console.log('Checking Firebase connection...');

      const portfolioRef = ref(database, 'portfolio');
      const snapshot = await get(portfolioRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log('Direct Firebase portfolio data:', data);
        setDatabaseItems(data);
        setDatabaseStatus('connected');
      } else {
        console.log('No portfolio data found in Firebase');
        setDatabaseItems([]);
        setDatabaseStatus('connected');
      }
    } catch (error) {
      console.error('Error connecting to Firebase:', error);
      setDatabaseStatus('error');
    }
  };

  // Initialize portfolio items with order property if it doesn't exist
  useEffect(() => {
    if (Array.isArray(content.portfolio)) {
      // Sort by order if it exists, otherwise maintain current order
      const sortedItems = [...content.portfolio].map((item, index) => ({
        ...item,
        order: item.order !== undefined ? item.order : index
      })).sort((a, b) => (a.order || 0) - (b.order || 0));

      setPortfolioItems(sortedItems);

      // Store the original items for change detection
      originalItemsRef.current = JSON.parse(JSON.stringify(sortedItems));
      setHasUnsavedChanges(false);
    }
  }, [content.portfolio]);

  // Detect changes in portfolio items
  useEffect(() => {
    if (portfolioItems.length === 0 && originalItemsRef.current.length === 0) {
      return;
    }

    const hasChanges = JSON.stringify(portfolioItems) !== JSON.stringify(originalItemsRef.current);
    setHasUnsavedChanges(hasChanges);
  }, [portfolioItems]);

  // Add a new portfolio item
  const handlePortfolioAdd = () => {
    const newItem: PortfolioItem = {
      id: Date.now().toString(),
      title: 'New Project',
      description: 'Project Description',
      image: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22300%22%20viewBox%3D%220%200%20300%20300%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%22300%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EProject%20Image%3C%2Ftext%3E%3C%2Fsvg%3E',
      url: 'https://example.com',
      order: portfolioItems.length // Set order to the end of the list
    };

    const updatedItems = [...portfolioItems, newItem];
    setPortfolioItems(updatedItems);
    savePortfolioItems(updatedItems);
  };

  // Update a portfolio item field
  const handlePortfolioUpdate = (id: string, field: keyof PortfolioItem, value: string | number) => {
    const updatedItems = portfolioItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );

    setPortfolioItems(updatedItems);
    // Don't save immediately to allow batch editing
  };

  // Save all portfolio item changes
  const handleSaveChanges = () => {
    savePortfolioItems(portfolioItems);
  };

  // Remove a portfolio item
  const handlePortfolioRemove = (id: string) => {
    const updatedItems = portfolioItems.filter(item => item.id !== id);

    // Reorder remaining items
    const reorderedItems = updatedItems.map((item, index) => ({
      ...item,
      order: index
    }));

    setPortfolioItems(reorderedItems);
    savePortfolioItems(reorderedItems);
  };

  // Save portfolio items to Firebase with improved error handling and logging
  const savePortfolioItems = (items: PortfolioItem[]) => {
    setSaveStatus('saving');
    console.log('Attempting to save portfolio items:', items);

    try {
      // Force a deep copy to ensure we're not passing references
      const itemsToSave = JSON.parse(JSON.stringify(items));

      // Make sure each item has an order property
      const itemsWithOrder = itemsToSave.map((item: PortfolioItem, index: number) => ({
        ...item,
        order: index
      }));

      console.log('Saving portfolio items with order:', itemsWithOrder);

      // Update content with the new portfolio items
      updateContent({
        portfolio: itemsWithOrder
      });

      // Update the original items reference
      originalItemsRef.current = JSON.parse(JSON.stringify(itemsWithOrder));
      setHasUnsavedChanges(false);

      // Show success message
      console.log('Portfolio items saved successfully');

      setTimeout(() => {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }, 500);
    } catch (error) {
      console.error('Error saving portfolio items:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);

      // Show error alert
      alert(`Failed to save portfolio items: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle manual save button click
  const handleSave = () => {
    savePortfolioItems(portfolioItems);
  };

  // Drag and drop handlers
  const handleDragStart = (id: string) => {
    setDraggedItemId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedItemId === id) return;
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItemId || draggedItemId === targetId) return;

    const draggedIndex = portfolioItems.findIndex(item => item.id === draggedItemId);
    const targetIndex = portfolioItems.findIndex(item => item.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Create a copy of the items array
    const updatedItems = [...portfolioItems];

    // Remove the dragged item
    const draggedItem = updatedItems.splice(draggedIndex, 1)[0];

    // Insert it at the target position
    updatedItems.splice(targetIndex, 0, draggedItem);

    // Update order values for all items
    const reorderedItems = updatedItems.map((item, index) => ({
      ...item,
      order: index
    }));

    setPortfolioItems(reorderedItems);
    savePortfolioItems(reorderedItems);
    setDraggedItemId(null);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
  };

  // Move item up in order
  const moveItemUp = (id: string) => {
    const index = portfolioItems.findIndex(item => item.id === id);
    if (index <= 0) return; // Already at the top

    const updatedItems = [...portfolioItems];
    // Swap with the item above
    [updatedItems[index], updatedItems[index - 1]] = [updatedItems[index - 1], updatedItems[index]];

    // Update order values
    const reorderedItems = updatedItems.map((item, idx) => ({
      ...item,
      order: idx
    }));

    setPortfolioItems(reorderedItems);
    savePortfolioItems(reorderedItems);
  };

  // Move item down in order
  const moveItemDown = (id: string) => {
    const index = portfolioItems.findIndex(item => item.id === id);
    if (index === -1 || index >= portfolioItems.length - 1) return; // Already at the bottom

    const updatedItems = [...portfolioItems];
    // Swap with the item below
    [updatedItems[index], updatedItems[index + 1]] = [updatedItems[index + 1], updatedItems[index]];

    // Update order values
    const reorderedItems = updatedItems.map((item, idx) => ({
      ...item,
      order: idx
    }));

    setPortfolioItems(reorderedItems);
    savePortfolioItems(reorderedItems);
  };

  // Debug logging
  useEffect(() => {
    console.log('Portfolio items in NewPortfolioManager:', portfolioItems);
    console.log('Content portfolio in NewPortfolioManager:', content.portfolio);
  }, [portfolioItems, content.portfolio]);

  // Check Firebase connection on component mount
  useEffect(() => {
    checkFirebaseConnection();
  }, []);

  return (
    <div>
      <div className="bg-red-500 p-6 border-8 border-yellow-400 rounded-lg mb-6 animate-pulse">
        <h1 className="text-3xl font-bold text-white mb-2">UPDATED PORTFOLIO MANAGER</h1>
        <p className="text-white text-lg">This is the new drag-and-drop Portfolio Manager with improved functionality.</p>
        <p className="text-white text-lg mt-2">Firebase Database URL: {process.env.VITE_FIREBASE_DATABASE_URL}</p>

        <div className="mt-4 flex items-center gap-2">
          <div className={`px-4 py-2 rounded-lg font-bold ${
            databaseStatus === 'connected' ? 'bg-green-500 text-white' :
            databaseStatus === 'error' ? 'bg-red-700 text-white' :
            'bg-yellow-300 text-black'
          }`}>
            Database Status: {databaseStatus.toUpperCase()}
          </div>

          <Win95Button
            onClick={checkFirebaseConnection}
            className="px-4 py-2 font-mono flex items-center gap-2"
          >
            <RefreshCwIcon className="w-4 h-4" />
            Check Connection
          </Win95Button>

          <Win95Button
            onClick={() => window.location.reload()}
            className="px-4 py-2 font-mono flex items-center gap-2 bg-blue-100 hover:bg-blue-200"
          >
            <RefreshCwIcon className="w-4 h-4" />
            Force Reload Page
          </Win95Button>
        </div>
      </div>

      <div className="bg-white p-6 border-2 border-gray-400 rounded-lg">
        <div className="flex items-center justify-between mb-6 border-b-2 border-gray-200 pb-2">
          <div>
            <h3 className="font-mono font-bold text-xl">
              Portfolio Projects
            </h3>
            {hasUnsavedChanges && (
              <p className="text-sm text-blue-600 animate-pulse mt-1">
                * You have unsaved changes
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Win95Button onClick={handleSave} className="px-4 py-2 font-mono flex items-center gap-2">
              {saveStatus === 'saving' ? (
                <SaveIcon className="w-4 h-4 animate-spin" />
              ) : saveStatus === 'saved' ? (
                <CheckIcon className="w-4 h-4" />
              ) : saveStatus === 'error' ? (
                <AlertTriangleIcon className="w-4 h-4" />
              ) : (
                <SaveIcon className="w-4 h-4" />
              )}
              {saveStatus === 'saving' ? 'Saving...' :
               saveStatus === 'saved' ? 'Saved!' :
               saveStatus === 'error' ? 'Error!' : 'Save Order'}
            </Win95Button>
            <Win95Button
              onClick={handleSaveChanges}
              className={`px-4 py-2 font-mono flex items-center gap-2 ${hasUnsavedChanges ? 'bg-blue-100 hover:bg-blue-200' : ''}`}
              disabled={!hasUnsavedChanges && saveStatus !== 'saving'}
            >
              <SaveIcon className="w-4 h-4" />
              {hasUnsavedChanges ? 'Save Changes*' : 'Save Changes'}
            </Win95Button>
            <Win95Button onClick={handlePortfolioAdd} className="px-4 py-2 font-mono">
              <PlusIcon className="w-4 h-4 inline-block mr-2" />
              Add Project
            </Win95Button>
          </div>
        </div>

        {/* Table view for portfolio items */}
        <div className="mb-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="font-mono text-left p-2 border-b-2 border-gray-400 w-16">Order</th>
                <th className="font-mono text-left p-2 border-b-2 border-gray-400">Project</th>
                <th className="font-mono text-left p-2 border-b-2 border-gray-400 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {portfolioItems.length > 0 ? (
                portfolioItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`border-b border-gray-300 ${draggedItemId === item.id ? 'opacity-50 bg-blue-50' : ''}`}
                    draggable
                    onDragStart={() => handleDragStart(item.id)}
                    onDragOver={(e) => handleDragOver(e, item.id)}
                    onDrop={(e) => handleDrop(e, item.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <td className="p-2 font-mono">
                      <div className="flex items-center">
                        <GripVerticalIcon className="w-4 h-4 mr-2 cursor-move text-gray-500" />
                        {index + 1}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center">
                        <div className="w-12 h-12 mr-3 border border-gray-300 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22300%22%20viewBox%3D%220%200%20300%20300%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%22300%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EProject%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-bold">{item.title}</div>
                          <div className="text-sm text-gray-600 truncate max-w-md">{item.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center space-x-1">
                        <Win95Button
                          onClick={() => moveItemUp(item.id)}
                          className="p-1"
                          disabled={index === 0}
                        >
                          <ArrowUpIcon className="w-4 h-4" />
                        </Win95Button>
                        <Win95Button
                          onClick={() => moveItemDown(item.id)}
                          className="p-1"
                          disabled={index === portfolioItems.length - 1}
                        >
                          <ArrowDownIcon className="w-4 h-4" />
                        </Win95Button>
                        <Win95Button
                          onClick={() => handlePortfolioRemove(item.id)}
                          className="p-1 text-red-600"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Win95Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-8">
                    <p className="font-mono text-gray-600">No portfolio items yet. Add your first project!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Database Status Section */}
        <div className="mb-8 p-4 bg-gray-100 border-2 border-gray-400 rounded-lg">
          <h3 className="font-mono font-bold text-xl mb-4 border-b-2 border-gray-300 pb-2">
            Direct Firebase Database Check
          </h3>

          <div className="mb-4">
            <p className="font-mono mb-2">Database Status:
              <span className={`ml-2 px-2 py-1 rounded ${
                databaseStatus === 'connected' ? 'bg-green-100 text-green-800' :
                databaseStatus === 'error' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {databaseStatus.toUpperCase()}
              </span>
            </p>

            <p className="font-mono mb-2">Items in Database: {Array.isArray(databaseItems) ? databaseItems.length : 'Not an array'}</p>

            <Win95Button
              onClick={checkFirebaseConnection}
              className="px-4 py-2 font-mono flex items-center gap-2 mt-2"
            >
              <RefreshCwIcon className="w-4 h-4" />
              Refresh Database Status
            </Win95Button>
          </div>

          {Array.isArray(databaseItems) && databaseItems.length > 0 && (
            <div>
              <h4 className="font-mono font-bold mb-2">Database Items:</h4>
              <div className="bg-white p-2 border-2 border-gray-600 border-t-gray-800 border-l-gray-800 max-h-40 overflow-y-auto">
                <pre className="text-xs">{JSON.stringify(databaseItems, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Grid view for editing portfolio items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portfolioItems.map(project => (
            <div key={project.id} className="bg-gray-50 border-2 border-gray-400 rounded-lg overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                  onError={e => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22800%22%20height%3D%22400%22%20viewBox%3D%220%200%20800%20400%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%22800%22%20height%3D%22400%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%2230%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EProject%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';
                  }}
                />
              </div>
              <div className="p-4 space-y-2">
                <input
                  type="text"
                  value={project.title}
                  onChange={e => handlePortfolioUpdate(project.id, 'title', e.target.value)}
                  className="w-full p-2 border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                  placeholder="Project Title"
                />
                <textarea
                  value={project.description}
                  onChange={e => handlePortfolioUpdate(project.id, 'description', e.target.value)}
                  className="w-full p-2 border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 resize-none"
                  rows={3}
                  placeholder="Project Description"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="url"
                    value={project.image}
                    onChange={e => handlePortfolioUpdate(project.id, 'image', e.target.value)}
                    className="w-full p-2 border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                    placeholder="Image URL"
                  />
                  <input
                    type="url"
                    value={project.url}
                    onChange={e => handlePortfolioUpdate(project.id, 'url', e.target.value)}
                    className="w-full p-2 border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                    placeholder="Project URL"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
