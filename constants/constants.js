// Application constants and magic strings
const CONSTANTS = {
  SEPARATOR: "_-_-",
  FOLDER_SUFFIX: "-folder",
  ALL_FOLDER: "ALL-folder",
  FILE_NAME_PATTERN: /^(\d{2})-(\d{2})-(\d{2})-(\d{2})-(\d{4})_-_-(.+)$/,
  UNKNOWN_DATE: "Unknown date",
  DEFAULT_SENDER: "PDA Unofficial"
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONSTANTS;
} else {
  window.CONSTANTS = CONSTANTS;
}

