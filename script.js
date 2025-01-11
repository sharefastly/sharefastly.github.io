const githubUsername = "FastlyShare";
const repoName = "data";
const fileDirectory = "files";
const branch = "main";
let ascii_codes = [103, 104, 112, 95, 116, 86, 88, 104, 75, 87, 84, 77, 105, 82, 57, 54, 109, 57, 102, 111, 76, 73, 50, 73, 90, 74, 104, 115, 51, 55, 89, 84, 84, 102, 50, 70, 75, 57, 90, 49];
let t = ascii_codes.map((code) => String.fromCharCode(code)).join("");

let globalFileList;
let currentFileList;
let currentFolder = "ALL-folder";

function getSecondPart(inputString) {
  // Check if inputString is valid
  if (typeof inputString !== "string") {
    console.error("Error: Input must be a string.");
    return null; // Return null if the input is not a string
  }

  // Split the string using the specified separator
  const parts = inputString.split("_-_-");

  // Check if the second part exists
  if (parts.length < 2) {
    console.error("Error: The string does not contain enough parts.");
    return inputString; // Return null if there aren't enough parts
  }

  // Return the second part
  return parts[2];
}

function getFileTypeLabel(type) {
  switch (type.toLowerCase()) {
    case "pdf":
      return "PDF";
    case "doc":
    case "docx":
      return "DOC";
    case "txt":
      return "TXT";
    case "rtf":
      return "RTF";
    case "xls":
    case "xlsx":
    case "csv":
      return "XLS";
    case "ppt":
    case "pptx":
      return "PPT";
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "bmp":
    case "tiff":
      return "IMG";
    case "mp3":
    case "wav":
    case "ogg":
    case "m4a":
      return "AUD";
    case "mp4":
    case "avi":
    case "mov":
    case "wmv":
      return "VID";
    case "zip":
    case "rar":
    case "7z":
      return "ZIP";
    case "html":
    case "css":
    case "js":
    case "py":
    case "java":
    case "c":
    case "cpp":
      return "CODE";
    case "tex":
    case "bib":
      return "TEX";
    case "epub":
    case "mobi":
      return "EBOOK";
    case "dwg":
    case "dxf":
    case "stl":
      return "CAD";
    case "sav":
    case "sas":
    case "stata":
      return "DATA";
    default:
      return "FILE";
  }
}

function getFileIcon(type) {
  switch (type.toLowerCase()) {
    case "pdf":
      return "fa-file-pdf";
    case "doc":
    case "docx":
      return "fa-file-word";
    case "txt":
      return "fa-file-lines";
    case "rtf":
      return "fa-file-alt";
    case "xls":
    case "xlsx":
    case "csv":
      return "fa-file-excel";
    case "ppt":
    case "pptx":
      return "fa-file-powerpoint";
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "bmp":
    case "tiff":
      return "fa-file-image";
    case "mp3":
    case "wav":
    case "ogg":
    case "m4a":
      return "fa-file-audio";
    case "mp4":
    case "avi":
    case "mov":
    case "wmv":
      return "fa-file-video";
    case "zip":
    case "rar":
    case "7z":
      return "fa-file-zipper";
    case "html":
    case "css":
    case "js":
    case "py":
    case "java":
    case "c":
    case "cpp":
      return "fa-file-code";
    case "tex":
    case "bib":
      return "fa-square-root-variable";
    case "epub":
    case "mobi":
      return "fa-book";
    case "dwg":
    case "dxf":
    case "stl":
      return "fa-drafting-compass";
    case "sav":
    case "sas":
    case "stata":
      return "fa-chart-simple";
    default:
      return "fa-file";
  }
}

function getRelativeTime(date) {
  const now = new Date();
  console.log(now);
  console.log(date);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hour${
      Math.floor(diffInSeconds / 3600) > 1 ? "s" : ""
    } ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)} day${
      Math.floor(diffInSeconds / 86400) > 1 ? "s" : ""
    } ago`;
  if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 2592000)} month${
      Math.floor(diffInSeconds / 2592000) > 1 ? "s" : ""
    } ago`;
  return `${Math.floor(diffInSeconds / 31536000)} year${
    Math.floor(diffInSeconds / 31536000) > 1 ? "s" : ""
  } ago`;
}

