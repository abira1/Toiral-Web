/**
 * Performance Optimization Service for Toiral Web Application
 * Provides advanced caching, data loading, and performance monitoring
 */

import { ref, get, onValue, off } from 'firebase/database';
import { database } from '../firebase/config';

// Performance monitoring interface
interface PerformanceMetrics {
  loadTime: number;
  dataSize: number;
  cacheHits: number;
  cacheMisses: number;
  lastUpdated: number;
}

// Cache configuration
interface CacheConfig {
  maxAge: number; // milliseconds
  maxSize: number; // number of entries
  priority: 'high' | 'medium' | 'low';
}

// Enhanced cache entry
interface CacheEntry {
  data: any;
  timestamp: number;
  size: number;
  priority: 'high' | 'medium' | 'low';
  accessCount: number;
  lastAccessed: number;
}

class PerformanceOptimizationService {
  private cache = new Map<string, CacheEntry>();
  private subscriptions = new Map<string, () => void>();
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    dataSize: 0,
    cacheHits: 0,
    cacheMisses: 0,
    lastUpdated: Date.now()
  };

  // Cache configurations for different data types
  private cacheConfigs: Record<string, CacheConfig> = {
    // Critical data - cache for 5 minutes
    company: { maxAge: 5 * 60 * 1000, maxSize: 1, priority: 'high' },
    theme: { maxAge: 5 * 60 * 1000, maxSize: 1, priority: 'high' },
    
    // Frequently accessed - cache for 10 minutes
    portfolio: { maxAge: 10 * 60 * 1000, maxSize: 1, priority: 'high' },
    services: { maxAge: 10 * 60 * 1000, maxSize: 1, priority: 'high' },
    reviews: { maxAge: 10 * 60 * 1000, maxSize: 1, priority: 'high' },
    
    // Moderately accessed - cache for 15 minutes
    contact: { maxAge: 15 * 60 * 1000, maxSize: 1, priority: 'medium' },
    about: { maxAge: 15 * 60 * 1000, maxSize: 1, priority: 'medium' },
    
    // Admin data - cache for 5 minutes (needs to be fresh)
    analytics: { maxAge: 5 * 60 * 1000, maxSize: 1, priority: 'medium' },
    seo: { maxAge: 5 * 60 * 1000, maxSize: 1, priority: 'medium' },
    
    // Low priority - cache for 30 minutes
    games: { maxAge: 30 * 60 * 1000, maxSize: 1, priority: 'low' },
    community: { maxAge: 30 * 60 * 1000, maxSize: 1, priority: 'low' }
  };

  /**
   * Get data with intelligent caching
   */
  async getData(path: string, forceRefresh = false): Promise<any> {
    const startTime = performance.now();
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = this.getCachedData(path);
      if (cachedData) {
        this.metrics.cacheHits++;
        return cachedData;
      }
    }

    // Cache miss - fetch from Firebase
    this.metrics.cacheMisses++;
    
    try {
      const snapshot = await get(ref(database, path));
      const data = snapshot.exists() ? snapshot.val() : null;
      
      // Cache the data
      if (data) {
        this.setCachedData(path, data);
      }
      
      // Update metrics
      const loadTime = performance.now() - startTime;
      this.metrics.loadTime = loadTime;
      this.metrics.dataSize = JSON.stringify(data || {}).length;
      this.metrics.lastUpdated = Date.now();
      
      return data;
    } catch (error) {
      console.error(`Error fetching ${path}:`, error);
      
      // Return cached data as fallback if available
      const cachedData = this.getCachedData(path, true); // Ignore expiry
      return cachedData || null;
    }
  }

  /**
   * Subscribe to data with optimized real-time updates
   */
  subscribeToData(path: string, callback: (data: any) => void, options?: {
    throttle?: number;
    priority?: 'high' | 'medium' | 'low';
  }): () => void {
    const throttleMs = options?.throttle || 1000; // Default 1 second throttle
    let lastUpdate = 0;
    let timeoutId: NodeJS.Timeout | null = null;

    const unsubscribe = onValue(ref(database, path), (snapshot) => {
      const now = Date.now();
      const data = snapshot.exists() ? snapshot.val() : null;
      
      // Cache the data
      if (data) {
        this.setCachedData(path, data);
      }
      
      // Throttle updates to prevent excessive re-renders
      if (now - lastUpdate >= throttleMs) {
        lastUpdate = now;
        callback(data);
      } else {
        // Schedule delayed update
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          lastUpdate = Date.now();
          callback(data);
        }, throttleMs - (now - lastUpdate));
      }
    });

    // Store subscription for cleanup
    this.subscriptions.set(path, unsubscribe);
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      unsubscribe();
      this.subscriptions.delete(path);
    };
  }

  /**
   * Preload critical data in priority order
   */
  async preloadCriticalData(): Promise<void> {
    const criticalPaths = [
      'company',
      'theme',
      'portfolio',
      'services',
      'reviews'
    ];

    // Load critical data in parallel with limited concurrency
    const concurrencyLimit = 3;
    const chunks = this.chunkArray(criticalPaths, concurrencyLimit);
    
    for (const chunk of chunks) {
      await Promise.all(chunk.map(path => this.getData(path)));
    }
  }

  /**
   * Get cached data if valid
   */
  private getCachedData(path: string, ignoreExpiry = false): any | null {
    const entry = this.cache.get(path);
    if (!entry) return null;

    const config = this.cacheConfigs[path] || { maxAge: 10 * 60 * 1000, maxSize: 1, priority: 'medium' };
    const isExpired = Date.now() - entry.timestamp > config.maxAge;
    
    if (!ignoreExpiry && isExpired) {
      this.cache.delete(path);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    
    return entry.data;
  }

  /**
   * Set cached data with intelligent eviction
   */
  private setCachedData(path: string, data: any): void {
    const config = this.cacheConfigs[path] || { maxAge: 10 * 60 * 1000, maxSize: 1, priority: 'medium' };
    const size = JSON.stringify(data).length;
    
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      size,
      priority: config.priority,
      accessCount: 1,
      lastAccessed: Date.now()
    };

    this.cache.set(path, entry);
    
    // Evict old entries if cache is too large
    this.evictOldEntries();
  }

  /**
   * Intelligent cache eviction based on priority and usage
   */
  private evictOldEntries(): void {
    const maxCacheSize = 50; // Maximum number of entries
    
    if (this.cache.size <= maxCacheSize) return;

    // Sort entries by priority and usage for eviction
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      entry,
      score: this.calculateEvictionScore(entry)
    }));

    // Sort by eviction score (higher score = more likely to evict)
    entries.sort((a, b) => b.score - a.score);

    // Remove entries until we're under the limit
    const toRemove = entries.slice(0, this.cache.size - maxCacheSize);
    toRemove.forEach(({ key }) => this.cache.delete(key));
  }

  /**
   * Calculate eviction score (higher = more likely to evict)
   */
  private calculateEvictionScore(entry: CacheEntry): number {
    const age = Date.now() - entry.timestamp;
    const timeSinceAccess = Date.now() - entry.lastAccessed;
    const priorityWeight = entry.priority === 'high' ? 0.1 : entry.priority === 'medium' ? 0.5 : 1.0;
    const accessWeight = 1 / (entry.accessCount + 1);
    
    return (age + timeSinceAccess) * priorityWeight * accessWeight;
  }

  /**
   * Utility function to chunk array
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Clear all caches and subscriptions
   */
  cleanup(): void {
    this.cache.clear();
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const totalSize = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.size, 0);
    const hitRate = this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100;
    
    return {
      entries: this.cache.size,
      totalSize,
      hitRate: isNaN(hitRate) ? 0 : hitRate,
      ...this.metrics
    };
  }
}

// Export singleton instance
export const performanceService = new PerformanceOptimizationService();
