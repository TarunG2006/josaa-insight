export function predictCategory(effectiveRank, closingRank) {
  if (!effectiveRank || !closingRank) return null;
  const ratio = parseInt(effectiveRank) / closingRank;
  if (ratio <= 0.80) return 'safe';
  if (ratio <= 1.05) return 'target';
  if (ratio <= 1.25) return 'dream';
  return 'out_of_reach';
}

export function getBadgeLabel(category) {
  const map = {
    safe: '✅ Safe',
    target: '🎯 Target',
    dream: '✨ Dream',
    out_of_reach: '❌ Out of Reach',
  };
  return map[category] || '';
}

export function getBadgeClass(category) {
  const map = {
    safe: 'badge-safe',
    target: 'badge-target',
    dream: 'badge-dream',
    out_of_reach: 'text-red-500 bg-red-50 rounded-full px-3 py-0.5 text-xs font-semibold',
  };
  return map[category] || '';
}

export function getAdmissionProbability(effectiveRank, closingRank, historicalClosingRanks = []) {
  if (!effectiveRank || !closingRank) return 0;
  const rank = parseInt(effectiveRank);

  if (historicalClosingRanks && historicalClosingRanks.length >= 3) {
    const ranks = historicalClosingRanks.filter(r => r != null && r > 0);
    const mean = ranks.reduce((a, b) => a + b, 0) / ranks.length;
    const stdDev = Math.sqrt(
      ranks.map(r => (r - mean) ** 2).reduce((a, b) => a + b, 0) / ranks.length
    ) || 1;

    // Trend from last 3 years: positive = cutoff relaxing, negative = tightening
    const recent = ranks.slice(-3);
    const trend = recent.length >= 2
      ? (recent[recent.length - 1] - recent[0]) / (recent.length - 1)
      : 0;

    // Predicted closing rank next year (half-weight trend)
    const predicted = closingRank + trend * 0.5;
    const margin = predicted - rank; // positive = user rank is better than cutoff

    if (margin >= 2 * stdDev) return 95;
    if (margin >= stdDev) return 85;
    if (margin >= stdDev * 0.5) return 72;
    if (margin >= 0) return 58;
    if (margin >= -stdDev * 0.3) return 35;
    if (margin >= -stdDev * 0.6) return 18;
    if (margin >= -stdDev) return 8;
    return 3;
  }

  // Fallback if no history
  const ratio = rank / closingRank;
  if (ratio <= 0.60) return 95;
  if (ratio <= 0.75) return 85;
  if (ratio <= 0.85) return 72;
  if (ratio <= 0.95) return 58;
  if (ratio <= 1.00) return 40;
  if (ratio <= 1.10) return 20;
  if (ratio <= 1.20) return 10;
  if (ratio <= 1.30) return 5;
  return 2;
}