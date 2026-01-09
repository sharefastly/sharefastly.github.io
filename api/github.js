// GitHub API wrapper
const GitHubAPI = {
  /**
   * Fetch file list from GitHub repository
   * @returns {Promise<Array>} Array of file objects
   */
  fetchFileList: async function() {
    const timestamp = new Date().getTime();
    const apiUrl = `${CONFIG.api.baseUrl}/repos/${CONFIG.github.username}/${CONFIG.github.repoName}/contents/${CONFIG.github.fileDirectory}?timestamp=${timestamp}`;

    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `token ${CONFIG.github.token}`,
          Accept: CONFIG.api.acceptHeader,
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
      LOGGER.error("Error fetching file list:", error);
      return [];
    }
  },

  /**
   * Upload file to GitHub repository
   * @param {string} fileName - Name of the file
   * @param {string} content - Base64 encoded content
   * @param {Function} progressCallback - Progress callback function
   * @returns {Promise} Upload response
   */
  uploadFile: function(fileName, content, progressCallback) {
    const apiUrl = `${CONFIG.api.baseUrl}/repos/${CONFIG.github.username}/${CONFIG.github.repoName}/contents/${CONFIG.github.fileDirectory}/${fileName}`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", apiUrl, true);
      xhr.setRequestHeader("Authorization", `token ${CONFIG.github.token}`);
      xhr.setRequestHeader("Content-Type", "application/json");

      xhr.upload.onprogress = function (event) {
        if (event.lengthComputable && progressCallback) {
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
        branch: CONFIG.github.branch,
      });

      xhr.send(data);
    });
  },

  /**
   * Check if file exists in repository
   * @param {string} fileName - Name of the file
   * @returns {Promise<boolean>} True if file exists
   */
  checkFileExists: async function(fileName) {
    const apiUrl = `${CONFIG.api.baseUrl}/repos/${CONFIG.github.username}/${CONFIG.github.repoName}/contents/${CONFIG.github.fileDirectory}/${fileName}`;
    
    try {
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `token ${CONFIG.github.token}`,
          Accept: CONFIG.api.acceptHeader,
        },
      });
      return response.status !== 404;
    } catch (error) {
      LOGGER.error("Error checking file existence:", error);
      return false;
    }
  },

  /**
   * Delete file from GitHub repository
   * @param {string} fileName - Name of the file to delete
   * @returns {Promise} Delete response
   */
  deleteFile: async function(fileName) {
    const apiUrl = `${CONFIG.api.baseUrl}/repos/${CONFIG.github.username}/${CONFIG.github.repoName}/contents/${CONFIG.github.fileDirectory}/${fileName}`;

    try {
      // First, get the SHA of the file to delete
      const getFileResponse = await fetch(apiUrl, {
        headers: {
          Authorization: `token ${CONFIG.github.token}`,
          Accept: CONFIG.api.acceptHeader,
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
          Authorization: `token ${CONFIG.github.token}`,
          Accept: CONFIG.api.acceptHeader,
        },
        body: JSON.stringify({
          message: "Delete file",
          sha: fileSHA,
          branch: CONFIG.github.branch,
        }),
      });

      if (!deleteResponse.ok) {
        throw new Error(
          `Error deleting file: ${deleteResponse.status} ${deleteResponse.statusText}`
        );
      }

      return await deleteResponse.json();
    } catch (error) {
      LOGGER.error("Error deleting file:", error);
      throw error;
    }
  },

  /**
   * Upload blank file (for folder creation)
   * @param {string} fileName - Name of the file
   * @returns {Promise} Upload response
   */
  uploadBlankFile: async function(fileName) {
    const apiUrl = `${CONFIG.api.baseUrl}/repos/${CONFIG.github.username}/${CONFIG.github.repoName}/contents/${CONFIG.github.fileDirectory}/${fileName}`;
    const content = "";

    try {
      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${CONFIG.github.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Add ${fileName}`,
          content: btoa(content),
          branch: CONFIG.github.branch,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      LOGGER.error("Error uploading blank file:", error);
      throw error;
    }
  },

  /**
   * Get preview URL for a file
   * @param {string} fileName - Name of the file
   * @returns {string} Preview URL
   */
  getPreviewUrl: function(fileName) {
    return `https://github.com/${CONFIG.github.username}/${CONFIG.github.repoName}/blob/${CONFIG.github.branch}/${CONFIG.github.fileDirectory}/${fileName}`;
  }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GitHubAPI;
} else {
  window.GitHubAPI = GitHubAPI;
}

