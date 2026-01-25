// ShareLaunchContext - handle Web Share Target (Android share menu) and URL params

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';

interface ShareLaunchContextValue {
  pendingFiles: File[];
  hasPending: boolean;
  consumeFiles: () => void;
  sharedForNote: { title: string; content: string } | null;
  consumeNotePrefill: () => void;
}

const ShareLaunchContext = createContext<ShareLaunchContextValue | undefined>(undefined);

declare global {
  interface Window {
    launchQueue?: {
      setDelegate: (fn: (params: { targetURL?: string; files?: File[]; text?: string; title?: string; url?: string }) => void) => void;
    };
  }
}

export function ShareLaunchProvider({ children }: { children: ReactNode }) {
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [sharedForNote, setSharedForNote] = useState<{ title: string; content: string } | null>(null);

  const consumeFiles = useCallback(() => setPendingFiles([]), []);
  const consumeNotePrefill = useCallback(() => setSharedForNote(null), []);
  const hasPending = pendingFiles.length > 0 || !!sharedForNote;

  // 1) launchQueue – when PWA is opened from the system share sheet (files/text/url)
  // setDelegate is only available when the Launch Handler API is supported (e.g. installed PWA on Chrome/Edge).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const lq = window.launchQueue;
    if (!lq || typeof lq.setDelegate !== 'function') return;
    lq.setDelegate((params) => {
      if (params.files && params.files.length > 0) {
        setPendingFiles(Array.from(params.files));
        return;
      }
      if (params.title || params.text || params.url) {
        setSharedForNote({
          title: params.title || '',
          content: [params.text, params.url].filter(Boolean).join('\n\n'),
        });
      }
    });
  }, []);

  // 2) URL query params – e.g. ?title=...&text=...&url=... (GET share or direct link)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const title = q.get('title') || '';
    const text = q.get('text') || '';
    const url = q.get('url') || '';
    if (title || text || url) {
      setSharedForNote({
        title,
        content: [text, url].filter(Boolean).join('\n\n'),
      });
      // Clear from URL without reload
      const clean = window.location.pathname + window.location.hash;
      window.history.replaceState(null, '', clean);
    }
  }, []);

  const value: ShareLaunchContextValue = {
    pendingFiles,
    hasPending,
    consumeFiles,
    sharedForNote,
    consumeNotePrefill,
  };

  return (
    <ShareLaunchContext.Provider value={value}>
      {children}
    </ShareLaunchContext.Provider>
  );
}

export function useShareLaunch() {
  const ctx = useContext(ShareLaunchContext);
  if (ctx === undefined) throw new Error('useShareLaunch must be used within ShareLaunchProvider');
  return ctx;
}
