// FolderNavbar component - horizontal folder navigation

import { useState } from 'react';
import { useApp } from '../../context';
import { CONSTANTS } from '../../utils';
import { GitHubService } from '../../services';
import { OverlaySpinner } from '../ui';

export function FolderNavbar() {
  const { state, setCurrentFolder, refreshFiles } = useApp();
  const { folders, currentFolder, globalFileList } = state;
  const [isAdding, setIsAdding] = useState(false);

  // Calculate total file count (excluding folder marker files)
  const totalFileCount = globalFileList.filter(
    (file) => !file.name.endsWith(CONSTANTS.FOLDER_SUFFIX)
  ).length;

  const handleFolderClick = (folderName: string) => {
    setCurrentFolder(folderName);
  };

  const handleAddFolder = async () => {
    const folderName = prompt('Enter new folder name:');
    
    if (!folderName || folderName.trim() === '') {
      return;
    }

    // Sanitize folder name (remove special characters)
    const sanitizedName = folderName.trim().replace(/[^a-zA-Z0-9-_\s]/g, '');
    
    if (sanitizedName === '') {
      alert('Invalid folder name. Please use only letters, numbers, spaces, hyphens, and underscores.');
      return;
    }

    // Check if folder already exists
    const folderFileName = `${sanitizedName}${CONSTANTS.FOLDER_SUFFIX}`;
    const exists = folders.some((f) => f.name === folderFileName);
    
    if (exists) {
      alert('A folder with this name already exists.');
      return;
    }

    setIsAdding(true);
    try {
      await GitHubService.uploadBlankFile(folderFileName);
      await refreshFiles();
      // Switch to the new folder
      setCurrentFolder(folderFileName);
    } catch (error) {
      console.error('Failed to create folder:', error);
      alert('Failed to create folder. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <>
      {isAdding && <OverlaySpinner message="Creating folder..." />}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#1A3D64]/20 shadow-sm">
        <nav className="overflow-x-auto scrollbar-thin">
          <div className="flex items-center gap-2 p-3 min-w-max">
            {/* ALL Folder Tab */}
          <button
            onClick={() => handleFolderClick(CONSTANTS.ALL_FOLDER)}
            className={`
              inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap
              transition-all duration-200
              ${
                currentFolder === CONSTANTS.ALL_FOLDER
                  ? 'bg-[#0C2B4E] text-white shadow-md'
                  : 'bg-[#F4F4F4] text-[#0C2B4E] hover:bg-[#1A3D64]/10'
              }
            `}
          >
            <span>ALL</span>
            {totalFileCount > 0 && (
              <span
                className={`
                  text-xs px-1.5 py-0.5 rounded-full
                  ${
                    currentFolder === CONSTANTS.ALL_FOLDER
                      ? 'bg-[#1A3D64] text-white'
                      : 'bg-[#1A3D64]/20 text-[#0C2B4E]'
                  }
                `}
              >
                {totalFileCount}
              </span>
            )}
          </button>

          {/* Folder Tabs */}
          {folders.map((folder) => (
            <button
              key={folder.name}
              onClick={() => handleFolderClick(folder.name)}
              className={`
                inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm
                whitespace-nowrap transition-all duration-200 max-w-[180px]
                ${
                  currentFolder === folder.name
                    ? 'bg-[#0C2B4E] text-white shadow-md'
                    : 'bg-[#F4F4F4] text-[#0C2B4E] hover:bg-[#1A3D64]/10'
                }
              `}
            >
              <span>📁</span>
              <span className="truncate">{folder.displayName}</span>
              {folder.fileCount > 0 && (
                <span
                  className={`
                    text-xs px-1.5 py-0.5 rounded-full
                    ${
                      currentFolder === folder.name
                        ? 'bg-[#1A3D64] text-white'
                        : 'bg-[#1A3D64]/20 text-[#0C2B4E]'
                    }
                  `}
                >
                  {folder.fileCount}
                </span>
              )}
            </button>
          ))}

          {/* Add Folder Button */}
          <button
            onClick={handleAddFolder}
            disabled={isAdding}
            className="flex-shrink-0 w-9 h-9 rounded-full bg-[#1D546C] hover:bg-[#1A3D64] text-white font-bold text-xl flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            title="Add new folder"
          >
            {isAdding ? (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              '+'
            )}
          </button>
        </div>
      </nav>
    </div>
    </>
  );
}
