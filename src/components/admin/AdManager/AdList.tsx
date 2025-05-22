import React from 'react';
import { Ad } from '../../../types/ad.types';
import { deleteAd, toggleAdStatus } from '../../../firebase/adService';

interface AdListProps {
  ads: Ad[];
  onEdit: (ad: Ad) => void;
  onRefresh: () => void;
}

export function AdList({ ads, onEdit, onRefresh }: AdListProps) {
  // Handle toggling ad active status
  const handleToggleStatus = async (ad: Ad) => {
    if (!ad.id) return;

    try {
      await toggleAdStatus(ad.id, !ad.isActive);
      onRefresh();
    } catch (error) {
      console.error('Error toggling ad status:', error);
      alert('Failed to update ad status. Please try again.');
    }
  };

  // Handle deleting an ad
  const handleDelete = async (ad: Ad) => {
    if (!ad.id) return;

    if (window.confirm(`Are you sure you want to delete the ad "${ad.title}"?`)) {
      try {
        await deleteAd(ad.id);
        onRefresh();
      } catch (error) {
        console.error('Error deleting ad:', error);
        alert('Failed to delete ad. Please try again.');
      }
    }
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (ads.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600 font-mono mb-4">No ads found</p>
        <p className="text-gray-500 font-mono text-sm">
          Create your first ad to start promoting your content
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="py-3 px-4 text-left font-mono text-sm font-medium text-gray-600">Title</th>
            <th className="py-3 px-4 text-left font-mono text-sm font-medium text-gray-600">Type</th>
            <th className="py-3 px-4 text-left font-mono text-sm font-medium text-gray-600">Active</th>
            <th className="py-3 px-4 text-left font-mono text-sm font-medium text-gray-600">Date Range</th>
            <th className="py-3 px-4 text-left font-mono text-sm font-medium text-gray-600">Stats</th>
            <th className="py-3 px-4 text-left font-mono text-sm font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {ads.map(ad => (
            <tr key={ad.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4 font-mono">
                <div className="font-medium">
                  {ad.title || (
                    <span className="text-red-500 italic">Missing Title</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {ad.content?.heading || (
                    <span className="text-red-500 italic">Missing Heading</span>
                  )}
                  {ad.content?.mediaType === 'video' && (
                    <span className="ml-2 inline-block px-1.5 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">
                      Video
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 font-mono">
                <span className={`inline-block px-2 py-1 text-xs rounded ${
                  (ad.type || 'banner') === 'banner' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  {ad.type ? (ad.type.charAt(0).toUpperCase() + ad.type.slice(1)) : 'Banner'}
                </span>
              </td>
              <td className="py-3 px-4">
                <button
                  onClick={() => handleToggleStatus(ad)}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none transition-colors ${
                    ad.isActive ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${
                      ad.isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </td>
              <td className="py-3 px-4 font-mono text-sm">
                {ad.display?.startDate && ad.display?.endDate ? (
                  <>
                    <div>{formatDate(ad.display.startDate)}</div>
                    <div className="text-gray-500">to</div>
                    <div>{formatDate(ad.display.endDate)}</div>
                  </>
                ) : (
                  <div className="text-gray-500">No date range</div>
                )}
              </td>
              <td className="py-3 px-4 font-mono text-sm">
                <div>Views: {ad.stats?.impressions || 0}</div>
                <div>Clicks: {ad.stats?.clicks || 0}</div>
                <div>CTR: {ad.stats?.impressions > 0
                  ? (((ad.stats?.clicks || 0) / ad.stats.impressions) * 100).toFixed(1) + '%'
                  : '0%'}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(ad)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-mono text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(ad)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 font-mono text-xs"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
