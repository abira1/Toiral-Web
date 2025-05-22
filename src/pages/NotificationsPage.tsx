import React from 'react';
import { NotificationManager } from '../components/NotificationManager';
import { useContent } from '../contexts/ContentContext';

export function NotificationsPage() {
  // This is just to verify that the ContentContext is available
  const { content } = useContent();
  
  return (
    <div className="w-full min-h-screen bg-teal-600 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-300 border-2 border-white border-r-gray-800 border-b-gray-800 p-4">
          <h1 className="font-mono text-lg font-bold mb-4">Notifications</h1>
          <NotificationManager />
        </div>
      </div>
    </div>
  );
}