import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Win95Button } from '../Win95Button';
import { SunIcon, MoonIcon } from 'lucide-react';

interface ThemeSwitcherProps {
  className?: string;
}

export function ThemeSwitcher({ className = '' }: ThemeSwitcherProps) {
  const { settings, updateSettings } = useTheme();
  const isHighContrast = settings.themeMode === 'highContrast';

  const toggleTheme = () => {
    updateSettings({
      themeMode: isHighContrast ? 'default' : 'highContrast'
    });
  };

  return (
    <Win95Button
      onClick={toggleTheme}
      className={`flex items-center justify-center ${className}`}
      title={isHighContrast ? 'Switch to Default Theme' : 'Switch to High Contrast Theme'}
      aria-label={isHighContrast ? 'Switch to Default Theme' : 'Switch to High Contrast Theme'}
    >
      {isHighContrast ? (
        <>
          <SunIcon className="w-4 h-4 mr-2" />
          <span className="font-mono text-sm">Default Theme</span>
        </>
      ) : (
        <>
          <MoonIcon className="w-4 h-4 mr-2" />
          <span className="font-mono text-sm">High Contrast</span>
        </>
      )}
    </Win95Button>
  );
}
