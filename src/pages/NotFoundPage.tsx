import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Win95Button } from '../components/Win95Button';
import { HomeIcon, AlertTriangleIcon, ArrowLeftIcon } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-teal-600 p-4 md:p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-gray-300 border-2 border-white border-r-gray-800 border-b-gray-800 p-4">
        {/* Title bar */}
        <div className="bg-blue-900 text-white px-2 py-1 font-bold mb-4 flex justify-between items-center">
          <div className="flex items-center">
            <AlertTriangleIcon className="w-5 h-5 mr-2" />
            <span>Error - Page Not Found</span>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="text-white hover:text-gray-300 focus:outline-none"
          >
            ✕
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 flex flex-col items-center">
          <div className="text-center mb-8">
            <div className="text-9xl font-mono font-bold text-blue-900 mb-4">404</div>
            <h1 className="text-2xl font-mono font-bold mb-4">Page Not Found</h1>
            <p className="font-mono text-gray-700 mb-6">
              The page you are looking for doesn't exist or you don't have permission to access it.
            </p>
            <div className="w-full max-w-md mx-auto p-4 bg-white border-2 border-gray-400 font-mono text-sm text-gray-700">
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  <AlertTriangleIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="mb-2">
                    <span className="font-bold">Error:</span> The requested URL was not found on this server.
                  </p>
                  <p>
                    Please check the URL or return to the home page.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Win95Button
              className="px-6 py-3 font-mono flex items-center"
              onClick={() => navigate(-1)}
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Go Back
            </Win95Button>
            
            <Win95Button
              className="px-6 py-3 font-mono flex items-center"
              onClick={() => navigate('/')}
            >
              <HomeIcon className="w-4 h-4 mr-2" />
              Home Page
            </Win95Button>
          </div>
        </div>
      </div>
    </div>
  );
}
