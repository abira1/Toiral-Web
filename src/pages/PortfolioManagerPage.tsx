import React from 'react';
import { DraggablePortfolioManager } from '../components/admin/DraggablePortfolioManager';
import { ContentProvider } from '../contexts/ContentContext';
import { AuthProvider } from '../contexts/AuthContext';

export default function PortfolioManagerPage() {
  return (
    <AuthProvider>
      <ContentProvider>
        <div className="p-4 max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Portfolio Manager</h1>
          <DraggablePortfolioManager />
        </div>
      </ContentProvider>
    </AuthProvider>
  );
}
