// InstallPwaBanner - recommends installing the PWA (Chrome beforeinstallprompt or iOS hint)

import { usePwaInstall } from '../../hooks/usePwaInstall';

export function InstallPwaBanner() {
  const { canInstall, ios, showBanner, install, dismiss } = usePwaInstall();

  if (!showBanner) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-3 px-4 py-3 bg-[#0C2B4E] text-white shadow-lg sm:px-6"
      role="banner"
      aria-label="Install app"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/15">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="font-semibold">Install ShareFastly</p>
          <p className="text-sm text-white/80">
            {canInstall
              ? 'Install to share files from any app and use offline.'
              : ios
              ? 'Tap Share, then "Add to Home Screen" to install.'
              : 'Add to your home screen for quick access.'}
          </p>
        </div>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        {canInstall && (
          <button
            onClick={install}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#0C2B4E] transition hover:bg-white/90"
          >
            Install
          </button>
        )}
        <button
          onClick={dismiss}
          className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
          aria-label="Dismiss"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
