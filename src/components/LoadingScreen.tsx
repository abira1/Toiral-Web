import React, { useEffect, useState, useCallback } from 'react';
import { useContent } from '../contexts/ContentContext';

interface LoadingStage {
  name: string;
  weight: number; // Percentage of total loading time
  completed: boolean;
}

export function LoadingScreen({
  onLoadingComplete
}: {
  onLoadingComplete: () => void;
}) {
  const { preloadEssentialData } = useContent();
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [currentStage, setCurrentStage] = useState('Initializing...');
  const [loadingStages] = useState<LoadingStage[]>([
    { name: 'Initializing...', weight: 10, completed: false },
    { name: 'Loading core data...', weight: 30, completed: false },
    { name: 'Preparing interface...', weight: 25, completed: false },
    { name: 'Optimizing assets...', weight: 20, completed: false },
    { name: 'Finalizing...', weight: 15, completed: false }
  ]);

  const updateProgress = useCallback((stageIndex: number, stageProgress: number = 100) => {
    const completedWeight = loadingStages.slice(0, stageIndex).reduce((sum, stage) => sum + stage.weight, 0);
    const currentStageWeight = loadingStages[stageIndex]?.weight || 0;
    const currentStageProgress = (currentStageWeight * stageProgress) / 100;
    const totalProgress = Math.min(completedWeight + currentStageProgress, 100);

    setProgress(totalProgress);
    if (stageIndex < loadingStages.length) {
      setCurrentStage(loadingStages[stageIndex].name);
    }
  }, [loadingStages]);

  // Preload essential data with staged progress
  useEffect(() => {
    const loadData = async () => {
      try {
        // Stage 1: Initialization
        updateProgress(0, 0);
        await new Promise(resolve => setTimeout(resolve, 200));
        updateProgress(0, 100);

        // Stage 2: Load core data
        updateProgress(1, 0);
        await preloadEssentialData();
        updateProgress(1, 100);

        // Stage 3: Prepare interface
        updateProgress(2, 0);
        await new Promise(resolve => setTimeout(resolve, 300));
        updateProgress(2, 100);

        // Stage 4: Optimize assets
        updateProgress(3, 0);
        // Simulate asset optimization
        for (let i = 0; i <= 100; i += 20) {
          updateProgress(3, i);
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Stage 5: Finalize
        updateProgress(4, 0);
        await new Promise(resolve => setTimeout(resolve, 200));
        updateProgress(4, 100);

        // Complete loading
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(onLoadingComplete, 500);
        }, 300);
      } catch (error) {
        console.error('Error preloading data:', error);

        // Even on error, complete the loading process
        setProgress(100);
        setCurrentStage('Ready!');
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(onLoadingComplete, 500);
        }, 300);
      }
    };

    loadData();
  }, [preloadEssentialData, onLoadingComplete, updateProgress]);

  return (
    <div className={`fixed inset-0 bg-teal-600 flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Logo */}
      <div className="w-40 h-40 mb-8">
        <img src="/toiral.png" alt="Toiral Logo" className="w-full h-full" />
      </div>

      {/* Current stage indicator */}
      <div className="mb-4 text-white font-mono text-sm text-center">
        {currentStage}
      </div>

      {/* Enhanced segmented progress bar */}
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

      {/* Progress percentage and welcome */}
      <div className="mt-4 font-mono text-white text-center">
        <div className="text-lg mb-1">Welcome to Toiral</div>
        <div className="text-xl font-bold">
          {Math.round(progress)}%
        </div>
      </div>

      <div className="absolute bottom-4 font-mono text-white/60 text-xs">
        © 2025 Toiral Web Development
      </div>
    </div>
  );
}