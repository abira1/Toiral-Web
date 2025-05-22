import React from 'react';
import { useTour } from '../../contexts/TourContext';
import { TourStep } from './TourStep';

export function TourManager() {
  const { 
    activeTour, 
    currentStepIndex, 
    isTourActive, 
    nextStep, 
    prevStep, 
    endTour 
  } = useTour();

  if (!isTourActive || !activeTour) return null;

  const currentStep = activeTour.steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === activeTour.steps.length - 1;

  return (
    <TourStep
      step={currentStep}
      isFirst={isFirstStep}
      isLast={isLastStep}
      onNext={nextStep}
      onPrev={prevStep}
      onClose={endTour}
    />
  );
}
