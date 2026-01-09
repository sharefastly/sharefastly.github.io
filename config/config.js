// Configuration constants
// Token is obfuscated but should be moved to environment variables in production
const ascii_codes = [103, 104, 112, 95, 116, 86, 88, 104, 75, 87, 84, 77, 105, 82, 57, 54, 109, 57, 102, 111, 76, 73, 50, 73, 90, 74, 104, 115, 51, 55, 89, 84, 84, 102, 50, 70, 75, 57, 90, 49];
const token = ascii_codes.map((code) => String.fromCharCode(code)).join("");

const CONFIG = {
  github: {
    username: "sharefastly",
    repoName: "data",
    fileDirectory: "files",
    branch: "main",
    token: token
  },
  api: {
    baseUrl: "https://api.github.com",
    acceptHeader: "application/vnd.github.v3+json"
  },
  security: {
    deletePassword: "hello12345" // Should be moved to environment variable
  }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} else {
  window.CONFIG = CONFIG;
}

