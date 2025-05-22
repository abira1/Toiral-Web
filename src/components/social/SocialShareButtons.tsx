import React from 'react';
import { FacebookIcon, TwitterIcon, LinkedinIcon, Share2Icon, InstagramIcon } from 'lucide-react';
import { Win95Button } from '../Win95Button';

interface SocialShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  className?: string;
  compact?: boolean;
}

export function SocialShareButtons({
  url,
  title,
  description = '',
  image = '',
  className = '',
  compact = false
}: SocialShareButtonsProps) {
  // Ensure we have a valid URL to share
  const shareUrl = url.startsWith('http') ? url : window.location.origin + url;
  
  // Encode parameters for sharing
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const encodedImage = image ? encodeURIComponent(image) : '';

  // Share URLs for different platforms
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const pinterestShareUrl = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`;
  
  // Function to open share dialog
  const openShareWindow = (url: string) => {
    window.open(url, 'share-dialog', 'width=800,height=600');
    return false;
  };

  // Copy link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        alert('Link copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
      });
  };

  return (
    <div className={`flex ${compact ? 'gap-1' : 'gap-2'} items-center ${className}`}>
      {!compact && (
        <span className="font-mono text-sm mr-1">Share:</span>
      )}
      
      <Win95Button
        onClick={() => openShareWindow(facebookShareUrl)}
        className={`${compact ? 'p-1' : 'p-2'} flex items-center justify-center`}
        title="Share on Facebook"
        ariaLabel="Share on Facebook"
      >
        <FacebookIcon className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-blue-600`} />
      </Win95Button>
      
      <Win95Button
        onClick={() => openShareWindow(twitterShareUrl)}
        className={`${compact ? 'p-1' : 'p-2'} flex items-center justify-center`}
        title="Share on Twitter"
        ariaLabel="Share on Twitter"
      >
        <TwitterIcon className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-blue-400`} />
      </Win95Button>
      
      <Win95Button
        onClick={() => openShareWindow(linkedinShareUrl)}
        className={`${compact ? 'p-1' : 'p-2'} flex items-center justify-center`}
        title="Share on LinkedIn"
        ariaLabel="Share on LinkedIn"
      >
        <LinkedinIcon className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-blue-700`} />
      </Win95Button>
      
      <Win95Button
        onClick={copyToClipboard}
        className={`${compact ? 'p-1' : 'p-2'} flex items-center justify-center`}
        title="Copy link"
        ariaLabel="Copy link"
      >
        <Share2Icon className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-gray-700`} />
      </Win95Button>
    </div>
  );
}
