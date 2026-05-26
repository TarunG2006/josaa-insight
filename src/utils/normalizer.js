/**
 * Normalizes all dataset formats into unified schema:
 * {
 *   institute, program, quota, category, gender,
 *   openingRank, closingRank, year, round
 * }
 */

function parseRank(val) {
  if (val === null || val === undefined || val === '') return null;
  const s = String(val).replace(/P$/i, '').trim();
  const n = parseInt(s, 10);
  return isNaN(n) ? null : n;
}

function cleanInstituteName(name) {
  return (name || '').replace(/\s+/g, ' ').trim();
}

/**
 * Format 1: 2016–2022 — array of objects with named keys
 */
export function normalizeObjectFormat(records, defaultYear = null, defaultRound = null) {
  return records.map((r) => ({
    institute: cleanInstituteName(r['Institute']),
    program: (r['Academic Program Name'] || '').trim(),
    quota: (r['Quota'] || '').trim(),
    category: (r['Seat Type'] || '').trim(),
    gender: r['Gender'] === 'NA' ? 'Gender-Neutral' : (r['Gender'] || '').trim(),
    openingRank: parseRank(r['Opening Rank']),
    closingRank: parseRank(r['Closing Rank']),
    year: r['Year'] ? Number(r['Year']) : defaultYear,
    round: r['Round'] ? Number(r['Round']) : defaultRound,
  }));
}

/**
 * Format 2: 2023/2024 — array of arrays
 * Columns: [Institute, Program, Quota, SeatType, Gender, OpeningRank, ClosingRank]
 */
export function normalizeArrayFormat(records, year, round) {
  return records.map((r) => ({
    institute: cleanInstituteName(r[0]),
    program: (r[1] || '').trim(),
    quota: (r[2] || '').trim(),
    category: (r[3] || '').trim(),
    gender: (r[4] || '').trim(),
    openingRank: parseRank(r[5]),
    closingRank: parseRank(r[6]),
    year,
    round,
  }));
}

/**
 * Auto-detects format and normalizes.
 * Pass year and round for array-format files (2023/2024).
 */
export function normalizeDataset(raw, year = null, round = null) {
  if (!Array.isArray(raw) || raw.length === 0) return [];

  if (Array.isArray(raw[0])) {
    // Array-of-arrays format (2023/2024)
    return normalizeArrayFormat(raw, year, round);
  } else {
    // Object format (2016–2022)
    return normalizeObjectFormat(raw, year, round);
  }
}