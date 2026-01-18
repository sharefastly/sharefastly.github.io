// FileCard component - displays individual file or folder

import { useState, useEffect } from 'react';
import type { ProcessedFile } from '../../types';
import { getFileIcon, getFileTypeLabel, getDisplayName, CONSTANTS } from '../../utils';
import { GitHubService } from '../../services';
import { Button, PreviewModal } from '../ui';

interface FileCardProps {
  file: ProcessedFile;
  showDelete?: boolean;
  onDelete?: (fileName: string) => void;
}

export function FileCard({ file, showDelete = false, onDelete }: FileCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [postContent, setPostContent] = useState<string | null>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [copied, setCopied] = useState(false);
  const isFolder = file.name.endsWith(CONSTANTS.FOLDER_SUFFIX);
  const isPost = file.fileType === 'post';
  const displayName = isFolder 
    ? file.name.replace(CONSTANTS.FOLDER_SUFFIX, '') 
    : getDisplayName(file.name);
  const fileIcon = isFolder ? '📁' : getFileIcon(file.fileType);
  const fileTypeLabel = isFolder ? 'FOLDER' : getFileTypeLabel(file.fileType);

  // Fetch post content for .post files
  useEffect(() => {
    if (isPost && !postContent && !isLoadingPost) {
      setIsLoadingPost(true);
      fetch(file.download_url)
        .then(res => res.text())
        .then(text => {
          setPostContent(text);
          setIsLoadingPost(false);
        })
        .catch(() => {
          setPostContent('Failed to load message');
          setIsLoadingPost(false);
        });
    }
  }, [isPost, file.download_url, postContent, isLoadingPost]);

  const handleDownload = async () => {
    try {
      await GitHubService.downloadFile(file.download_url, displayName);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(file.name);
    }
  };

  const handleCopyPost = async () => {
    if (postContent) {
      try {
        await navigator.clipboard.writeText(postContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  // Render note card - distinctive postcard style
  if (isPost) {
    // Strip .post extension from display name
    const noteTitle = displayName ? displayName.replace(/\.post$/i, '') : '';
    
    return (
      <>
        {showPreview && (
          <PreviewModal file={file} onClose={() => setShowPreview(false)} />
        )}
        
        <div className="group bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-5 shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 flex flex-col h-full relative overflow-hidden">
          {/* Note badge */}
          <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-bl-lg">
            📝 NOTE
          </div>
          
          {/* Header */}
          <div className="flex items-start gap-4 mb-4 flex-1 mt-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-amber-900 text-lg leading-tight truncate">
                  {noteTitle || 'Note'}
                </h3>
                <span className="text-sm text-amber-700 shrink-0">
                  • {file.relativeTime}
                </span>
              </div>
              {/* Note content preview - 2 lines */}
              <div className="mt-2">
                {isLoadingPost ? (
                  <p className="text-amber-700 italic text-sm">Loading...</p>
                ) : (
                  <p 
                    className="text-amber-800 text-sm leading-relaxed"
                    style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                  >
                    {postContent}
                  </p>
                )}
              </div>
            </div>

            {/* Copy button */}
            {postContent && (
              <button
                onClick={handleCopyPost}
                className={`shrink-0 p-2 rounded-lg transition-all ${
                  copied 
                    ? 'bg-green-100 text-green-600' 
                    : 'hover:bg-amber-100 text-amber-700'
                }`}
                title={copied ? 'Copied!' : 'Copy content'}
              >
                {copied ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            )}
          </div>
          
          {/* Actions - fixed at bottom */}
          <div className="flex gap-3 flex-wrap mt-auto">
            <button
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View
            </button>
            
            {showDelete && (
              <Button variant="danger" size="md" onClick={handleDelete}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </Button>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Preview Modal - rendered at top level */}
      {showPreview && (
        <PreviewModal file={file} onClose={() => setShowPreview(false)} />
      )}

      <div className="group bg-white border border-[#1A3D64]/20 rounded-xl p-5 shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 flex flex-col h-full">
        {/* File Info Section */}
        <div className="flex items-start gap-4 mb-4 flex-1">
          {/* Icon */}
          <div className={`shrink-0 w-16 h-16 rounded-lg flex flex-col items-center justify-center border ${
            isPost 
              ? 'bg-[#dcf8c6] border-[#075e54]/20' 
              : 'bg-[#F4F4F4] border-[#1A3D64]/10'
          }`}>
            <span className="text-3xl">{fileIcon}</span>
            <span className={`text-[10px] font-bold uppercase tracking-wide ${
              isPost ? 'text-[#075e54]' : 'text-[#1D546C]'
            }`}>
              {fileTypeLabel}
            </span>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <h3 
              className="font-semibold text-[#0C2B4E] text-lg leading-tight mb-1"
              style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              {displayName}
            </h3>
            <p className="text-sm text-[#1A3D64]">
              • {file.relativeTime}
            </p>
          </div>
        </div>

        {/* Actions - fixed at bottom */}
        <div className="flex gap-3 flex-wrap mt-auto">
          {!isFolder && (
            <button
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0C2B4E] hover:bg-[#1A3D64] text-white font-semibold text-sm rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              Preview
            </button>
          )}

          {showDelete ? (
            <Button variant="danger" size="md" onClick={handleDelete}>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete {isFolder ? 'Folder' : ''}
            </Button>
          ) : !isFolder ? (
            <Button variant="success" size="md" onClick={handleDownload}>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download
            </Button>
          ) : null}
        </div>
      </div>
    </>
  );
}
