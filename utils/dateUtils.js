// Date utility functions
const DateUtils = {
  /**
   * Get relative time string (e.g., "2 hours ago", "3 days ago")
   * @param {Date} date - The date to compare
   * @returns {string} Relative time string
   */
  getRelativeTime: function(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }
    if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }
    if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} month${months > 1 ? "s" : ""} ago`;
    }
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} year${years > 1 ? "s" : ""} ago`;
  },

  /**
   * Get current date-time in the format: MM-HH-DD-MM-YYYY
   * @returns {string} Formatted date-time string
   */
  getCurrentDateTime: function() {
    const now = new Date();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${minutes}-${hours}-${day}-${month}-${year}`;
  },

  /**
   * Parse date from filename pattern
   * @param {string} filename - Filename with date pattern
   * @returns {Date|null} Parsed date or null if pattern doesn't match
   */
  parseDateFromFilename: function(filename) {
    const match = filename.match(CONSTANTS.FILE_NAME_PATTERN);
    if (match) {
      const [, minutes, hours, day, month, year] = match;
      return new Date(year, month - 1, day, hours, minutes);
    }
    return null;
  }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DateUtils;
} else {
  window.DateUtils = DateUtils;
}

