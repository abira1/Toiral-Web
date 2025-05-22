import React from 'react';
import { Ad } from '../../types/ad.types';
import { incrementAdStat } from '../../firebase/adService';
import { AdContainer } from './AdContainer';

interface AdPopupProps {
  ad: Ad;
  onClose: () => void;
}

export function AdPopup({ ad, onClose }: AdPopupProps) {
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
        className="flex flex-col overflow-hidden border-2 border-t-[#ffffff] border-l-[#ffffff] border-r-[#808080] border-b-[#808080]"
        style={{
          backgroundColor: ad.styling?.backgroundColor || '#c0c0c0',
          color: ad.styling?.textColor || '#000000',
          borderRadius: ad.styling?.borderRadius || '0',
          width: ad.styling?.width || '320px',
          maxWidth: '90vw',
        }}
      >
        {/* Title Bar - Windows 95 Style */}
        <div
          className="px-2 py-1 flex items-center justify-between"
          style={{
            backgroundColor: ad.styling?.accentColor || '#000080',
            color: '#ffffff'
          }}
        >
          <h3 className="font-mono font-bold text-sm">{ad.content?.heading || 'Advertisement'}</h3>
        </div>

        {/* Media (Image or Video) */}
        {(ad.content?.mediaUrl || ad.content?.imageUrl || ad.content?.videoUrl) && (
          <div className="w-full border-b border-[#808080]">
            {(ad.content?.mediaType === 'video' || ad.content?.videoUrl) ? (
              <video
                src={ad.content?.mediaUrl || ad.content?.videoUrl}
                className="w-full object-cover"
                style={{ maxHeight: '180px' }}
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
                className="w-full object-cover"
                style={{ maxHeight: '180px' }}
              />
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          <p className="font-mono text-sm mb-4">{ad.content?.body || ''}</p>

          {/* CTA Button */}
          {ad.content?.buttonText && (
            <button
              onClick={handleClick}
              className="font-mono text-sm px-4 py-1 border-2 border-t-[#ffffff] border-l-[#ffffff] border-r-[#808080] border-b-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-r-[#ffffff] active:border-b-[#ffffff] focus:outline-none w-full"
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
