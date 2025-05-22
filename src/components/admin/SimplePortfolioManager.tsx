import React from 'react';
import { useContent } from '../../contexts/ContentContext';

export function SimplePortfolioManager() {
  const { content } = useContent();
  
  return (
    <div className="bg-white p-6 border-2 border-gray-400 rounded-lg">
      <h3 className="font-mono font-bold text-xl mb-4">
        Simple Portfolio Manager
      </h3>
      <p className="mb-4">
        This is a simple portfolio manager to test if the component is rendering correctly.
      </p>
      <p className="mb-4">
        Number of portfolio items: {Array.isArray(content.portfolio) ? content.portfolio.length : 0}
      </p>
    </div>
  );
}
