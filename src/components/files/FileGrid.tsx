// FileGrid component - displays grid of file cards

import type { ProcessedFile } from '../../types';
import { FileCard } from './FileCard';
import { EmptyState } from '../ui';

interface FileGridProps {
  files: ProcessedFile[];
  showDelete?: boolean;
  onDelete?: (fileName: string) => void;
  emptyMessage?: string;
}

export function FileGrid({
  files,
  showDelete = false,
  onDelete,
  emptyMessage = 'No files found',
}: FileGridProps) {
  if (files.length === 0) {
    return (
      <EmptyState
        icon="📁"
        title={emptyMessage}
        description="Upload some files to see them here"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {files.map((file) => (
        <FileCard
          key={file.sha}
          file={file}
          showDelete={showDelete}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
