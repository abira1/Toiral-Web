import React, { useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export function ThemeManager() {
  const { settings } = useTheme();
  const isHighContrast = settings.themeMode === 'highContrast';

  useEffect(() => {
    // Apply high contrast theme to the root element
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [isHighContrast]);

  return null; // This component doesn't render anything
}
