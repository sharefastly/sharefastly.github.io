// GitHub API Service

import type { GitHubFile, UploadResponse, DeleteResponse } from '../types';
import { CONFIG } from '../utils/constants';
import { decodeGitHubToken } from '../utils/tokenUtils';

const { github, api } = CONFIG;

/**
 * GitHub API wrapper class
 */
export const GitHubService = {
  /**
   * Get the API URL for the files directory
   */
  getBaseUrl(): string {
    return `${api.baseUrl}/repos/${github.username}/${github.repoName}/contents/${github.fileDirectory}`;
  },

  /**
   * Get authorization headers
   */
  getHeaders(): HeadersInit {
    return {
      Authorization: `token ${decodeGitHubToken()}`,
      Accept: api.acceptHeader,
      'Content-Type': 'application/json',
    };
  },

  /**
   * Fetch file list from GitHub repository
   */
  async fetchFileList(): Promise<GitHubFile[]> {
    const timestamp = new Date().getTime();
    const url = `${this.getBaseUrl()}?_=${timestamp}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...this.getHeaders(),
          'If-None-Match': '',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Received data is not an array');
      }

      return data;
    } catch (error) {
      console.error('Error fetching file list:', error);
      return [];
    }
  },

  /**
   * Upload file to GitHub repository with progress tracking
   */
  uploadFile(
    fileName: string,
    content: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    const url = `${this.getBaseUrl()}/${fileName}`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url, true);
      xhr.setRequestHeader('Authorization', `token ${decodeGitHubToken()}`);
      xhr.setRequestHeader('Content-Type', 'application/json');

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percentComplete = (event.loaded / event.total) * 100;
          onProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.response));
        } else {
          reject(new Error(`HTTP error! status: ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error occurred'));
      };

      const data = JSON.stringify({
        message: `Add ${fileName}`,
        content: content,
        branch: github.branch,
      });

      xhr.send(data);
    });
  },

  /**
   * Check if file exists in repository
   */
  async checkFileExists(fileName: string): Promise<boolean> {
    const url = `${this.getBaseUrl()}/${fileName}`;

    try {
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });
      return response.status !== 404;
    } catch (error) {
      console.error('Error checking file existence:', error);
      return false;
    }
  },

  /**
   * Delete file from GitHub repository
   */
  async deleteFile(fileName: string): Promise<DeleteResponse> {
    const url = `${this.getBaseUrl()}/${fileName}`;

    // First, get the SHA of the file
    const getFileResponse = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!getFileResponse.ok) {
      throw new Error(
        `Error fetching file: ${getFileResponse.status} ${getFileResponse.statusText}`
      );
    }

    const fileData = await getFileResponse.json();
    const fileSHA = fileData.sha;

    // Now delete the file
    const deleteResponse = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
      body: JSON.stringify({
        message: `Delete ${fileName}`,
        sha: fileSHA,
        branch: github.branch,
      }),
    });

    if (!deleteResponse.ok) {
      throw new Error(
        `Error deleting file: ${deleteResponse.status} ${deleteResponse.statusText}`
      );
    }

    return deleteResponse.json();
  },

  /**
   * Upload blank file (for folder creation)
   */
  async uploadBlankFile(fileName: string): Promise<UploadResponse> {
    const url = `${this.getBaseUrl()}/${fileName}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `token ${decodeGitHubToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Add ${fileName}`,
        content: btoa(''), // Empty content
        branch: github.branch,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Get preview URL for a file
   */
  getPreviewUrl(fileName: string): string {
    return `https://github.com/${github.username}/${github.repoName}/blob/${github.branch}/${github.fileDirectory}/${fileName}`;
  },

  /**
   * Download file via URL
   */
  async downloadFile(url: string, filename: string): Promise<void> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  },
};
