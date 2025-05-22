export type AdType = 'banner' | 'popup';
export type AnimationType = 'slide' | 'fade' | 'bounce' | 'pulse';
export type AnimationDirection = 'top' | 'right' | 'bottom' | 'left';
export type DisplayPosition = 'top' | 'bottom' | 'center' | 'corner-top-right' | 'corner-bottom-right' | 'corner-top-left' | 'corner-bottom-left';
export type DisplayFrequency = 'once' | 'always' | 'daily' | 'hourly';

export type MediaType = 'image' | 'video';

export interface AdContent {
  heading: string;
  body: string;
  mediaType: MediaType;
  mediaUrl: string;
  imageUrl?: string; // Kept for backward compatibility
  videoUrl?: string; // For video ads
  videoAutoplay?: boolean;
  videoMuted?: boolean;
  videoControls?: boolean;
  buttonText: string;
  buttonUrl: string;
}

export interface AdStyling {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  width?: string;
  height?: string;
  borderRadius?: string;
}

export interface AdAnimation {
  type: AnimationType;
  direction: AnimationDirection;
  duration: number;
}

export interface AdDisplay {
  position: DisplayPosition;
  startDate: number; // timestamp
  endDate: number; // timestamp
  frequency: DisplayFrequency;
  delay: number; // seconds before showing
  showOnPages: string[]; // array of page paths, empty means all pages
  closeAfter: number | null; // seconds, null means manual close only
  minTimeBetweenDisplays?: number; // minimum seconds to wait before showing again after being closed
}

export interface AdStats {
  impressions: number;
  clicks: number;
  closes: number;
}

export interface Ad {
  id?: string;
  type: AdType;
  title: string;
  content: AdContent;
  styling: AdStyling;
  animation: AdAnimation;
  display: AdDisplay;
  stats: AdStats;
  isActive: boolean;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

// For local storage tracking
export interface AdImpressionRecord {
  adId: string;
  lastShown: number; // timestamp
  showCount: number;
  closedAt?: number; // timestamp when the ad was last closed
}
