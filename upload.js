const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const spinner = document.getElementById("spinner");
const progressFill = document.getElementById("progressFill");
const fileList = document.getElementById("fileList");
const buttonText = uploadBtn.querySelector('.button-text');
const uploadButton = document.querySelector('.upload-btn');

document.querySelector(".progress-bar").style.display = "none";

let selectedFiles = [];

function handleButtonClick() {
  if (selectedFiles.length === 0) {
    fileInput.click();
  } else {
    uploadFiles();
  }
}

fileInput.addEventListener("change", function (e) {
  const files = e.target.files;
  if (files.length > 0) {
    selectedFiles = Array.from(files);
    displayFileList();
    // buttonText.textContent = "Upload";
    // buttonText.innerHTML=""
    uploadButton.style.backgroundColor = '#3498db';
    // uploadBtn.style.padding='0px';

    buttonText.innerHTML = `
<div style="
    background-color: #3498db; 
    color: white; 
    font-family: Arial, sans-serif; 
    font-weight: bold; 
    // padding: 10px 20px; 
    border: none; 
    border-radius: 50px; 
    cursor: pointer; 
    font-size: 16px; 
    display: inline-flex; 
    align-items: center; 
    // box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
    Upload
</div>
`;
    
  }
});

function displayFileList() {
  fileList.innerHTML = "";
  selectedFiles.forEach((file, index) => {
    const fileItem = document.createElement("div");
    fileItem.className = "file-item";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "file-name-input";
    input.value = file.name.split(".").slice(0, -1).join("."); // Remove extension
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

function getCurrentDateTime() {
  const now = new Date();
  const minutes = String(now.getMinutes()).padStart(2, '0'); // Get minutes and pad with zero if needed
  const hours = String(now.getHours()).padStart(2, '0');     // Get hours and pad with zero if needed
  const day = String(now.getDate()).padStart(2, '0');       // Get day and pad with zero if needed
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Get month (0-11) and add 1
  const year = now.getFullYear();                             // Get full year

  return `${minutes}-${hours}-${day}-${month}-${year}`;
}

function updateFileName(e) {
  const index = e.target.getAttribute("data-index");
  const newName = e.target.value;
  const oldFile = selectedFiles[index];
  const extension = oldFile.name.split(".").pop();

  // Create a new File object with the updated name
  const newFile = new File([oldFile], `${newName}.${extension}`, {
    type: oldFile.type,
    lastModified: oldFile.lastModified,
  });

  selectedFiles[index] = newFile;
}

async function uploadFiles() {
  if (selectedFiles.length === 0) {
    alert("Please select files first.");
    return;
  }

  document.querySelector(".progress-bar").style.display = "block";
  makeUploadingAnimationInButton();
 



  try {
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      let fileName = `${getCurrentDateTime()}_-_-${currentFolder}_-_-${file.name}`
      // let filePath = `${TARGET_DIRECTORY}${fileName}`;
      let apiUrl = `https://api.github.com/repos/${githubUsername}/${repoName}/contents/${fileDirectory}/${fileName}`;
      const content = await readFileAsBase64(file);

      // Check if file already exists
      let fileExists = true;
      let counter = 1;
      while (fileExists) {
        try {
          const response = await fetch(apiUrl);
          if (response.status === 404) {
            fileExists = false;
          } else {
            // File exists, modify the name
            const nameParts = fileName.split(".");
            const extension = nameParts.pop();
            const baseName = nameParts.join(".");
            fileName = `${baseName}(${counter}).${extension}`;
            // filePath = `${TARGET_DIRECTORY}${fileName}`;
            apiUrl = `https://api.github.com/repos/${githubUsername}/${repoName}/contents/${fileDirectory}/${fileName}`;
            counter++;
          }
        } catch (error) {
          console.error("Error checking file existence:", error);
          break;
        }
      }

      await uploadToGitHub(
        apiUrl,
        branch,
        fileName,
        content,
        updateProgress
      );

      // Update progress
      const progress = ((i + 1) / selectedFiles.length) * 100;
      updateProgress(progress);
    }

    uploadButton.style.backgroundColor = '#4CAF50';
    backButtonToNormalState();
    // setTimeout(function() {
      alert("All files uploaded successfully!");
      await updateGlobalFileList();
      renderFileListForFolder();
      // location.reload(); 
      // renderFileList();
      // renderFileListForFolder();
  //     const mockEvent = new Event('click');  // Create a mock event object
  //     handleFolderClick(mockEvent, currentFolder); 
  // // }, 500); // 500 milliseconds (1 second) delay

  } catch (error) {
    backButtonToNormalState();
    console.error("Error:", error);
    alert("An error occurred during the upload.");
    location.reload(); 
  } finally {
    fileInput.value = "";
    fileList.innerHTML = "";
    progressFill.style.width = "0%";
    selectedFiles = [];
  }
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function uploadToGitHub(
  url,
  branch,
  fileName,
  content,
  progressCallback
) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Authorization", `token ${t}`);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.upload.onprogress = function (event) {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        progressCallback(percentComplete);
      }
    };

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
      } else {
        reject(new Error(`HTTP error! status: ${xhr.status}`));
      }
    };

    xhr.onerror = function () {
      reject(new Error("Network error occurred"));
    };

    const data = JSON.stringify({
      message: `Add ${fileName}`,
      content: content,
      branch: branch,
    });

    xhr.send(data);
  });
}

function updateProgress(percentage) {
  progressFill.style.width = percentage + "%";
}

const messages = [
  'Uploading...',
  'Please wait',
  'Almost there',
  'Finishing up'
];
let messageIndex = 0;
let messageInterval;

function makeUploadingAnimationInButton() {
  uploadBtn.disabled = true;
  uploadButton.style.backgroundColor = '#0362fc';
  changeMessage();

  messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      changeMessage();
  }, 2000);

}

function changeMessage() {
  buttonText.textContent = messages[messageIndex];
}

function backButtonToNormalState() {
  clearInterval(messageInterval);
  uploadBtn.disabled = false;
  buttonText.textContent = 'Choose and Upload Files';
  messageIndex = 0;
}
