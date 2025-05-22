import React from 'react';

export function TestPortfolioManager() {
  return (
    <div className="bg-white p-6 border-2 border-gray-400 rounded-lg">
      <h3 className="font-mono font-bold text-xl mb-4 text-red-600">
        TEST PORTFOLIO MANAGER
      </h3>
      <p className="mb-4 text-red-600 font-bold">
        This is a test component to verify that the component is rendering correctly.
      </p>
      <div className="p-4 bg-yellow-200 border-4 border-red-500 rounded-lg">
        <p className="text-xl font-bold">If you can see this, the component is working!</p>
      </div>
    </div>
  );
}
