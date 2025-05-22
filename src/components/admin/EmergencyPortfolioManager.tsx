import React, { useState, useEffect, useRef } from 'react';
import { Win95Button } from '../Win95Button';
import { useContent } from '../../contexts/ContentContext';
import { 
  TrashIcon, 
  PlusIcon, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  SaveIcon, 
  CheckIcon, 
  AlertTriangleIcon,
  RefreshCwIcon
} from 'lucide-react';
import { PortfolioItem } from '../../types';
import { database } from '../../firebase/config';
import { ref, get, set } from 'firebase/database';

export function EmergencyPortfolioManager() {
  const { content, updateContent } = useContent();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [databaseStatus, setDatabaseStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [databaseItems, setDatabaseItems] = useState<PortfolioItem[]>([]);
  
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
        
        // Also update the local state
        if (Array.isArray(data)) {
          setPortfolioItems(data);
        }
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

  // Initialize on component mount
  useEffect(() => {
    checkFirebaseConnection();
  }, []);

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

  // Save portfolio items to Firebase directly
  const savePortfolioItems = async (items: PortfolioItem[]) => {
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
      
      // Save directly to Firebase
      const portfolioRef = ref(database, 'portfolio');
      await set(portfolioRef, itemsWithOrder);
      
      // Also update through context
      updateContent({
        portfolio: itemsWithOrder
      });
      
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

  return (
    <div>
      <div className="bg-red-500 p-6 border-8 border-yellow-400 rounded-lg mb-6 animate-pulse">
        <h1 className="text-3xl font-bold text-white mb-2">EMERGENCY PORTFOLIO MANAGER</h1>
        <p className="text-white text-lg">This is a completely new implementation of the Portfolio Manager.</p>
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
          </div>
          <div className="flex items-center gap-2">
            <Win95Button onClick={handleSaveChanges} className="px-4 py-2 font-mono flex items-center gap-2">
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
            <Win95Button onClick={handlePortfolioAdd} className="px-4 py-2 font-mono">
              <PlusIcon className="w-4 h-4 inline-block mr-2" />
              Add Project
            </Win95Button>
          </div>
        </div>

        {/* Portfolio items list */}
        <div className="space-y-4">
          {portfolioItems.length > 0 ? (
            portfolioItems.map((item, index) => (
              <div key={item.id} className="bg-gray-50 p-4 border-2 border-gray-300 rounded-lg flex items-center">
                <div className="w-12 h-12 mr-4 border border-gray-300 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22300%22%20viewBox%3D%220%200%20300%20300%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%22300%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EProject%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={item.title}
                    onChange={e => handlePortfolioUpdate(item.id, 'title', e.target.value)}
                    className="w-full p-2 mb-2 border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                    placeholder="Project Title"
                  />
                  <textarea
                    value={item.description}
                    onChange={e => handlePortfolioUpdate(item.id, 'description', e.target.value)}
                    className="w-full p-2 border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 resize-none"
                    rows={2}
                    placeholder="Project Description"
                  />
                </div>
                <div className="ml-4 flex flex-col space-y-2">
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
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="font-mono text-gray-600">No portfolio items yet. Add your first project!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
