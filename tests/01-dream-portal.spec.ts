import { test, expect } from '@playwright/test';
import { DreamPortalPage } from '../src/pages/DreamPortalPage';

test.describe('Dream Portal - Home Page (index.html)', () => {
  let portalPage: DreamPortalPage;

  test.beforeEach(async ({ page }) => {
    portalPage = new DreamPortalPage(page);
  });

  test('should display loading animation and hide it after approximately 3 seconds', async ({ page }) => {
    const startTime = Date.now();

    // Start navigation
    await portalPage.open();

    // Verify loading animation is initially present in the DOM
    await expect(portalPage.loadingAnimation).toBeAttached();

    // Wait for the loading animation to disappear
    await portalPage.waitForLoadingAnimationToDisappear(6000);
    const elapsedSeconds = (Date.now() - startTime) / 1000;

    // Validate that loading duration is around 3 seconds (allowing network & browser overhead: 2.5s - 5.0s)
    expect(elapsedSeconds).toBeGreaterThanOrEqual(2.5);
    await expect(portalPage.loadingAnimation).toHaveClass(/hidden/);
  });

  test('should display main content and "My Dreams" button once loading finishes', async () => {
    await portalPage.open();
    await portalPage.waitForLoadingAnimationToDisappear();

    // Verify main content is visible and animated with "show" class
    await portalPage.waitForMainContentVisible();
    await expect(portalPage.mainContent).toBeVisible();
    await expect(portalPage.portalTitle).toHaveText('Dream Portal');

    // Verify "My Dreams" button is visible and active
    await portalPage.waitForDreamButtonVisible();
    await expect(portalPage.dreamButton).toBeVisible();
    await expect(portalPage.dreamButton).toHaveText('My Dreams');
    await expect(portalPage.dreamButton).toBeEnabled();
  });

  test('should open dreams-diary.html and dreams-total.html in new tabs upon clicking "My Dreams"', async () => {
    await portalPage.open();
    await portalPage.waitForLoadingAnimationToDisappear();
    await portalPage.waitForDreamButtonVisible();

    const { diaryPage, summaryPage, rawPages } =
      await portalPage.clickMyDreamsAndCaptureTabs();

    // Verify two separate tabs were launched
    expect(rawPages).toHaveLength(2);

    // Verify URLs of the opened tabs
    const diaryUrl = await diaryPage.getUrl();
    const summaryUrl = await summaryPage.getUrl();

    expect(diaryUrl).toContain('dreams-diary.html');
    expect(summaryUrl).toContain('dreams-total.html');

    // Verify page titles
    await expect(diaryPage.page).toHaveTitle('Dreams Diary');
    await expect(summaryPage.page).toHaveTitle('Dreams Total');

    // Cleanup opened pages
    await diaryPage.page.close();
    await summaryPage.page.close();
  });
});
