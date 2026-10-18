export type Brand = 'actuary' | 'mathmentor';

export type SubjectCode =
  | 'CM1'
  | 'CM2'
  | 'CS1'
  | 'CS2'
  | 'CB1'
  | 'CB2'
  | 'SP7'
  | 'SP8'
  | 'CP1'
  | 'CP2';

export interface StudyNote {
  id: string;
  title: string;
  topic: string;
  content: string;
  isPremium: boolean;
}

export interface PracticeQuestion {
  id: string;
  topic: string;
  question: string;
  solution: string;
  isPremium: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface VideoModule {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
}

export interface ActuarialSubject {
  code: SubjectCode;
  name: string;
  category: string;
  description: string;
  coursePriceGBP: number;
  stripePaymentLink?: string;
  notes: StudyNote[];
  questions: PracticeQuestion[];
  quiz: QuizQuestion[];
  videos: VideoModule[];
}

export interface MathWorksheet {
  id: string;
  title: string;
  level: 'GCSE' | 'A-Level';
  examBoard: 'Edexcel' | 'AQA' | 'OCR' | 'All Boards';
  topic: string;
  priceGBP: number;
  stripePaymentLink?: string;
  samplePreview: string;
  pdfDataUrl: string;
  fileName: string;
}

export interface BlogPost {
  id: string;
  brand: Brand;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
}

export interface CartItem {
  id: string;
  type: 'course' | 'worksheet';
  title: string;
  priceGBP: number;
  stripePaymentLink?: string;
}

export interface OrderRecord {
  id: string;
  userEmail: string;
  items: CartItem[];
  totalGBP: number;
  date: string;
}

export interface StudentProfile {
  email: string;
  name: string;
  isAdmin: boolean;
  purchasedCourses: SubjectCode[];
  purchasedWorksheets: string[];
  completedNotes: string[];
  quizScores: Record<string, { score: number; total: number; date: string }>;
  orders: OrderRecord[];
}

export interface CatalogData {
  subjects: Record<SubjectCode, ActuarialSubject>;
  worksheets: MathWorksheet[];
  blogs: BlogPost[];
}