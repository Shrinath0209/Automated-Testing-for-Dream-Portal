import { test, expect } from '@playwright/test';
import { DreamsDiaryPage } from '../src/pages/DreamsDiaryPage';
import { AIClassifierService } from '../src/services/aiClassifier.service';
import { logger } from '../src/utils/logger';

test.describe('AI Dream Content Classification (Part 2 - Bonus)', () => {
  let aiService: AIClassifierService;

  test.beforeAll(() => {
    aiService = new AIClassifierService();
  });

  test('should classify canonical example "Monster chase" as Bad', async () => {
    const result = await aiService.classifyDream('Monster chase');
    logger.info(`AI Classification for "Monster chase":`, result);

    expect(result.predictedType).toBe('Bad');
  });

  test('should classify canonical example "Flying over mountains" as Good', async () => {
    const result = await aiService.classifyDream('Flying over mountains');
    logger.info(`AI Classification for "Flying over mountains":`, result);

    expect(result.predictedType).toBe('Good');
  });

  test('should retrieve dream names from diary table and validate AI classification matches table type', async ({
    page,
  }) => {
    const diaryPage = new DreamsDiaryPage(page);
    await diaryPage.open();

    const entries = await diaryPage.getDreamEntries();
    expect(entries.length).toBeGreaterThan(0);

    const classificationSummary: Array<{
      dreamName: string;
      tableType: string;
      aiType: string;
      source: string;
      match: boolean;
    }> = [];

    for (const entry of entries) {
      const classification = await aiService.classifyDream(entry.name);
      const isMatch = classification.predictedType === entry.type;

      classificationSummary.push({
        dreamName: entry.name,
        tableType: entry.type,
        aiType: classification.predictedType,
        source: classification.source,
        match: isMatch,
      });

      expect(
        classification.predictedType,
        `AI classified "${entry.name}" as "${classification.predictedType}", but table expected "${entry.type}"`
      ).toBe(entry.type);
    }

    logger.info('Completed AI validation across all diary entries:');
    console.table(classificationSummary);
  });
});
