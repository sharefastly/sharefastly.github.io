function createFolderNav(folder) {
  const navbar = document.getElementById("folderNavbar");
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
    document.createTextNode(folder.name.replace("-folder", ""))
  );

  if (folder.name === currentFolder) {
    folderLink.classList.add("active");
  }

  navbar.appendChild(folderLink);
}

function handleFolderClick(event, folderName) {
  event.preventDefault();
  console.log(`Clicked on ${folderName}`);
  // Remove 'active' class from all folders
  document.querySelectorAll(".folder").forEach((folder) => {
    folder.classList.remove("active");
  });
  // Add 'active' class to clicked folder
  event.currentTarget.classList.add("active");

  currentFolder = folderName;

  console.log(currentFolder);
  renderFileListForFolder();
}

function addNewFolder() {
  const newFolderName = prompt("Enter new folder name:");
  if (newFolderName) {
    uploadBlankFile(fileDirectory, newFolderName);
  }
}

function getSortedFolderObjectsByFileCount(files) {
  const folderCounts = {};
  const folderObjects = {};

  files.forEach((file) => {
    const parts = file.name.split("_-_-");

    // Check if the file is of the first type: "abc_-_-xyz-folder_-_-fileName.ext"
    if (parts.length === 3) {
      const folderName = parts[1]; // Extract the "xyz-folder" part

      // Increment the count for the folder
      if (folderCounts[folderName]) {
        folderCounts[folderName]++;
      } else {
        folderCounts[folderName] = 1;
      }
    }

    // Check if the file is of the second type: "xyz-folder"
    if (parts.length === 1 && file.name.includes("-folder")) {
      folderObjects[file.name] = file; // Store the folder file object
    }
  });

  // Now we filter only folder objects and sort them based on the counts
  const sortedFolderObjects = Object.keys(folderObjects)
    .sort((a, b) => (folderCounts[b] || 0) - (folderCounts[a] || 0)) // Sort by counts, default to 0
    .map((folderName) => folderObjects[folderName]); // Return file objects

  return sortedFolderObjects;
}

function renderFolderList() {
  folders = getSortedFolderObjectsByFileCount(globalFileList);

  const navbar = document.getElementById("folderNavbar");
  navbar.innerHTML = ""; // Clear existing folders

  // Add "ALL" folder at the beginning
  createFolderNav({ name: "ALL-folder" });

  folders.forEach(createFolderNav);

  // Add the (+) button
  const addButton = document.createElement("button");
  addButton.textContent = "+";
  addButton.className = "add-button";
  addButton.onclick = addNewFolder;
  navbar.appendChild(addButton);
}

async function uploadBlankFile(path, filename) {
  const finalFileName = filename + "-folder";
  const apiUrl = `https://api.github.com/repos/${githubUsername}/${repoName}/contents/${path}/${finalFileName}`;
  const content = ""; // Blank file content

  const spinner = document.getElementById("load-page-spinner");

  try {
    spinner.style.display = "flex";
    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${t}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Add ${finalFileName}`,
        content: btoa(content), // Use btoa() for base64 encoding in browser
        branch: branch,
      }),
    });

    if (!response.ok) {
      // spinner.style.display = "none";
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("File created:", data.content.html_url);

    spinner.style.display = "none";
    alert("Folder created successfully");

    await updateGlobalFileList();
    currentFolder = finalFileName;
    renderFolderList();
    renderFileListForFolder();
    // handleFolderClickManual(currentFolder);

    // // Create a mock event object
    // const mockEvent = {
    //   preventDefault: () => {},
    //   currentTarget: document.querySelector(".folder"),
    // };

    // // Call the function
    // handleFolderClick(mockEvent, currentFolder);
    // renderFileListForFolder();
    // Refresh the folder list
    return data;
  } catch (error) {
    spinner.style.display = "none";
    console.error("Error uploading file:", error);
    alert(`Error uploading file: ${error.message}`);
  }
}

function filterFileListForFolder() {
  if (currentFolder == "ALL-folder") {
    return globalFileList.filter((file) => {
      const fileName = file.name;
      const parts = fileName.split("_-_-");
      console.log(parts);
      return parts.length === 3;
    });
  } else {
    return globalFileList.filter((file) => {
      const fileName = file.name;
      const parts = fileName.split("_-_-");
      console.log(parts);
      return parts.length === 3 && parts[1] === currentFolder;
    });
  }
}

function renderFilesForAFolder(fileListForAFolder) {
  const fileBoxContainer = document.getElementById("files-box-container");
  fileBoxContainer.innerHTML = ""; // Clear existing files

  let noOfBox = 0;
  for (const file of fileListForAFolder) {
    // console.log(file.relativeTime);

    const fileType = file.name.split(".").pop();
    const fileName = file.name;
    const previewUrl = `https://github.com/${githubUsername}/${repoName}/blob/main/${fileDirectory}/${file.name}`;

    createFileBox(
      fileType,
      "PDA Unofficial", // You might want to replace this with actual sender info if available
      file.name, // Using file.name as a placeholder for the date. Replace with actual date if available.
      fileName,
      file.relativeTime,
      file.download_url,
      previewUrl
    );
    noOfBox = noOfBox + 1;
  }
  if (noOfBox != 0) {
    injectDeleteButton();
  }
  //   spinner.style.display = "none";
}
