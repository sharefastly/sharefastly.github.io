// PreviewModal component - fullscreen file preview

import { useState, useEffect } from 'react';
import type { ProcessedFile } from '../../types';
import { getDisplayName} from '../../utils';
import { Spinner } from './Spinner';

interface PreviewModalProps {
  file: ProcessedFile | null;
  onClose: () => void;
}

// File types that can be previewed
const IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
const VIDEO_TYPES = ['mp4', 'webm', 'ogg', 'mov'];
const AUDIO_TYPES = ['mp3', 'wav', 'ogg', 'aac', 'm4a'];
const TEXT_TYPES = ['txt', 'json', 'md', 'csv', 'xml', 'html', 'css', 'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'h', 'hpp', 'sh', 'bash', 'yml', 'yaml', 'toml', 'ini', 'cfg', 'conf', 'log', 'sql', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'scala', 'r', 'pl', 'lua', 'dart', 'vue', 'svelte'];
const PDF_TYPES = ['pdf'];
const POST_TYPES = ['post'];

type PreviewType = 'image' | 'video' | 'audio' | 'text' | 'pdf' | 'post' | 'unsupported';

function getPreviewType(fileType: string): PreviewType {
  const ext = fileType.toLowerCase();
  if (POST_TYPES.includes(ext)) return 'post';
  if (IMAGE_TYPES.includes(ext)) return 'image';
  if (VIDEO_TYPES.includes(ext)) return 'video';
  if (AUDIO_TYPES.includes(ext)) return 'audio';
  if (TEXT_TYPES.includes(ext)) return 'text';
  if (PDF_TYPES.includes(ext)) return 'pdf';
  return 'unsupported';
}

export function PreviewModal({ file, onClose }: PreviewModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [textContent, setTextContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!file) return null;

  const displayName = getDisplayName(file.name);
  const previewType = getPreviewType(file.fileType);
  const rawUrl = file.download_url;

  // Fetch text content for text files and posts
  useEffect(() => {
    if ((previewType === 'text' || previewType === 'post') && file) {
      setIsLoading(true);
      setError(null);
      
      fetch(rawUrl)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch file');
          return res.text();
        })
        .then(text => {
          setTextContent(text);
          setIsLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [file, previewType, rawUrl]);

  // Handle escape key and browser back
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    // Push state for back button support
    window.history.pushState({ preview: true }, '');
    
    const handlePopState = () => {
      onClose();
    };
    
    window.addEventListener('keydown', handleEscape);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onClose]);

  const handleClose = () => {
    window.history.back();
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-100 flex flex-col">
      {/* Header - Mobile responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-white border-b border-gray-200 shadow-sm gap-3">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Back button */}
          <button
            onClick={handleClose}
            className="flex items-center gap-1 sm:gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </button>
          
          {/* File name */}
          <h2 className="font-semibold text-gray-800 truncate max-w-[150px] sm:max-w-md text-sm sm:text-base">
            {displayName || 'Untitled Note'}
          </h2>
          
          {/* File type badge */}
          <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs font-bold uppercase rounded">
            {file.fileType === 'post' ? 'NOTE' : file.fileType}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Copy button for text files and posts */}
          {(previewType === 'text' || previewType === 'post') && textContent && (
            <button
              onClick={handleCopyText}
              className={`flex items-center gap-1 sm:gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                copied 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="hidden sm:inline">Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>
          )}
          
          {/* Download button */}
          <a
            href={rawUrl}
            download={displayName}
            className="flex items-center gap-1 sm:gap-2 px-3 py-2 bg-[#0C2B4E] hover:bg-[#1A3D64] text-white rounded-lg transition-colors text-sm"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden sm:inline">Download</span>
          </a>
        </div>
      </div>

      {/* Content - Full screen */}
      <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-100 relative">
        {/* Loading - for text/post types only (they handle loading differently) */}
        {isLoading && (previewType === 'text' || previewType === 'post') && (
          <div className="flex flex-col items-center gap-4">
            <Spinner size="xl" className="border-[#0C2B4E] border-t-transparent" />
            <p className="text-gray-600">Loading preview...</p>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="flex flex-col items-center gap-4 text-center p-4 sm:p-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-3xl sm:text-4xl">⚠️</span>
            </div>
            <p className="text-red-600 text-base sm:text-lg">{error}</p>
            <a
              href={rawUrl}
              download={displayName}
              className="mt-4 inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[#0C2B4E] text-white font-semibold rounded-lg hover:bg-[#1A3D64] transition-colors text-sm sm:text-base"
            >
              Download Instead
            </a>
          </div>
        )}

        {/* Image Preview - Full screen */}
        {previewType === 'image' && !error && (
          <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 bg-gray-200">
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200 z-10">
                <Spinner size="xl" className="border-[#0C2B4E] border-t-transparent" />
                <p className="text-gray-600 mt-4">Loading image...</p>
              </div>
            )}
            <img
              src={rawUrl}
              alt={displayName}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setError('Failed to load image');
              }}
              style={{ display: isLoading ? 'none' : 'block' }}
            />
          </div>
        )}

        {/* Video Preview */}
        {previewType === 'video' && !error && (
          <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 bg-black relative">
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
                <Spinner size="xl" className="border-white border-t-transparent" />
                <p className="text-white/70 mt-4">Loading video...</p>
              </div>
            )}
            <video
              src={rawUrl}
              controls
              autoPlay
              className="max-w-full max-h-full rounded-lg"
              onLoadedData={() => setIsLoading(false)}
              style={{ display: isLoading ? 'none' : 'block' }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* Audio Preview */}
        {previewType === 'audio' && !error && (
          <div className="flex flex-col items-center gap-4 sm:gap-6 p-4 sm:p-8 bg-gradient-to-br from-purple-50 to-blue-50 w-full h-full justify-center relative">
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 z-10">
                <Spinner size="xl" className="border-[#0C2B4E] border-t-transparent" />
                <p className="text-gray-600 mt-4">Loading audio...</p>
              </div>
            )}
            <div className="w-24 h-24 sm:w-40 sm:h-40 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <span className="text-4xl sm:text-6xl">🎵</span>
            </div>
            <p className="text-gray-800 text-lg sm:text-xl font-medium text-center px-4">{displayName}</p>
            <audio
              src={rawUrl}
              controls
              autoPlay
              className="w-full max-w-lg"
              onLoadedData={() => setIsLoading(false)}
            >
              Your browser does not support the audio tag.
            </audio>
          </div>
        )}

        {/* Text/Code Preview - Full screen with light background */}
        {previewType === 'text' && !isLoading && !error && (
          <div className="w-full h-full p-2 sm:p-4 bg-gray-50">
            <div className="relative h-full bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              {/* Line numbers + Code */}
              <div className="h-full overflow-auto">
                <pre className="p-3 sm:p-4 text-xs sm:text-sm font-mono leading-relaxed">
                  <code className="text-gray-800 whitespace-pre-wrap break-words">
                    {textContent.split('\n').map((line, i) => (
                      <div key={i} className="flex hover:bg-gray-50">
                        <span className="select-none text-gray-400 w-8 sm:w-12 pr-2 sm:pr-4 text-right flex-shrink-0 text-xs sm:text-sm">
                          {i + 1}
                        </span>
                        <span className="flex-1">{line || ' '}</span>
                      </div>
                    ))}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Note Preview - Clean readable style */}
        {previewType === 'post' && !isLoading && !error && (
          <div className="w-full h-full p-2 sm:p-6 bg-amber-50 overflow-auto">
            <div className="max-w-3xl mx-auto">
              {/* Note header */}
              {displayName && (
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 pb-3 border-b border-amber-200">
                  {displayName.replace(/\.post$/i, '')}
                </h1>
              )}
              {/* Note content */}
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-amber-200">
                <p className="text-gray-700 text-base sm:text-lg whitespace-pre-wrap break-words leading-relaxed">
                  {textContent}
                </p>
              </div>
              {/* Note footer */}
              <div className="mt-4 text-center text-amber-600 text-sm">
                📝 Note · {textContent.length} characters
              </div>
            </div>
          </div>
        )}

        {/* PDF Preview - Use Google Docs Viewer */}
        {previewType === 'pdf' && !error && (
          <div className="w-full h-full p-2 sm:p-4 bg-gray-200 relative">
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200 z-10">
                <Spinner size="xl" className="border-[#0C2B4E] border-t-transparent" />
                <p className="text-gray-600 mt-4">Loading PDF...</p>
              </div>
            )}
            <iframe
              src={`https://docs.google.com/viewerng/viewer?url=${encodeURIComponent(rawUrl)}&embedded=true`}
              className="w-full h-full rounded-xl border border-gray-300 bg-white"
              title={displayName}
              onLoad={() => setIsLoading(false)}
            />
          </div>
        )}

        {/* Unsupported Preview */}
        {previewType === 'unsupported' && !isLoading && (
          <div className="flex flex-col items-center gap-4 sm:gap-6 p-4 sm:p-8 text-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-4xl sm:text-6xl">📄</span>
            </div>
            <p className="text-gray-800 text-lg sm:text-xl font-medium">Preview not available</p>
            <p className="text-gray-500 text-sm sm:text-base">File type: .{file.fileType.toUpperCase()}</p>
            <a
              href={rawUrl}
              download={displayName}
              className="mt-4 inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#0C2B4E] text-white font-bold rounded-xl hover:bg-[#1A3D64] transition-colors shadow-lg text-sm sm:text-base"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download File
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
