import { prisma } from '../prisma/prisma.js';

let configCache = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache TTL

/**
 * Loads all system settings into memory cache
 */
export const loadConfigCache = async (forceRefresh = false) => {
  const now = Date.now();
  if (configCache && !forceRefresh && now - lastFetchTime < CACHE_TTL_MS) {
    return configCache;
  }

  try {
    const settings = await prisma.systemSetting.findMany({});
    const map = {};
    settings.forEach((s) => {
      map[s.key] = s.value;
    });

    configCache = map;
    lastFetchTime = now;
    return configCache;
  } catch (error) {
    console.error('Failed to load system config cache:', error);
    return configCache || {};
  }
};

/**
 * Reads a dynamic system setting value with fallback default
 */
export const getSetting = async (key, defaultValue) => {
  const cache = await loadConfigCache();
  if (cache[key] !== undefined && cache[key] !== null) {
    const val = cache[key];
    // Auto type parsing for numbers & booleans
    if (val === 'true') return true;
    if (val === 'false') return false;
    if (!isNaN(val) && val.trim() !== '' && !val.includes('-') && !val.includes('/')) {
      return parseFloat(val);
    }
    return val;
  }
  return defaultValue;
};

/**
 * Invalidates the configuration cache when settings are updated in UI
 */
export const invalidateConfigCache = () => {
  configCache = null;
  lastFetchTime = 0;
};
