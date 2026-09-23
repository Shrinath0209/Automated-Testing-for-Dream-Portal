import { test, expect } from '@playwright/test';
import { DreamsDiaryPage } from '../src/pages/DreamsDiaryPage';

test.describe('Dreams Diary - Dream Log Table (dreams-diary.html)', () => {
  let diaryPage: DreamsDiaryPage;

  test.beforeEach(async ({ page }) => {
    diaryPage = new DreamsDiaryPage(page);
    await diaryPage.open();
  });

  test('should display table headers correctly', async () => {
    const headers = await diaryPage.getHeaderTexts();
    expect(headers).toEqual(['Dream Name', 'Days Ago', 'Dream Type']);
  });

  test('should contain exactly 10 dream entries', async () => {
    const rowCount = await diaryPage.getRowCount();
    expect(rowCount).toBe(10);
  });

  test('should strictly categorize dream types as only "Good" or "Bad"', async () => {
    const types = await diaryPage.getDreamTypes();
    expect(types).toHaveLength(10);

    for (const [index, type] of types.entries()) {
      expect(
        ['Good', 'Bad'],
        `Row ${index + 1} has invalid Dream Type: "${type}"`
      ).toContain(type);
    }
  });

  test('should ensure each row has all three columns filled with non-empty data', async () => {
    const entries = await diaryPage.getDreamEntries();
    expect(entries).toHaveLength(10);

    entries.forEach((entry, index) => {
      expect(entry.name, `Row ${index + 1}: "Dream Name" is empty`).toBeTruthy();
      expect(entry.name.length, `Row ${index + 1}: "Dream Name" too short`).toBeGreaterThan(1);

      expect(entry.daysAgo, `Row ${index + 1}: "Days Ago" is empty`).toBeTruthy();
      expect(entry.daysAgo, `Row ${index + 1}: "Days Ago" format invalid`).toMatch(
        /^\d+\s+days?\s+ago$/i
      );

      expect(entry.type, `Row ${index + 1}: "Dream Type" is empty`).toBeTruthy();
    });
  });
});
