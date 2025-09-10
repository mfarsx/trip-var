/**
 * Constants used across multiple pages for consistency and maintainability
 */

// Layout constants
export const LAYOUT_CONSTANTS = {
  BACKGROUND_COLOR: "bg-[#1a1f2d]",
  PAGE_PADDING: "pt-20 pb-8",
  CONTAINER_MAX_WIDTH: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  CONTAINER_MAX_WIDTH_SMALL: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8",
  CONTAINER_MAX_WIDTH_MEDIUM: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8",
};

// Animation constants
export const ANIMATION_CONSTANTS = {
  PAGE_TRANSITION_DURATION: 0.8,
  FORM_SCALE_DURATION: 0.5,
  IMAGE_SLIDE_DURATION: 1,
  SLIDE_INTERVAL: 5000,
};

// Background image arrays
export const BACKGROUND_IMAGES = {
  LOGIN: [
    "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba",
    "https://images.unsplash.com/photo-1682687221323-6ce2dbc803ab",
    "https://images.unsplash.com/photo-1682687220063-4742bd7fd538",
  ],
  REGISTER: [
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1",
    "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd",
  ],
};

// Form constants
export const FORM_CONSTANTS = {
  MIN_AGE: 20,
  MAX_COMPARE_DESTINATIONS: 3,
  DEFAULT_GUESTS: "1 Guest",
};

// Status constants
export const STATUS_CONSTANTS = {
  BOOKING_STATUSES: {
    CONFIRMED: "confirmed",
    CANCELLED: "cancelled",
    COMPLETED: "completed",
    NO_SHOW: "no-show",
  },
  PAYMENT_STATUSES: {
    PENDING: "pending",
    COMPLETED: "completed",
    FAILED: "failed",
    REFUNDED: "refunded",
  },
};

// Sort options
export const SORT_OPTIONS = {
  BOOKINGS: {
    NEWEST: "newest",
    OLDEST: "oldest",
    CHECKIN: "checkin",
    AMOUNT: "amount",
    STATUS: "status",
  },
  DESTINATIONS: {
    FEATURED: "featured",
    PRICE_LOW: "price-low",
    PRICE_HIGH: "price-high",
    RATING: "rating",
    POPULARITY: "popularity",
  },
};

// Filter options
export const FILTER_OPTIONS = {
  DESTINATIONS: {
    ALL: "all",
    POPULAR: "popular",
    ADVENTURE: "adventure",
    RELAXATION: "relaxation",
    CULTURE: "culture",
  },
};

// UI constants
export const UI_CONSTANTS = {
  GRADIENT_COLORS: {
    PRIMARY: "from-purple-400 to-pink-400",
    SECONDARY: "from-purple-500 to-pink-500",
    HOVER: "from-purple-600 to-pink-600",
    TEXT_PRIMARY: "from-purple-200 to-pink-100",
  },
  BORDER_COLORS: {
    DEFAULT: "border-gray-700/30",
    HOVER: "border-purple-500/50",
    ERROR: "border-red-500/20",
  },
  BACKGROUND_COLORS: {
    CARD: "bg-gray-800/60",
    INPUT: "bg-gray-800/50",
    OVERLAY: "bg-gray-800/30",
  },
};

// Country list for nationality selection
export const COUNTRIES = [
  { name: "Afghanistan", code: "AF" },
  { name: "Albania", code: "AL" },
  { name: "Algeria", code: "DZ" },
  { name: "Andorra", code: "AD" },
  { name: "Angola", code: "AO" },
  { name: "Argentina", code: "AR" },
  { name: "Australia", code: "AU" },
  { name: "Austria", code: "AT" },
  { name: "Azerbaijan", code: "AZ" },
  { name: "Bahamas", code: "BS" },
  { name: "Bahrain", code: "BH" },
  { name: "Bangladesh", code: "BD" },
  { name: "Belgium", code: "BE" },
  { name: "Brazil", code: "BR" },
  { name: "Canada", code: "CA" },
  { name: "China", code: "CN" },
  { name: "Denmark", code: "DK" },
  { name: "Egypt", code: "EG" },
  { name: "Finland", code: "FI" },
  { name: "France", code: "FR" },
  { name: "Germany", code: "DE" },
  { name: "Greece", code: "GR" },
  { name: "Hong Kong", code: "HK" },
  { name: "Iceland", code: "IS" },
  { name: "India", code: "IN" },
  { name: "Indonesia", code: "ID" },
  { name: "Iran", code: "IR" },
  { name: "Iraq", code: "IQ" },
  { name: "Ireland", code: "IE" },
  { name: "Israel", code: "IL" },
  { name: "Italy", code: "IT" },
  { name: "Japan", code: "JP" },
  { name: "Kazakhstan", code: "KZ" },
  { name: "Kenya", code: "KE" },
  { name: "Kuwait", code: "KW" },
  { name: "Malaysia", code: "MY" },
  { name: "Mexico", code: "MX" },
  { name: "Netherlands", code: "NL" },
  { name: "New Zealand", code: "NZ" },
  { name: "Norway", code: "NO" },
  { name: "Pakistan", code: "PK" },
  { name: "Philippines", code: "PH" },
  { name: "Poland", code: "PL" },
  { name: "Portugal", code: "PT" },
  { name: "Qatar", code: "QA" },
  { name: "Russia", code: "RU" },
  { name: "Saudi Arabia", code: "SA" },
  { name: "Singapore", code: "SG" },
  { name: "South Africa", code: "ZA" },
  { name: "South Korea", code: "KR" },
  { name: "Spain", code: "ES" },
  { name: "Sweden", code: "SE" },
  { name: "Switzerland", code: "CH" },
  { name: "Taiwan", code: "TW" },
  { name: "Thailand", code: "TH" },
  { name: "Turkey", code: "TR" },
  { name: "Ukraine", code: "UA" },
  { name: "United Arab Emirates", code: "AE" },
  { name: "United Kingdom", code: "GB" },
  { name: "United States", code: "US" },
  { name: "Vietnam", code: "VN" },
].sort((a, b) => a.name.localeCompare(b.name));
