/**
 * Filter JoSAA records based on user inputs and active filters.
 */
export function filterResults(data, { rank, categoryRank, category, gender, instituteType, branch, safeOnly }) {
  if (!data || data.length === 0) return [];

  // Compute effective rank once — use category rank for non-OPEN, non-PwD categories
  const crl = parseInt(rank) || 0;
  const catRank = parseInt(categoryRank) || 0;
  const effectiveRank =
    category && category !== 'OPEN' && !category.includes('PwD') && catRank > 0
      ? catRank
      : crl;

  return data.filter((row) => {
    // Category filter
    if (category && row.category !== category) return false;

    // Gender filter — allow Gender-Neutral rows for any gender preference
    if (gender && row.gender !== gender && row.gender !== 'Gender-Neutral') return false;

    // Institute type filter
    if (instituteType && instituteType !== 'ALL') {
      const name = row.institute?.toUpperCase() || '';
      if (instituteType === 'IIT' && !name.includes('INDIAN INSTITUTE OF TECHNOLOGY')) return false;
      if (instituteType === 'NIT' && !name.includes('NATIONAL INSTITUTE OF TECHNOLOGY')) return false;
      if (instituteType === 'IIIT' && !name.includes('INDIAN INSTITUTE OF INFORMATION')) return false;
      if (instituteType === 'GFTI' && (
        name.includes('INDIAN INSTITUTE OF TECHNOLOGY') ||
        name.includes('NATIONAL INSTITUTE OF TECHNOLOGY') ||
        name.includes('INDIAN INSTITUTE OF INFORMATION')
      )) return false;
    }

    // Branch filter
    if (branch && branch !== 'ALL') {
      if (!row.program?.toLowerCase().includes(branch.toLowerCase())) return false;
    }

    // Rank filter
    if (effectiveRank > 0) {
      if (safeOnly) {
        // Strict mode: only show programs where rank clearly clears the cutoff
        // effectiveRank must be <= closingRank (lower rank number = better)
        if (row.closingRank < effectiveRank) return false;
      } else {
        // Dream range: show up to 25% harder programs too
        if (row.closingRank < Math.round(effectiveRank * 0.75)) return false;
      }
    }

    return true;
  });
}

export function getUniqueValues(data, key) {
  return [...new Set(data.map((d) => d[key]).filter(Boolean))].sort();
}

export function getInstituteTypes(institutes) {
  const types = [];
  institutes.forEach((name) => {
    const upper = name.toUpperCase();
    if (upper.includes('INDIAN INSTITUTE OF TECHNOLOGY')) types.push('IIT');
    else if (upper.includes('NATIONAL INSTITUTE OF TECHNOLOGY')) types.push('NIT');
    else if (upper.includes('INDIAN INSTITUTE OF INFORMATION')) types.push('IIIT');
    else types.push('GFTI');
  });
  return types;
}

export function getInstituteType(name) {
  const upper = (name || '').toUpperCase();
  if (upper.includes('INDIAN INSTITUTE OF TECHNOLOGY')) return 'IIT';
  if (upper.includes('NATIONAL INSTITUTE OF TECHNOLOGY')) return 'NIT';
  if (upper.includes('INDIAN INSTITUTE OF INFORMATION')) return 'IIIT';
  return 'GFTI';
}