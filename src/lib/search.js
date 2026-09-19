export const initialFilters = {
  gender: '', biodataNumber: '', ageMin: '', ageMax: '', heightMin: '', heightMax: '',
  maritalStatus: '', division: '', district: '', education: '', profession: '',
  income: '', complexion: '', madhab: '', praysFiveTimes: false, familyReligiousness: '',
};

export function normalizeFilters(filters) {
  return Object.fromEntries(Object.entries(initialFilters).map(([key, fallback]) => [
    key, typeof filters[key] === 'string' ? filters[key].trim() : (filters[key] ?? fallback),
  ]));
}

export function validateFilters(filters) {
  for (const [prefix, label, min, max] of [['age', 'বয়স', 18, 100], ['height', 'উচ্চতা', 100, 250]]) {
    const lower = filters[`${prefix}Min`];
    const upper = filters[`${prefix}Max`];
    if ([lower, upper].some(value => value !== '' && (!Number.isFinite(Number(value)) || Number(value) < min || Number(value) > max || (prefix === 'age' && !Number.isInteger(Number(value)))))) {
      return `${label} ${min} থেকে ${max}${prefix === 'age' ? ' বছর' : ' সেমি'} এর মধ্যে দিন।`;
    }
    if (lower !== '' && upper !== '' && Number(lower) > Number(upper)) {
      return `সর্বনিম্ন ${label} সর্বোচ্চ ${label} থেকে বেশি হতে পারবে না।`;
    }
  }
  return '';
}

export function searchParams(filters, page) {
  return { page, limit: 12, ...Object.fromEntries(Object.entries(normalizeFilters(filters)).filter(([, value]) => value !== '' && value !== false)) };
}

export function mergeProfiles(existing, incoming) {
  return [...new Map([...existing, ...incoming].map(profile => [profile._id, profile])).values()];
}
