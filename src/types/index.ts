// TypeScript interfaces for the application

export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  // Parsed fields (added after processing)
  parsedDate?: Date;
  relativeTime?: string;
}

export interface ProcessedFile extends GitHubFile {
  parsedDate: Date;
  relativeTime: string;
  displayName: string;
  fileType: string;
  folderName: string;
}

export interface Folder {
  name: string;
  displayName: string;
  fileCount: number;
  file?: GitHubFile;
}

export interface AppState {
  globalFileList: ProcessedFile[];
  currentFileList: ProcessedFile[];
  folders: Folder[];
  currentFolder: string;
  isLoading: boolean;
  hasFetched: boolean;
  error: string | null;
}

export type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_GLOBAL_FILE_LIST'; payload: ProcessedFile[] }
  | { type: 'SET_CURRENT_FOLDER'; payload: string }
  | { type: 'SET_FOLDERS'; payload: Folder[] }
  | { type: 'REFRESH_CURRENT_LIST' };

export interface UploadState {
  selectedFiles: File[];
  isUploading: boolean;
  progress: number;
  currentFileIndex: number;
}

export interface GitHubConfig {
  username: string;
  repoName: string;
  fileDirectory: string;
  branch: string;
  token: string;
}

export interface UploadResponse {
  content: {
    name: string;
    path: string;
    sha: string;
    size: number;
    url: string;
    html_url: string;
    git_url: string;
    download_url: string;
    type: string;
  };
  commit: {
    sha: string;
    url: string;
    message: string;
  };
}

export interface DeleteResponse {
  content: null;
  commit: {
    sha: string;
    url: string;
    message: string;
  };
}
