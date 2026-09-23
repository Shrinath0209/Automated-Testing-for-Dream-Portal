import { DreamEntry, DreamSummaryStats, RecurringDreamAnalysis } from '../models/dream.model';

export function calculateDreamFrequencies(entries: DreamEntry[]): Map<string, number> {
  const frequencies = new Map<string, number>();

  for (const entry of entries) {
    const trimmed = entry.name.trim();
    frequencies.set(trimmed, (frequencies.get(trimmed) || 0) + 1);
  }

  return frequencies;
}

export function findRecurringDreams(entries: DreamEntry[]): RecurringDreamAnalysis[] {
  const frequencies = calculateDreamFrequencies(entries);
  const recurring: RecurringDreamAnalysis[] = [];

  for (const [name, count] of frequencies.entries()) {
    if (count > 1) {
      recurring.push({ name, count });
    }
  }

  // Sort descending by occurrence count
  return recurring.sort((a, b) => b.count - a.count);
}

export function computeSummaryFromEntries(entries: DreamEntry[]): DreamSummaryStats {
  const goodDreams = entries.filter((e) => e.type === 'Good').length;
  const badDreams = entries.filter((e) => e.type === 'Bad').length;
  const recurring = findRecurringDreams(entries);

  return {
    goodDreams,
    badDreams,
    totalDreams: entries.length,
    recurringDreams: recurring.length,
  };
}
