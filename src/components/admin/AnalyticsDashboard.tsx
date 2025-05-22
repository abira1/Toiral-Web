import React, { useState, useEffect } from 'react';
import { Win95Button } from '../Win95Button';
import { database } from '../../firebase/config';
import { ref, onValue, set } from 'firebase/database';
import { BarChart, LineChart, PieChart, TrendingUpIcon, UsersIcon, MousePointerIcon, ClockIcon, RefreshCwIcon, CalendarIcon, DownloadIcon } from 'lucide-react';
import { getAnalytics, logEvent } from 'firebase/analytics';

// Define types for analytics data
interface PageView {
  path: string;
  count: number;
  timestamp: number;
}

interface VisitorData {
  totalVisitors: number;
  newVisitors: number;
  returningVisitors: number;
  lastUpdated: number;
}

interface DeviceData {
  desktop: number;
  mobile: number;
  tablet: number;
}

interface AnalyticsData {
  pageViews: Record<string, PageView>;
  visitors: VisitorData;
  devices: DeviceData;
  bounceRate: number;
  avgSessionDuration: number;
  dailyVisitors: Record<string, number>;
}

export function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days'>('7days');

  // Load analytics data from Firebase
  useEffect(() => {
    const analyticsRef = ref(database, 'analytics');

    const unsubscribe = onValue(analyticsRef, (snapshot) => {
      setLoading(true);
      try {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setAnalyticsData(data);
        } else {
          // Initialize with default data if none exists
          const defaultData: AnalyticsData = {
            pageViews: {},
            visitors: {
              totalVisitors: 0,
              newVisitors: 0,
              returningVisitors: 0,
              lastUpdated: Date.now()
            },
            devices: {
              desktop: 0,
              mobile: 0,
              tablet: 0
            },
            bounceRate: 0,
            avgSessionDuration: 0,
            dailyVisitors: {}
          };
          setAnalyticsData(defaultData);
          // Save default data to Firebase
          set(analyticsRef, defaultData);
        }
        setError(null);
      } catch (err) {
        console.error('Error loading analytics data:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Refresh analytics data
  const handleRefresh = () => {
    setLoading(true);
    // This would typically fetch fresh data from an analytics API
    // For now, we'll just simulate a refresh by updating the lastUpdated timestamp
    if (analyticsData) {
      const updatedData = {
        ...analyticsData,
        visitors: {
          ...analyticsData.visitors,
          lastUpdated: Date.now()
        }
      };

      set(ref(database, 'analytics'), updatedData)
        .then(() => {
          setAnalyticsData(updatedData);
          setError(null);
        })
        .catch(err => {
          console.error('Error refreshing analytics:', err);
          setError('Failed to refresh analytics data');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  // Generate mock chart data based on date range
  const getChartData = () => {
    // In a real implementation, this would filter actual data based on the date range
    return Array(dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90)
      .fill(0)
      .map((_, i) => ({
        date: new Date(Date.now() - (i * 86400000)).toLocaleDateString(),
        visitors: Math.floor(Math.random() * 100) + 10
      }))
      .reverse();
  };

  // Export analytics data
  const handleExport = () => {
    if (!analyticsData) return;

    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `toiral-analytics-${new Date().toISOString().slice(0, 10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading && !analyticsData) {
    return (
      <div className="p-6 bg-white border-2 border-gray-400 rounded-lg">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600 font-mono">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border-2 border-gray-400 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold font-mono flex items-center">
          <TrendingUpIcon className="w-5 h-5 mr-2" />
          Analytics Dashboard
        </h2>
        <div className="flex space-x-2">
          <Win95Button
            onClick={handleRefresh}
            className="px-3 py-1 font-mono text-sm flex items-center"
            disabled={loading}
          >
            <RefreshCwIcon className="w-4 h-4 mr-1" />
            Refresh
          </Win95Button>
          <Win95Button
            onClick={handleExport}
            className="px-3 py-1 font-mono text-sm flex items-center"
          >
            <DownloadIcon className="w-4 h-4 mr-1" />
            Export
          </Win95Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-2 border-red-400 p-3 mb-4 font-mono text-red-700">
          {error}
        </div>
      )}

      {/* Date range selector */}
      <div className="mb-6 flex items-center">
        <CalendarIcon className="w-4 h-4 mr-2" />
        <span className="font-mono mr-2">Time Period:</span>
        <div className="flex border-2 border-gray-400">
          <button
            className={`px-3 py-1 font-mono text-sm ${dateRange === '7days' ? 'bg-blue-100' : 'bg-gray-200'}`}
            onClick={() => setDateRange('7days')}
          >
            7 Days
          </button>
          <button
            className={`px-3 py-1 font-mono text-sm ${dateRange === '30days' ? 'bg-blue-100' : 'bg-gray-200'}`}
            onClick={() => setDateRange('30days')}
          >
            30 Days
          </button>
          <button
            className={`px-3 py-1 font-mono text-sm ${dateRange === '90days' ? 'bg-blue-100' : 'bg-gray-200'}`}
            onClick={() => setDateRange('90days')}
          >
            90 Days
          </button>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 border-2 border-gray-400 bg-gray-100">
          <div className="flex items-center mb-2">
            <UsersIcon className="w-5 h-5 mr-2 text-blue-600" />
            <h3 className="font-mono font-bold">Total Visitors</h3>
          </div>
          <p className="text-2xl font-bold">{analyticsData?.visitors?.totalVisitors || 0}</p>
          <p className="text-xs text-gray-500 font-mono mt-1">
            Last updated: {analyticsData?.visitors ? formatDate(analyticsData.visitors.lastUpdated) : 'N/A'}
          </p>
        </div>

        <div className="p-4 border-2 border-gray-400 bg-gray-100">
          <div className="flex items-center mb-2">
            <MousePointerIcon className="w-5 h-5 mr-2 text-green-600" />
            <h3 className="font-mono font-bold">Page Views</h3>
          </div>
          <p className="text-2xl font-bold">
            {analyticsData?.pageViews ? Object.values(analyticsData.pageViews).reduce((sum, page) => sum + page.count, 0) : 0}
          </p>
          <p className="text-xs text-gray-500 font-mono mt-1">
            Across all pages
          </p>
        </div>

        <div className="p-4 border-2 border-gray-400 bg-gray-100">
          <div className="flex items-center mb-2">
            <BarChart className="w-5 h-5 mr-2 text-red-600" />
            <h3 className="font-mono font-bold">Bounce Rate</h3>
          </div>
          <p className="text-2xl font-bold">{analyticsData?.bounceRate || 0}%</p>
          <p className="text-xs text-gray-500 font-mono mt-1">
            Single page sessions
          </p>
        </div>

        <div className="p-4 border-2 border-gray-400 bg-gray-100">
          <div className="flex items-center mb-2">
            <ClockIcon className="w-5 h-5 mr-2 text-purple-600" />
            <h3 className="font-mono font-bold">Avg. Session</h3>
          </div>
          <p className="text-2xl font-bold">{analyticsData?.avgSessionDuration || 0}s</p>
          <p className="text-xs text-gray-500 font-mono mt-1">
            Time on site
          </p>
        </div>
      </div>

      {/* Visitor chart */}
      <div className="mb-6 border-2 border-gray-400 p-4">
        <h3 className="font-mono font-bold mb-4 flex items-center">
          <LineChart className="w-5 h-5 mr-2" />
          Visitor Trends
        </h3>
        <div className="h-64 bg-gray-100 border border-gray-300 p-4 flex items-center justify-center">
          <div className="w-full h-full relative">
            {/* This would be replaced with an actual chart library in a real implementation */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between">
              {getChartData().filter((_, i) => i % (dateRange === '7days' ? 1 : dateRange === '30days' ? 5 : 15) === 0).map((item, index) => (
                <div key={index} className="text-xs font-mono text-gray-500">{item.date.split('/').slice(0, 2).join('/')}</div>
              ))}
            </div>
            <div className="absolute top-0 left-0 bottom-0 flex flex-col justify-between">
              <div className="text-xs font-mono text-gray-500">100</div>
              <div className="text-xs font-mono text-gray-500">50</div>
              <div className="text-xs font-mono text-gray-500">0</div>
            </div>
            <div className="absolute top-8 left-8 right-8 bottom-8 flex items-end">
              {getChartData().map((item, index) => (
                <div
                  key={index}
                  className="bg-blue-500 mx-1"
                  style={{
                    height: `${(item.visitors / 100) * 100}%`,
                    width: `${100 / (dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90)}%`
                  }}
                  title={`${item.date}: ${item.visitors} visitors`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Device breakdown and top pages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border-2 border-gray-400 p-4">
          <h3 className="font-mono font-bold mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            Device Breakdown
          </h3>
          <div className="flex justify-around items-center h-48">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-blue-500 mx-auto flex items-center justify-center text-white font-bold">
                {analyticsData?.devices?.desktop || 0}%
              </div>
              <p className="mt-2 font-mono">Desktop</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-green-500 mx-auto flex items-center justify-center text-white font-bold">
                {analyticsData?.devices?.mobile || 0}%
              </div>
              <p className="mt-2 font-mono">Mobile</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-yellow-500 mx-auto flex items-center justify-center text-white font-bold">
                {analyticsData?.devices?.tablet || 0}%
              </div>
              <p className="mt-2 font-mono">Tablet</p>
            </div>
          </div>
        </div>

        <div className="border-2 border-gray-400 p-4">
          <h3 className="font-mono font-bold mb-4">Top Pages</h3>
          <div className="overflow-auto max-h-48">
            <table className="w-full border-collapse font-mono">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 text-left border border-gray-400">Page</th>
                  <th className="p-2 text-right border border-gray-400">Views</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData?.pageViews && Object.values(analyticsData.pageViews)
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5)
                  .map((page, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                      <td className="p-2 border border-gray-400">{page.path || 'Unknown'}</td>
                      <td className="p-2 text-right border border-gray-400">{page.count}</td>
                    </tr>
                  ))}
                {(!analyticsData?.pageViews || Object.values(analyticsData.pageViews).length === 0) && (
                  <tr>
                    <td colSpan={2} className="p-2 text-center border border-gray-400 text-gray-500">
                      No page view data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Setup instructions */}
      <div className="mt-6 bg-blue-50 p-4 border-2 border-blue-200 font-mono text-sm">
        <h3 className="font-bold mb-2">Analytics Setup Instructions</h3>
        <p>To collect real analytics data, you need to:</p>
        <ol className="list-decimal ml-5 mt-2 space-y-1">
          <li>Ensure Firebase Analytics is properly configured in your project</li>
          <li>Add tracking code to your pages to record page views and events</li>
          <li>Set up a scheduled function to aggregate and store analytics data in your Realtime Database</li>
        </ol>
        <p className="mt-2">Currently showing simulated data for demonstration purposes.</p>
      </div>
    </div>
  );
}
