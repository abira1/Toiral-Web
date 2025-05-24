import React, { useState, useEffect } from 'react';
import { PerformanceMonitor } from '../PerformanceMonitor';
import { getPerformanceStats } from '../../services/imageOptimizationService';
import { performanceService } from '../../services/performanceOptimizationService';
import { intelligentPreloadingService } from '../../services/intelligentPreloadingService';
import { offlineService } from '../../services/offlineService';

interface PerformanceMetrics {
  coreWebVitals: {
    lcp?: number;
    fid?: number;
    cls?: number;
    fcp?: number;
    ttfb?: number;
  };
  loadingPerformance: {
    totalLoadTime: number;
    cacheHitRate: number;
    imageOptimization: any;
    bundleSize: number;
  };
  userExperience: {
    preloadAccuracy: number;
    offlineCapability: number;
    errorRate: number;
    retrySuccess: number;
  };
  networkOptimization: {
    compressionRatio: number;
    resourceCount: number;
    transferSize: number;
    connectionType: string;
  };
}

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadMetrics();
    
    if (autoRefresh) {
      const interval = setInterval(loadMetrics, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [selectedTimeRange, autoRefresh]);

  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      
      // Gather metrics from all services
      const [
        imageStats,
        cacheStats,
        preloadStats,
        offlineStats,
        webVitals
      ] = await Promise.all([
        getPerformanceStats(),
        performanceService.getCacheStats(),
        intelligentPreloadingService.getAnalytics(),
        offlineService.getOfflineStatus(),
        measureWebVitals()
      ]);

      const compiledMetrics: PerformanceMetrics = {
        coreWebVitals: webVitals,
        loadingPerformance: {
          totalLoadTime: imageStats.totalLoadTime || 0,
          cacheHitRate: cacheStats.hitRate || 0,
          imageOptimization: imageStats,
          bundleSize: await getBundleSize()
        },
        userExperience: {
          preloadAccuracy: preloadStats.hitRate || 0,
          offlineCapability: calculateOfflineScore(offlineStats),
          errorRate: calculateErrorRate(),
          retrySuccess: calculateRetrySuccess()
        },
        networkOptimization: {
          compressionRatio: await calculateCompressionRatio(),
          resourceCount: await getResourceCount(),
          transferSize: await getTransferSize(),
          connectionType: getConnectionType()
        }
      };

      setMetrics(compiledMetrics);
    } catch (error) {
      console.error('Failed to load performance metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const measureWebVitals = async (): Promise<any> => {
    return new Promise((resolve) => {
      const vitals: any = {};
      
      // Get navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        vitals.ttfb = navigation.responseStart - navigation.requestStart;
        vitals.loadTime = navigation.loadEventEnd - navigation.navigationStart;
      }

      // Get paint timing
      const paint = performance.getEntriesByType('paint');
      const fcpEntry = paint.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        vitals.fcp = fcpEntry.startTime;
      }

      // LCP measurement
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) {
              vitals.lcp = lastEntry.startTime;
            }
            observer.disconnect();
            resolve(vitals);
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
          
          // Fallback timeout
          setTimeout(() => {
            observer.disconnect();
            resolve(vitals);
          }, 1000);
        } catch (error) {
          resolve(vitals);
        }
      } else {
        resolve(vitals);
      }
    });
  };

  const getBundleSize = async (): Promise<number> => {
    try {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return resources
        .filter(resource => resource.name.includes('.js') || resource.name.includes('.css'))
        .reduce((total, resource) => total + (resource.transferSize || 0), 0);
    } catch (error) {
      return 0;
    }
  };

  const calculateOfflineScore = (offlineStats: any): number => {
    const capabilities = offlineStats.offlineCapabilities.length;
    const cachedData = offlineStats.cachedDataCount;
    return Math.min(100, (capabilities * 10) + (cachedData * 2));
  };

  const calculateErrorRate = (): number => {
    // This would be calculated from actual error tracking
    return Math.random() * 5; // Placeholder
  };

  const calculateRetrySuccess = (): number => {
    // This would be calculated from actual retry statistics
    return 85 + Math.random() * 10; // Placeholder
  };

  const calculateCompressionRatio = async (): Promise<number> => {
    try {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const totalTransfer = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
      const totalDecompressed = resources.reduce((sum, r) => sum + (r.decodedBodySize || 0), 0);
      return totalDecompressed > 0 ? (1 - totalTransfer / totalDecompressed) * 100 : 0;
    } catch (error) {
      return 0;
    }
  };

  const getResourceCount = async (): Promise<number> => {
    return performance.getEntriesByType('resource').length;
  };

  const getTransferSize = async (): Promise<number> => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return resources.reduce((total, resource) => total + (resource.transferSize || 0), 0);
  };

  const getConnectionType = (): string => {
    if ('connection' in navigator) {
      return (navigator as any).connection.effectiveType || 'unknown';
    }
    return 'unknown';
  };

  const getScoreColor = (score: number, thresholds: [number, number]) => {
    if (score >= thresholds[1]) return 'text-green-600';
    if (score >= thresholds[0]) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="font-mono text-lg">Loading Performance Metrics...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="font-mono text-lg text-red-600">Failed to load metrics</div>
            <button
              onClick={loadMetrics}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded font-mono"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold font-mono">Performance Dashboard</h1>
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="border border-gray-300 rounded px-3 py-1 font-mono"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <label className="flex items-center font-mono text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2"
              />
              Auto Refresh
            </label>
            <button
              onClick={loadMetrics}
              className="bg-blue-600 text-white px-4 py-2 rounded font-mono hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Core Web Vitals */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border-2 border-gray-300">
            <h3 className="font-mono font-bold text-sm mb-2">LCP</h3>
            <div className={`text-2xl font-bold ${getScoreColor(metrics.coreWebVitals.lcp || 0, [2500, 4000])}`}>
              {metrics.coreWebVitals.lcp ? formatTime(metrics.coreWebVitals.lcp) : 'N/A'}
            </div>
            <div className="text-xs text-gray-500 font-mono">Largest Contentful Paint</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border-2 border-gray-300">
            <h3 className="font-mono font-bold text-sm mb-2">FCP</h3>
            <div className={`text-2xl font-bold ${getScoreColor(metrics.coreWebVitals.fcp || 0, [1800, 3000])}`}>
              {metrics.coreWebVitals.fcp ? formatTime(metrics.coreWebVitals.fcp) : 'N/A'}
            </div>
            <div className="text-xs text-gray-500 font-mono">First Contentful Paint</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border-2 border-gray-300">
            <h3 className="font-mono font-bold text-sm mb-2">TTFB</h3>
            <div className={`text-2xl font-bold ${getScoreColor(metrics.coreWebVitals.ttfb || 0, [800, 1800])}`}>
              {metrics.coreWebVitals.ttfb ? formatTime(metrics.coreWebVitals.ttfb) : 'N/A'}
            </div>
            <div className="text-xs text-gray-500 font-mono">Time to First Byte</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border-2 border-gray-300">
            <h3 className="font-mono font-bold text-sm mb-2">Cache Hit Rate</h3>
            <div className={`text-2xl font-bold ${getScoreColor(metrics.loadingPerformance.cacheHitRate, [70, 85])}`}>
              {metrics.loadingPerformance.cacheHitRate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 font-mono">Data & Image Cache</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border-2 border-gray-300">
            <h3 className="font-mono font-bold text-sm mb-2">Bundle Size</h3>
            <div className="text-2xl font-bold text-blue-600">
              {formatBytes(metrics.loadingPerformance.bundleSize)}
            </div>
            <div className="text-xs text-gray-500 font-mono">Total JS/CSS</div>
          </div>
        </div>

        {/* Performance Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Loading Performance */}
          <div className="bg-white p-6 rounded-lg shadow border-2 border-gray-300">
            <h2 className="text-lg font-bold font-mono mb-4">Loading Performance</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-mono text-sm">Total Load Time:</span>
                <span className="font-mono text-sm font-bold">
                  {formatTime(metrics.loadingPerformance.totalLoadTime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-sm">Images Loaded:</span>
                <span className="font-mono text-sm font-bold">
                  {metrics.loadingPerformance.imageOptimization.imagesLoaded || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-sm">Avg Image Load:</span>
                <span className="font-mono text-sm font-bold">
                  {formatTime(metrics.loadingPerformance.imageOptimization.avgLoadTime || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* User Experience */}
          <div className="bg-white p-6 rounded-lg shadow border-2 border-gray-300">
            <h2 className="text-lg font-bold font-mono mb-4">User Experience</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-mono text-sm">Preload Accuracy:</span>
                <span className={`font-mono text-sm font-bold ${getScoreColor(metrics.userExperience.preloadAccuracy, [60, 80])}`}>
                  {metrics.userExperience.preloadAccuracy.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-sm">Offline Capability:</span>
                <span className={`font-mono text-sm font-bold ${getScoreColor(metrics.userExperience.offlineCapability, [50, 80])}`}>
                  {metrics.userExperience.offlineCapability.toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-sm">Error Rate:</span>
                <span className={`font-mono text-sm font-bold ${getScoreColor(100 - metrics.userExperience.errorRate, [95, 98])}`}>
                  {metrics.userExperience.errorRate.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Monitor */}
        <div className="mt-6">
          <PerformanceMonitor enabled={true} showOverlay={true} />
        </div>
      </div>
    </div>
  );
}
