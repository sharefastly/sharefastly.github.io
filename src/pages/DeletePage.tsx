// Delete Page - manage file deletions

import { useApp } from '../context';
import { useDeleteFile } from '../hooks';
import { FileGrid, Button, PageSpinner, OverlaySpinner } from '../components';
import { CONSTANTS } from '../utils';

interface DeletePageProps {
  onBack: () => void;
}

export function DeletePage({ onBack }: DeletePageProps) {
  const { state } = useApp();
  const { currentFileList, globalFileList, isLoading, currentFolder } = state;
  const { deleteFile, deleteAllFiles, isDeleting } = useDeleteFile();

  // Get files for deletion (exclude folders from file list)
  const filesForDeletion =
    currentFolder === CONSTANTS.ALL_FOLDER
      ? globalFileList.filter(
          (f) => !f.name.endsWith(CONSTANTS.FOLDER_SUFFIX)
        )
      : currentFileList;

  // Get folders for deletion (only in ALL folder view)
  const foldersForDeletion =
    currentFolder === CONSTANTS.ALL_FOLDER
      ? globalFileList.filter((f) => f.name.endsWith(CONSTANTS.FOLDER_SUFFIX))
      : [];

  // Combined list for deletion
  const deleteFileList = [...filesForDeletion, ...foldersForDeletion];
  const fileCount = filesForDeletion.length;
  const folderCount = foldersForDeletion.length;

  const handleDelete = async (fileName: string) => {
    await deleteFile(fileName);
  };

  const handleDeleteAll = async () => {
    const fileNames = deleteFileList.map((f) => f.name);
    await deleteAllFiles(fileNames);
  };

  if (isLoading) {
    return <PageSpinner message="Loading files..." />;
  }

  return (
    <div className="min-h-screen bg-[#F4F4F4]">
      {/* Deleting Overlay */}
      {isDeleting && <OverlaySpinner message="Deleting files..." />}
      
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#1A3D64]/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="secondary">
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Go Back
            </Button>
            <h1 className="text-2xl font-bold text-[#0C2B4E]">
              Delete Files
            </h1>
          </div>

          <span className="text-sm text-[#1A3D64]">
            {currentFolder === CONSTANTS.ALL_FOLDER
              ? 'All Folders'
              : currentFolder.replace(CONSTANTS.FOLDER_SUFFIX, '')}
          </span>
        </div>
      </div>

      <FileGrid
        files={deleteFileList}
        showDelete
        onDelete={handleDelete}
        emptyMessage="No files to delete"
      />

      {/* Delete All Button */}
      {deleteFileList.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-8 border-t border-[#1A3D64]/20">
          <div className="flex justify-center">
            <Button
              onClick={handleDeleteAll}
              variant="danger"
              size="lg"
              disabled={isDeleting}
              className="min-w-[250px]"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete All ({fileCount} {fileCount === 1 ? 'File' : 'Files'}{folderCount > 0 ? `, ${folderCount} ${folderCount === 1 ? 'Folder' : 'Folders'}` : ''})
            </Button>
          </div>
          <p className="text-center text-sm text-[#1A3D64] mt-4">
            ⚠️ This action cannot be undone
          </p>
        </div>
      )}
    </div>
  );
}
