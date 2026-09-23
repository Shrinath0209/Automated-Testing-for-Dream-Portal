import { test, expect } from '@playwright/test';
import { DreamPortalPage } from '../src/pages/DreamPortalPage';
import { computeSummaryFromEntries } from '../src/utils/dreamStatsCalculator';
import { logger } from '../src/utils/logger';

test.describe('Dream Portal - End-to-End User Journey', () => {
  test('should execute full user journey from portal home to diary and summary validation', async ({
    page,
  }) => {
    logger.info('Starting End-to-End Dream Portal journey test');

    const portalPage = new DreamPortalPage(page);

    // Step 1: Navigate to Dream Portal
    await portalPage.open();

    // Step 2: Observe loading animation and wait for completion
    await portalPage.waitForLoadingAnimationToDisappear();
    await portalPage.waitForMainContentVisible();
    await portalPage.waitForDreamButtonVisible();

    // Step 3: Click "My Dreams" button and capture the two opened tabs
    const { diaryPage, summaryPage } = await portalPage.clickMyDreamsAndCaptureTabs();

    // Step 4: Validate Dreams Diary Tab
    await expect(diaryPage.page).toHaveTitle('Dreams Diary');
    const diaryEntries = await diaryPage.getDreamEntries();
    expect(diaryEntries).toHaveLength(10);
    logger.info(`Extracted ${diaryEntries.length} entries from Dreams Diary`);

    // Step 5: Validate Dreams Total Tab
    await expect(summaryPage.page).toHaveTitle('Dreams Total');
    const displayedStats = await summaryPage.getParsedStats();
    logger.info('Extracted summary metrics:', displayedStats);

    // Step 6: Cross-verify summary tab values against calculated diary records
    const computedStats = computeSummaryFromEntries(diaryEntries);
    expect(displayedStats.totalDreams).toBe(computedStats.totalDreams);
    expect(displayedStats.goodDreams).toBe(computedStats.goodDreams);
    expect(displayedStats.badDreams).toBe(computedStats.badDreams);
    expect(displayedStats.recurringDreams).toBe(computedStats.recurringDreams);

    logger.info('Full E2E user journey completed successfully');

    // Clean up child tabs
    await diaryPage.page.close();
    await summaryPage.page.close();
  });
});
