/**
 * Central type definitions for the application
 */

// Team Member
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
}

// Portfolio Item
export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image: string;
  url: string;
  order?: number; // Optional for backward compatibility
}

// Review
export interface Review {
  id: string;
  name: string;
  rating: number;
  review: string;
  date: string;
  approved: boolean;
  featured?: boolean;
  position?: number;
  company?: string;
  avatar?: string;
}

// Contact Information
export interface SocialMediaLink {
  id: string;
  platform: string;
  icon: string;
  url: string;
}

export interface ContactInfo {
  officeHours: {
    days: string;
    hours: string;
    timezone: string;
  };
  phone: string;
  whatsapp?: string;
  email: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    [key: string]: string | undefined;
  } | SocialMediaLink[];
}

// Pricing Information
export interface PricingAddon {
  id: string;
  name: string;
  description?: string;
  price: number;
  visible: boolean;
}

export interface PricingPackage {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  features: string[];
  popular: boolean;
  visible: boolean;
  order: number;
  icon?: string;
}

export interface PricingSettings {
  packages: PricingPackage[];
  addons: PricingAddon[];
  currency: string;
  showPricing: boolean;
  title: string;
  subtitle?: string;
}

// Service Type
export interface ServiceType {
  id: string;
  name: string;
  duration: string;
  price: string;
  color: string;
}

// Booking Submission
export interface BookingSubmission {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceType: string;
  date: string;
  time: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  userId?: string; // Optional user ID from Firebase Auth
}

// Company Profile
export interface CompanyProfile {
  name: string;
  tagline: string;
  logo: string;
  headerImage: string;
}

// Contact Form Submission
export interface ContactFormSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  submittedAt: string;
}

// Gallery Image
export interface GalleryImage {
  id: string;
  url: string;
  caption: string;
}

// About Us Content
export interface AboutUsContent {
  vision: string;
  story: string;
  gallery: GalleryImage[];
  welcomeText: string;
}

// Chat Message
export interface ChatMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
  status: 'new' | 'replied' | 'read';
  subject?: string;
  role?: 'user' | 'admin' | 'bot';
  content?: string;
  userId?: string;  // Firebase Auth UID
  conversationId?: string;  // To group messages in a conversation
  isTyping?: boolean;  // For typing indicators
  read?: boolean;  // To track if message has been read
}

// Notification
export interface Notification {
  id: string;
  type: 'review' | 'contact' | 'booking';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  sourceId: string; // ID of the original item (review, contact, booking)
  userName?: string;
}

// Notifications Map
export type NotificationsMap = {
  [key: string]: Notification;
};

// Chat Conversation
export interface ChatConversation {
  id: string;
  userId: string;  // Firebase Auth UID
  userName: string;
  userEmail: string;
  userPhotoURL?: string;
  startedAt: string;
  lastMessageAt: string;
  status: 'active' | 'closed' | 'archived';
  unreadCount: number;  // Number of unread messages (for admin)
  userUnreadCount: number;  // Number of unread messages (for user)
  assignedTo?: string;  // Admin UID who is handling this conversation
}

// Testimonial Settings
export interface TestimonialSettings {
  displayMode: 'grid' | 'carousel' | 'list';
  autoRotate: boolean;
  rotationSpeed: number;
  showRating: boolean;
  maxDisplayCount: number;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

// Analytics Data
export interface PageView {
  path: string;
  count: number;
  timestamp: number;
}

export interface VisitorData {
  totalVisitors: number;
  newVisitors: number;
  returningVisitors: number;
  lastUpdated: number;
}

export interface DeviceData {
  desktop: number;
  mobile: number;
  tablet: number;
}

export interface AnalyticsData {
  pageViews: Record<string, PageView>;
  visitors: VisitorData;
  devices: DeviceData;
  bounceRate: number;
  avgSessionDuration: number;
  dailyVisitors: Record<string, number>;
}

// SEO Settings
export interface MetaTag {
  id: string;
  name: string;
  content: string;
}

export interface SEOSettings {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  canonicalUrl: string;
  structuredData: string;
  metaTags: MetaTag[];
  robotsTxt: string;
  sitemapXml: string;
}

// Email Marketing
export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  subscribed: boolean;
  subscribedAt: number;
  lastEmailSent?: number;
  source?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  templateId?: string;
  status: 'draft' | 'scheduled' | 'sent';
  scheduledFor?: number;
  sentAt?: number;
  recipients: number;
  opens?: number;
  clicks?: number;
}

