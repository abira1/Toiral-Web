import React, { useState, useEffect } from 'react';
import { Win95Button } from '../Win95Button';

interface LogEntry {
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  details?: any;
}

export function ErrorLogger() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Store original console methods
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleLog = console.log;

    // Override console.error
    console.error = (...args: any[]) => {
      // Call the original method
      originalConsoleError.apply(console, args);
      
      // Add to our logs
      const message = args.map(arg => 
        typeof arg === 'string' ? arg : JSON.stringify(arg, null, 2)
      ).join(' ');
      
      setLogs(prev => [
        {
          type: 'error',
          message: message.substring(0, 500) + (message.length > 500 ? '...' : ''),
          timestamp: new Date(),
          details: args.length > 1 ? args.slice(1) : undefined
        },
        ...prev.slice(0, 49) // Keep only the last 50 logs
      ]);
    };

    // Override console.warn
    console.warn = (...args: any[]) => {
      // Call the original method
      originalConsoleWarn.apply(console, args);
      
      // Add to our logs
      const message = args.map(arg => 
        typeof arg === 'string' ? arg : JSON.stringify(arg, null, 2)
      ).join(' ');
      
      setLogs(prev => [
        {
          type: 'warning',
          message: message.substring(0, 500) + (message.length > 500 ? '...' : ''),
          timestamp: new Date(),
          details: args.length > 1 ? args.slice(1) : undefined
        },
        ...prev.slice(0, 49)
      ]);
    };

    // Override console.log for specific debug messages
    console.log = (...args: any[]) => {
      // Call the original method
      originalConsoleLog.apply(console, args);
      
      // Only capture logs with [TOIRAL] prefix
      if (args.length > 0 && typeof args[0] === 'string' && args[0].includes('[TOIRAL')) {
        const message = args.map(arg => 
          typeof arg === 'string' ? arg : JSON.stringify(arg, null, 2)
        ).join(' ');
        
        setLogs(prev => [
          {
            type: 'info',
            message: message.substring(0, 500) + (message.length > 500 ? '...' : ''),
            timestamp: new Date(),
            details: args.length > 1 ? args.slice(1) : undefined
          },
          ...prev.slice(0, 49)
        ]);
      }
    };

    // Cleanup function to restore original console methods
    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      console.log = originalConsoleLog;
    };
  }, []);

  const clearLogs = () => {
    setLogs([]);
  };

  const copyLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp.toLocaleTimeString()}] [${log.type.toUpperCase()}] ${log.message}`
    ).join('\n');
    
    navigator.clipboard.writeText(logText)
      .then(() => alert('Logs copied to clipboard'))
      .catch(err => console.error('Failed to copy logs:', err));
  };

  if (logs.length === 0 && !expanded) {
    return null;
  }

  return (
    <div className="fixed bottom-0 right-0 z-50 w-full md:w-1/2 lg:w-1/3 bg-white border-2 border-gray-400 shadow-lg">
      <div className="flex justify-between items-center p-2 bg-blue-900 text-white">
        <h3 className="font-mono font-bold">
          Error Logger {logs.length > 0 && `(${logs.length})`}
        </h3>
        <div className="flex space-x-1">
          <button 
            onClick={clearLogs}
            className="px-2 py-0.5 bg-gray-200 text-black font-mono text-xs"
          >
            Clear
          </button>
          <button 
            onClick={copyLogs}
            className="px-2 py-0.5 bg-gray-200 text-black font-mono text-xs"
          >
            Copy
          </button>
          <button 
            onClick={() => setExpanded(!expanded)}
            className="px-2 py-0.5 bg-gray-200 text-black font-mono text-xs"
          >
            {expanded ? 'Minimize' : 'Expand'}
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="max-h-96 overflow-y-auto p-2 font-mono text-xs">
          {logs.map((log, index) => (
            <div 
              key={index} 
              className={`mb-2 p-2 rounded ${
                log.type === 'error' ? 'bg-red-100 border-l-4 border-red-500' : 
                log.type === 'warning' ? 'bg-yellow-100 border-l-4 border-yellow-500' : 
                'bg-blue-100 border-l-4 border-blue-500'
              }`}
            >
              <div className="flex justify-between">
                <span className="font-bold">
                  {log.type.toUpperCase()}
                </span>
                <span className="text-gray-500">
                  {log.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="whitespace-pre-wrap mt-1">{log.message}</div>
              {log.details && (
                <details className="mt-1">
                  <summary className="cursor-pointer text-blue-600">Details</summary>
                  <pre className="mt-1 p-2 bg-gray-100 rounded overflow-x-auto">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
