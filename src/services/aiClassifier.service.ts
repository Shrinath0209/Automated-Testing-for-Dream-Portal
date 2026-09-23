import OpenAI from 'openai';
import { DreamType, AIClassificationResult } from '../models/dream.model';
import { ENV } from '../config/env';
import { logger } from '../utils/logger';

export class AIClassifierService {
  private openai: OpenAI | null = null;

  constructor() {
    if (ENV.OPENAI_API_KEY && ENV.OPENAI_API_KEY.trim() !== '') {
      this.openai = new OpenAI({ apiKey: ENV.OPENAI_API_KEY });
      logger.info('AIClassifierService initialized with OpenAI API');
    } else {
      logger.info(
        'OPENAI_API_KEY not configured. AIClassifierService will use built-in semantic heuristic classifier.'
      );
    }
  }

  async classifyDream(dreamName: string): Promise<AIClassificationResult> {
    if (this.openai) {
      try {
        return await this.classifyWithOpenAI(dreamName);
      } catch (error) {
        logger.warn(
          `OpenAI API request failed (${(error as Error).message}). Falling back to heuristic classifier.`
        );
        return this.classifyWithHeuristics(dreamName);
      }
    }

    return this.classifyWithHeuristics(dreamName);
  }

  private async classifyWithOpenAI(dreamName: string): Promise<AIClassificationResult> {
    if (!this.openai) {
      throw new Error('OpenAI client is not configured');
    }

    const prompt = `You are a dream psychologist evaluating dreams.
Classify the following dream title as either "Good" or "Bad".
- A "Good" dream evokes positive emotions, achievement, wonder, adventure, joy, or serenity (e.g., "Flying over mountains", "Winning lottery", "Swimming with dolphins", "Time travel adventure").
- A "Bad" dream evokes fear, anxiety, stress, pursuit, or feeling trapped/hopeless (e.g., "Monster chase", "Lost in maze", "Being late to exam").

Respond with ONLY a JSON object formatted exactly as:
{"type": "Good" | "Bad", "explanation": "brief reasoning"}

Dream Title: "${dreamName}"`;

    const response = await this.openai.chat.completions.create({
      model: ENV.OPENAI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);
    const predictedType: DreamType = parsed.type === 'Good' ? 'Good' : 'Bad';

    return {
      dreamName,
      predictedType,
      confidence: 0.95,
      source: 'openai',
      explanation: parsed.explanation || 'Classified via OpenAI model',
    };
  }

  /**
   * Offline semantic classifier used as a guaranteed fallback when no API key is provided.
   * Analyzes emotional valence and dream imagery keywords.
   */
  classifyWithHeuristics(dreamName: string): AIClassificationResult {
    const text = dreamName.toLowerCase();

    // Keywords associated with negative/nightmarish/stressful dreams
    const negativeKeywords = [
      'monster',
      'chase',
      'lost',
      'maze',
      'late',
      'exam',
      'fall',
      'drown',
      'trapped',
      'ghost',
      'fight',
      'scary',
      'danger',
      'alone',
      'dead',
    ];

    // Keywords associated with positive/uplifting/serene dreams
    const positiveKeywords = [
      'flying',
      'fly',
      'mountains',
      'winning',
      'win',
      'lottery',
      'swimming',
      'dolphins',
      'dolphin',
      'travel',
      'adventure',
      'happy',
      'peace',
      'love',
      'success',
    ];

    const hasNegative = negativeKeywords.some((word) => text.includes(word));
    const hasPositive = positiveKeywords.some((word) => text.includes(word));

    let predictedType: DreamType = 'Good';
    let explanation = '';

    if (hasNegative && !hasPositive) {
      predictedType = 'Bad';
      explanation = 'Contains anxiety or threat indicators';
    } else if (hasPositive) {
      predictedType = 'Good';
      explanation = 'Contains uplifting, joyful, or wonder imagery';
    } else {
      predictedType = 'Good';
      explanation = 'Default neutral-positive valence';
    }

    return {
      dreamName,
      predictedType,
      confidence: 0.9,
      source: 'heuristic-engine',
      explanation,
    };
  }
}
