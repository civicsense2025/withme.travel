// src/utils/emojiUtils.ts

// Simple mapping for country names to flag emojis
// TODO: Use a more robust library or data source for comprehensive coverage
const countryToFlag: Record<string, string> = {
  'United States': '🇺🇸',
  Japan: '🇯🇵',
  France: '🇫🇷',
  Italy: '🇮🇹',
  Spain: '🇪🇸',
  'United Kingdom': '🇬🇧',
  Germany: '🇩🇪',
  Australia: '🇦🇺',
  Canada: '🇨🇦',
  China: '🇨🇳',
  India: '🇮🇳',
  Brazil: '🇧🇷',
  Mexico: '🇲🇽',
  'South Korea': '🇰🇷',
  Thailand: '🇹🇭',
  Greece: '🇬🇷',
  Egypt: '🇪🇬',
  Singapore: '🇸🇬',
  Indonesia: '🇮🇩',
  'New Zealand': '🇳🇿',
  Portugal: '🇵🇹',
  Netherlands: '🇳🇱',
  Switzerland: '🇨🇭',
  Sweden: '🇸🇪',
  Norway: '🇳🇴',
  Denmark: '🇩🇰',
  Finland: '🇫🇮',
  Ireland: '🇮🇪',
  Austria: '🇦🇹',
  Turkey: '🇹🇷',
  Russia: '🇷🇺',
  'South Africa': '🇿🇦',
  Argentina: '🇦🇷',
  Chile: '🇨🇱',
  Peru: '🇵🇪',
  Colombia: '🇨🇴',
  Morocco: '🇲🇦',
  Kenya: '🇰🇪',
  Israel: '🇮🇱',
  UAE: '🇦🇪',
  Vietnam: '🇻🇳',
  Malaysia: '🇲🇾',
  Philippines: '🇵🇭',
  Croatia: '🇭🇷',
  'Czech Republic': '🇨🇿',
};

/**
 * Returns a flag emoji for a given country name.
 * Falls back to a generic flag if the country is not found.
 * @param country - The name of the country.
 * @returns A string containing the flag emoji.
 */
export const getCountryFlag = (country: string): string => {
  return countryToFlag[country] || '🏳️';
};

// Map continents to emojis
const CONTINENT_EMOJIS: Record<string, string> = {
  africa: '🌍',
  antarctica: '🧊',
  asia: '🌏',
  australia: '🦘',
  europe: '🏰',
  'north america': '🗽',
  'south america': '🌴',
  oceania: '🏝️',
};

/**
 * Returns an emoji representing the continent.
 * Falls back to a globe emoji if the continent is null or not found.
 * @param continent - The name of the continent (case-insensitive).
 * @returns A string containing the continent emoji.
 */
export const getContinentEmoji = (continent: string | null): string => {
  if (!continent) return '🌎';

  const normalized = continent.toLowerCase();
  return CONTINENT_EMOJIS[normalized] || '🌎';
};
