// Delete file functionality (lazy loaded)

/**
 * Render delete file list page
 */
async function renderDeleteFileList() {
  // Ensure global file list is updated
  if (window.updateGlobalFileList) {
    await window.updateGlobalFileList();
  }
  
  // Update the current file list from the global list
  AppState.updateCurrentFileList();

  const superContainer = DOMCache.getElement("super-container");
  if (!superContainer) {
    LOGGER.error("Super container not found");
    return;
  }

  superContainer.innerHTML = "";

  const deletePageTitle = document.createElement("div");
  deletePageTitle.className = "delete-page-title";
  const title = document.createElement("h1");
  title.textContent = "Delete Your uploads";
  deletePageTitle.appendChild(title);
  superContainer.appendChild(deletePageTitle);

  const button = document.createElement('button');
  button.className = 'go-back-form-delete';
  button.textContent = 'Go Back';
  button.onclick = () => location.reload();
  superContainer.appendChild(button);

  const madeFilesBoxContainer = document.createElement("div");
  madeFilesBoxContainer.id = "files-box-container";
  superContainer.appendChild(madeFilesBoxContainer);

  const currentFolder = AppState.getCurrentFolder();
  
  // Get the appropriate file list
  let deleteFileList = [];
  if (currentFolder === CONSTANTS.ALL_FOLDER) {
    deleteFileList = AppState.getGlobalFileList() || [];
  } else {
    deleteFileList = AppState.getCurrentFileList() || [];
  }

  LOGGER.log("Delete file list:", deleteFileList);
  LOGGER.log("Current folder:", currentFolder);
  
  const container = madeFilesBoxContainer;
  
  if (deleteFileList.length > 0) {
    FileRenderer.renderFileList(deleteFileList, container, true);
    
    // Add delete all button at the bottom
    const deleteAllContainer = document.createElement("div");
    deleteAllContainer.style.cssText = "margin-top: 30px; padding: 20px; text-align: center; border-top: 2px solid #ddd;";
    
    const deleteAllButton = document.createElement("button");
    deleteAllButton.className = "delete-all-button";
    deleteAllButton.textContent = `Delete All Files in ${currentFolder === CONSTANTS.ALL_FOLDER ? 'ALL FOLDERS' : currentFolder}`;
    deleteAllButton.style.cssText = `
      background-color: #d32f2f;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.3s;
    `;
    
    deleteAllButton.onmouseover = () => {
      deleteAllButton.style.backgroundColor = "#b71c1c";
    };
    deleteAllButton.onmouseout = () => {
      deleteAllButton.style.backgroundColor = "#d32f2f";
    };
    
    deleteAllButton.onclick = () => {
      const confirmMessage = `Are you sure you want to delete ALL ${deleteFileList.length} files in ${currentFolder === CONSTANTS.ALL_FOLDER ? 'all folders' : currentFolder}? This action cannot be undone.`;
      if (confirm(confirmMessage)) {
        deleteAllFilesInFolder(deleteFileList);
      }
    };
    
    deleteAllContainer.appendChild(deleteAllButton);
    superContainer.appendChild(deleteAllContainer);
  } else {
    container.innerHTML = '<p style="text-align: center; padding: 20px; color: #999;">No files to delete</p>';
  }
  
  // Scroll to top after rendering is complete
  window.scrollTo(0, 0);
}

/**
 * Delete file handler
 * @param {string} fileName - Name of file to delete
 */
async function deleteFile(fileName) {
  const button = document.querySelector(`button[data-filename="${fileName}"]`);
  if (!button) return;

  button.disabled = true;
  const originalContent = button.innerHTML;
  button.innerHTML = '<span class="spinner"></span>Deleting...';

  try {
    await GitHubAPI.deleteFile(fileName);
    LOGGER.log(`File ${fileName} deleted successfully`);
    alert("File deleted successfully!");
  } catch (error) {
    LOGGER.error("Error deleting file:", error);
    alert(`Failed to delete file ${fileName}. Please try again.`);
  } finally {
    if (window.updateGlobalFileList) {
      await window.updateGlobalFileList();
    }
    AppState.updateCurrentFileList();
    renderDeleteFileList();
    
    button.disabled = false;
    button.innerHTML = originalContent;
  }
}

/**
 * Delete all files in folder
 * @param {Array} fileList - List of files to delete
 */
