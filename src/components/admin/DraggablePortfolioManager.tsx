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
import { ref, set, get } from 'firebase/database';

export function DraggablePortfolioManager() {
  const { content, updateContent } = useContent();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const originalItemsRef = useRef<PortfolioItem[]>([]);

  // Load portfolio items directly from Firebase
  const loadPortfolioItems = async () => {
    try {
      console.log('Loading portfolio items directly from Firebase...');
      const portfolioRef = ref(database, 'portfolio');
      const snapshot = await get(portfolioRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log('Portfolio data from Firebase:', data);

        if (Array.isArray(data)) {
          // Sort by order if it exists
          const sortedItems = [...data].map((item, index) => ({
            ...item,
            order: item.order !== undefined ? item.order : index
          })).sort((a, b) => (a.order || 0) - (b.order || 0));

          setPortfolioItems(sortedItems);
          originalItemsRef.current = JSON.parse(JSON.stringify(sortedItems));
          setHasUnsavedChanges(false);
          console.log('Portfolio items loaded and sorted:', sortedItems);
        } else {
          console.error('Portfolio data is not an array:', data);
          setPortfolioItems([]);
        }
      } else {
        console.log('No portfolio data found in Firebase');
        setPortfolioItems([]);
      }
    } catch (error) {
      console.error('Error loading portfolio items:', error);
      alert('Failed to load portfolio items from Firebase. Please try again.');
    }
  };

  // Initialize on component mount
  useEffect(() => {
    loadPortfolioItems();
  }, []);

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

  // Save portfolio items to Firebase
  const savePortfolioItems = async (items: PortfolioItem[]) => {
    setSaveStatus('saving');
    console.log('Saving portfolio items:', items);

    try {
      // Make sure each item has an order property
      const itemsWithOrder = items.map((item, index) => ({
        ...item,
        order: index
      }));

      // Save directly to Firebase
      const portfolioRef = ref(database, 'portfolio');
      await set(portfolioRef, itemsWithOrder);

      // Also update through context
      updateContent({
        portfolio: itemsWithOrder
      });

      // Update the original items reference
      originalItemsRef.current = JSON.parse(JSON.stringify(itemsWithOrder));
      setHasUnsavedChanges(false);

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      console.log('Portfolio items saved successfully');
    } catch (error) {
      console.error('Error saving portfolio items:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      alert(`Failed to save portfolio items: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle manual save button click
  const handleSaveChanges = () => {
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
    setDraggedItemId(null);
    // Don't save immediately to allow multiple reorderings
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
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white p-6 border-2 border-gray-300 rounded-lg mb-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Portfolio Projects</h1>
            <p className="text-gray-600">Drag and drop to reorder or use the arrow buttons</p>
          </div>
          <div className="flex items-center gap-2">
            <Win95Button
              onClick={loadPortfolioItems}
              className="px-3 py-1 font-mono flex items-center gap-1 text-sm"
            >
              <RefreshCwIcon className="w-3 h-3" />
              Reload
            </Win95Button>
          </div>
        </div>

        {hasUnsavedChanges && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4">
            <p className="text-blue-700 flex items-center">
              <AlertTriangleIcon className="w-4 h-4 mr-2" />
              You have unsaved changes
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-500">
            {portfolioItems.length} {portfolioItems.length === 1 ? 'project' : 'projects'} in portfolio
          </div>
          <div className="flex items-center gap-2">
            <Win95Button
              onClick={handleSaveChanges}
              className={`px-4 py-2 font-mono flex items-center gap-2 ${hasUnsavedChanges ? 'bg-blue-100 hover:bg-blue-200' : ''}`}
              disabled={!hasUnsavedChanges && saveStatus !== 'saving'}
            >
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
               saveStatus === 'error' ? 'Error!' : 'Save Changes'}
            </Win95Button>
            <Win95Button onClick={handlePortfolioAdd} className="px-4 py-2 font-mono bg-green-50 hover:bg-green-100">
              <PlusIcon className="w-4 h-4 inline-block mr-2" />
              Add Project
            </Win95Button>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg shadow-sm">

        {/* Enhanced single-column list view for portfolio items with drag and drop */}
        <div className="space-y-4">
          {portfolioItems.length > 0 ? (
            portfolioItems.map((item, index) => (
              <div
                key={item.id}
                className={`bg-gray-50 border-2 border-gray-400 rounded-lg overflow-hidden transition-all duration-200 ${
                  draggedItemId === item.id ? 'opacity-50 bg-blue-50 border-blue-300' : 'hover:border-blue-300'
                }`}
                style={{
                  borderStyle: 'outset',
                  borderWidth: '2px',
                  boxShadow: 'inset -1px -1px 0px rgba(0,0,0,0.25), inset 1px 1px 0px rgba(255,255,255,0.75)'
                }}
                draggable
                onDragStart={() => handleDragStart(item.id)}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDrop={(e) => handleDrop(e, item.id)}
                onDragEnd={handleDragEnd}
              >
                {/* Header with order number and drag handle */}
                <div className="bg-gray-200 border-b-2 border-gray-400 p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <GripVerticalIcon className="w-5 h-5 mr-3 cursor-move text-gray-500" />
                    <span className="font-mono font-bold text-lg">Project #{index + 1}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Win95Button
                      onClick={() => moveItemUp(item.id)}
                      className="p-1"
                      disabled={index === 0}
                      title="Move Up"
                    >
                      <ArrowUpIcon className="w-4 h-4" />
                    </Win95Button>
                    <Win95Button
                      onClick={() => moveItemDown(item.id)}
                      className="p-1"
                      disabled={index === portfolioItems.length - 1}
                      title="Move Down"
                    >
                      <ArrowDownIcon className="w-4 h-4" />
                    </Win95Button>
                    <Win95Button
                      onClick={() => handlePortfolioRemove(item.id)}
                      className="p-1 text-red-600"
                      title="Delete Project"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Win95Button>
                  </div>
                </div>

                {/* Content area with image and form fields */}
                <div className="p-4">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Image preview section */}
                    <div className="lg:w-1/3">
                      <div className="aspect-video relative border-2 border-gray-300 rounded overflow-hidden bg-gray-100">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={e => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22225%22%20viewBox%3D%220%200%20400%20225%22%3E%3Crect%20fill%3D%22%23C0C0C0%22%20width%3D%22400%22%20height%3D%22225%22%20stroke%3D%22%23808080%22%20stroke-width%3D%222%22%2F%3E%3Crect%20fill%3D%22%23FFFFFF%22%20x%3D%2250%22%20y%3D%2250%22%20width%3D%22300%22%20height%3D%22125%22%20stroke%3D%22%23808080%22%20stroke-width%3D%221%22%2F%3E%3Ctext%20fill%3D%22%23000000%22%20font-family%3D%22monospace%22%20font-size%3D%2216%22%20x%3D%22200%22%20y%3D%22100%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EProject%20Image%3C%2Ftext%3E%3Ctext%20fill%3D%22%23666666%22%20font-family%3D%22monospace%22%20font-size%3D%2212%22%20x%3D%22200%22%20y%3D%22125%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3E16%3A9%20Preview%3C%2Ftext%3E%3C%2Fsvg%3E';
                          }}
                        />
                      </div>
                    </div>

                    {/* Form fields section */}
                    <div className="lg:w-2/3 space-y-3">
                      <div>
                        <label className="block font-mono text-sm font-bold mb-1">Project Title</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={e => handlePortfolioUpdate(item.id, 'title', e.target.value)}
                          className="w-full p-2 border-2 border-gray-600 bg-white font-mono"
                          style={{
                            borderStyle: 'inset',
                            borderTopColor: '#808080',
                            borderLeftColor: '#808080',
                            borderBottomColor: '#ffffff',
                            borderRightColor: '#ffffff'
                          }}
                          placeholder="Enter project title"
                        />
                      </div>

                      <div>
                        <label className="block font-mono text-sm font-bold mb-1">Project Description</label>
                        <textarea
                          value={item.description}
                          onChange={e => handlePortfolioUpdate(item.id, 'description', e.target.value)}
                          className="w-full p-2 border-2 border-gray-600 bg-white font-mono resize-none"
                          style={{
                            borderStyle: 'inset',
                            borderTopColor: '#808080',
                            borderLeftColor: '#808080',
                            borderBottomColor: '#ffffff',
                            borderRightColor: '#ffffff'
                          }}
                          rows={3}
                          placeholder="Enter project description"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-mono text-sm font-bold mb-1">Image URL</label>
                          <input
                            type="url"
                            value={item.image}
                            onChange={e => handlePortfolioUpdate(item.id, 'image', e.target.value)}
                            className="w-full p-2 border-2 border-gray-600 bg-white font-mono"
                            style={{
                              borderStyle: 'inset',
                              borderTopColor: '#808080',
                              borderLeftColor: '#808080',
                              borderBottomColor: '#ffffff',
                              borderRightColor: '#ffffff'
                            }}
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                        <div>
                          <label className="block font-mono text-sm font-bold mb-1">Project URL</label>
                          <input
                            type="url"
                            value={item.url}
                            onChange={e => handlePortfolioUpdate(item.id, 'url', e.target.value)}
                            className="w-full p-2 border-2 border-gray-600 bg-white font-mono"
                            style={{
                              borderStyle: 'inset',
                              borderTopColor: '#808080',
                              borderLeftColor: '#808080',
                              borderBottomColor: '#ffffff',
                              borderRightColor: '#ffffff'
                            }}
                            placeholder="https://example.com/project"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="mb-4">
                <PlusIcon className="w-12 h-12 mx-auto text-gray-300" />
              </div>
              <p className="text-gray-600 mb-4">No portfolio items yet.</p>
              <Win95Button onClick={handlePortfolioAdd} className="px-4 py-2 font-mono bg-green-50 hover:bg-green-100 mx-auto">
                <PlusIcon className="w-4 h-4 inline-block mr-2" />
                Add Your First Project
              </Win95Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
