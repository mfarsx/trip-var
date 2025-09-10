/**
 * Date utility functions for consistent date handling across the application
 */

/**
 * Format date for input fields (YYYY-MM-DD format)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateForInput = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-CA"); // Returns YYYY-MM-DD format
};

/**
 * Format date for display (e.g., "Jan 15, 2024")
 * @param {Date|string} dateString - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Calculate age from birth date
 * @param {Date|string} birthDate - Birth date
 * @returns {number|null} Age in years or null if invalid date
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

/**
 * Check if age meets minimum requirement
 * @param {Date|string} birthDate - Birth date
 * @param {number} minAge - Minimum age requirement (default: 20)
 * @returns {boolean} True if age meets requirement
 */
export const isAgeValid = (birthDate, minAge = 20) => {
  const age = calculateAge(birthDate);
  return age >= minAge;
};

/**
 * Get maximum date for age restriction (e.g., 20 years ago)
 * @param {number} minAge - Minimum age requirement (default: 20)
 * @returns {string} Maximum date in YYYY-MM-DD format
 */
export const getMaxDate = (minAge = 20) => {
  const today = new Date();
  today.setFullYear(today.getFullYear() - minAge);
  return today.toISOString().split("T")[0];
};

/**
 * Format date range for display
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {string} Formatted date range
 */
export const formatDateRange = (startDate, endDate) => {
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  return `${start} - ${end}`;
};

/**
 * Calculate number of nights between two dates
 * @param {Date|string} checkIn - Check-in date
 * @param {Date|string} checkOut - Check-out date
 * @returns {number} Number of nights
 */
export const calculateNights = (checkIn, checkOut) => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

/**
 * Check if a date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isPastDate = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  today.setHours(0, 0, 0, 0);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

/**
 * Check if a date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  today.setHours(0, 0, 0, 0);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate.getTime() === today.getTime();
};
