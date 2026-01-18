// TextNote component - create and upload text content as a note

import { useState } from 'react';
import { useApp } from '../../context';
import { GitHubService } from '../../services';
import { CONSTANTS, getCurrentDateTime } from '../../utils';
import { Button, OverlaySpinner } from '../ui';

interface TextNoteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TextNote({ isOpen, onClose }: TextNoteProps) {
  const { state, refreshFiles } = useApp();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError('Please enter some content');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const timestamp = getCurrentDateTime();
      const currentFolder = state.currentFolder;
      // Title is optional
      const sanitizedTitle = title.trim() 
        ? title.trim().replace(/[^a-zA-Z0-9-_\s]/g, '') 
        : '';
      // Use .post extension (keeping file extension for compatibility)
      const fileName = sanitizedTitle
        ? `${timestamp}${CONSTANTS.SEPARATOR}${currentFolder}${CONSTANTS.SEPARATOR}${sanitizedTitle}${CONSTANTS.POST_EXTENSION}`
        : `${timestamp}${CONSTANTS.SEPARATOR}${currentFolder}${CONSTANTS.POST_EXTENSION}`;
      
      // Convert text to base64
      const base64Content = btoa(unescape(encodeURIComponent(content)));
      
      await GitHubService.uploadFile(fileName, base64Content);
      
      // Success - reset and close
      setTitle('');
      setContent('');
      onClose();
      
      // Delay to ensure GitHub API has updated before refreshing
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refreshFiles();
    } catch (err) {
      console.error('Failed to create note:', err);
      setError('Failed to upload. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      onClose();
      setError(null);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {isUploading && <OverlaySpinner message="Creating note..." />}
      
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* Modal Content */}
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#1A3D64]/20 bg-[#F4F4F4]">
            <h2 className="text-xl font-bold text-[#0C2B4E]">New Note</h2>
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="p-2 rounded-lg hover:bg-[#1A3D64]/10 text-[#1A3D64] transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[#0C2B4E] mb-1">
                Title <span className="text-[#1A3D64] font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a title..."
                className="w-full px-4 py-2.5 border border-[#1A3D64]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C2B4E] focus:border-transparent text-[#0C2B4E]"
                disabled={isUploading}
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-[#0C2B4E] mb-1">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your note here..."
                rows={10}
                className="w-full px-4 py-3 border border-[#1A3D64]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C2B4E] focus:border-transparent text-[#0C2B4E] resize-none"
                disabled={isUploading}
              />
              <p className="text-xs text-[#1A3D64] mt-1">
                {content.length} characters
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-[#1A3D64]/20 bg-[#F4F4F4]">
            <p className="text-sm text-[#1A3D64]">
              Saving to: <span className="font-medium">
                {state.currentFolder === CONSTANTS.ALL_FOLDER 
                  ? 'ALL' 
                  : state.currentFolder.replace(CONSTANTS.FOLDER_SUFFIX, '')}
              </span>
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isUploading || !content.trim()}
                isLoading={isUploading}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Note
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
