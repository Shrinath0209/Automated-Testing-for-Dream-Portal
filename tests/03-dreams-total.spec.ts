import { test, expect } from '@playwright/test';
import { DreamsSummaryPage } from '../src/pages/DreamsSummaryPage';
import { DreamsDiaryPage } from '../src/pages/DreamsDiaryPage';
import { computeSummaryFromEntries, findRecurringDreams } from '../src/utils/dreamStatsCalculator';

test.describe('Dreams Summary - Statistics & Recurring Dreams (dreams-total.html)', () => {
  let summaryPage: DreamsSummaryPage;

  test.beforeEach(async ({ page }) => {
    summaryPage = new DreamsSummaryPage(page);
    await summaryPage.open();
  });

  test('should verify the correct stats displayed in summary table', async () => {
    const stats = await summaryPage.getParsedStats();

    expect(stats.goodDreams, 'Good Dreams count mismatch').toBe(6);
    expect(stats.badDreams, 'Bad Dreams count mismatch').toBe(4);
    expect(stats.totalDreams, 'Total Dreams count mismatch').toBe(10);
    expect(stats.recurringDreams, 'Recurring Dreams count mismatch').toBe(2);
  });

  test('should assert recurring dreams ("Flying over mountains" & "Lost in maze") derived from diary logic', async ({
    page,
  }) => {
    // Open diary page to extract raw entries
    const diaryPage = new DreamsDiaryPage(page);
    await diaryPage.open();
    const rawEntries = await diaryPage.getDreamEntries();

    // Calculate recurring dreams using diary data logic
    const recurringAnalysis = findRecurringDreams(rawEntries);
    const recurringNames = recurringAnalysis.map((r) => r.name);

    // Assert that exactly 2 distinct dreams are recurring
    expect(recurringAnalysis).toHaveLength(2);

    // Assert specific recurring dream names
    expect(recurringNames).toContain('Flying over mountains');
    expect(recurringNames).toContain('Lost in maze');

    // Assert specific occurrence counts (Flying over mountains: 3, Lost in maze: 2)
    const flyingEntry = recurringAnalysis.find((r) => r.name === 'Flying over mountains');
    const mazeEntry = recurringAnalysis.find((r) => r.name === 'Lost in maze');

    expect(flyingEntry?.count, 'Expected "Flying over mountains" to appear 3 times').toBe(3);
    expect(mazeEntry?.count, 'Expected "Lost in maze" to appear 2 times').toBe(2);

    // Switch back to summary page and verify the recurring metric matches the calculation
    await summaryPage.open();
    const displayedRecurring = await summaryPage.getStatValue('Recurring Dreams');
    expect(displayedRecurring).toBe(recurringAnalysis.length);
  });

  test('should cross-validate all summary metrics directly against calculated diary table data', async ({
    page,
  }) => {
    const diaryPage = new DreamsDiaryPage(page);
    await diaryPage.open();
    const diaryEntries = await diaryPage.getDreamEntries();

    // Compute expected summary from diary data
    const computedStats = computeSummaryFromEntries(diaryEntries);

    // Open summary page and fetch displayed values
    await summaryPage.open();
    const displayedStats = await summaryPage.getParsedStats();

    expect(displayedStats.totalDreams).toBe(computedStats.totalDreams);
    expect(displayedStats.goodDreams).toBe(computedStats.goodDreams);
    expect(displayedStats.badDreams).toBe(computedStats.badDreams);
    expect(displayedStats.recurringDreams).toBe(computedStats.recurringDreams);
  });
});
