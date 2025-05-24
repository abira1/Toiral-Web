import React, { useEffect, useState } from 'react';
import { useContent } from '../contexts/ContentContext';

interface SimplifiedLoadingScreenProps {
  onLoadingComplete: () => void;
}

export function SimplifiedLoadingScreen({ onLoadingComplete }: SimplifiedLoadingScreenProps) {
  const { preloadEssentialData } = useContent();
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      // Start with a smooth progress animation
      let simulatedProgress = 0;
      const progressInterval = setInterval(() => {
        simulatedProgress += 2;
        if (simulatedProgress > 90) {
          clearInterval(progressInterval);
          simulatedProgress = 90; // Cap at 90% until data is actually loaded
        }
        setProgress(simulatedProgress);
      }, 50);

      try {
        // Preload essential data from Firebase
        await preloadEssentialData();

        // Data loaded successfully, complete the progress
        clearInterval(progressInterval);
        setProgress(100);

        // Trigger completion after a short delay
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(onLoadingComplete, 500);
        }, 300);
      } catch (error) {
        console.error('Error preloading data:', error);

        // Even on error, continue after a delay
        clearInterval(progressInterval);
        setProgress(100);

        setTimeout(() => {
          setFadeOut(true);
          setTimeout(onLoadingComplete, 500);
        }, 300);
      }
    };

    loadData();
  }, [preloadEssentialData, onLoadingComplete]);

  return (
    <div className={`fixed inset-0 bg-teal-600 flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Logo */}
      <div className="w-40 h-40 mb-8">
        <img src="/toiral.png" alt="Toiral Logo" className="w-full h-full" />
      </div>

      {/* Simple segmented progress bar */}
      <div className="w-80 bg-gray-300 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 p-1">
        <div className="h-6 w-full flex">
          {Array.from({ length: 20 }).map((_, index) => {
            const segmentProgress = (progress / 100) * 20;
            const isActive = index < Math.floor(segmentProgress);
            const isPartial = index === Math.floor(segmentProgress) && segmentProgress % 1 > 0;
            
            return (
              <div
                key={index}
                className={`flex-1 mx-[1px] transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-900'
                    : isPartial
                    ? 'bg-blue-700'
                    : 'bg-gray-300'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Progress percentage */}
      <div className="mt-4 text-white font-mono text-xl font-bold">
        {Math.round(progress)}%
      </div>
    </div>
  );
}
