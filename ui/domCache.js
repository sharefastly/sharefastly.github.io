// DOM element caching to avoid repeated queries
const DOMCache = {
  cache: {},

  /**
   * Get element by ID with caching
   * @param {string} id - Element ID
   * @returns {HTMLElement|null} Cached element
   */
  getElement: function(id) {
    if (!this.cache[id]) {
      this.cache[id] = document.getElementById(id);
    }
    return this.cache[id];
  },

  /**
   * Get element by selector with caching
   * @param {string} selector - CSS selector
   * @param {string} cacheKey - Key to use for caching
   * @returns {HTMLElement|null} Cached element
   */
  querySelector: function(selector, cacheKey) {
    const key = cacheKey || selector;
    if (!this.cache[key]) {
      this.cache[key] = document.querySelector(selector);
    }
    return this.cache[key];
  },

  /**
   * Clear cache for a specific element
   * @param {string} key - Cache key
   */
  clear: function(key) {
    if (key) {
      delete this.cache[key];
    } else {
      this.cache = {};
    }
  },

  /**
   * Initialize cache with common elements
   */
  init: function() {
    // Cache common elements
    this.getElement("super-container");
    this.getElement("folderNavbar");
    this.getElement("files-box-container");
    this.getElement("delete-button-cont");
    this.getElement("ifFolderIsEmpty");
    this.getElement("load-page-spinner");
    this.getElement("fileInput");
    this.getElement("uploadBtn");
    this.getElement("fileList");
    this.getElement("progressFill");
    this.querySelector(".progress-bar", "progress-bar");
    this.querySelector(".button-text", "button-text");
    this.querySelector(".upload-btn", "upload-btn");
  }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DOMCache;
} else {
  window.DOMCache = DOMCache;
}

