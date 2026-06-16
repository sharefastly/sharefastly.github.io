import { useState } from 'react';
import { AppProvider } from './context';
import { HomePage, DeletePage } from './pages';
import { CONFIG } from './utils';

type Page = 'home' | 'delete';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const handleNavigateToDelete = () => {
    const password = prompt('Enter password to access delete menu:');
    if (password === CONFIG.security.deletePassword) {
      setCurrentPage('delete');
    } else if (password !== null) {
      alert('Incorrect password');
    }
  };

  return (
    <AppProvider>
      {currentPage === 'home' && (
        <HomePage onNavigateToDelete={handleNavigateToDelete} />
      )}
      {currentPage === 'delete' && (
        <DeletePage onBack={() => setCurrentPage('home')} />
      )}
    </AppProvider>
  );
}

export default App;
