import React, { useEffect, useState } from 'react';
import { useContent } from '../contexts/ContentContext';

export function LoadingScreen({
  onLoadingComplete
}: {
  onLoadingComplete: () => void;
}) {
  const { preloadEssentialData } = useContent();
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  // Preload essential data
  useEffect(() => {
    const loadData = async () => {
      // Start with a smooth progress animation
      let simulatedProgress = 0;
      const progressInterval = setInterval(() => {
        simulatedProgress += 1.5;
        if (simulatedProgress > 95) {
          clearInterval(progressInterval);
          simulatedProgress = 95; // Cap at 95% until data is actually loaded
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
      <div className="w-64 bg-gray-300 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 p-1">
        <div className="h-4 w-full flex">
          {Array.from({ length: 15 }).map((_, index) => (
            <div
              key={index}
              className={`flex-1 mx-[1px] ${
                index < Math.floor((progress / 100) * 15)
                  ? 'bg-blue-900'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Simple percentage text */}
      <div className="mt-4 font-mono text-white text-center">
        <div className="text-lg mb-1">Welcome to Toiral</div>
        <div className="text-sm">
          {Math.round(progress)}%
        </div>
      </div>

      <div className="absolute bottom-4 font-mono text-white/60 text-xs">
        © 2025 Toiral Web Development
      </div>
    </div>
  );
}