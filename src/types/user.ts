// User Rank enumeration 
export enum UserRank {
  ADMIN = 'admin',
  VIP = 'vip',
  NORMAL = 'normal'
}

// User interface definition
export interface User {
  id: string;
  email: string;
  name?: string;
  jackPoints: number;
  transactions: Transaction[];
  lastUpdated: number;
  hasReceivedInitialBonus: boolean;
  rank: UserRank;
  lastDailyBonus?: number;
}

// Define Transaction type
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  timestamp: number;
  type: string;
}

// Define Player interface
export interface Player {
  id: number;
  name: string;
  points: number;
  avatar: string;
}

// Define Tournament interface
export interface Tournament {
  id: number;
  name: string;
  date: string;
  prizePool: number;
  entryFee: number;
  participants: number;
  isVipOnly?: boolean;
}

// Social platform interface for rendering social media buttons
export interface SocialPlatform {
  id: number;
  name: string;
  icon: string;
  color: string;
  link: string;
}

// Define redemption code interface
export interface RedemptionCode {
  id: string;
  code: string;
  pointValue: number;
  isUsed: boolean;
  createdAt: number;
  usedAt?: number;
  usedBy?: string;
  description?: string;
}

// Type guard function to verify User type
export function isUser(obj: any): obj is User {
  return obj && typeof obj === 'object' 
    && 'id' in obj
    && 'email' in obj
    && 'jackPoints' in obj
    && 'transactions' in obj
    && 'lastUpdated' in obj
    && 'hasReceivedInitialBonus' in obj
    && 'rank' in obj;
} 