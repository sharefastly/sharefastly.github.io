// Custom hook for file deletion

import { useState, useCallback } from 'react';
import { GitHubService } from '../services';
import { useApp } from '../context';

interface UseDeleteFileResult {
  isDeleting: boolean;
  deleteFile: (fileName: string) => Promise<boolean>;
  deleteAllFiles: (fileNames: string[]) => Promise<boolean>;
}

export function useDeleteFile(): UseDeleteFileResult {
  const [isDeleting, setIsDeleting] = useState(false);
  const { refreshFiles } = useApp();

  const deleteFile = useCallback(
    async (fileName: string): Promise<boolean> => {
      const confirmDelete = confirm(
        `Are you sure you want to delete this file?`
      );
      if (!confirmDelete) return false;

      setIsDeleting(true);
      try {
        await GitHubService.deleteFile(fileName);
        await refreshFiles();
        return true;
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete file. Please try again.');
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [refreshFiles]
  );

  const deleteAllFiles = useCallback(
    async (fileNames: string[]): Promise<boolean> => {
      const confirmDelete = confirm(
        `Are you sure you want to delete ${fileNames.length} files? This cannot be undone.`
      );
      if (!confirmDelete) return false;

      setIsDeleting(true);
      try {
        for (const fileName of fileNames) {
          await GitHubService.deleteFile(fileName);
        }
        await refreshFiles();
        return true;
      } catch (error) {
        console.error('Delete all failed:', error);
        alert('Failed to delete some files. Please try again.');
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [refreshFiles]
  );

  return {
    isDeleting,
    deleteFile,
    deleteAllFiles,
  };
}
