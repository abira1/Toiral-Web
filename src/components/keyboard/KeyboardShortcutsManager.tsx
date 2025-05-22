import React, { useEffect, useState } from 'react';
import { DialogWindow } from '../DialogWindow';
import { Win95Button } from '../Win95Button';

interface KeyboardShortcut {
  id: string;
  key: string;
  modifiers: {
    alt?: boolean;
    ctrl?: boolean;
    shift?: boolean;
  };
  description: string;
  action: () => void;
}

export function KeyboardShortcutsManager() {
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);

  // Register a new shortcut
  const registerShortcut = (shortcut: KeyboardShortcut) => {
    setShortcuts(prev => {
      // Check if shortcut already exists
      const exists = prev.some(s => s.id === shortcut.id);
      if (exists) {
        return prev.map(s => s.id === shortcut.id ? shortcut : s);
      }
      return [...prev, shortcut];
    });
  };

  // Unregister a shortcut
  const unregisterShortcut = (id: string) => {
    setShortcuts(prev => prev.filter(s => s.id !== id));
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+K to show keyboard shortcuts dialog
      if (e.altKey && e.key === 'k') {
        e.preventDefault();
        setShowShortcutsDialog(true);
        return;
      }

      // Check for registered shortcuts
      for (const shortcut of shortcuts) {
        const keyMatches = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const altMatches = !!shortcut.modifiers.alt === e.altKey;
        const ctrlMatches = !!shortcut.modifiers.ctrl === e.ctrlKey;
        const shiftMatches = !!shortcut.modifiers.shift === e.shiftKey;

        if (keyMatches && altMatches && ctrlMatches && shiftMatches) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  // Define default shortcuts
  useEffect(() => {
    // Start menu (Alt+S)
    registerShortcut({
      id: 'start-menu',
      key: 's',
      modifiers: { alt: true },
      description: 'Open Start Menu',
      action: () => {
        const startButton = document.querySelector('.h-12 .h-10:first-child') as HTMLElement;
        if (startButton) startButton.click();
      }
    });

    // Close active window (Alt+F4)
    registerShortcut({
      id: 'close-window',
      key: 'F4',
      modifiers: { alt: true },
      description: 'Close Active Window',
      action: () => {
        const closeButton = document.querySelector('.fixed.bg-gray-300 .bg-blue-900 .h-6.w-6') as HTMLElement;
        if (closeButton) closeButton.click();
      }
    });

    // Open chat (Alt+C)
    registerShortcut({
      id: 'open-chat',
      key: 'c',
      modifiers: { alt: true },
      description: 'Open Live Chat',
      action: () => {
        const chatButton = document.querySelector('.ml-1.md\\:ml-2.flex.space-x-1 .h-10:first-child') as HTMLElement;
        if (chatButton) chatButton.click();
      }
    });

    // Open appointments (Alt+A)
    registerShortcut({
      id: 'open-appointments',
      key: 'a',
      modifiers: { alt: true },
      description: 'Open Appointments',
      action: () => {
        const appointmentsButton = document.querySelector('.ml-1.md\\:ml-2.flex.space-x-1 .h-10:last-child') as HTMLElement;
        if (appointmentsButton) appointmentsButton.click();
      }
    });

    // Show keyboard shortcuts (Alt+K)
    registerShortcut({
      id: 'show-shortcuts',
      key: 'k',
      modifiers: { alt: true },
      description: 'Show Keyboard Shortcuts',
      action: () => setShowShortcutsDialog(true)
    });

    // Cleanup
    return () => {
      unregisterShortcut('start-menu');
      unregisterShortcut('close-window');
      unregisterShortcut('open-chat');
      unregisterShortcut('open-appointments');
      unregisterShortcut('show-shortcuts');
    };
  }, []);

  // Format shortcut key for display
  const formatShortcutKey = (shortcut: KeyboardShortcut) => {
    const parts = [];
    if (shortcut.modifiers.alt) parts.push('Alt');
    if (shortcut.modifiers.ctrl) parts.push('Ctrl');
    if (shortcut.modifiers.shift) parts.push('Shift');
    
    // Format the key nicely
    let key = shortcut.key;
    if (key === ' ') key = 'Space';
    else if (key.length === 1) key = key.toUpperCase();
    
    parts.push(key);
    return parts.join('+');
  };

  return (
    <>
      {showShortcutsDialog && (
        <DialogWindow
          title="Keyboard Shortcuts"
          onClose={() => setShowShortcutsDialog(false)}
          style={{ width: 400 }}
        >
          <div className="p-4 bg-gray-200 text-black">
            <div className="mb-4 font-mono text-sm">
              <p>Use these keyboard shortcuts to navigate quickly:</p>
            </div>
            
            <div className="border-2 border-gray-400 bg-white">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-300">
                    <th className="font-mono text-left p-2 border-b-2 border-gray-400">Shortcut</th>
                    <th className="font-mono text-left p-2 border-b-2 border-gray-400">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {shortcuts.map((shortcut) => (
                    <tr key={shortcut.id} className="border-b border-gray-300">
                      <td className="p-2 font-mono font-bold">{formatShortcutKey(shortcut)}</td>
                      <td className="p-2 font-mono">{shortcut.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Win95Button
                className="px-4 py-2 font-mono"
                onClick={() => setShowShortcutsDialog(false)}
              >
                Close
              </Win95Button>
            </div>
          </div>
        </DialogWindow>
      )}
    </>
  );
}
