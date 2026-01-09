// File upload functionality

let selectedFiles = [];
let messageIndex = 0;
let messageInterval;

const messages = [
  'Uploading...',
  'Please wait',
  'Almost there',
  'Finishing up'
];

// Initialize DOM elements
const fileInput = DOMCache.getElement("fileInput");
const uploadBtn = DOMCache.getElement("uploadBtn");
const fileList = DOMCache.getElement("fileList");
const progressBar = DOMCache.querySelector(".progress-bar", "progress-bar");
const progressFill = DOMCache.getElement("progressFill");
const buttonText = DOMCache.querySelector(".button-text", "button-text");
const uploadButton = DOMCache.querySelector(".upload-btn", "upload-btn");

if (progressBar) {
  progressBar.style.display = "none";
}

/**
 * Handle upload button click
 */
function handleButtonClick() {
  if (selectedFiles.length === 0) {
    if (fileInput) {
      fileInput.click();
    }
  } else {
    uploadFiles();
  }
}

/**
 * Handle file input change
 */
if (fileInput) {
  fileInput.addEventListener("change", function (e) {
    const files = e.target.files;
    if (files.length > 0) {
      selectedFiles = Array.from(files);
      displayFileList();
      
      if (uploadButton) {
        uploadButton.style.backgroundColor = '#3498db';
      }

      if (buttonText) {
        buttonText.innerHTML = `
<div style="background-color: #3498db; color: white; font-family: Arial, sans-serif; font-weight: bold; border: none; border-radius: 50px; cursor: pointer; font-size: 16px; display: inline-flex; align-items: center;">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
    Upload
</div>
`;
      }
    }
  });
}

/**
 * Display selected files list
 */
function displayFileList() {
  if (!fileList) return;
  
  fileList.innerHTML = "";
  selectedFiles.forEach((file, index) => {
    const fileItem = document.createElement("div");
    fileItem.className = "file-item";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "file-name-input";
    input.value = file.name.split(".").slice(0, -1).join(".");
    input.setAttribute("data-index", index);
    input.addEventListener("change", updateFileName);
    input.addEventListener("focus", function () {
      this.setSelectionRange(0, this.value.length);
    });

    fileItem.appendChild(input);
    fileList.appendChild(fileItem);

    // Automatically focus and open keyboard for the first file on mobile
    if (index === 0 && /Mobi|Android/i.test(navigator.userAgent)) {
      setTimeout(() => input.focus(), 0);
    }
  });
}

/**
 * Update file name in selected files array
 * @param {Event} e - Change event
 */
function updateFileName(e) {
  const index = e.target.getAttribute("data-index");
  const newName = e.target.value;
  const oldFile = selectedFiles[index];
  const extension = oldFile.name.split(".").pop();

  const newFile = new File([oldFile], `${newName}.${extension}`, {
    type: oldFile.type,
    lastModified: oldFile.lastModified,
  });

  selectedFiles[index] = newFile;
}

/**
 * Upload files to GitHub
 */
async function uploadFiles() {
  if (selectedFiles.length === 0) {
    alert("Please select files first.");
    return;
  }

  if (progressBar) {
    progressBar.style.display = "block";
  }
  makeUploadingAnimationInButton();

  try {
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      let fileName = `${DateUtils.getCurrentDateTime()}${CONSTANTS.SEPARATOR}${AppState.getCurrentFolder()}${CONSTANTS.SEPARATOR}${file.name}`;
      
      const content = await FileUtils.readFileAsBase64(file);

      // Check if file already exists and generate unique name
      let fileExists = true;
      let counter = 1;
      while (fileExists) {
        try {
          fileExists = await GitHubAPI.checkFileExists(fileName);
          if (fileExists) {
            const nameParts = fileName.split(".");
            const extension = nameParts.pop();
            const baseName = nameParts.join(".");
            fileName = `${baseName}(${counter}).${extension}`;
            counter++;
          }
        } catch (error) {
          LOGGER.error("Error checking file existence:", error);
          break;
        }
      }

      await GitHubAPI.uploadFile(fileName, content, updateProgress);

      // Update progress
      const progress = ((i + 1) / selectedFiles.length) * 100;
      updateProgress(progress);
    }

    if (uploadButton) {
      uploadButton.style.backgroundColor = '#4CAF50';
    }
    backButtonToNormalState();
    
    alert("All files uploaded successfully!");
    
    if (window.updateGlobalFileList) {
      await window.updateGlobalFileList();
    }
    if (window.renderFileListForFolder) {
      window.renderFileListForFolder();
    }

  } catch (error) {
    backButtonToNormalState();
    LOGGER.error("Error:", error);
    alert("An error occurred during the upload.");
    location.reload();
  } finally {
    if (fileInput) fileInput.value = "";
    if (fileList) fileList.innerHTML = "";
    if (progressFill) progressFill.style.width = "0%";
    selectedFiles = [];
  }
}

/**
 * Update upload progress
 * @param {number} percentage - Progress percentage
 */
function updateProgress(percentage) {
  if (progressFill) {
    progressFill.style.width = percentage + "%";
  }
}

/**
 * Make uploading animation in button
 */
function makeUploadingAnimationInButton() {
  if (uploadBtn) {
    uploadBtn.disabled = true;
  }
  if (uploadButton) {
    uploadButton.style.backgroundColor = '#0362fc';
  }
  changeMessage();

  messageInterval = setInterval(() => {
    messageIndex = (messageIndex + 1) % messages.length;
    changeMessage();
  }, 2000);
}

/**
 * Change button message
 */
function changeMessage() {
  if (buttonText) {
    buttonText.textContent = messages[messageIndex];
  }
}

/**
 * Reset button to normal state
 */
function backButtonToNormalState() {
  clearInterval(messageInterval);
  if (uploadBtn) {
    uploadBtn.disabled = false;
  }
  if (buttonText) {
    buttonText.textContent = 'Choose and Upload Files';
  }
  messageIndex = 0;
}

// Export functions to global scope
window.handleButtonClick = handleButtonClick;
window.uploadFiles = uploadFiles;
window.updateGlobalFileList = async function() {
  const rawFileList = await GitHubAPI.fetchFileList();
  const processedList = FileUtils.processAndSortFiles(rawFileList);
  AppState.setGlobalFileList(processedList);
};
window.renderFileListForFolder = function() {
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
};

