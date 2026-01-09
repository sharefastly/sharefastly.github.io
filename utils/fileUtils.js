// File utility functions
const FileUtils = {
  /**
   * Extract the actual filename from the formatted filename
   * Format: timestamp_-_-folder_-_-actualFileName.ext
   * @param {string} inputString - The formatted filename
   * @returns {string|null} The actual filename or null if invalid
   */
  getSecondPart: function(inputString) {
    if (typeof inputString !== "string") {
      LOGGER.error("Error: Input must be a string.");
      return null;
    }

    const parts = inputString.split(CONSTANTS.SEPARATOR);
    
    if (parts.length < 3) {
      LOGGER.error("Error: The string does not contain enough parts.");
      return inputString; // Return original if pattern doesn't match
    }

    return parts[2]; // Return the actual filename (third part)
  },

  /**
   * Get file type label based on extension
   * @param {string} type - File extension
   * @returns {string} File type label
   */
  getFileTypeLabel: function(type) {
    const ext = type.toLowerCase();
    const typeMap = {
      pdf: "PDF",
      doc: "DOC", docx: "DOC",
      txt: "TXT",
      rtf: "RTF",
      xls: "XLS", xlsx: "XLS", csv: "XLS",
      ppt: "PPT", pptx: "PPT",
      jpg: "IMG", jpeg: "IMG", png: "IMG", gif: "IMG", bmp: "IMG", tiff: "IMG",
      mp3: "AUD", wav: "AUD", ogg: "AUD", m4a: "AUD",
      mp4: "VID", avi: "VID", mov: "VID", wmv: "VID",
      zip: "ZIP", rar: "ZIP", "7z": "ZIP",
      html: "CODE", css: "CODE", js: "CODE", py: "CODE", java: "CODE", c: "CODE", cpp: "CODE",
      tex: "TEX", bib: "TEX",
      epub: "EBOOK", mobi: "EBOOK",
      dwg: "CAD", dxf: "CAD", stl: "CAD",
      sav: "DATA", sas: "DATA", stata: "DATA"
    };
    return typeMap[ext] || "FILE";
  },

  /**
   * Get Font Awesome icon class based on file extension
   * @param {string} type - File extension
   * @returns {string} Icon class name
   */
  getFileIcon: function(type) {
    const ext = type.toLowerCase();
    const iconMap = {
      pdf: "fa-file-pdf",
      doc: "fa-file-word", docx: "fa-file-word",
      txt: "fa-file-lines",
      rtf: "fa-file-alt",
      xls: "fa-file-excel", xlsx: "fa-file-excel", csv: "fa-file-excel",
      ppt: "fa-file-powerpoint", pptx: "fa-file-powerpoint",
      jpg: "fa-file-image", jpeg: "fa-file-image", png: "fa-file-image",
      gif: "fa-file-image", bmp: "fa-file-image", tiff: "fa-file-image",
      mp3: "fa-file-audio", wav: "fa-file-audio", ogg: "fa-file-audio", m4a: "fa-file-audio",
      mp4: "fa-file-video", avi: "fa-file-video", mov: "fa-file-video", wmv: "fa-file-video",
      zip: "fa-file-zipper", rar: "fa-file-zipper", "7z": "fa-file-zipper",
      html: "fa-file-code", css: "fa-file-code", js: "fa-file-code",
      py: "fa-file-code", java: "fa-file-code", c: "fa-file-code", cpp: "fa-file-code",
      tex: "fa-square-root-variable", bib: "fa-square-root-variable",
      epub: "fa-book", mobi: "fa-book",
      dwg: "fa-drafting-compass", dxf: "fa-drafting-compass", stl: "fa-drafting-compass",
      sav: "fa-chart-simple", sas: "fa-chart-simple", stata: "fa-chart-simple"
    };
    return iconMap[ext] || "fa-file";
  },

  /**
   * Get file extension from filename
   * @param {string} filename - Full filename
   * @returns {string} File extension
   */
  getFileExtension: function(filename) {
    return filename.split(".").pop();
  },

  /**
   * Process and sort files by date
   * @param {Array} fileList - Array of file objects from GitHub API
   * @returns {Array} Processed and sorted file list
   */
  processAndSortFiles: function(fileList) {
    return fileList
      .map((file) => {
        const parsedDate = DateUtils.parseDateFromFilename(file.name);
        if (parsedDate) {
          return {
            ...file,
            parsedDate: parsedDate,
            formattedName: `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')} ${String(parsedDate.getHours()).padStart(2, '0')}:${String(parsedDate.getMinutes()).padStart(2, '0')} ${FileUtils.getSecondPart(file.name)}`,
            relativeTime: DateUtils.getRelativeTime(parsedDate)
          };
        }
        return {
          ...file,
          relativeTime: CONSTANTS.UNKNOWN_DATE
        };
      })
      .sort((a, b) => (b.parsedDate || 0) - (a.parsedDate || 0));
  },

  /**
   * Read file as base64 string
   * @param {File} file - File object
   * @returns {Promise<string>} Base64 encoded content
   */
  readFileAsBase64: function(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FileUtils;
} else {
  window.FileUtils = FileUtils;
}

