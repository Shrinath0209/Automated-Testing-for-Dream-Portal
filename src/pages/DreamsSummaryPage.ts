import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { DreamSummaryStats } from '../models/dream.model';
import { logger } from '../utils/logger';

export class DreamsSummaryPage extends BasePage {
  readonly pageTitle: Locator;
  readonly table: Locator;
  readonly tableHeaders: Locator;
  readonly tableRows: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('h1');
    this.table = page.locator('#dreamsTotal');
    this.tableHeaders = page.locator('#dreamsTotal thead th');
    this.tableRows = page.locator('#dreamsTotal tbody tr');
  }

  async open(): Promise<void> {
    await this.navigateTo('/dreams-total.html');
  }

  async getSummaryMap(): Promise<Map<string, number>> {
    await this.table.waitFor({ state: 'visible' });
    const count = await this.tableRows.count();
    const map = new Map<string, number>();

    for (let i = 0; i < count; i++) {
      const row = this.tableRows.nth(i);
      const cells = row.locator('td');
      const label = (await cells.nth(0).innerText()).trim();
      const valueText = (await cells.nth(1).innerText()).trim();
      const value = parseInt(valueText, 10);

      map.set(label, isNaN(value) ? 0 : value);
    }

    logger.debug('Summary metrics extracted:', Object.fromEntries(map));
    return map;
  }

  async getParsedStats(): Promise<DreamSummaryStats> {
    const map = await this.getSummaryMap();

    return {
      goodDreams: map.get('Good Dreams') ?? 0,
      badDreams: map.get('Bad Dreams') ?? 0,
      totalDreams: map.get('Total Dreams') ?? 0,
      dreamsThisWeek: map.get('Dreams This Week'),
      recurringDreams: map.get('Recurring Dreams') ?? 0,
    };
  }

  async getStatValue(label: string): Promise<number> {
    const map = await this.getSummaryMap();
    const value = map.get(label);
    if (value === undefined) {
      throw new Error(`Metric label "${label}" was not found in dreamsTotal table`);
    }
    return value;
  }
}
