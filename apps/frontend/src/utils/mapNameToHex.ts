import ntc from 'ntcjs';

/**
 * Common color aliases for better matching
 */
const commonAliases: Record<string, string> = {
  'ice grey': '#D3D3D3',
  grey: '#c4b0b7',
  'washed grey': '#51515f',
  paramount: '#51515f',
  'dark grey': '#413a48',
  'midnight blue': '#191970',
  'off-white': '#FAF9F6',
  'off white': '#FAF9F6',
  green: '#327064',
  'jade green': '#00BB77',
  café: '#855b5b',
  burgundy: '#660033',
  oily: '#888e77',
};

/**
 * Compute Levenshtein distance between two strings
 */
function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[a.length][b.length];
}

/**
 * Maps a color name to its hex value
 * Uses multiple strategies: exact match, common aliases, substring match, and fuzzy matching
 */
export function mapNameToHex(name: string): string | null {
  if (!name) return null;
  const lowerName = name.toLowerCase();

  // 0. Check common mistakes first
  if (commonAliases[lowerName]) {
    return commonAliases[lowerName];
  }

  // 1. Exact match
  for (const [hex, ntcName] of ntc.names) {
    if (ntcName.toLowerCase() === lowerName) {
      return `#${hex}`;
    }
  }

  // 2. Substring match
  for (const [hex, ntcName] of ntc.names) {
    if (ntcName.toLowerCase().includes(lowerName)) {
      return `#${hex}`;
    }
  }

  // 3. Fallback: closest match using Levenshtein distance
  let closest: [string, string, number] | null = null; // [hex, ntcName, distance]
  for (const [hex, ntcName] of ntc.names) {
    const distance = levenshtein(lowerName, ntcName.toLowerCase());
    if (closest === null || distance < closest[2]) {
      closest = [hex, ntcName, distance];
    }
  }

  if (closest) {
    console.log(
      `No exact match for "${name}". Closest match is "${closest[1]}" with distance ${closest[2]}.`
    );
  }

  return closest ? `#${closest[0]}` : null;
}
