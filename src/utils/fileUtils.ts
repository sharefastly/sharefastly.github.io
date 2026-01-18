// File utility functions

import type { GitHubFile, ProcessedFile, Folder } from '../types';
import { CONSTANTS, FILE_ICONS, FILE_TYPE_LABELS } from './constants';
import { parseDateFromFilename, getRelativeTime } from './dateUtils';

/**
 * Get the actual filename from the formatted filename
 * Format: timestamp_-_-folder_-_-actualFileName.ext
 * Or for notes without title: timestamp_-_-folder.post
 */
export function getDisplayName(inputString: string): string {
  const parts = inputString.split(CONSTANTS.SEPARATOR);
  
  // 3 parts: timestamp_-_-folder_-_-filename.ext
  if (parts.length >= 3) {
    return parts[2];
  }
  
  // 2 parts: timestamp_-_-folder.post (note without title)
  if (parts.length === 2) {
    // Check if it's a note file (ends with .post)
    if (parts[1].endsWith(CONSTANTS.POST_EXTENSION)) {
      return ''; // Return empty for untitled notes
    }
    return parts[1];
  }

  return inputString;
}

/**
 * Get folder name from the formatted filename
 */
export function getFolderName(inputString: string): string {
  const parts = inputString.split(CONSTANTS.SEPARATOR);
  
  if (parts.length < 2) {
    return CONSTANTS.ALL_FOLDER;
  }

  // For 2-part format (notes without title): timestamp_-_-folder.post
  if (parts.length === 2 && parts[1].endsWith(CONSTANTS.POST_EXTENSION)) {
    return parts[1].replace(CONSTANTS.POST_EXTENSION, '');
  }

  return parts[1];
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  // Handle 2-part format for notes: the second part ends with .post
  if (filename === '' || filename.endsWith(CONSTANTS.POST_EXTENSION)) {
    return 'post';
  }
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}

/**
 * Get file type label based on extension
 */
export function getFileTypeLabel(extension: string): string {
  return FILE_TYPE_LABELS[extension.toLowerCase()] || 'FILE';
}

/**
 * Get file icon based on extension
 */
export function getFileIcon(extension: string): string {
  return FILE_ICONS[extension.toLowerCase()] || '📄';
}

/**
 * Process and sort files by date
 */
export function processAndSortFiles(fileList: GitHubFile[]): ProcessedFile[] {
  return fileList
    .map((file) => {
      // Handle folder files (e.g., "xyz-folder")
      if (file.name.endsWith(CONSTANTS.FOLDER_SUFFIX)) {
        return {
          ...file,
          parsedDate: new Date(0), // Epoch date for folders
          relativeTime: '',
          displayName: file.name.replace(CONSTANTS.FOLDER_SUFFIX, ''),
          fileType: 'folder',
          folderName: CONSTANTS.ALL_FOLDER,
        } as ProcessedFile;
      }

      const parsedDate = parseDateFromFilename(file.name);
      const displayName = getDisplayName(file.name);
      // For notes without title (displayName is empty), check original filename for .post
      const fileType = displayName 
        ? getFileExtension(displayName) 
        : (file.name.endsWith(CONSTANTS.POST_EXTENSION) ? 'post' : '');
      const folderName = getFolderName(file.name);
      
      if (parsedDate) {
        return {
          ...file,
          parsedDate,
          relativeTime: getRelativeTime(parsedDate),
          displayName,
          fileType,
          folderName,
        } as ProcessedFile;
      }
      return null;
    })
    .filter((file): file is ProcessedFile => file !== null)
    .sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime());
}

/**
 * Get sorted folder objects by file count
 */
export function getSortedFolders(files: GitHubFile[]): Folder[] {
  const folderCounts: Record<string, number> = {};
  const folderObjects: Record<string, GitHubFile> = {};

  files.forEach((file) => {
    const parts = file.name.split(CONSTANTS.SEPARATOR);

    // Check if the file is of the first type: "abc_-_-xyz-folder_-_-fileName.ext"
    if (parts.length === 3) {
      const folderName = parts[1];
      folderCounts[folderName] = (folderCounts[folderName] || 0) + 1;
    }
    
    // Check if the file is of the second type (note without title): "abc_-_-xyz-folder.post"
    if (parts.length === 2 && parts[1].endsWith(CONSTANTS.POST_EXTENSION)) {
      const folderName = parts[1].replace(CONSTANTS.POST_EXTENSION, '');
      folderCounts[folderName] = (folderCounts[folderName] || 0) + 1;
    }

    // Check if the file is a folder marker: "xyz-folder"
    if (parts.length === 1 && file.name.includes(CONSTANTS.FOLDER_SUFFIX)) {
      folderObjects[file.name] = file;
    }
  });

  // Sort folders by file count
  return Object.keys(folderObjects)
    .sort((a, b) => (folderCounts[b] || 0) - (folderCounts[a] || 0))
    .map((folderName) => ({
      name: folderName,
      displayName: folderName.replace(CONSTANTS.FOLDER_SUFFIX, ''),
      fileCount: folderCounts[folderName] || 0,
      file: folderObjects[folderName],
    }));
}

/**
 * Filter file list for a specific folder
 */
export function filterFilesForFolder(
  globalFileList: ProcessedFile[],
  currentFolder: string
): ProcessedFile[] {
  if (currentFolder === CONSTANTS.ALL_FOLDER) {
    // Return all files, excluding logical folder files
    return globalFileList.filter(
      (file) => !file.name.endsWith(CONSTANTS.FOLDER_SUFFIX)
    );
  }

  return globalFileList.filter((file) => {
    // Skip folder marker files
    if (file.name.endsWith(CONSTANTS.FOLDER_SUFFIX)) {
      return false;
    }
    
    // Use the folderName property that was computed during processing
    return file.folderName === currentFolder;
  });
}

/**
 * Read file as base64
 */
export function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Generate unique filename if file exists
 */
export function generateUniqueFilename(
  filename: string,
  counter: number
): string {
  const parts = filename.split('.');
  const extension = parts.pop();
  const baseName = parts.join('.');
  return `${baseName}(${counter}).${extension}`;
}
