export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
}
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
  userId?: string; // User ID from Firebase Auth
}
export interface ContentUpdateEvent extends CustomEvent {
  detail: {
    type: string;
    data: any;
  };
}
export interface WindowWithEvents extends Window {
  addEventListener(type: 'contentUpdate', listener: (event: ContentUpdateEvent) => void, options?: boolean | AddEventListenerOptions): void;
  removeEventListener(type: 'contentUpdate', listener: (event: ContentUpdateEvent) => void, options?: boolean | EventListenerOptions): void;
}

export interface ChatMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
  status: 'new' | 'replied';
  subject?: string;
  role?: 'user' | 'admin';
  content?: string;
}