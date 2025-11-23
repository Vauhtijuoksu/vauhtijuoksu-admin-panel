import { DateTime } from 'luxon';

const FINNISH_FORMAT = "d.M.yyyy HH:mm:ss";

/**
 * Convert ISO timestamp to Finnish format
 */
export const formatTimestamp = (isoString) => {
  return DateTime.fromISO(isoString).toFormat(FINNISH_FORMAT);
};

/**
 * Convert Finnish format to ISO timestamp
 */
export const parseTimestamp = (finnishString) => {
  return DateTime.fromFormat(finnishString, FINNISH_FORMAT, { locale: "fi" }).toISO();
};

/**
 * Get current time in Finnish format
 */
export const nowFormatted = () => {
  return DateTime.now().toFormat(FINNISH_FORMAT);
};

/**
 * Parse timestamp and validate
 */
export const parseAndValidate = (finnishString) => {
  const iso = parseTimestamp(finnishString);
  if (iso === null || iso === undefined) {
    throw new Error(`Invalid timestamp: ${finnishString}`);
  }
  return iso;
};

