import { useState, useEffect } from 'react';
import { offlineService } from '../services/offlineService';

interface OfflineIndicatorProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showDetails?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export function OfflineIndicator({
  position = 'top-right',
  showDetails = false,
  autoHide = true,
  autoHideDelay = 5000
}: OfflineIndicatorProps) {
  // Initialize with proper online status detection
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineStatus, setOfflineStatus] = useState(offlineService.getOfflineStatus());
  // Only show when offline, or when online with sync activity
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // Initialize visibility based on actual online status
  useEffect(() => {
    const initializeStatus = async () => {
      // Force a connectivity check to ensure accurate status
      const actualOnlineStatus = await offlineService.forceConnectivityCheck();
      const currentStatus = offlineService.getOfflineStatus();

      console.log('OfflineIndicator Debug:', {
        navigatorOnLine: navigator.onLine,
        serviceOnline: actualOnlineStatus,
        queuedActions: currentStatus.queuedActionsCount,
        debugInfo: offlineService.getDebugInfo()
      });

      setIsOnline(actualOnlineStatus);
      setOfflineStatus(currentStatus);

      // Only show if offline or if there are queued actions to sync
      const shouldShow = !actualOnlineStatus || currentStatus.queuedActionsCount > 0;
      setIsVisible(shouldShow);

      console.log('OfflineIndicator visibility:', shouldShow, 'Online:', actualOnlineStatus);
    };

    initializeStatus();
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      const newStatus = offlineService.getOfflineStatus();
      setOfflineStatus(newStatus);

      // Show briefly to indicate connection restored, then hide if no pending actions
      setIsVisible(true);
      setSyncStatus('success');

      if (autoHide && newStatus.queuedActionsCount === 0) {
        setTimeout(() => {
          setIsVisible(false);
          setSyncStatus('idle');
        }, autoHideDelay);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setOfflineStatus(offlineService.getOfflineStatus());
      setIsVisible(true); // Always show when offline
      setSyncStatus('idle');
    };

    const handleSyncStart = () => {
      setSyncStatus('syncing');
      setIsVisible(true); // Show during sync
    };

    const handleSyncComplete = (data: any) => {
      setSyncStatus(data.failed > 0 ? 'error' : 'success');
      const newStatus = offlineService.getOfflineStatus();
      setOfflineStatus(newStatus);

      // Hide after successful sync if online and no more pending actions
      setTimeout(() => {
        if (isOnline && newStatus.queuedActionsCount === 0) {
          setSyncStatus('idle');
          if (autoHide) {
            setIsVisible(false);
          }
        } else {
          setSyncStatus('idle');
        }
      }, 3000);
    };

    // Register event listeners
    offlineService.on('online', handleOnline);
    offlineService.on('offline', handleOffline);
    offlineService.on('sync_start', handleSyncStart);
    offlineService.on('sync_complete', handleSyncComplete);

    // Cleanup
    return () => {
      offlineService.off('online', handleOnline);
      offlineService.off('offline', handleOffline);
      offlineService.off('sync_start', handleSyncStart);
      offlineService.off('sync_complete', handleSyncComplete);
    };
  }, [autoHide, autoHideDelay]);

  const getPositionClasses = () => {
    const baseClasses = 'fixed z-50';
    switch (position) {
      case 'top-left':
        return `${baseClasses} top-4 left-4`;
      case 'top-right':
        return `${baseClasses} top-4 right-4`;
      case 'bottom-left':
        return `${baseClasses} bottom-4 left-4`;
      case 'bottom-right':
        return `${baseClasses} bottom-4 right-4`;
      default:
        return `${baseClasses} top-4 right-4`;
    }
  };

  const getStatusIcon = () => {
    if (isOnline) {
      switch (syncStatus) {
        case 'syncing':
          return '🔄';
        case 'success':
          return '✅';
        case 'error':
          return '⚠️';
        default:
          return '🌐';
      }
    }
    return '📴';
  };

  const getStatusText = () => {
    if (isOnline) {
      switch (syncStatus) {
        case 'syncing':
          return 'Syncing...';
        case 'success':
          return 'Synced';
        case 'error':
          return 'Sync Error';
        default:
          return 'Online';
      }
    }
    return 'Offline';
  };

  const getStatusColor = () => {
    if (isOnline) {
      switch (syncStatus) {
        case 'syncing':
          return 'bg-blue-500';
        case 'success':
          return 'bg-green-500';
        case 'error':
          return 'bg-yellow-500';
        default:
          return 'bg-green-500';
      }
    }
    return 'bg-red-500';
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  // Don't render if not visible
  if (!isVisible) return null;

  return (
    <div className={getPositionClasses()}>
      <div
        className={`
          ${getStatusColor()} text-white rounded-lg shadow-lg transition-all duration-300 cursor-pointer
          ${isExpanded ? 'w-80' : 'w-auto'}
        `}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Compact View */}
        <div className="flex items-center p-3">
          <span className="mr-2 text-lg">{getStatusIcon()}</span>
          <span className="font-mono text-sm font-bold">{getStatusText()}</span>
          {!isOnline && offlineStatus.queuedActionsCount > 0 && (
            <span className="ml-2 bg-white/20 rounded-full px-2 py-1 text-xs">
              {offlineStatus.queuedActionsCount}
            </span>
          )}
          <span className="ml-2 text-xs opacity-75">
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>

        {/* Expanded View */}
        {isExpanded && (
          <div className="border-t border-white/20 p-3 space-y-3">
            {/* Connection Status */}
            <div>
              <div className="font-mono text-xs font-bold mb-1">Connection</div>
              <div className="font-mono text-xs">
                Status: {isOnline ? 'Connected' : 'Disconnected'}
              </div>
              {!isOnline && offlineStatus.timeSinceLastOnline > 0 && (
                <div className="font-mono text-xs opacity-75">
                  Last online: {formatTime(offlineStatus.timeSinceLastOnline)}
                </div>
              )}
            </div>

            {/* Offline Capabilities */}
            {!isOnline && (
              <div>
                <div className="font-mono text-xs font-bold mb-1">Available Offline</div>
                <div className="space-y-1">
                  {offlineStatus.offlineCapabilities.map((capability, index) => (
                    <div key={index} className="font-mono text-xs flex items-center">
                      <span className="mr-1">✓</span>
                      {capability.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Queued Actions */}
            {offlineStatus.queuedActionsCount > 0 && (
              <div>
                <div className="font-mono text-xs font-bold mb-1">Pending Actions</div>
                <div className="font-mono text-xs">
                  {offlineStatus.queuedActionsCount} action(s) will sync when online
                </div>
              </div>
            )}

            {/* Cached Data */}
            {offlineStatus.cachedDataCount > 0 && (
              <div>
                <div className="font-mono text-xs font-bold mb-1">Cached Data</div>
                <div className="font-mono text-xs">
                  {offlineStatus.cachedDataCount} item(s) available offline
                </div>
              </div>
            )}

            {/* Sync Status */}
            {isOnline && syncStatus !== 'idle' && (
              <div>
                <div className="font-mono text-xs font-bold mb-1">Sync Status</div>
                <div className="font-mono text-xs">
                  {syncStatus === 'syncing' && 'Synchronizing data...'}
                  {syncStatus === 'success' && 'All data synchronized'}
                  {syncStatus === 'error' && 'Some items failed to sync'}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  // Force connectivity check
                  const actualStatus = await offlineService.forceConnectivityCheck();
                  const newStatus = offlineService.getOfflineStatus();
                  setIsOnline(actualStatus);
                  setOfflineStatus(newStatus);
                  console.log('Manual refresh:', { actualStatus, newStatus });
                }}
                className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs font-mono transition-colors"
              >
                Refresh
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsVisible(false);
                }}
                className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs font-mono transition-colors"
              >
                Hide
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Offline Mode Banner */}
      {!isOnline && (
        <div className="mt-2 bg-gray-800 text-white rounded-lg p-3 max-w-xs">
          <div className="font-mono text-sm font-bold mb-1">Offline Mode</div>
          <div className="font-mono text-xs text-gray-300">
            You can still browse cached content and your actions will sync when you're back online.
          </div>
        </div>
      )}
    </div>
  );
}
