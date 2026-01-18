// Token utilities

/**
 * Decode GitHub token from ASCII codes
 */
export function decodeGitHubToken(): string {
  const asciiString = import.meta.env.VITE_GITHUB_TOKEN_ASCII;
  if (!asciiString) {
    return '';
  }
  const codes: number[] = asciiString.split(',').map((code: string) => parseInt(code.trim(), 10));
  return String.fromCharCode(...codes);
}