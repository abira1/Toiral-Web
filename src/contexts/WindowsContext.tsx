import React, { createContext, useContext, ReactNode } from 'react';

interface WindowsContextType {
  handleIconClick: (id: string) => void;
}

const WindowsContext = createContext<WindowsContextType | undefined>(undefined);

export function WindowsProvider({ 
  children, 
  handleIconClick 
}: { 
  children: ReactNode;
  handleIconClick: (id: string) => void;
}) {
  return (
    <WindowsContext.Provider value={{ handleIconClick }}>
      {children}
    </WindowsContext.Provider>
  );
}

export function useWindowsContext() {
  const context = useContext(WindowsContext);
  if (context === undefined) {
    throw new Error('useWindowsContext must be used within a WindowsProvider');
  }
  return context;
}
