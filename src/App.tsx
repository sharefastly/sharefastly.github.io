import { AppProvider, ShareLaunchProvider } from './context';
import { Routes, Route } from 'react-router-dom';
import { HomeRoute } from './pages/HomeRoute';
import { PreviewRoute } from './pages/PreviewRoute';
import { DeleteRoute } from './pages/DeleteRoute';
import { InstallPwaBanner } from './components/ui';

function App() {
  return (
    <AppProvider>
      <ShareLaunchProvider>
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/f/:folder" element={<HomeRoute />} />
          <Route path="/preview" element={<PreviewRoute />} />
          <Route path="/delete" element={<DeleteRoute />} />
        </Routes>
        <InstallPwaBanner />
      </ShareLaunchProvider>
    </AppProvider>
  );
}

export default App;
