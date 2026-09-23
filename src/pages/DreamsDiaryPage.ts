import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { DreamEntry, DreamType, RecurringDreamAnalysis } from '../models/dream.model';
import { findRecurringDreams } from '../utils/dreamStatsCalculator';
import { logger } from '../utils/logger';

export class DreamsDiaryPage extends BasePage {
  readonly pageTitle: Locator;
  readonly table: Locator;
  readonly tableHeaders: Locator;
  readonly tableRows: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('h1');
    this.table = page.locator('#dreamsDiary');
    this.tableHeaders = page.locator('#dreamsDiary thead th');
    this.tableRows = page.locator('#dreamsDiary tbody tr');
  }

  async open(): Promise<void> {
    await this.navigateTo('/dreams-diary.html');
  }

  async getRowCount(): Promise<number> {
    await this.table.waitFor({ state: 'visible' });
    return this.tableRows.count();
  }

  async getHeaderTexts(): Promise<string[]> {
    await this.table.waitFor({ state: 'visible' });
    return this.tableHeaders.allInnerTexts();
  }

  async getDreamEntries(): Promise<DreamEntry[]> {
    await this.table.waitFor({ state: 'visible' });
    const count = await this.tableRows.count();
    const entries: DreamEntry[] = [];

    for (let i = 0; i < count; i++) {
      const row = this.tableRows.nth(i);
      const cells = row.locator('td');
      const name = (await cells.nth(0).innerText()).trim();
      const daysAgo = (await cells.nth(1).innerText()).trim();
      const type = (await cells.nth(2).innerText()).trim() as DreamType;

      entries.push({ name, daysAgo, type });
    }

    logger.debug(`Extracted ${entries.length} dream entries from diary table`);
    return entries;
  }

  async getDreamNames(): Promise<string[]> {
    const entries = await this.getDreamEntries();
    return entries.map((e) => e.name);
  }

  async getDreamTypes(): Promise<DreamType[]> {
    const entries = await this.getDreamEntries();
    return entries.map((e) => e.type);
  }

  async getRecurringDreams(): Promise<RecurringDreamAnalysis[]> {
    const entries = await this.getDreamEntries();
    return findRecurringDreams(entries);
  }
}
