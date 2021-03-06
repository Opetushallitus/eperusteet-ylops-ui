import { createLogger } from '@shared/utils/logger';

const logger = createLogger('LocalStorage');

export function removeItem(key: string) {
  logger.debug('Removing item', key);
  localStorage.removeItem(key);
}

export function setItem<T>(key: string, value: T) {
  logger.debug('Setting item', key, value);
  localStorage.setItem(key, JSON.stringify(value));
}

export function getItem<T>(key: string, def: T | null = null): T | null {
  const value = localStorage.getItem(key);
  if (value) {
    const parsed = JSON.parse(value);
    logger.debug('Getting item', key, parsed);
    return parsed;
  }
  else {
    return def;
  }
}
