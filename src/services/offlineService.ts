/**
 * Offline Service for Toiral Web Application
 * Provides robust offline functionality and background sync
 */

interface OfflineQueueItem {
  id: string;
  type: 'firebase_write' | 'form_submission' | 'user_action';
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

interface OfflineState {
  isOnline: boolean;
  lastOnlineTime: number;
  queuedActions: OfflineQueueItem[];
  cachedData: Record<string, any>;
  offlineCapabilities: string[];
}

class OfflineService {
  private state: OfflineState = {
    isOnline: navigator.onLine,
    lastOnlineTime: Date.now(),
    queuedActions: [],
    cachedData: {},
    offlineCapabilities: [
      'view_portfolio',
      'browse_services',
      'read_reviews',
      'view_contact_info',
      'access_cached_content'
    ]
  };

  private syncInProgress = false;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeOfflineDetection();
    this.loadPersistedState();
    this.registerServiceWorker();

    // Perform initial connectivity check
    setTimeout(() => {
      this.checkConnectivity();
    }, 1000);
  }

  /**
   * Initialize online/offline detection
   */
  private initializeOfflineDetection(): void {
    window.addEventListener('online', () => {
      this.handleOnlineStatusChange(true);
    });

    window.addEventListener('offline', () => {
      this.handleOnlineStatusChange(false);
    });

    // Periodic connectivity check
    setInterval(() => {
      this.checkConnectivity();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Handle online status changes
   */
  private handleOnlineStatusChange(isOnline: boolean): void {
    const wasOnline = this.state.isOnline;
    this.state.isOnline = isOnline;

    if (isOnline && !wasOnline) {
      // Just came back online
      this.state.lastOnlineTime = Date.now();
      this.emit('online', { timestamp: Date.now() });
      this.processOfflineQueue();
    } else if (!isOnline && wasOnline) {
      // Just went offline
      this.emit('offline', { timestamp: Date.now() });
    }

    this.persistState();
  }

  /**
   * Check connectivity with actual network request
   */
  private async checkConnectivity(): Promise<void> {
    try {
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache'
      });

      const isOnline = response.ok;
      if (isOnline !== this.state.isOnline) {
        this.handleOnlineStatusChange(isOnline);
      }
    } catch (error) {
      if (this.state.isOnline) {
        this.handleOnlineStatusChange(false);
      }
    }
  }

  /**
   * Cache critical data for offline access
   */
  async cacheData(key: string, data: any, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<void> {
    this.state.cachedData[key] = {
      data,
      timestamp: Date.now(),
      priority,
      size: JSON.stringify(data).length
    };

    // Manage cache size
    await this.manageCacheSize();
    this.persistState();
  }

  /**
   * Get cached data
   */
  getCachedData(key: string): any | null {
    const cached = this.state.cachedData[key];
    if (!cached) return null;

    // Check if data is still valid (24 hours for high priority, 12 hours for others)
    const maxAge = cached.priority === 'high' ? 24 * 60 * 60 * 1000 : 12 * 60 * 60 * 1000;
    const isValid = Date.now() - cached.timestamp < maxAge;

    return isValid ? cached.data : null;
  }

  /**
   * Queue action for when online
   */
  queueAction(type: OfflineQueueItem['type'], data: any, maxRetries: number = 3): string {
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const queueItem: OfflineQueueItem = {
      id,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries
    };

    this.state.queuedActions.push(queueItem);
    this.persistState();

    // Try to process immediately if online
    if (this.state.isOnline) {
      this.processOfflineQueue();
    }

    return id;
  }

  /**
   * Process queued actions when online
   */
  private async processOfflineQueue(): Promise<void> {
    if (this.syncInProgress || !this.state.isOnline) return;

    this.syncInProgress = true;
    this.emit('sync_start', { queueLength: this.state.queuedActions.length });

    const processedItems: string[] = [];
    const failedItems: string[] = [];

    for (const item of this.state.queuedActions) {
      try {
        await this.processQueueItem(item);
        processedItems.push(item.id);
        this.emit('sync_item_success', { item });
      } catch (error) {
        item.retryCount++;

        if (item.retryCount >= item.maxRetries) {
          failedItems.push(item.id);
          this.emit('sync_item_failed', { item, error });
        } else {
          this.emit('sync_item_retry', { item, error });
        }
      }
    }

    // Remove processed and permanently failed items
    this.state.queuedActions = this.state.queuedActions.filter(
      item => !processedItems.includes(item.id) && !failedItems.includes(item.id)
    );

    this.syncInProgress = false;
    this.persistState();

    this.emit('sync_complete', {
      processed: processedItems.length,
      failed: failedItems.length,
      remaining: this.state.queuedActions.length
    });
  }

  /**
   * Process individual queue item
   */
  private async processQueueItem(item: OfflineQueueItem): Promise<void> {
    switch (item.type) {
      case 'firebase_write':
        await this.processFirebaseWrite(item.data);
        break;
      case 'form_submission':
        await this.processFormSubmission(item.data);
        break;
      case 'user_action':
        await this.processUserAction(item.data);
        break;
      default:
        throw new Error(`Unknown queue item type: ${item.type}`);
    }
  }

  /**
   * Process Firebase write operations
   */
  private async processFirebaseWrite(data: any): Promise<void> {
    const { ref, value } = data;
    // This would integrate with your Firebase service
    // await firebaseService.write(ref, value);
    console.log('Processing Firebase write:', { ref, value });
  }

  /**
   * Process form submissions
   */
  private async processFormSubmission(data: any): Promise<void> {
    const { formType, formData } = data;

    const response = await fetch('/api/forms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type: formType, data: formData })
    });

    if (!response.ok) {
      throw new Error(`Form submission failed: ${response.statusText}`);
    }
  }

  /**
   * Process user actions
   */
  private async processUserAction(data: any): Promise<void> {
    const { action, payload } = data;
    console.log('Processing user action:', { action, payload });
    // Implement specific user action processing
  }

  /**
   * Manage cache size to prevent storage overflow
   */
  private async manageCacheSize(): Promise<void> {
    const maxCacheSize = 50 * 1024 * 1024; // 50MB
    let currentSize = 0;

    // Calculate current cache size
    Object.values(this.state.cachedData).forEach((cached: any) => {
      currentSize += cached.size || 0;
    });

    if (currentSize > maxCacheSize) {
      // Remove oldest low-priority items first
      const sortedEntries = Object.entries(this.state.cachedData)
        .sort((a, b) => {
          const [, aData] = a;
          const [, bData] = b;

          // Sort by priority (high last) then by timestamp (oldest first)
          if (aData.priority !== bData.priority) {
            const priorityOrder = { low: 0, medium: 1, high: 2 };
            return priorityOrder[aData.priority] - priorityOrder[bData.priority];
          }

          return aData.timestamp - bData.timestamp;
        });

      // Remove items until under size limit
      for (const [key, cached] of sortedEntries) {
        if (currentSize <= maxCacheSize * 0.8) break; // Keep 20% buffer

        delete this.state.cachedData[key];
        currentSize -= (cached as any).size || 0;
      }
    }
  }

  /**
   * Register enhanced service worker
   */
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/enhanced-sw.js');

        registration.addEventListener('updatefound', () => {
          this.emit('sw_update_available', { registration });
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleServiceWorkerMessage(event.data);
        });

      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    }
  }

  /**
   * Handle messages from service worker
   */
  private handleServiceWorkerMessage(data: any): void {
    switch (data.type) {
      case 'CACHE_UPDATED':
        this.emit('cache_updated', data.payload);
        break;
      case 'OFFLINE_FALLBACK':
        this.emit('offline_fallback', data.payload);
        break;
      case 'BACKGROUND_SYNC':
        this.processOfflineQueue();
        break;
    }
  }

  /**
   * Get offline capabilities
   */
  getOfflineCapabilities(): string[] {
    return [...this.state.offlineCapabilities];
  }

  /**
   * Check if feature is available offline
   */
  isFeatureAvailableOffline(feature: string): boolean {
    return this.state.offlineCapabilities.includes(feature);
  }

  /**
   * Get offline status information
   */
  getOfflineStatus() {
    return {
      isOnline: this.state.isOnline,
      lastOnlineTime: this.state.lastOnlineTime,
      queuedActionsCount: this.state.queuedActions.length,
      cachedDataCount: Object.keys(this.state.cachedData).length,
      offlineCapabilities: this.state.offlineCapabilities,
      timeSinceLastOnline: this.state.isOnline ? 0 : Date.now() - this.state.lastOnlineTime
    };
  }

  /**
   * Event system
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  /**
   * Persistence
   */
  private persistState(): void {
    try {
      localStorage.setItem('offlineState', JSON.stringify({
        queuedActions: this.state.queuedActions,
        cachedData: this.state.cachedData,
        lastOnlineTime: this.state.lastOnlineTime
      }));
    } catch (error) {
      console.warn('Failed to persist offline state:', error);
    }
  }

  private loadPersistedState(): void {
    try {
      const stored = localStorage.getItem('offlineState');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.state.queuedActions = parsed.queuedActions || [];
        this.state.cachedData = parsed.cachedData || {};
        this.state.lastOnlineTime = parsed.lastOnlineTime || Date.now();
      }
    } catch (error) {
      console.warn('Failed to load persisted offline state:', error);
    }
  }

  /**
   * Force a connectivity check
   */
  async forceConnectivityCheck(): Promise<boolean> {
    await this.checkConnectivity();
    return this.state.isOnline;
  }

  /**
   * Get debug information
   */
  getDebugInfo() {
    return {
      navigatorOnLine: navigator.onLine,
      serviceOnline: this.state.isOnline,
      lastOnlineTime: new Date(this.state.lastOnlineTime).toISOString(),
      queuedActions: this.state.queuedActions.length,
      cachedData: Object.keys(this.state.cachedData).length,
      eventListeners: Array.from(this.eventListeners.keys())
    };
  }

  /**
   * Clear all offline data
   */
  clearOfflineData(): void {
    this.state.queuedActions = [];
    this.state.cachedData = {};
    this.persistState();
    this.emit('offline_data_cleared');
  }
}

// Export singleton instance
export const offlineService = new OfflineService();
