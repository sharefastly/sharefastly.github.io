import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { PreviewModal, Spinner } from '../components';

export function PreviewRoute() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state } = useApp();

  const f = searchParams.get('f');
  const fileName = f ? decodeURIComponent(f) : null;

  const file = fileName
    ? state.globalFileList.find((x) => x.name === fileName)
    : null;

  if (!fileName) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-gray-600">No file specified</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-[#0C2B4E] text-white rounded-lg hover:bg-[#1A3D64]"
        >
          Go back
        </button>
      </div>
    );
  }

  if (!state.hasFetched && state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-4">
        <Spinner size="xl" className="border-[#0C2B4E] border-t-transparent" />
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!file && state.hasFetched) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-gray-600">File not found</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-[#0C2B4E] text-white rounded-lg hover:bg-[#1A3D64]"
        >
          Go back
        </button>
      </div>
    );
  }

  if (!file) {
    return null;
  }

  return (
    <PreviewModal file={file} onClose={() => navigate(-1)} />
  );
}
