// Main application initialization and file list management

// Download file handler
window.downloadFileHandler = async function(url, filename) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = FileUtils.getSecondPart(filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    LOGGER.error("Error downloading file:", error);
  }
};

/**
 * Update global file list from GitHub
 */
async function updateGlobalFileList() {
  const rawFileList = await GitHubAPI.fetchFileList();
  const processedList = FileUtils.processAndSortFiles(rawFileList);
  AppState.setGlobalFileList(processedList);
}

/**
 * Render file list for current folder
 */
function renderFileListForFolder() {
  AppState.updateCurrentFileList();
  const currentFileList = AppState.getCurrentFileList();
  const filesBoxContainer = DOMCache.getElement("files-box-container");
  
  if (!filesBoxContainer) {
    LOGGER.error("Files box container not found");
    return;
  }

  filesBoxContainer.innerHTML = "";
  
  const deleteButtonCont = DOMCache.getElement("delete-button-cont");
  const emptyFolderElement = DOMCache.getElement("ifFolderIsEmpty");
  
  if (deleteButtonCont) deleteButtonCont.innerHTML = "";
  if (emptyFolderElement) emptyFolderElement.innerHTML = "";

  if (currentFileList && currentFileList.length > 0) {
    FileRenderer.renderFileList(currentFileList, filesBoxContainer, false);
    if (window.injectDeleteButton) {
      window.injectDeleteButton();
    }
  } else {
    if (emptyFolderElement) {
      FileRenderer.renderEmptyFolderMessage(emptyFolderElement);
    }
  }
}

/**
 * Initialize application
 */
async function init() {
  const spinner = DOMCache.getElement("load-page-spinner");
  if (spinner) {
    spinner.style.display = "flex";
  }

  await updateGlobalFileList();

  if (spinner) {
    spinner.style.display = "none";
  }
  
  if (window.renderFolderList) {
    window.renderFolderList();
  }
  renderFileListForFolder();
}

// Initialize DOM cache and start app
DOMCache.init();
init();
