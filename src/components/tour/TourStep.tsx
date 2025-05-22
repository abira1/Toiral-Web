import React, { useEffect, useState, useRef } from 'react';
import { Win95Button } from '../Win95Button';
import { TourStep as TourStepType } from '../../contexts/TourContext';
import { XIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

interface TourStepProps {
  step: TourStepType;
  isFirst: boolean;
  isLast: boolean;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

export function TourStep({ step, isFirst, isLast, onNext, onPrev, onClose }: TourStepProps) {
  const [targetElement, setTargetElement] = useState<Element | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Find the target element and calculate its position
  useEffect(() => {
    const findTargetElement = () => {
      if (step.target === 'body') {
        // Special case for body - center in viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        setPosition({
          top: viewportHeight / 2 - 100,
          left: viewportWidth / 2 - 150,
          width: 300,
          height: 200
        });
        setTargetElement(document.body);
        return;
      }
      
      const element = document.querySelector(step.target);
      if (element) {
        setTargetElement(element);
        const rect = element.getBoundingClientRect();
        setPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height
        });
      }
    };

    findTargetElement();
    
    // Recalculate on window resize
    window.addEventListener('resize', findTargetElement);
    return () => window.removeEventListener('resize', findTargetElement);
  }, [step.target]);

  // Calculate tooltip position based on target position and step.position
  useEffect(() => {
    if (!tooltipRef.current) return;
    
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const tooltipWidth = tooltipRect.width;
    const tooltipHeight = tooltipRect.height;
    
    let top = 0;
    let left = 0;
    
    const OFFSET = 10; // Distance from target element
    
    switch (step.position) {
      case 'top':
        top = position.top - tooltipHeight - OFFSET;
        left = position.left + (position.width / 2) - (tooltipWidth / 2);
        break;
      case 'right':
        top = position.top + (position.height / 2) - (tooltipHeight / 2);
        left = position.left + position.width + OFFSET;
        break;
      case 'bottom':
        top = position.top + position.height + OFFSET;
        left = position.left + (position.width / 2) - (tooltipWidth / 2);
        break;
      case 'left':
        top = position.top + (position.height / 2) - (tooltipHeight / 2);
        left = position.left - tooltipWidth - OFFSET;
        break;
    }
    
    // Ensure tooltip stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (left < 10) left = 10;
    if (left + tooltipWidth > viewportWidth - 10) left = viewportWidth - tooltipWidth - 10;
    if (top < 10) top = 10;
    if (top + tooltipHeight > viewportHeight - 10) top = viewportHeight - tooltipHeight - 10;
    
    setTooltipPosition({ top, left });
  }, [position, step.position, targetElement]);

  // Scroll target element into view
  useEffect(() => {
    if (targetElement && step.target !== 'body') {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [targetElement, step.target]);

  if (!targetElement) return null;

  return (
    <>
      {/* Overlay */}
      {!step.disableOverlay && (
        <div 
          className="fixed inset-0 bg-black/50 z-[9998]"
          onClick={step.spotlightClicks ? undefined : onClose}
        />
      )}
      
      {/* Spotlight */}
      {step.target !== 'body' && (
        <div 
          className={`absolute z-[9999] rounded-md ${step.spotlightClicks ? 'pointer-events-none' : ''}`}
          style={{
            top: position.top,
            left: position.left,
            width: position.width,
            height: position.height,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            border: '2px solid white'
          }}
        />
      )}
      
      {/* Tooltip */}
      <div 
        ref={tooltipRef}
        className="fixed z-[10000] bg-gray-300 border-2 border-gray-400 shadow-lg w-72 rounded-none"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left
        }}
      >
        {/* Header */}
        <div className="bg-blue-900 text-white px-2 py-1 flex items-center justify-between select-none">
          <div className="font-bold truncate">{step.title}</div>
          <Win95Button className="h-6 w-6 flex-shrink-0 flex items-center justify-center p-0" onClick={onClose}>
            <XIcon className="w-4 h-4 text-black" />
          </Win95Button>
        </div>
        
        {/* Content */}
        <div className="p-4 font-mono text-sm">
          <p>{step.content}</p>
        </div>
        
        {/* Footer */}
        {!step.disableButtons && (
          <div className="p-2 flex justify-between border-t-2 border-gray-400">
            <Win95Button 
              className="px-2 py-1 font-mono text-sm flex items-center"
              onClick={onPrev}
              disabled={isFirst}
            >
              <ChevronLeftIcon className="w-4 h-4 mr-1" />
              Previous
            </Win95Button>
            
            <Win95Button 
              className="px-2 py-1 font-mono text-sm flex items-center"
              onClick={onNext}
            >
              {isLast ? 'Finish' : 'Next'}
              {!isLast && <ChevronRightIcon className="w-4 h-4 ml-1" />}
            </Win95Button>
          </div>
        )}
      </div>
    </>
  );
}
