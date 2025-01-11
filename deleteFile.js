async function renderDeleteFileList() {
  await updateGlobalFileList();
  updateCurrentFileList();

  superContainer = document.getElementById("super-container");
  superContainer.innerHTML = "";

  const deletePageTitle = document.createElement("div");
  deletePageTitle.className = "delete-page-title";

  deletePageTitle.innerHTML = " <h1>Delete Your uploads</h1>";

  superContainer.appendChild(deletePageTitle);

  const button = document.createElement('button');
  button.className = 'go-back-form-delete';
  button.textContent = 'Go Back';
  button.onclick = () => location.reload();
  superContainer.appendChild(button);

  const madeFilesBoxContainer = document.createElement("div");
  madeFilesBoxContainer.id = "files-box-container";
  superContainer.appendChild(madeFilesBoxContainer);
  const filesBoxContainer = document.getElementById("super-container");

  let deleteFileList;
  // for (const file of currentFileList) {
  if(currentFolder=="ALL-folder"){
    deleteFileList=globalFileList;
  }else{
    deleteFileList=currentFileList;
  }

  for (const file of deleteFileList){
    console.log(file.relativeTime);

    const fileType = file.name.split(".").pop();
    const fileName = file.name;
    const previewUrl = `https://github.com/${githubUsername}/${repoName}/blob/main/${fileDirectory}/${file.name}`;

    createDeleteFileBox(
      fileType,
      "PDA Unofficial", // You might want to replace this with actual sender info if available
      file.name, // Using file.name as a placeholder for the date. Replace with actual date if available.
      fileName,
      file.relativeTime,
      file.download_url,
      previewUrl
    );
  }
}

function createDeleteFileBox(
  fileType,
  senderName,
  sentDate,
  fileName,
  relativeTime,
  download_url,
  preview_url
) {
  // const madeFilesBoxContainer = document.createElement("div");
  // madeFilesBoxContainer.id = "files-box-container";
  const fileBoxContainer = document.getElementById("files-box-container");
  // const fileBoxContainer = document.getElementById("super-container");
  const fileBox = document.createElement("div");
  fileBox.className = "file-box";

  fileBox.innerHTML = `
          <div class="each-file-box">
              <div class="file-info">
                  <div class="file-icon-wrapper">
                      <i class="file-icon fas ${getFileIcon(fileType)}"></i>
                      <span class="file-type">${getFileTypeLabel(
                        fileType
                      )}</span>
                  </div>
                  <div>
                      <div class="file-name">${getSecondPart(fileName)}</div>
                      <p class="file-details">
                           • ${relativeTime}
                      </p>
                  </div>
              </div>
               <div class="actions">
               <a href="${preview_url}" target="_blank" class="button button-preview">
                      <i class="fas fa-eye"></i>
                      <span>Preview</span>
                  </a>
          <button onclick="deleteFile('${fileName}')" class="del-button" data-filename="${fileName}">
            <i class="fas fa-trash"></i>
            <span>Delete</span>
          </button>
        </div>
          </div>
      `;

  fileBoxContainer.appendChild(fileBox);
}

async function deleteFile(fileName) {
  const button = document.querySelector(`button[data-filename="${fileName}"]`);
  if (!button) return;

  button.disabled = true;
  const originalContent = button.innerHTML;
  button.innerHTML = '<span class="spinner"></span>Deleting...';

  const apiUrl = `https://api.github.com/repos/${githubUsername}/${repoName}/contents/${fileDirectory}/${fileName}`;

  try {
    // First, get the SHA of the file to delete
    const getFileResponse = await fetch(apiUrl, {
      headers: {
        Authorization: `token ${t}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!getFileResponse.ok) {
      throw new Error(
        `Error fetching file: ${getFileResponse.status} ${getFileResponse.statusText}`
      );
    }

    const fileData = await getFileResponse.json();
    const fileSHA = fileData.sha;

    // Now proceed to delete the file
    const deleteResponse = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        Authorization: `token ${t}`,
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({
        message: "Delete file",
        sha: fileSHA,
        branch: branch,
      }),
    });

    if (!deleteResponse.ok) {
      throw new Error(
        `Error deleting file: ${deleteResponse.status} ${deleteResponse.statusText}`
      );
    }

    console.log(`File ${fileName} deleted successfully`);

    // await init();
    // renderDeleteFileList();
    alert("File deleted successfully!");
  } catch (error) {
    console.error("Error deleting file:", error);
    alert(`Failed to delete file ${fileName}. Please try again.`);
  } finally {
    // await init();
    await updateGlobalFileList();
    updateCurrentFileList();
    renderDeleteFileList();
    button.disabled = false;
    button.innerHTML = originalContent;
    // await init();
    // renderDeleteFileList();
  }
}


function injectDeleteButton() {
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

  // deleteButtonCont = document.getElementById("delete-button-cont");
  // deleteButtonCont.innerHTML = "";

  // Create a new div element
  const deleteButtonContainer = document.createElement("div");
  deleteButtonContainer.innerHTML = deleteButtonHTML;

  // Append the new element to the body (or any other desired parent element)
  deleteButtonCont.appendChild(deleteButtonContainer);

  const deleteButton = document.getElementById("deleteButton");
  const passwordContainer = document.getElementById("passwordContainer");
  const passwordInput = document.getElementById("passwordInput");
  const submitPassword = document.getElementById("submitPassword");
  const cancelButton = document.getElementById("cancelButton");
  const errorMessage = document.getElementById("errorMessage");

  deleteButton.addEventListener("click", (event) => {
    event.stopPropagation();
    passwordContainer.style.display = "block";
    passwordInput.focus();
  });

  submitPassword.addEventListener("click", checkPassword);
  passwordInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      checkPassword();
    }
  });

  cancelButton.addEventListener("click", hidePasswordContainer);

  function checkPassword() {
    if (passwordInput.value === "hello12345") {
      renderDeleteFileList(currentFileList);
    } else {
      errorMessage.style.display = "block";
      passwordInput.value = "";
      setTimeout(() => {
        errorMessage.style.display = "none";
      }, 3000);
    }
  }

  function hidePasswordContainer() {
    passwordContainer.style.display = "none";
    passwordInput.value = "";
    errorMessage.style.display = "none";
  }

  document.addEventListener("click", (event) => {
    if (
      !passwordContainer.contains(event.target) &&
      event.target !== deleteButton
    ) {
      hidePasswordContainer();
    }
  });
}

function injectGoBackButton() {
  const button = document.createElement('button');
  button.textContent = 'Go Back';
  button.onclick = () => window.history.back();
  
  // Apply styles
  Object.assign(button.style, {
    position: 'fixed',
    top: '20px',
    left: '20px',
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
  });

  // Add hover effect
  button.onmouseover = () => button.style.backgroundColor = '#45a049';
  button.onmouseout = () => button.style.backgroundColor = '#4CAF50';

  document.body.appendChild(button);
}