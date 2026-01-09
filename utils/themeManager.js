// Theme Manager - Sets light theme as default
// Simplified version - no toggle functionality

const ThemeManager = {
  /**
   * Initialize light theme
   */
  init: function() {
    this.setTheme('light');
  },

  /**
   * Set theme
   * @param {string} theme - 'light' or 'dark'
   */
  setTheme: function(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  },

  /**
   * Get current theme
   * @returns {string} Current theme
   */
  getCurrentTheme: function() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
} else {
  window.ThemeManager = ThemeManager;
}

