import * as dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  BASE_URL: process.env.BASE_URL || 'https://arjitnigam.github.io/myDreams',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  LOG_LEVEL: process.env.LOG_LEVEL || 'INFO',
};
