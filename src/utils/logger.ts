type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

const LOG_LEVELS: Record<LogLevel, number> = {
  DEBUG: 10,
  INFO: 20,
  WARN: 30,
  ERROR: 40,
};

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'INFO';

function formatTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= (LOG_LEVELS[currentLevel] || LOG_LEVELS.INFO);
}

export const logger = {
  info(message: string, context?: Record<string, unknown> | unknown): void {
    if (shouldLog('INFO')) {
      console.log(`[${formatTimestamp()}] [INFO]  ${message}`, context !== undefined ? context : '');
    }
  },

  debug(message: string, context?: Record<string, unknown> | unknown): void {
    if (shouldLog('DEBUG')) {
      console.log(`[${formatTimestamp()}] [DEBUG] ${message}`, context !== undefined ? context : '');
    }
  },

  warn(message: string, context?: Record<string, unknown> | unknown): void {
    if (shouldLog('WARN')) {
      console.warn(`[${formatTimestamp()}] [WARN]  ${message}`, context !== undefined ? context : '');
    }
  },

  error(message: string, context?: Record<string, unknown> | unknown): void {
    if (shouldLog('ERROR')) {
      console.error(`[${formatTimestamp()}] [ERROR] ${message}`, context !== undefined ? context : '');
    }
  },
};
