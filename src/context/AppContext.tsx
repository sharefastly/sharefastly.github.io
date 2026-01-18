// Application Context and State Management

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { AppState, AppAction, ProcessedFile, Folder } from '../types';
import { CONSTANTS, filterFilesForFolder, processAndSortFiles, getSortedFolders } from '../utils';
import { GitHubService } from '../services';

// Initial state
const initialState: AppState = {
  globalFileList: [],
  currentFileList: [],
  folders: [],
  currentFolder: CONSTANTS.ALL_FOLDER,
  isLoading: true,
  hasFetched: false,
  error: null,
};

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_GLOBAL_FILE_LIST':
      return {
        ...state,
        globalFileList: action.payload,
        currentFileList: filterFilesForFolder(action.payload, state.currentFolder),
        isLoading: false,
        hasFetched: true,
      };
    
    case 'SET_CURRENT_FOLDER':
      return {
        ...state,
        currentFolder: action.payload,
        currentFileList: filterFilesForFolder(state.globalFileList, action.payload),
      };
    
    case 'SET_FOLDERS':
      return { ...state, folders: action.payload };
    
    case 'REFRESH_CURRENT_LIST':
      return {
        ...state,
        currentFileList: filterFilesForFolder(state.globalFileList, state.currentFolder),
      };
    
    default:
      return state;
  }
}

// Context type
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  fetchFiles: () => Promise<void>;
  setCurrentFolder: (folder: string) => void;
  refreshFiles: () => Promise<void>;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Fetch files from GitHub
  const fetchFiles = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const rawFiles = await GitHubService.fetchFileList();
      const processedFiles = processAndSortFiles(rawFiles);
      const folders = getSortedFolders(rawFiles);

      dispatch({ type: 'SET_GLOBAL_FILE_LIST', payload: processedFiles });
      dispatch({ type: 'SET_FOLDERS', payload: folders });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to fetch files',
      });
    }
  }, []);

  // Set current folder
  const setCurrentFolder = useCallback((folder: string) => {
    dispatch({ type: 'SET_CURRENT_FOLDER', payload: folder });
  }, []);

  // Refresh files
  const refreshFiles = useCallback(async () => {
    await fetchFiles();
  }, [fetchFiles]);

  // Initial fetch
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const value: AppContextType = {
    state,
    dispatch,
    fetchFiles,
    setCurrentFolder,
    refreshFiles,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Export types for convenience
export type { AppState, ProcessedFile, Folder };
