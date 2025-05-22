export interface UserLoginData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  lastLogin: string; // ISO date string
  firstLogin: string; // ISO date string
  loginCount: number;
}

export interface UserLoginRecord {
  uid: string;
  timestamp: string; // ISO date string
  device?: string;
  browser?: string;
  ip?: string;
}
