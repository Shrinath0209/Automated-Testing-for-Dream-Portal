import { Page, Locator } from '@playwright/test';
import { logger } from '../utils/logger';

export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateTo(path: string, maxAttempts = 3): Promise<void> {
    const cleanPath = path.replace(/^\/+/, '');
    logger.info(`Navigating to: ${cleanPath}`);
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.page.goto(cleanPath, { waitUntil: 'domcontentloaded' });
        return;
      } catch (err) {
        if (attempt === maxAttempts) throw err;
        logger.warn(`Navigation attempt ${attempt} failed: ${(err as Error).message}. Retrying...`);
        await this.page.waitForTimeout(1000);
      }
    }
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async getUrl(): Promise<string> {
    return this.page.url();
  }

  async captureScreenshot(name: string): Promise<Buffer> {
    const screenshot = await this.page.screenshot({ fullPage: true });
    logger.debug(`Captured screenshot: ${name}`);
    return screenshot;
  }

  async waitForElementVisible(locator: Locator, timeoutMs = 10000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout: timeoutMs });
  }

  async waitForElementHidden(locator: Locator, timeoutMs = 10000): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout: timeoutMs });
  }
}
