import React, { useState, useEffect, useCallback } from 'react';
import { getPerformanceStats } from '../services/imageOptimizationService';
import { performanceService } from '../services/performanceOptimizationService';

interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  
  // Custom metrics
  loadTime: number;
  imageStats: any;
  cacheStats: any;
  memoryUsage?: any;
  networkInfo?: any;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  showOverlay?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

export function PerformanceMonitor({ 
  enabled = true, 
  showOverlay = false,
  onMetricsUpdate 
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    imageStats: {},
    cacheStats: {}
  });
  const [isVisible, setIsVisible] = useState(showOverlay);

  // Measure Core Web Vitals
  const measureCoreWebVitals = useCallback(() => {
    if (!enabled || typeof window === 'undefined') return;

    try {
      // Get performance entries
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const newMetrics: Partial<PerformanceMetrics> = {};

      // Time to First Byte
      if (navigation) {
        newMetrics.ttfb = navigation.responseStart - navigation.requestStart;
        newMetrics.loadTime = navigation.loadEventEnd - navigation.navigationStart;
      }

      // First Contentful Paint
      const fcpEntry = paint.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        newMetrics.fcp = fcpEntry.startTime;
      }

      // Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) {
              newMetrics.lcp = lastEntry.startTime;
            }
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (error) {
          console.warn('LCP measurement not supported:', error);
        }
      }

      // Memory usage (if available)
      if ('memory' in performance) {
        newMetrics.memoryUsage = {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize,
          limit: (performance as any).memory.jsHeapSizeLimit
        };
      }

      // Network information (if available)
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        newMetrics.networkInfo = {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        };
      }

      return newMetrics;
    } catch (error) {
      console.warn('Error measuring Core Web Vitals:', error);
      return {};
    }
  }, [enabled]);

  // Update metrics periodically
  useEffect(() => {
    if (!enabled) return;

    const updateMetrics = () => {
      const coreWebVitals = measureCoreWebVitals();
      const imageStats = getPerformanceStats();
      const cacheStats = performanceService.getCacheStats();

      const newMetrics: PerformanceMetrics = {
        ...metrics,
        ...coreWebVitals,
        imageStats,
        cacheStats,
        loadTime: performance.now()
      };

      setMetrics(newMetrics);
      
      if (onMetricsUpdate) {
        onMetricsUpdate(newMetrics);
      }
    };

    // Initial measurement
    updateMetrics();

    // Update every 5 seconds
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, [enabled, measureCoreWebVitals, onMetricsUpdate]);

  // Keyboard shortcut to toggle overlay
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        setIsVisible(!isVisible);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isVisible]);

  if (!enabled || !isVisible) {
    return null;
  }

  const formatTime = (time: number) => {
    if (time < 1000) return `${Math.round(time)}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const getScoreColor = (score: number, thresholds: [number, number]) => {
    if (score <= thresholds[0]) return 'text-green-500';
    if (score <= thresholds[1]) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="fixed top-4 right-4 bg-black/90 text-white p-4 rounded-lg font-mono text-xs z-50 max-w-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">Performance Monitor</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>

      {/* Core Web Vitals */}
      <div className="mb-3">
        <h4 className="font-semibold mb-1">Core Web Vitals</h4>
        <div className="space-y-1">
          {metrics.lcp && (
            <div className={`flex justify-between ${getScoreColor(metrics.lcp, [2500, 4000])}`}>
              <span>LCP:</span>
              <span>{formatTime(metrics.lcp)}</span>
            </div>
          )}
          {metrics.fcp && (
            <div className={`flex justify-between ${getScoreColor(metrics.fcp, [1800, 3000])}`}>
              <span>FCP:</span>
              <span>{formatTime(metrics.fcp)}</span>
            </div>
          )}
          {metrics.ttfb && (
            <div className={`flex justify-between ${getScoreColor(metrics.ttfb, [800, 1800])}`}>
              <span>TTFB:</span>
              <span>{formatTime(metrics.ttfb)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Image Performance */}
      <div className="mb-3">
        <h4 className="font-semibold mb-1">Images</h4>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Cache Hit Rate:</span>
            <span className={metrics.imageStats.cacheHitRate > 80 ? 'text-green-500' : 'text-yellow-500'}>
              {metrics.imageStats.cacheHitRate?.toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>Avg Load Time:</span>
            <span>{formatTime(metrics.imageStats.avgLoadTime || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span>Images Loaded:</span>
            <span>{metrics.imageStats.imagesLoaded || 0}</span>
          </div>
        </div>
      </div>

      {/* Cache Performance */}
      <div className="mb-3">
        <h4 className="font-semibold mb-1">Cache</h4>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Hit Rate:</span>
            <span className={metrics.cacheStats.hitRate > 80 ? 'text-green-500' : 'text-yellow-500'}>
              {metrics.cacheStats.hitRate?.toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>Entries:</span>
            <span>{metrics.cacheStats.entries || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Size:</span>
            <span>{formatBytes(metrics.cacheStats.totalSize || 0)}</span>
          </div>
        </div>
      </div>

      {/* Memory Usage */}
      {metrics.memoryUsage && (
        <div className="mb-3">
          <h4 className="font-semibold mb-1">Memory</h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Used:</span>
              <span>{formatBytes(metrics.memoryUsage.used)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total:</span>
              <span>{formatBytes(metrics.memoryUsage.total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Network Info */}
      {metrics.networkInfo && (
        <div className="mb-3">
          <h4 className="font-semibold mb-1">Network</h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Type:</span>
              <span>{metrics.networkInfo.effectiveType}</span>
            </div>
            <div className="flex justify-between">
              <span>Downlink:</span>
              <span>{metrics.networkInfo.downlink} Mbps</span>
            </div>
            <div className="flex justify-between">
              <span>RTT:</span>
              <span>{metrics.networkInfo.rtt}ms</span>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-400 mt-2">
        Press Ctrl+Shift+P to toggle
      </div>
    </div>
  );
}
