import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { DreamsDiaryPage } from './DreamsDiaryPage';
import { DreamsSummaryPage } from './DreamsSummaryPage';
import { logger } from '../utils/logger';

export class DreamPortalPage extends BasePage {
  readonly loadingAnimation: Locator;
  readonly mainContent: Locator;
  readonly dreamButton: Locator;
  readonly portalTitle: Locator;
  readonly dreamStats: Locator;

  constructor(page: Page) {
    super(page);
    this.loadingAnimation = page.locator('#loadingAnimation');
    this.mainContent = page.locator('#mainContent');
    this.dreamButton = page.locator('#dreamButton');
    this.portalTitle = page.locator('#mainContent h1');
    this.dreamStats = page.locator('.dream-stats');
  }

  async open(): Promise<void> {
    await this.navigateTo('/index.html');
  }

  async isLoadingAnimationVisible(): Promise<boolean> {
    return this.loadingAnimation.isVisible();
  }

  async waitForLoadingAnimationToDisappear(timeoutMs = 7000): Promise<void> {
    logger.info('Waiting for portal loading animation to disappear (~3s)...');
    await this.loadingAnimation.waitFor({ state: 'hidden', timeout: timeoutMs });
  }

  async waitForMainContentVisible(timeoutMs = 5000): Promise<void> {
    await this.mainContent.waitFor({ state: 'visible', timeout: timeoutMs });
  }

  async waitForDreamButtonVisible(timeoutMs = 5000): Promise<void> {
    await this.dreamButton.waitFor({ state: 'visible', timeout: timeoutMs });
  }

  async isMainContentVisible(): Promise<boolean> {
    return this.mainContent.isVisible();
  }

  async isDreamButtonVisible(): Promise<boolean> {
    return this.dreamButton.isVisible();
  }

  async clickMyDreamsAndCaptureTabs(): Promise<{
    diaryPage: DreamsDiaryPage;
    summaryPage: DreamsSummaryPage;
    rawPages: Page[];
  }> {
    logger.info('Clicking "My Dreams" button and awaiting multi-tab dispatch...');
    const context = this.page.context();

    // Listen for both newly spawned tabs
    const targetPagesPromise = new Promise<Page[]>((resolve, reject) => {
      const openedPages: Page[] = [];
      const timeout = setTimeout(() => {
        context.off('page', handler);
        reject(
          new Error(
            `Timed out waiting for 2 popup pages. Received ${openedPages.length} pages.`
          )
        );
      }, 10000);

      const handler = (newPage: Page) => {
        openedPages.push(newPage);
        if (openedPages.length === 2) {
          clearTimeout(timeout);
          context.off('page', handler);
          resolve(openedPages);
        }
      };

      context.on('page', handler);
    });

    await this.dreamButton.click();
    const [page1, page2] = await targetPagesPromise;

    // Wait for both pages to reach DOMContentLoaded
    await Promise.all([
      page1.waitForLoadState('domcontentloaded'),
      page2.waitForLoadState('domcontentloaded'),
    ]);

    const url1 = page1.url();
    const url2 = page2.url();
    logger.info(`Opened tab 1: ${url1}`);
    logger.info(`Opened tab 2: ${url2}`);

    let diaryRawPage: Page;
    let summaryRawPage: Page;

    if (url1.includes('dreams-diary.html')) {
      diaryRawPage = page1;
      summaryRawPage = page2;
    } else {
      diaryRawPage = page2;
      summaryRawPage = page1;
    }

    return {
      diaryPage: new DreamsDiaryPage(diaryRawPage),
      summaryPage: new DreamsSummaryPage(summaryRawPage),
      rawPages: [page1, page2],
    };
  }
}
