export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  questions: QuizQuestion[];
}

export interface Snippet {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  body: string;
  quiz: Quiz;
  status: 'draft' | 'published';
  createdAt: string;
}

export interface VocabWord {
  id: string;
  word: string;
  meaning: string;
  example: string;
}

export interface DailyLongReadEntry {
  date: string;
  title: string;
  imageUrl: string;
  body: string;
  quiz: Quiz;
}

export interface RoadmapUnit {
  id: string;
  title: string;
  order: number;
  body: string;
  quiz: Quiz;
}

export const ROADMAP_CATEGORIES = [
  'Science & Nature',
  'Tech & AI',
  'Money & Finance',
  'Languages',
  'Health & Mind',
  'Life Skills',
] as const;

export type RoadmapCategory = typeof ROADMAP_CATEGORIES[number];

export interface Roadmap {
  id: string;
  title: string;
  category: RoadmapCategory;
  coverImage: string;
  description: string;
  units: RoadmapUnit[];
  status: 'draft' | 'published';
  createdAt: string;
}
