import React from 'react';
import { Ad } from '../../../types/ad.types';
import { AdBanner } from '../../ads/AdBanner';
import { AdPopup } from '../../ads/AdPopup';

interface AdPreviewProps {
  ad: Ad;
}

export function AdPreview({ ad }: AdPreviewProps) {
  // Create a preview version of the ad with default stats
  const previewAd: Ad = {
    ...ad,
    stats: ad.stats || {
      impressions: 0,
      clicks: 0,
      closes: 0
    },
    createdAt: ad.createdAt || Date.now(),
    updatedAt: ad.updatedAt || Date.now()
  };

  // Mock close function for preview
  const handleClose = () => {
    // Do nothing in preview
  };

  // Create a modified version of the ad for preview that handles section links
  const previewAdWithModifiedHandlers = {
    ...previewAd,
    // Override the buttonUrl if it's a section link to show a message in preview
    content: previewAd.content ? {
      ...previewAd.content,
      buttonUrl: previewAd.content.buttonUrl?.startsWith('#')
        ? '#preview-section-link' // Special value for preview
        : previewAd.content.buttonUrl
    } : {
      heading: 'Preview Heading',
      body: 'Preview body text',
      mediaType: 'image',
      mediaUrl: '',
      buttonText: 'Preview Button',
      buttonUrl: '#'
    }
  };

  return (
    <div className="relative bg-gray-100 rounded-lg p-4 h-[500px] overflow-hidden">
      <div className="text-center text-gray-500 font-mono text-sm mb-4">
        Preview Mode
      </div>

      <div className="relative h-full">
        {/* Mock browser window */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
          {/* Browser header */}
          <div className="bg-gray-200 px-4 py-2 flex items-center">
            <div className="flex space-x-2 mr-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="bg-white rounded px-2 py-1 text-xs text-gray-600 flex-grow text-center">
              https://yourwebsite.com
            </div>
          </div>

          {/* Browser content */}
          <div className="flex-grow p-4 relative">
            {/* Mock website content */}
            <div className="mb-4">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>

            <div className="mb-4">
              <div className="h-6 bg-gray-200 rounded w-2/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            </div>

            {/* Ad preview */}
            <div className="absolute inset-0">
              {ad.type === 'banner' ? (
                <AdBanner ad={previewAdWithModifiedHandlers} onClose={handleClose} />
              ) : (
                <AdPopup ad={previewAdWithModifiedHandlers} onClose={handleClose} />
              )}
            </div>

            {/* Section link info message */}
            {ad.content?.buttonUrl?.startsWith('#') && (
              <div className="absolute bottom-4 left-4 right-4 bg-blue-100 border border-blue-300 text-blue-800 p-2 rounded text-xs font-mono">
                <strong>Note:</strong> In the actual website, clicking the button will open the "{ad.content.buttonUrl.substring(1)}" section.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
