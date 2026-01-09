// Unified file rendering using DOM manipulation instead of innerHTML
const FileRenderer = {
  /**
   * Create a file box element using DOM manipulation
   * @param {Object} options - File box options
   * @param {string} options.fileType - File extension
   * @param {string} options.fileName - Full filename
   * @param {string} options.relativeTime - Relative time string
   * @param {string} options.downloadUrl - Download URL
   * @param {string} options.previewUrl - Preview URL
   * @param {boolean} options.showDelete - Whether to show delete button
   * @returns {HTMLElement} File box element
   */
  createFileBox: function(options) {
    const { fileType, fileName, relativeTime, downloadUrl, previewUrl, showDelete = false } = options;
    
    // Create main container
    const fileBox = document.createElement("div");
    fileBox.className = "file-box";

    // Create inner container
    const eachFileBox = document.createElement("div");
    eachFileBox.className = "each-file-box";

    // Create file info section
    const fileInfo = document.createElement("div");
    fileInfo.className = "file-info";

    // Create icon wrapper
    const iconWrapper = document.createElement("div");
    iconWrapper.className = "file-icon-wrapper";

    const icon = document.createElement("i");
    icon.className = `file-icon fas ${FileUtils.getFileIcon(fileType)}`;

    const fileTypeLabel = document.createElement("span");
    fileTypeLabel.className = "file-type";
    fileTypeLabel.textContent = FileUtils.getFileTypeLabel(fileType);

    iconWrapper.appendChild(icon);
    iconWrapper.appendChild(fileTypeLabel);

    // Create file details
    const fileDetails = document.createElement("div");
    const fileNameDiv = document.createElement("div");
    fileNameDiv.className = "file-name";
    fileNameDiv.textContent = FileUtils.getSecondPart(fileName);

    const detailsPara = document.createElement("p");
    detailsPara.className = "file-details";
    detailsPara.textContent = ` • ${relativeTime}`;

    fileDetails.appendChild(fileNameDiv);
    fileDetails.appendChild(detailsPara);

    fileInfo.appendChild(iconWrapper);
    fileInfo.appendChild(fileDetails);

    // Create actions section
    const actions = document.createElement("div");
    actions.className = "actions";

    // Preview button
    const previewLink = document.createElement("a");
    previewLink.href = previewUrl;
    previewLink.target = "_blank";
    previewLink.className = "button button-preview";
    
    const previewIcon = document.createElement("i");
    previewIcon.className = "fas fa-eye";
    const previewSpan = document.createElement("span");
    previewSpan.textContent = "Preview";
    
    previewLink.appendChild(previewIcon);
    previewLink.appendChild(previewSpan);
    actions.appendChild(previewLink);

    // Download or Delete button
    if (showDelete) {
      const deleteButton = document.createElement("button");
      deleteButton.className = "del-button";
      deleteButton.setAttribute("data-filename", fileName);
      deleteButton.onclick = () => {
        if (window.deleteFileHandler) {
          window.deleteFileHandler(fileName);
        }
      };
      
      const deleteIcon = document.createElement("i");
      deleteIcon.className = "fas fa-trash";
      const deleteSpan = document.createElement("span");
      deleteSpan.textContent = "Delete";
      
      deleteButton.appendChild(deleteIcon);
      deleteButton.appendChild(deleteSpan);
      actions.appendChild(deleteButton);
    } else {
      const downloadButton = document.createElement("button");
      downloadButton.className = "button button-download";
      downloadButton.onclick = () => {
        if (window.downloadFileHandler) {
          window.downloadFileHandler(downloadUrl, fileName);
        }
      };
      
      const downloadIcon = document.createElement("i");
      downloadIcon.className = "fas fa-download";
      const downloadSpan = document.createElement("span");
      downloadSpan.textContent = "Download";
      
      downloadButton.appendChild(downloadIcon);
      downloadButton.appendChild(downloadSpan);
      actions.appendChild(downloadButton);
    }

    eachFileBox.appendChild(fileInfo);
    eachFileBox.appendChild(actions);
    fileBox.appendChild(eachFileBox);

    return fileBox;
  },

  /**
   * Render multiple file boxes using DocumentFragment for performance
   * @param {Array} files - Array of file objects
   * @param {HTMLElement} container - Container element
   * @param {boolean} showDelete - Whether to show delete buttons
   */
  renderFileList: function(files, container, showDelete = false) {
    const fragment = document.createDocumentFragment();
    
    files.forEach((file) => {
      const fileType = FileUtils.getFileExtension(file.name);
      const previewUrl = GitHubAPI.getPreviewUrl(file.name);
      
      const fileBox = this.createFileBox({
        fileType,
        fileName: file.name,
        relativeTime: file.relativeTime || CONSTANTS.UNKNOWN_DATE,
        downloadUrl: file.download_url,
        previewUrl,
        showDelete
      });
      
      fragment.appendChild(fileBox);
    });
    
    container.appendChild(fragment);
  },

  /**
   * Clear container and render empty folder message
   * @param {HTMLElement} container - Container element
   */
  renderEmptyFolderMessage: function(container) {
    container.innerHTML = "";
    
    const message = document.createElement("p");
    message.className = "empty-folder-message";
    
    const title = document.createElement("span");
    title.textContent = "This folder is empty";
    
    const subtitle = document.createElement("span");
    subtitle.textContent = "Upload Your Files";
    
    message.appendChild(title);
    message.appendChild(subtitle);
    container.appendChild(message);
  }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FileRenderer;
} else {
  window.FileRenderer = FileRenderer;
}

