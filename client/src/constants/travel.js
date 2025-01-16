export const INTERESTS = [
  'History',
  'Food',
  'Nature',
  'Art',
  'Shopping',
  'Adventure',
  'Culture',
  'Relaxation',
  'Nightlife',
  'Photography',
];

export const BUDGET_OPTIONS = [
  { value: 'budget', label: 'Budget' },
  { value: 'mid-range', label: 'Mid-Range' },
  { value: 'luxury', label: 'Luxury' },
];

export const ACCOMMODATION_TYPES = [
  { value: 'hotel', label: 'Hotel' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'resort', label: 'Resort' },
  { value: 'guesthouse', label: 'Guesthouse' },
];

export const TRAVEL_STYLES = [
  { value: 'relaxed', label: 'Relaxed' },
  { value: 'adventurous', label: 'Adventurous' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'budget', label: 'Budget' },
];

export const DEFAULT_PREFERENCES = {
  destination: '',
  start_date: new Date(),
  end_date: new Date(),
  budget: '',
  interests: [],
  accommodation_type: '',
  travel_style: '',
  num_travelers: 1,
};
