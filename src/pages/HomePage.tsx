// Home Page - main file listing with upload

import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context';
import { Layout, UploadBox, FileGrid, PageSpinner } from '../components';

interface HomePageProps {
  onNavigateToDelete: () => void;
}

export function HomePage({ onNavigateToDelete }: HomePageProps) {
  const { state } = useApp();
  const { currentFileList, isLoading, hasFetched, error, currentFolder } = state;
  const [searchQuery, setSearchQuery] = useState('');

  // Filter files based on search query
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) {
      return currentFileList;
    }
    const query = searchQuery.toLowerCase().trim();
    return currentFileList.filter((file) => {
      // Skip folder marker files
      if (file.fileType === 'folder') {
        return false;
      }
      
      // Search by display name (file name or note title)
      const displayName = (file.displayName || '').toLowerCase();
      
      // Search by file type/extension
      const fileType = (file.fileType || '').toLowerCase();
      
      // For notes: check if it's a note and allow searching by "note" keyword
      const isNote = fileType === 'post';
      const noteSearchTerms = isNote ? 'note post' : '';
      
      // For untitled notes, allow searching by "untitled"
      const untitledTerm = isNote && !displayName ? 'untitled' : '';
      
      // Combine all searchable terms
      const searchableText = `${displayName} ${fileType} ${noteSearchTerms} ${untitledTerm}`;
      
      return searchableText.includes(query);
    });
  }, [currentFileList, searchQuery]);

  // Reset search when folder changes
  useEffect(() => {
    setSearchQuery('');
  }, [currentFolder]);

  // Show loading spinner until initial fetch is complete
  if (isLoading || !hasFetched) {
    return <PageSpinner message="Loading files..." />
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center p-8 bg-red-100 rounded-xl border border-red-200">
            <p className="text-red-700 text-lg">
              Error: {error}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Upload Box */}
      <UploadBox />

      {/* Search Bar */}
      <div className="w-[90%] max-w-3xl mx-auto mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-[#1A3D64]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={currentFolder === 'ALL-folder' ? 'Search all files...' : `Search in this folder...`}
            className="w-full pl-12 pr-10 py-3 bg-white border border-[#1A3D64]/20 rounded-xl text-[#0C2B4E] placeholder-[#1A3D64]/50 focus:outline-none focus:ring-2 focus:ring-[#0C2B4E] focus:border-transparent shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#1A3D64] hover:text-[#0C2B4E]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-sm text-[#1A3D64] mt-2 ml-1">
            Found {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'}
            {currentFolder !== 'ALL-folder' && ' in this folder'}
          </p>
        )}
      </div>

      {/* File Grid - key forces re-render on folder change */}
      <FileGrid
        key={currentFolder}
        files={filteredFiles}
        emptyMessage={
          searchQuery
            ? 'No files match your search'
            : currentFolder === 'ALL-folder'
            ? 'No files yet'
            : `No files in this folder`
        }
      />

      {/* Delete Section at end of page */}
      <div className="mt-12 mb-8 flex justify-center">
        <button
          onClick={onNavigateToDelete}
          className="flex items-center gap-3 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-semibold rounded-xl border border-red-200 hover:border-red-300 transition-all duration-200"
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
          Manage Deletions
        </button>
      </div>
    </Layout>
  );
}
