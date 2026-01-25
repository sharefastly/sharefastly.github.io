import { useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { HomePage } from './HomePage';
import { CONSTANTS, CONFIG } from '../utils';

export function HomeRoute() {
  const { folder } = useParams<{ folder: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setCurrentFolder, state } = useApp();

  const q = searchParams.get('q') ?? '';
  const setQ = (value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value.trim()) next.set('q', value);
        else next.delete('q');
        return next;
      },
      { replace: true }
    );
  };

  // Sync folder from URL to context
  useEffect(() => {
    if (folder) {
      try {
        setCurrentFolder(decodeURIComponent(folder));
      } catch {
        setCurrentFolder(CONSTANTS.ALL_FOLDER);
      }
    } else {
      setCurrentFolder(CONSTANTS.ALL_FOLDER);
    }
  }, [folder, setCurrentFolder]);

  const handleNavigateToDelete = () => {
    const password = CONFIG.security.deletePassword;
    const userInput = prompt('Enter password to access delete menu:');
    if (userInput === password) {
      const folderParam =
        state.currentFolder === CONSTANTS.ALL_FOLDER
          ? ''
          : `?folder=${encodeURIComponent(state.currentFolder)}`;
      navigate(`/delete${folderParam}`);
    } else if (userInput !== null) {
      alert('Incorrect password');
    }
  };

  return (
    <HomePage
      searchQuery={q}
      onSearchChange={setQ}
      onNavigateToDelete={handleNavigateToDelete}
    />
  );
}