export interface EmailMarketingSettings {
  subscribers: Record<string, Subscriber>;
  templates: Record<string, EmailTemplate>;
  campaigns: Record<string, EmailCampaign>;
  settings: {
    senderName: string;
    senderEmail: string;
    replyToEmail: string;
    signupFormEnabled: boolean;
    doubleOptIn: boolean;
    welcomeEmailEnabled: boolean;
    welcomeEmailSubject: string;
    welcomeEmailContent: string;
  };
}

// Game
export interface Game {
  id: string;
  name: string;
  description?: string;
  icon: string;
  embedType: 'direct' | 'itch.io' | 'youtube' | 'unity' | 'codepen' | 'jsfiddle' | 'glitch' | 'custom';
  embedUrl: string;
  visible: boolean;
  order: number;
  createdAt: number;
  updatedAt: number;
  category?: string;
  tags?: string[];
  playCount?: number;
  rating?: number;
  featured?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedTime?: string; // e.g., "5 min", "10-15 min"
  instructions?: string;
  controls?: string;
}

// Game Category
export interface GameCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  order: number;
  visible: boolean;
}

// Games Settings
export interface GamesSettings {
  games: Game[];
  categories?: GameCategory[];
  showGames: boolean;
  title: string;
  subtitle?: string;
  iconSize?: 'small' | 'medium' | 'large'; // Control icon size in the UI
  layout?: 'grid' | 'list'; // Control layout of games display
  showFeaturedGames?: boolean; // Whether to show featured games section
  showCategories?: boolean; // Whether to show category filters
  showSearch?: boolean; // Whether to show search bar
}

// Mobile Welcome Message Settings
export interface MobileWelcomeSettings {
  enabled: boolean;
  message: string;
  showOnlyOnFirstVisit: boolean;
  autoHideAfter: number; // milliseconds
}

// Content Settings
export interface ContentSettings {
  company: CompanyProfile;
  about: {
    story: string;
    teamMembers: TeamMember[];
  };
  portfolio: PortfolioItem[];
  reviews: Review[];
  contact: ContactInfo;
  services: ServiceType[];
  availableHours: number[];
  bookings: BookingSubmission[];
  contactSubmissions: ContactFormSubmission[];
  aboutUs: AboutUsContent;
  chatMessages: ChatMessage[];
  notifications: NotificationsMap;
  conversations: {
    [key: string]: ChatConversation;
  };
  pricing: PricingSettings;
  games: GamesSettings;
  testimonialSettings?: TestimonialSettings;
  analytics?: AnalyticsData;
  seo?: SEOSettings;
  emailMarketing?: EmailMarketingSettings;
  mobileWelcome?: MobileWelcomeSettings;

  // Additional properties accessed in the code
  toiral: {
    [key: string]: any;
    settings?: {
      [key: string]: any;
    };
  };
  security: {
    [key: string]: any;
    settings?: {
      [key: string]: any;
    };
  };
  profile: {
    [key: string]: any;
    settings?: {
      [key: string]: any;
    };
    fcmToken?: string;
  };
  theme: {
    [key: string]: any;
    settings?: {
      [key: string]: any;
    };
    sections?: Array<{
      id: string;
      label: string;
      icon: string;
      order: number;
      visible: boolean;
    }>;
  };

  // Clock settings
  clockTimezone?: string;

  // Allow for dynamic property access with better typing
  [key: string]: any;
}

// Win95Button Props
export interface Win95ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: React.ReactNode;
}

// Section Manager Props
export interface SectionManagerProps {
  title: string;
  children: React.ReactNode;
  onSave?: () => void;
  onCancel?: () => void;
  showSaveButton?: boolean;
}