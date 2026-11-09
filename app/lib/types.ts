export type Localized = {
  fa?: string | null;
  en?: string | null;
  [locale: string]: string | null | undefined;
};
export type SourceRef = { sourceId: string; locator: string; quote?: string };
export type LessonSummary = {
  id: string;
  title: string;
  english: string;
  category: string;
  description: string;
  documents: number;
  sessionIds: string[];
  formula?: string;
  accent?: string;
};
export type SessionSummary = {
  id: string;
  title: string;
  english: string;
  lessonIds: string[];
  documents: number;
  order: number;
};
export type AppModel = {
  lessons: LessonSummary[];
  sessions: SessionSummary[];
  stats: {
    vocabulary: number;
    sessions: number;
    concepts: number;
    messages: number;
  };
  subjects: { id: string; title: string }[];
  tutorAvailable: boolean;
};
export type StudyDocument = {
  id: string;
  title: string;
  role: string;
  blocks: { id: string; text: string; type: string }[];
  sourceRefs: SourceRef[];
};
export type Practice = {
  id: string;
  prompt: string;
  options: string[];
  answers: { number: number; text: string }[];
  explanation: Localized;
};
export type LessonDetail = {
  summary: LessonSummary;
  documents: StudyDocument[];
  related: LessonSummary[];
  practices: Practice[];
};
export type WordEntry = {
  id: string;
  word: string;
  familyId: string | null;
  senses: {
    id: string;
    partOfSpeech: string;
    translation: Localized;
    definition: Localized;
    equivalents: string[];
    examples: { data: { text: string } }[];
  }[];
};
export type Sticky = {
  id: string;
  text: string;
  color: "yellow" | "pink" | "blue";
  lessonId: string | null;
  createdAt: string;
};
export type ReviewRecord = { due: string; correct: number; attempts: number };
export type PersonalState = {
  version: 1;
  completed: string[];
  bookmarks: string[];
  stickies: Sticky[];
  reviews: Record<string, ReviewRecord>;
  lastLesson: string | null;
  theme: "paper" | "ink";
};
