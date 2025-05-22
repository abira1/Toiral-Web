import React from 'react';
import { Ad } from '../../types/ad.types';
import { incrementAdStat } from '../../firebase/adService';
import { AdContainer } from './AdContainer';

interface AdBannerProps {
  ad: Ad;
  onClose: () => void;
}

export function AdBanner({ ad, onClose }: AdBannerProps) {
  const handleClick = () => {
    // Record click
    if (ad.id) {
      incrementAdStat(ad.id, 'clicks').catch(console.error);
    }

    // Handle the button URL
    if (ad.content?.buttonUrl) {
      // Special case for preview mode
      if (ad.content.buttonUrl === '#preview-section-link') {
        // Do nothing in preview mode
        return;
      }

      // Check if it's an internal section link (starts with #)
      if (ad.content.buttonUrl.startsWith('#')) {
        const sectionId = ad.content.buttonUrl.substring(1); // Remove the # character

        // Find the section icon and click it
        const sectionIcon = document.querySelector(`[data-section-id="${sectionId}"]`);
        if (sectionIcon) {
          (sectionIcon as HTMLElement).click();
        } else {
          // Fallback: dispatch a custom event that Windows95Desktop can listen for
          window.dispatchEvent(new CustomEvent('openDialog', { detail: { id: sectionId } }));
        }
      } else {
        // External URL - open in new tab
        window.open(ad.content.buttonUrl, '_blank');
      }
    } else {
      console.log('Ad has no button URL:', ad);
    }
  };

  return (
    <AdContainer ad={ad} onClose={onClose}>
      <div
        className="flex items-center overflow-hidden border-2 border-t-[#ffffff] border-l-[#ffffff] border-r-[#808080] border-b-[#808080]"
        style={{
          backgroundColor: ad.styling?.backgroundColor || '#c0c0c0',
          color: ad.styling?.textColor || '#000000',
          borderRadius: ad.styling?.borderRadius || '0',
        }}
      >
        {/* Media (Image or Video) */}
        {(ad.content?.mediaUrl || ad.content?.imageUrl || ad.content?.videoUrl) && (
          <div className="flex-shrink-0 border-r border-[#808080]">
            {(ad.content?.mediaType === 'video' || ad.content?.videoUrl) ? (
              <video
                src={ad.content?.mediaUrl || ad.content?.videoUrl}
                className="h-full object-cover"
                style={{ maxHeight: '120px', width: 'auto' }}
                autoPlay={true}
                muted={true}
                controls={Boolean(ad.content?.videoControls)}
                loop
                playsInline
              />
            ) : (
              <img
                src={ad.content?.mediaUrl || ad.content?.imageUrl}
                alt=""
                className="h-full object-cover"
                style={{ maxHeight: '120px', width: 'auto' }}
              />
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-grow p-4">
          <div
            className="px-2 py-0.5 mb-2 inline-block"
            style={{
              backgroundColor: ad.styling?.accentColor || '#000080',
              color: '#ffffff'
            }}
          >
            <h3 className="font-mono font-bold text-sm">{ad.content?.heading || 'Advertisement'}</h3>
          </div>
          <p className="font-mono text-sm mb-3">{ad.content?.body || ''}</p>

          {/* CTA Button */}
          {ad.content?.buttonText && (
            <button
              onClick={handleClick}
              className="font-mono text-sm px-4 py-1 border-2 border-t-[#ffffff] border-l-[#ffffff] border-r-[#808080] border-b-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-r-[#ffffff] active:border-b-[#ffffff] focus:outline-none"
              style={{
                backgroundColor: ad.styling?.backgroundColor || '#c0c0c0',
                color: ad.styling?.textColor || '#000000',
              }}
            >
              {ad.content.buttonText}
            </button>
          )}
        </div>
      </div>
    </AdContainer>
  );
}
