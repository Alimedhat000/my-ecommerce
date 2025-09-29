import ntc from 'ntcjs';

export function mapNameToHex(name: string): string | null {
  if (!name) return null;

  const lowerName = name.toLowerCase();

  // First try exact match ignoring case
  for (const [hex, ntcName] of ntc.names) {
    if (ntcName.toLowerCase() === lowerName) {
      return `#${hex}`;
    }
  }

  // Next, try substring match
  for (const [hex, ntcName] of ntc.names) {
    if (ntcName.toLowerCase().includes(lowerName)) {
      return `#${hex}`;
    }
  }

  // Optional: fallback to closest using simple Levenshtein distance (requires a small helper)
  // For now, just return null
  return null;
}
