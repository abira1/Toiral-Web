import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
interface DesktopIconProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  id?: string; // Optional ID for the icon
}
export function DesktopIcon({
  icon,
  label,
  onClick,
  id
}: DesktopIconProps) {
  const [isPressed, setIsPressed] = useState(false);
  // Get theme settings to determine icon size
  const { settings } = useTheme();

  // Determine width based on icon size
  const getIconWidth = () => {
    switch (settings.desktopIcons.size) {
      case 'small':
        return 'w-12 sm:w-14 md:w-16';
      case 'medium':
        return 'w-14 sm:w-16 md:w-20';
      case 'large':
        return 'w-16 sm:w-20 md:w-24';
      default:
        return 'w-14 sm:w-16 md:w-20';
    }
  };

  return <div
      className={`
        flex flex-col items-center cursor-pointer
        ${getIconWidth()} p-1 rounded transition-all duration-200
        ${isPressed ? 'translate-y-[1px]' : ''}
        hover:bg-white/10 group
      `}
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => {
        setIsPressed(false);
        onClick(); // Ensure click handler is called on touch end
      }}
      onTouchCancel={() => setIsPressed(false)}
      data-section-id={id} // Add data attribute for section ID
    >
      <div className={`
          p-1
          ${isPressed ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : 'border-t-white border-l-white border-b-gray-800 border-r-gray-800'}
          border-2 transition-colors duration-200
        `}>
        {icon}
      </div>
      <div className="text-white text-center mt-1 font-mono text-[8px] sm:text-[10px] md:text-xs px-1 leading-tight">
        {label}
      </div>
    </div>;
}