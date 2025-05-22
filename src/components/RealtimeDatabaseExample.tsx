import React, { useState, useEffect } from 'react';
import { writeData, readData, subscribeToData, pushData, deleteData } from '../firebase/database';
import { Win95Button } from './Win95Button';

export function RealtimeDatabaseExample() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to messages in the database
    const unsubscribe = subscribeToData('messages', (data) => {
      if (data) {
        // Convert object of objects to array
        const messagesArray = Object.entries(data).map(([id, message]) => ({
          id,
          ...(message as object)
        }));
        setMessages(messagesArray);
      } else {
        setMessages([]);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleAddMessage = async () => {
    if (newMessage.trim() === '') return;
    
    try {
      // Add message to database with timestamp
      await pushData('messages', {
        text: newMessage,
        timestamp: Date.now(),
        author: 'User'
      });
      
      // Clear input field
      setNewMessage('');
    } catch (error) {
      console.error('Error adding message:', error);
      alert('Failed to add message. Please try again.');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await deleteData(`messages/${id}`);
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message. Please try again.');
    }
  };

  const handleClearAllMessages = async () => {
    try {
      await writeData('messages', null);
    } catch (error) {
      console.error('Error clearing messages:', error);
      alert('Failed to clear messages. Please try again.');
    }
  };

  return (
    <div className="p-6 bg-gray-200 text-black max-h-[80vh] overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-mono text-xl font-bold mb-4">Firebase Realtime Database Example</h2>
        
        {/* Message input */}
        <div className="flex mb-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border-2 border-gray-400 border-r-gray-800 border-b-gray-800 mr-2 font-mono"
            onKeyPress={(e) => e.key === 'Enter' && handleAddMessage()}
          />
          <Win95Button onClick={handleAddMessage} className="px-4 py-2 font-mono">
            Send
          </Win95Button>
        </div>
        
        {/* Messages list */}
        <div className="bg-white p-4 border-2 border-gray-400 border-r-gray-800 border-b-gray-800 mb-4">
          <h3 className="font-mono font-bold mb-2">Messages</h3>
          
          {loading ? (
            <p className="font-mono text-gray-600">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="font-mono text-gray-600">No messages yet. Send your first message!</p>
          ) : (
            <div className="space-y-2">
              {messages.map((message) => (
                <div key={message.id} className="flex justify-between items-start p-2 border border-gray-300">
                  <div>
                    <p className="font-mono">{message.text}</p>
                    <p className="font-mono text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Win95Button 
                    onClick={() => handleDeleteMessage(message.id)} 
                    className="px-2 py-1 font-mono text-sm"
                  >
                    Delete
                  </Win95Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Clear all button */}
        <div className="flex justify-end">
          <Win95Button 
            onClick={handleClearAllMessages} 
            className="px-4 py-2 font-mono bg-red-100 hover:bg-red-200"
          >
            Clear All Messages
          </Win95Button>
        </div>
      </div>
    </div>
  );
}
