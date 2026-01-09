// Folder navigation UI logic

/**
 * Create folder navigation link
 * @param {Object} folder - Folder object
 */
function createFolderNav(folder) {
  const navbar = DOMCache.getElement("folderNavbar");
  if (!navbar) return;

  const folderLink = document.createElement("a");
  folderLink.href = "#";
  folderLink.className = "folder";
  folderLink.onclick = function (event) {
    handleFolderClick(event, folder.name);
  };

  const folderIcon = document.createElement("span");
  folderIcon.className = "folder-icon";
  folderIcon.textContent = "📁";

  folderLink.appendChild(folderIcon);
  folderLink.appendChild(
    document.createTextNode(folder.name.replace(CONSTANTS.FOLDER_SUFFIX, ""))
  );

  if (folder.name === AppState.getCurrentFolder()) {
    folderLink.classList.add("active");
  }

  navbar.appendChild(folderLink);
}

/**
 * Handle folder click event
 * @param {Event} event - Click event
 * @param {string} folderName - Folder name
 */
function handleFolderClick(event, folderName) {
  event.preventDefault();
  LOGGER.log(`Clicked on ${folderName}`);
  
  // Remove 'active' class from all folders
  document.querySelectorAll(".folder").forEach((folder) => {
    folder.classList.remove("active");
  });
  
  // Add 'active' class to clicked folder
  event.currentTarget.classList.add("active");

  AppState.setCurrentFolder(folderName);
  LOGGER.log("Current folder:", AppState.getCurrentFolder());
  
  if (window.renderFileListForFolder) {
    window.renderFileListForFolder();
  }
}

/**
 * Add new folder
 */
async function addNewFolder() {
  const newFolderName = prompt("Enter new folder name:");
  if (newFolderName) {
    await uploadBlankFile(newFolderName);
  }
}

/**
 * Get sorted folder objects by file count
 * @param {Array} files - Array of file objects
 * @returns {Array} Sorted folder objects
 */
function getSortedFolderObjectsByFileCount(files) {
  const folderCounts = {};
  const folderObjects = {};

  files.forEach((file) => {
    const parts = file.name.split(CONSTANTS.SEPARATOR);

    // Check if the file is of the first type: "abc_-_-xyz-folder_-_-fileName.ext"
    if (parts.length === 3) {
      const folderName = parts[1];
      folderCounts[folderName] = (folderCounts[folderName] || 0) + 1;
    }

    // Check if the file is of the second type: "xyz-folder"
    if (parts.length === 1 && file.name.includes(CONSTANTS.FOLDER_SUFFIX)) {
      folderObjects[file.name] = file;
    }
  });

  // Filter only folder objects and sort them based on the counts
  const sortedFolderObjects = Object.keys(folderObjects)
    .sort((a, b) => (folderCounts[b] || 0) - (folderCounts[a] || 0))
    .map((folderName) => folderObjects[folderName]);

  return sortedFolderObjects;
}

/**
 * Render folder list in navigation bar
 */
function renderFolderList() {
  const globalFileList = AppState.getGlobalFileList();
  if (!globalFileList) {
    LOGGER.warn("Global file list not available");
    return;
  }

  const folders = getSortedFolderObjectsByFileCount(globalFileList);
  const navbar = DOMCache.getElement("folderNavbar");
  
  if (!navbar) {
    LOGGER.error("Folder navbar not found");
    return;
  }

  navbar.innerHTML = "";

  // Add "ALL" folder at the beginning
  createFolderNav({ name: CONSTANTS.ALL_FOLDER });

  folders.forEach(createFolderNav);

  // Add the (+) button
  const addButton = document.createElement("button");
  addButton.textContent = "+";
  addButton.className = "add-button";
  addButton.onclick = addNewFolder;
  navbar.appendChild(addButton);
}

/**
 * Upload blank file to create a folder
 * @param {string} filename - Folder name
 */
async function uploadBlankFile(filename) {
  const finalFileName = filename + CONSTANTS.FOLDER_SUFFIX;
  const spinner = DOMCache.getElement("load-page-spinner");

  try {
    if (spinner) {
      spinner.style.display = "flex";
    }

    const data = await GitHubAPI.uploadBlankFile(finalFileName);
    LOGGER.log("File created:", data.content.html_url);

    if (spinner) {
      spinner.style.display = "none";
    }
    
    alert("Folder created successfully");

    await window.updateGlobalFileList();
    AppState.setCurrentFolder(finalFileName);
    renderFolderList();
    
    if (window.renderFileListForFolder) {
      window.renderFileListForFolder();
    }
    
    return data;
  } catch (error) {
    if (spinner) {
      spinner.style.display = "none";
    }
    LOGGER.error("Error uploading file:", error);
    alert(`Error uploading file: ${error.message}`);
  }
}

// Export functions to global scope for use in HTML
window.createFolderNav = createFolderNav;
window.handleFolderClick = handleFolderClick;
window.addNewFolder = addNewFolder;
window.renderFolderList = renderFolderList;
window.uploadBlankFile = uploadBlankFile;