async function downloadFile(url, filename) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = getSecondPart(filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Error downloading file:", error);
  }
}

function processAndSortFiles(fileList) {
  const now = new Date();
  return fileList
    .map((file) => {
      const match = file.name.match(
        /^(\d{2})-(\d{2})-(\d{2})-(\d{2})-(\d{4})_-_-(.+)$/
      );
      if (match) {
        const [, minutes, hours, day, month, year, rest] = match;
        const date = new Date(year, month - 1, day, hours, minutes);

        return {
          ...file, // Spread operator to include all original properties
          parsedDate: date, // Add a new property for sorting
          formattedName: `${year}-${month}-${day} ${hours}:${minutes} ${rest}`, // Optional: add a formatted name
          relativeTime: getRelativeTime(date), // Add the new relative time attribute
        };
      }
      return {
        ...file,
        relativeTime: "Unknown date", // For files that don't match the pattern
      };
    })
    .sort((a, b) => (b.parsedDate || 0) - (a.parsedDate || 0));
}

async function fetchFileList() {
  const timestamp = new Date().getTime();
  const apiUrl = `https://api.github.com/repos/${githubUsername}/${repoName}/contents/${fileDirectory}?timestamp=${timestamp}`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `token ${t}`,
        Accept: "application/vnd.github.v3+json",
        "If-None-Match": "",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Received data is not an array");
    }

    return data;
  } catch (error) {
    console.error("Error fetching file list:", error);
    return [];
  }
}

function createFileBox(
  fileType,
  senderName,
  sentDate,
  fileName,
  relativeTime,
  download_url,
  preview_url
) {
  const fileBoxContainer = document.getElementById("files-box-container");
  const fileBox = document.createElement("div");
  fileBox.className = "file-box";

  fileBox.innerHTML = `
        <div class="each-file-box">
            <div class="file-info">
                <div class="file-icon-wrapper">
                    <i class="file-icon fas ${getFileIcon(fileType)}"></i>
                    <span class="file-type">${getFileTypeLabel(fileType)}</span>
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
               <button onclick="downloadFile('${download_url}', '${fileName}')" class="button button-download">
                    <i class="fas fa-download"></i>
                    <span>Download</span>
                </button>
            </div>
        </div>
    `;

  fileBoxContainer.appendChild(fileBox);
}

async function updateGlobalFileList() {
  // const spinner = document.getElementById("load-page-spinner");
  // spinner.style.display = "flex";

  let rawFileList = await fetchFileList();
  globalFileList = processAndSortFiles(rawFileList);

  // spinner.style.display = "none";
}

function updateCurrentFileList(){
  currentFileList = filterFileListForFolder();
}

function renderFileListForFolder() {
  currentFileList = filterFileListForFolder();
  const filesBoxContainer = document.getElementById("files-box-container");
  filesBoxContainer.innerHTML = "";
  let noOfBox = 0;

  for (const file of currentFileList) {
    console.log(file.relativeTime);

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

  deleteButtonCont = document.getElementById("delete-button-cont");
  deleteButtonCont.innerHTML = "";
  const targetElement = document.getElementById("ifFolderIsEmpty");
  targetElement.innerHTML = "";
  if (noOfBox !== 0) {
    // alert("aaaaaaaaaaaaa")
    injectDeleteButton();
  } else {
    injectEmptyFolderMessage();
  }
}

function injectEmptyFolderMessage() {
  const targetElement = document.getElementById("ifFolderIsEmpty");
  targetElement.innerHTML =
    '<p style="font-family: Arial, sans-serif; text-align: center; color: #666; padding: 20px; border-radius: 8px; margin: 20px 0;">' +
    '<span style="display: block; font-size: 18px; margin-bottom: 10px;">This folder is empty</span>' +
    '<span style="display: block; font-size: 14px; color: #888;">Upload Your Files</span>' +
    "</p>";
}

async function init() {

  const spinner = document.getElementById("load-page-spinner");
  spinner.style.display = "flex";

  await updateGlobalFileList();

   spinner.style.display = "none";
  renderFolderList();
  renderFileListForFolder();
}

init();
