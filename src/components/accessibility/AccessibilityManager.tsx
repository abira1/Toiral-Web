import React, { useEffect, useRef } from 'react';

export function AccessibilityManager() {
  const announcer = useRef<HTMLDivElement>(null);

  // Function to announce messages to screen readers
  const announce = (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    if (!announcer.current) return;

    // Create a new element to trigger screen reader announcement
    const element = announcer.current.querySelector(`[aria-live="${politeness}"]`);
    if (element) {
      // Clear the element first, then set the new message
      // This ensures screen readers will announce the new message
      element.textContent = '';

      // Use setTimeout to ensure the DOM update happens in separate ticks
      setTimeout(() => {
        if (element) element.textContent = message;
      }, 50);
    }
  };

  // Add keyboard focus outline for keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Add a class to the body when Tab key is pressed
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    };

    const handleMouseDown = () => {
      // Remove the class when mouse is used
      document.body.classList.remove('keyboard-navigation');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    // Add global styles for keyboard focus
    const style = document.createElement('style');
    style.textContent = `
      /* Hide focus outline for mouse users */
      :focus {
        outline: none;
      }

      /* Show focus outline for keyboard users */
      .keyboard-navigation :focus {
        outline: 2px solid #0078d7;
        outline-offset: 2px;
      }

      /* Skip to content link */
      .skip-link {
        position: absolute;
        top: -40px;
        left: 0;
        background: #0078d7;
        color: white;
        padding: 8px;
        z-index: 9999;
        transition: top 0.2s;
      }

      .skip-link:focus {
        top: 0;
      }
    `;
    document.head.appendChild(style);

    // Add skip to content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to content';
    document.body.prepend(skipLink);

    // Add main content marker if it doesn't exist
    if (!document.getElementById('main-content')) {
      const mainContent = document.createElement('div');
      mainContent.id = 'main-content';
      mainContent.tabIndex = -1;

      // Find a good place to insert it
      const desktopElement = document.querySelector('.w-full.h-screen.flex.flex-col');
      if (desktopElement) {
        desktopElement.prepend(mainContent);
      } else {
        document.body.appendChild(mainContent);
      }
    }

    // Make the announce function available globally
    (window as any).announce = announce;

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
      document.head.removeChild(style);
      if (skipLink.parentNode) {
        skipLink.parentNode.removeChild(skipLink);
      }
      delete (window as any).announce;
    };
  }, []);

  // Listen for route changes to announce page changes
  useEffect(() => {
    const handleRouteChange = () => {
      // Get the current page title
      const pageTitle = document.title;
      announce(`Navigated to ${pageTitle}`, 'assertive');
    };

    // Use MutationObserver to detect title changes
    const titleObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.target === document.head) {
          const titleElement = document.querySelector('title');
          if (titleElement && Array.from(mutation.addedNodes).some(node => node === titleElement)) {
            handleRouteChange();
          }
        }
      });
    });

    titleObserver.observe(document.head, { childList: true, subtree: true });

    // Also listen for popstate events
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      titleObserver.disconnect();
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <div
      ref={announcer}
      className="sr-only"
      aria-hidden="true"
      data-testid="accessibility-announcer"
    >
      <div aria-live="polite" role="status"></div>
      <div aria-live="assertive" role="alert"></div>
    </div>
  );
}
