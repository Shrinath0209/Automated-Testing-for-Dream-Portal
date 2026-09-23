export type DreamType = 'Good' | 'Bad';

export interface DreamEntry {
  name: string;
  daysAgo: string;
  type: DreamType;
}

export interface DreamSummaryStats {
  goodDreams: number;
  badDreams: number;
  totalDreams: number;
  dreamsThisWeek?: number;
  recurringDreams: number;
}

export interface RecurringDreamAnalysis {
  name: string;
  count: number;
}

export interface AIClassificationResult {
  dreamName: string;
  predictedType: DreamType;
  confidence?: number;
  source: 'openai' | 'heuristic-engine';
  explanation?: string;
}
