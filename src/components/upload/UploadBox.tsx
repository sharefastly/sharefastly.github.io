// UploadBox component - file upload with progress

import { useState, useRef, useCallback } from 'react';
import { useApp } from '../../context';
import { GitHubService } from '../../services';
import { CONSTANTS, getCurrentDateTime, readFileAsBase64 } from '../../utils';
import { Button } from '../ui';
import { TextNote } from './TextPost';

interface SelectedFile {
  file: File;
  customName: string;
}

interface FileUploadStatus {
  name: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'retrying';
  retryCount: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

export function UploadBox() {
  const { state, refreshFiles } = useApp();
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatuses, setUploadStatuses] = useState<FileUploadStatus[]>([]);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [uploadFolder, setUploadFolder] = useState<string>(state.currentFolder);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update uploadFolder when currentFolder changes (only if no files selected)
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        const newFiles = Array.from(files).map((file) => ({
          file,
          customName: file.name.split('.').slice(0, -1).join('.'),
        }));
        setSelectedFiles(newFiles);
        setUploadFolder(state.currentFolder); // Set default to current folder
      }
    },
    [state.currentFolder]
  );

  const handleNameChange = useCallback((index: number, newName: string) => {
    setSelectedFiles((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, customName: newName } : item
      )
    );
  }, []);

  const handleButtonClick = () => {
    if (selectedFiles.length === 0) {
      fileInputRef.current?.click();
    } else {
      uploadFiles();
    }
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    
    // Initialize upload statuses
    const initialStatuses: FileUploadStatus[] = selectedFiles.map(({ customName, file }) => ({
      name: `${customName}.${file.name.split('.').pop()}`,
      progress: 0,
      status: 'pending',
      retryCount: 0,
    }));
    setUploadStatuses(initialStatuses);

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Helper to upload a single file with retries
    const uploadWithRetry = async (
      fileName: string,
      content: string,
      index: number
    ): Promise<boolean> => {
      let retryCount = 0;
      
      while (retryCount <= MAX_RETRIES) {
        try {
          // Mark as uploading or retrying
          setUploadStatuses(prev => prev.map((s, i) => 
            i === index ? { 
              ...s, 
              status: retryCount > 0 ? 'retrying' : 'uploading',
              progress: 0,
              retryCount 
            } : s
          ));
          
          await GitHubService.uploadFile(fileName, content, (fileProgress) => {
            setUploadStatuses(prev => prev.map((s, i) => 
              i === index ? { ...s, progress: fileProgress } : s
            ));
          });
          
          // Success
          setUploadStatuses(prev => prev.map((s, i) => 
            i === index ? { ...s, progress: 100, status: 'completed' } : s
          ));
          return true;
          
        } catch (error) {
          retryCount++;
          
          if (retryCount <= MAX_RETRIES) {
            // Show retrying status with countdown
            setUploadStatuses(prev => prev.map((s, i) => 
              i === index ? { 
                ...s, 
                status: 'retrying', 
                progress: 0,
                retryCount 
              } : s
            ));
            
            // Wait with exponential backoff
            await delay(RETRY_DELAY * retryCount);
          } else {
            // Max retries reached
            setUploadStatuses(prev => prev.map((s, i) => 
              i === index ? { ...s, status: 'error', retryCount: MAX_RETRIES } : s
            ));
            return false;
          }
        }
      }
      return false;
    };

    try {
      // Prepare all files first (parallel file reading)
      const preparedFiles = await Promise.all(
        selectedFiles.map(async ({ file, customName }, index) => {
          const extension = file.name.split('.').pop();
          const timestamp = getCurrentDateTime();
          const targetFolder = uploadFolder;
          const fileName = `${timestamp}${CONSTANTS.SEPARATOR}${targetFolder}${CONSTANTS.SEPARATOR}${customName}.${extension}`;
          const content = await readFileAsBase64(file);
          return { fileName, content, index };
        })
      );

      // Upload with concurrency limit
      const CONCURRENT_LIMIT = 3;
      const results: boolean[] = [];
      
      // Process in batches
      for (let i = 0; i < preparedFiles.length; i += CONCURRENT_LIMIT) {
        const batch = preparedFiles.slice(i, i + CONCURRENT_LIMIT);
        const batchResults = await Promise.all(
          batch.map(({ fileName, content, index }) => 
            uploadWithRetry(fileName, content, index)
          )
        );
        results.push(...batchResults);
      }

      // Clear selection and refresh file list
      setSelectedFiles([]);
      
      // Delay to ensure GitHub API has updated before refreshing
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refreshFiles();
      
      setTimeout(() => {
        setUploadStatuses([]);
      }, 1500);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white border border-[#1A3D64]/20 rounded-b-2xl mx-auto mb-8 p-6 w-[90%] max-w-3xl shadow-xl">
      <h1 className="text-center text-2xl sm:text-3xl font-bold mb-6 text-[#0C2B4E]">
        Upload Your Files
      </h1>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        aria-label="File input"
      />

      {/* Selected files list */}
      {selectedFiles.length > 0 && !isUploading && (
        <div className="space-y-3 mb-4">
          {selectedFiles.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-[#F4F4F4] rounded-lg border border-[#1A3D64]/20"
            >
              <span className="text-[#1A3D64] text-sm">
                {index + 1}.
              </span>
              <input
                type="text"
                value={item.customName}
                onChange={(e) => handleNameChange(index, e.target.value)}
                onFocus={(e) => e.target.select()}
                className="flex-1 bg-transparent border-none outline-none text-[#0C2B4E] font-medium"
                placeholder="File name"
              />
              <span className="text-[#1D546C] text-sm">
                .{item.file.name.split('.').pop()}
              </span>
            </div>
          ))}
          
          {/* Folder Selection Dropdown */}
          <div className="flex items-center gap-3 p-3 bg-[#0C2B4E]/5 rounded-lg border border-[#1A3D64]/20">
            <span className="text-[#0C2B4E] font-medium text-sm">📁 Upload to:</span>
            <select
              value={uploadFolder}
              onChange={(e) => setUploadFolder(e.target.value)}
              className="flex-1 bg-white border border-[#1A3D64]/30 rounded-lg px-3 py-2 text-[#0C2B4E] font-medium focus:outline-none focus:ring-2 focus:ring-[#0C2B4E] focus:border-transparent"
            >
              <option value={CONSTANTS.ALL_FOLDER}>ALL</option>
              {state.folders.map((folder) => (
                <option key={folder.name} value={folder.name}>
                  {folder.displayName}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Upload progress for each file */}
      {isUploading && uploadStatuses.length > 0 && (
        <div className="space-y-3 mb-4">
          {uploadStatuses.map((fileStatus, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-lg border transition-all duration-300 ${
                fileStatus.status === 'completed'
                  ? 'border-green-500 bg-green-50'
                  : fileStatus.status === 'error'
                  ? 'border-red-500 bg-red-50'
                  : fileStatus.status === 'retrying'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-[#1A3D64]/20 bg-white'
              }`}
            >
              {/* Progress bar background */}
              <div
                className={`absolute inset-0 transition-all duration-300 ease-out ${
                  fileStatus.status === 'completed'
                    ? 'bg-green-100'
                    : fileStatus.status === 'uploading'
                    ? 'bg-[#0C2B4E]/10'
                    : fileStatus.status === 'retrying'
                    ? 'bg-orange-100'
                    : 'bg-transparent'
                }`}
                style={{ width: `${fileStatus.progress}%` }}
              />
              
              {/* Content */}
              <div className="relative flex items-center gap-3 p-3">
                {/* Status icon */}
                <div className="w-6 h-6 flex items-center justify-center">
                  {fileStatus.status === 'pending' && (
                    <span className="text-[#1A3D64]">⏳</span>
                  )}
                  {fileStatus.status === 'uploading' && (
                    <div className="w-5 h-5 border-2 border-[#0C2B4E] border-t-transparent rounded-full animate-spin" />
                  )}
                  {fileStatus.status === 'retrying' && (
                    <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  )}
                  {fileStatus.status === 'completed' && (
                    <span className="text-green-600 text-lg">✓</span>
                  )}
                  {fileStatus.status === 'error' && (
                    <span className="text-red-600 text-lg">✗</span>
                  )}
                </div>
                
                {/* File name */}
                <div className="flex-1 min-w-0">
                  <span className={`font-medium truncate block ${
                    fileStatus.status === 'completed'
                      ? 'text-green-700'
                      : fileStatus.status === 'error'
                      ? 'text-red-700'
                      : fileStatus.status === 'retrying'
                      ? 'text-orange-700'
                      : 'text-[#0C2B4E]'
                  }`}>
                    {fileStatus.name}
                  </span>
                  {fileStatus.retryCount > 0 && fileStatus.status !== 'completed' && (
                    <span className="text-xs text-orange-600">
                      Retry {fileStatus.retryCount}/{MAX_RETRIES}
                    </span>
                  )}
                </div>
                
                {/* Progress percentage */}
                <span className={`text-sm font-semibold min-w-[60px] text-right ${
                  fileStatus.status === 'completed'
                    ? 'text-green-600'
                    : fileStatus.status === 'error'
                    ? 'text-red-600'
                    : fileStatus.status === 'retrying'
                    ? 'text-orange-600'
                    : 'text-[#1A3D64]'
                }`}>
                  {fileStatus.status === 'completed' ? 'Done' : 
                   fileStatus.status === 'error' ? 'Failed' :
                   fileStatus.status === 'retrying' ? 'Retrying...' :
                   `${Math.round(fileStatus.progress)}%`}
                </span>
              </div>
            </div>
          ))}
          
          {/* Overall progress summary */}
          <div className="flex flex-col items-center gap-1 text-sm pt-2">
            <div className="flex items-center gap-2 text-[#1A3D64]">
              <div className="w-4 h-4 border-2 border-[#0C2B4E] border-t-transparent rounded-full animate-spin" />
              <span>
                {uploadStatuses.filter(s => s.status === 'completed').length} of {uploadStatuses.length} files uploaded
              </span>
            </div>
            {uploadStatuses.some(s => s.status === 'retrying') && (
              <span className="text-orange-600 text-xs">
                Retrying failed uploads...
              </span>
            )}
            {uploadStatuses.some(s => s.status === 'error') && (
              <span className="text-red-600 text-xs">
                {uploadStatuses.filter(s => s.status === 'error').length} file(s) failed after {MAX_RETRIES} retries
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleButtonClick}
          disabled={isUploading}
          isLoading={isUploading}
          className="flex-1 py-3"
          variant={selectedFiles.length > 0 ? 'success' : 'primary'}
        >
          {selectedFiles.length > 0 ? (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Upload {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Choose Files
            </>
          )}
        </Button>

        {selectedFiles.length === 0 && !isUploading && (
          <Button
            onClick={() => setIsNoteOpen(true)}
            variant="secondary"
            className="py-3"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            New Note
          </Button>
        )}

        {selectedFiles.length > 0 && !isUploading && (
          <Button onClick={clearSelection} variant="secondary">
            Clear
          </Button>
        )}
      </div>

      {/* Note Modal */}
      <TextNote isOpen={isNoteOpen} onClose={() => setIsNoteOpen(false)} />
    </div>
  );
}