async function deleteAllFilesInFolder(fileList) {
  if (!fileList || fileList.length === 0) {
    alert("No files to delete");
    return;
  }

  const totalFiles = fileList.length;
  let deletedCount = 0;
  let failedCount = 0;

  // Create a progress overlay
  const progressOverlay = document.createElement("div");
  progressOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  `;

  const progressBox = document.createElement("div");
  progressBox.style.cssText = `
    background-color: white;
    padding: 30px;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;

  const progressTitle = document.createElement("h2");
  progressTitle.textContent = "Deleting Files...";
  progressTitle.style.marginBottom = "20px";

  const progressText = document.createElement("p");
  progressText.id = "delete-progress-text";
  progressText.style.cssText = "font-size: 18px; margin-bottom: 20px;";

  const progressBar = document.createElement("div");
  progressBar.style.cssText = `
    width: 300px;
    height: 20px;
    background-color: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 20px;
  `;

  const progressFill = document.createElement("div");
  progressFill.id = "delete-progress-fill";
  progressFill.style.cssText = `
    height: 100%;
    background-color: #4caf50;
    width: 0%;
    transition: width 0.3s;
  `;

  progressBar.appendChild(progressFill);
  progressBox.appendChild(progressTitle);
  progressBox.appendChild(progressText);
  progressBox.appendChild(progressBar);
  progressOverlay.appendChild(progressBox);
  document.body.appendChild(progressOverlay);

  // Delete files one by one
  for (const file of fileList) {
    try {
      await GitHubAPI.deleteFile(file.name);
      deletedCount++;
      LOGGER.log(`Deleted file ${deletedCount}/${totalFiles}: ${file.name}`);
    } catch (error) {
      failedCount++;
      LOGGER.error(`Failed to delete ${file.name}:`, error);
    }

    // Update progress
    const progress = (deletedCount + failedCount) / totalFiles * 100;
    progressText.textContent = `Deleted: ${deletedCount} | Failed: ${failedCount} | Total: ${totalFiles}`;
    progressFill.style.width = progress + "%";
  }

  // Remove progress overlay
  document.body.removeChild(progressOverlay);

  // Show completion message
  if (failedCount === 0) {
    alert(`Successfully deleted all ${deletedCount} files!`);
  } else {
    alert(`Deletion complete!\nDeleted: ${deletedCount}\nFailed: ${failedCount}`);
  }

  // Refresh the delete menu
  if (window.updateGlobalFileList) {
    await window.updateGlobalFileList();
  }
  AppState.updateCurrentFileList();
  renderDeleteFileList();
}

/**
 * Inject delete button with password protection
 */
function injectDeleteButton() {
  const deleteButtonCont = DOMCache.getElement("delete-button-cont");
  if (!deleteButtonCont) {
    LOGGER.error("Delete button container not found");
    return;
  }

  const deleteButtonHTML = `
      <div class="delete-container">
        <button class="delete-button" id="deleteButton">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
          Delete Your Uploads
        </button>
        <div class="password-container" id="passwordContainer">
          <input type="password" id="passwordInput" class="password-input" placeholder="Enter password">
          <div class="button-group">
            <button id="submitPassword" class="submit-button">Submit</button>
            <button id="cancelButton" class="cancel-button">Cancel</button>
          </div>
          <div id="errorMessage" class="error-message">Incorrect password</div>
        </div>
      </div>
    `;

  const deleteButtonContainer = document.createElement("div");
  deleteButtonContainer.innerHTML = deleteButtonHTML;
  deleteButtonCont.appendChild(deleteButtonContainer);

  const deleteButton = document.getElementById("deleteButton");
  const passwordContainer = document.getElementById("passwordContainer");
  const passwordInput = document.getElementById("passwordInput");
  const submitPassword = document.getElementById("submitPassword");
  const cancelButton = document.getElementById("cancelButton");
  const errorMessage = document.getElementById("errorMessage");

  if (deleteButton) {
    deleteButton.addEventListener("click", (event) => {
      event.stopPropagation();
      if (passwordContainer) {
        passwordContainer.style.display = "block";
      }
      if (passwordInput) {
        passwordInput.focus();
      }
    });
  }

  function checkPassword() {
    if (passwordInput && passwordInput.value === CONFIG.security.deletePassword) {
      // Lazy load delete functionality
      renderDeleteFileList();
    } else {
      if (errorMessage) {
        errorMessage.style.display = "block";
      }
      if (passwordInput) {
        passwordInput.value = "";
      }
      setTimeout(() => {
        if (errorMessage) {
          errorMessage.style.display = "none";
        }
      }, 3000);
    }
  }

  function hidePasswordContainer() {
    if (passwordContainer) {
      passwordContainer.style.display = "none";
    }
    if (passwordInput) {
      passwordInput.value = "";
    }
    if (errorMessage) {
      errorMessage.style.display = "none";
    }
  }

  if (submitPassword) {
    submitPassword.addEventListener("click", checkPassword);
  }
  if (passwordInput) {
    passwordInput.addEventListener("keyup", (event) => {
      if (event.key === "Enter") {
        checkPassword();
      }
    });
  }
  if (cancelButton) {
    cancelButton.addEventListener("click", hidePasswordContainer);
  }

  document.addEventListener("click", (event) => {
    if (
      passwordContainer &&
      !passwordContainer.contains(event.target) &&
      event.target !== deleteButton
    ) {
      hidePasswordContainer();
    }
  });
}

// Export functions to global scope
window.renderDeleteFileList = renderDeleteFileList;
window.deleteFile = deleteFile;
window.deleteAllFilesInFolder = deleteAllFilesInFolder;
window.injectDeleteButton = injectDeleteButton;
window.deleteFileHandler = deleteFile;

