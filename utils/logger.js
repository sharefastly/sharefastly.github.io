// Logging utility - can be disabled in production
const LOGGER = {
  enabled: true, // Set to false in production
  
  log: function(...args) {
    if (this.enabled) {
      console.log(...args);
    }
  },
  
  error: function(...args) {
    if (this.enabled) {
      console.error(...args);
    }
  },
  
  warn: function(...args) {
    if (this.enabled) {
      console.warn(...args);
    }
  }
};

/**
 * Debounce utility function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LOGGER, debounce };
} else {
  window.LOGGER = LOGGER;
  window.debounce = debounce;
}

