// Centralized application state management
const AppState = {
  globalFileList: null,
  currentFileList: null,
  currentFolder: CONSTANTS.ALL_FOLDER,

  /**
   * Set the global file list
   * @param {Array} fileList - Array of file objects
   */
  setGlobalFileList: function(fileList) {
    this.globalFileList = fileList;
  },

  /**
   * Get the global file list
   * @returns {Array|null} Global file list
   */
  getGlobalFileList: function() {
    return this.globalFileList;
  },

  /**
   * Set the current file list (filtered for current folder)
   * @param {Array} fileList - Array of file objects
   */
  setCurrentFileList: function(fileList) {
    this.currentFileList = fileList;
  },

  /**
   * Get the current file list
   * @returns {Array|null} Current file list
   */
  getCurrentFileList: function() {
    return this.currentFileList;
  },

  /**
   * Set the current folder
   * @param {string} folderName - Folder name
   */
  setCurrentFolder: function(folderName) {
    this.currentFolder = folderName;
  },

  /**
   * Get the current folder
   * @returns {string} Current folder name
   */
  getCurrentFolder: function() {
    return this.currentFolder;
  },

  /**
   * Filter file list for current folder
   * @returns {Array} Filtered file list
   */
  filterFileListForFolder: function() {
    if (!this.globalFileList) {
      return [];
    }

    if (this.currentFolder === CONSTANTS.ALL_FOLDER) {
      // Return all files for ALL_FOLDER view, excluding logical folder files
      return this.globalFileList.filter((file) => !file.name.endsWith(CONSTANTS.FOLDER_SUFFIX));
    } else {
      return this.globalFileList.filter((file) => {
        const parts = file.name.split(CONSTANTS.SEPARATOR);
        // Exclude logical folder files and only show files in the current folder
        return parts.length === 3 && parts[1] === this.currentFolder && !file.name.endsWith(CONSTANTS.FOLDER_SUFFIX);
      });
    }
  },

  /**
   * Update current file list based on current folder
   */
  updateCurrentFileList: function() {
    this.currentFileList = this.filterFileListForFolder();
  }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppState;
} else {
  window.AppState = AppState;
}

