import { normalizeDataset } from './normalizer';

let _all = null;

async function loadFile(path, year = null, round = null) {
  const res = await fetch(path);
  const data = await res.json();
  return normalizeDataset(data, year, round);
}

export async function getAllData() {
  if (_all) return _all;

  const files = [
    ['/data/2016.json'],
    ['/data/2017.json'],
    ['/data/2018.json'],
    ['/data/2019.json'],
    ['/data/2020.json'],
    ['/data/2021.json'],
    ['/data/2022.json'],
    ['/data/2023-round1.json', 2023, 1],
    ['/data/2023-round2.json', 2023, 2],
    ['/data/2023-round3.json', 2023, 3],
    ['/data/2023-round4.json', 2023, 4],
    ['/data/2023-round5.json', 2023, 5],
    ['/data/2023-round6.json', 2023, 6],
    ['/data/2024-round1.json', 2024, 1],
    ['/data/2024-round2.json', 2024, 2],
    ['/data/2024-round3.json', 2024, 3],
    ['/data/2024-round4.json', 2024, 4],
    ['/data/2024-round5.json', 2024, 5],
    ['/data/2024-round6.json', 2024, 6],
  ];

  const results = await Promise.all(files.map(([path, y, r]) => loadFile(path, y, r)));
  _all = results.flat();

  console.log(`[JoSAA] Total normalized records: ${_all.length}`);
  return _all;
}

export async function getLatestRoundData(year = 2024) {
  const all = (await getAllData()).filter(d => d.year === year);
  const map = new Map();
  all.forEach(d => {
    const key = `${d.institute}||${d.program}||${d.category}||${d.gender}`;
    const existing = map.get(key);
    if (
      !existing ||
      d.round > existing.round ||
      (d.round === existing.round && (d.closingRank || 0) > (existing.closingRank || 0))
    ) {
      map.set(key, d);
    }
  });
  return [...map.values()];
}

export async function getTrendData(institute, program, category = 'OPEN', gender = 'Gender-Neutral') {
  return (await getAllData())
    .filter(d =>
      d.institute === institute &&
      d.program === program &&
      d.category === category &&
      d.gender === gender
    )
    .sort((a, b) => a.year !== b.year ? a.year - b.year : a.round - b.round);
}

export async function getYearlyTrend(institute, program, category = 'OPEN', gender = 'Gender-Neutral') {
  const raw = await getTrendData(institute, program, category, gender);
  const byYear = new Map();
  raw.forEach(d => {
    const existing = byYear.get(d.year);
    if (!existing || d.round > existing.round) byYear.set(d.year, d);
  });
  return [...byYear.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([year, d]) => ({ year, openingRank: d.openingRank, closingRank: d.closingRank, round: d.round }));
}

export async function getInstitutes() {
  return [...new Set((await getAllData()).map(d => d.institute))].sort();
}

export async function getProgramsForInstitute(institute) {
  return [...new Set(
    (await getAllData()).filter(d => d.institute === institute).map(d => d.program)
  )].sort();
}

export async function getLatestRoundDataWithHistory(year = 2024, historyYears = 5) {
  const all = await getAllData();
  const startYear = year - historyYears + 1;

  // Build lookup: key → { year → { closingRank, round } }
  const lookup = new Map();
  all.filter(d => d.year >= startYear && d.year <= year).forEach(d => {
    const key = `${d.institute}||${d.program}||${d.category}||${d.gender}`;
    if (!lookup.has(key)) lookup.set(key, {});
    const yearMap = lookup.get(key);
    if (
      !yearMap[d.year] ||
      d.round > yearMap[d.year].round ||
      (d.round === yearMap[d.year].round && (d.closingRank || 0) > (yearMap[d.year].closingRank || 0))
    ) {
      yearMap[d.year] = { closingRank: d.closingRank, round: d.round };
    }
  });

  const latest = await getLatestRoundData(year);

  return latest.map(item => {
    const key = `${item.institute}||${item.program}||${item.category}||${item.gender}`;
    const yearMap = lookup.get(key) || {};
    const historicalClosingRanks = [];
    for (let y = startYear; y <= year; y++) {
      if (yearMap[y]?.closingRank) historicalClosingRanks.push(yearMap[y].closingRank);
    }
    return { ...item, historicalClosingRanks };
  });
}