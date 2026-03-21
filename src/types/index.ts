// src/types/index.ts
// ============================================================
// Shared TypeScript types for all Firestore collections
// ============================================================

import { Timestamp } from 'firebase/firestore';

// ─── Job Notifications ───────────────────────────────────────
export interface JobNotification {
  id?: string;
  title: string;
  company: string;
  category: string;
  description: string;
  eligibility: string;
  applyLink: string;
  imageUrl?: string;
  videoLink?: string;          // YouTube URL
  adminBy: string;             // Author name
  status: 'published' | 'draft';
  pushNotification: boolean;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

// ─── Mock Tests ──────────────────────────────────────────────
export interface MockTest {
  id?: string;
  title: string;
  category: string;
  totalQuestions: number;
  timerMinutes: number;
  negativeMarking: number;     // e.g. 0.25 for -0.25 per wrong answer
  price: number;               // 0 = free
  status: 'published' | 'draft';
  adminBy: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface MockTestQuestion {
  id?: string;
  testId: string;
  questionText: string;
  imageUrl?: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  order: number;
}

// ─── Study Materials ─────────────────────────────────────────
export interface StudyMaterial {
  id?: string;
  title: string;
  category: string;
  description: string;
  fileUrl: string;             // Firebase Storage PDF URL
  previewPages: number;        // How many pages to show as preview
  price: number;               // 0 = free
  status: 'published' | 'draft';
  adminBy: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

// ─── Articles / Education Info / Current Affairs ─────────────
export interface ArticlePost {
  id?: string;
  title: string;
  content: string;             // Rich HTML content from Quill
  imageUrl?: string;
  category: string;            // 'education' | 'current-affairs' | custom
  adminBy: string;
  status: 'published' | 'draft';
  publishedDate?: string;      // ISO date string, used for current affairs
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

// ─── Purchases ───────────────────────────────────────────────
export interface Purchase {
  id?: string;
  userId: string;
  userEmail: string;
  itemId: string;
  itemType: 'mockTest' | 'studyMaterial';
  itemTitle: string;
  amount: number;              // in INR
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  status: 'created' | 'paid' | 'failed';
  createdAt: Timestamp | Date;
}

// ─── UI Helpers ──────────────────────────────────────────────
export type Category =
  | 'Government Jobs'
  | 'Banking'
  | 'Railway'
  | 'Defence'
  | 'Teaching'
  | 'Engineering'
  | 'Medical'
  | 'State PSC'
  | 'SSC'
  | 'UPSC'
  | 'Current Affairs'
  | 'General Knowledge'
  | 'Mathematics'
  | 'English'
  | 'Science'
  | 'Other';

export const CATEGORIES: Category[] = [
  'Government Jobs', 'Banking', 'Railway', 'Defence', 'Teaching',
  'Engineering', 'Medical', 'State PSC', 'SSC', 'UPSC',
  'Current Affairs', 'General Knowledge', 'Mathematics', 'English', 'Science', 'Other',
];
