import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { DeletePage } from './DeletePage';

export function DeleteRoute() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setCurrentFolder } = useApp();

  const folderParam = searchParams.get('folder');

  // Sync ?folder= to context when on delete page
  useEffect(() => {
    if (folderParam) {
      try {
        setCurrentFolder(decodeURIComponent(folderParam));
      } catch {
        // keep existing
      }
    }
  }, [folderParam, setCurrentFolder]);

  return <DeletePage onBack={() => navigate(-1)} />;
}
