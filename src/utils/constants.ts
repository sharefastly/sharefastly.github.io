// Application constants

import { decodeGitHubToken } from './tokenUtils';

export const CONSTANTS = {
  SEPARATOR: '_-_-',
  FOLDER_SUFFIX: '-folder',
  ALL_FOLDER: 'ALL-folder',
  POST_EXTENSION: '.post',
  // Pattern matches: MM-HH-DD-MM-YYYY at start of filename
  FILE_NAME_PATTERN: /^(\d{2})-(\d{2})-(\d{2})-(\d{2})-(\d{4})_-_-/,
  UNKNOWN_DATE: 'Unknown date',
  DEFAULT_SENDER: 'PDA Unofficial',
} as const;

export const CONFIG = {
  github: {
    username: import.meta.env.VITE_GITHUB_USERNAME || '',
    repoName: import.meta.env.VITE_GITHUB_REPO_NAME || '',
    fileDirectory: import.meta.env.VITE_GITHUB_FILE_DIRECTORY || 'files',
    branch: import.meta.env.VITE_GITHUB_BRANCH || 'main',
    token: decodeGitHubToken(),
  },
  api: {
    baseUrl: 'https://api.github.com',
    acceptHeader: 'application/vnd.github.v3+json',
  },
  security: {
    deletePassword: import.meta.env.VITE_DELETE_PASSWORD || '',
  },
} as const;

// File type to icon mapping (using emoji for simplicity, can switch to react-icons)
export const FILE_ICONS: Record<string, string> = {
  // Documents
  pdf: '📄',
  doc: '📝',
  docx: '📝',
  txt: '📃',
  rtf: '📃',
  // Spreadsheets
  xls: '📊',
  xlsx: '📊',
  csv: '📊',
  // Presentations
  ppt: '📽️',
  pptx: '📽️',
  // Images
  jpg: '🖼️',
  jpeg: '🖼️',
  png: '🖼️',
  gif: '🖼️',
  bmp: '🖼️',
  tiff: '🖼️',
  webp: '🖼️',
  svg: '🖼️',
  // Audio
  mp3: '🎵',
  wav: '🎵',
  ogg: '🎵',
  m4a: '🎵',
  // Video
  mp4: '🎬',
  avi: '🎬',
  mov: '🎬',
  wmv: '🎬',
  webm: '🎬',
  // Archives
  zip: '📦',
  rar: '📦',
  '7z': '📦',
  tar: '📦',
  gz: '📦',
  // Code
  html: '💻',
  css: '💻',
  js: '💻',
  ts: '💻',
  jsx: '💻',
  tsx: '💻',
  py: '💻',
  java: '💻',
  c: '💻',
  cpp: '💻',
  // Academic
  tex: '📐',
  bib: '📐',
  // Ebooks
  epub: '📚',
  mobi: '📚',
  // CAD
  dwg: '📏',
  dxf: '📏',
  stl: '📏',
  // Data
  sav: '📈',
  sas: '📈',
  stata: '📈',
  json: '📋',
  xml: '📋',
};

export const FILE_TYPE_LABELS: Record<string, string> = {
  pdf: 'PDF',
  doc: 'DOC',
  docx: 'DOC',
  txt: 'TXT',
  rtf: 'RTF',
  xls: 'XLS',
  xlsx: 'XLS',
  csv: 'CSV',
  ppt: 'PPT',
  pptx: 'PPT',
  jpg: 'IMG',
  jpeg: 'IMG',
  png: 'IMG',
  gif: 'GIF',
  bmp: 'IMG',
  tiff: 'IMG',
  webp: 'IMG',
  svg: 'SVG',
  mp3: 'AUD',
  wav: 'AUD',
  ogg: 'AUD',
  m4a: 'AUD',
  mp4: 'VID',
  avi: 'VID',
  mov: 'VID',
  wmv: 'VID',
  webm: 'VID',
  zip: 'ZIP',
  rar: 'RAR',
  '7z': 'ZIP',
  html: 'CODE',
  css: 'CODE',
  js: 'CODE',
  ts: 'CODE',
  py: 'CODE',
  java: 'CODE',
  tex: 'TEX',
  bib: 'TEX',
  epub: 'BOOK',
  mobi: 'BOOK',
  json: 'JSON',
  xml: 'XML',
};
