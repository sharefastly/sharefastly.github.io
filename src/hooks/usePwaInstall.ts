// usePwaInstall - capture beforeinstallprompt and recommend PWA install

import { useState, useEffect, useCallback } from 'react';

const DISMISS_KEY = 'pwa-install-dismissed';
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function getDismissedAt(): number | null {
  try {
    const v = localStorage.getItem(DISMISS_KEY);
    if (!v) return null;
    const n = parseInt(v, 10);
    return isNaN(n) ? null : n;
  } catch {
    return null;
  }
}

function isDismissed(): boolean {
  const at = getDismissedAt();
  if (!at) return false;
  return Date.now() - at < DISMISS_MS;
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  // Running as installed PWA
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  if ((navigator as { standalone?: boolean }).standalone === true) return true;
  // Some browsers use display-mode: fullscreen or minimal-ui when installed
  if (window.matchMedia('(display-mode: fullscreen)').matches && (window as { fromPwa?: boolean }).fromPwa) return true;
  return false;
}

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(isDismissed);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    setIos(isIos());
    if (isStandalone()) {
      setInstalled(true);
      setCanInstall(false);
      return;
    }
    setDismissed(isDismissed());

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    const onInstalled = () => {
      setDeferredPrompt(null);
      setCanInstall(false);
      setInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setCanInstall(false);
    }
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch {}
    setDismissed(true);
  }, []);

  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 2500);
    return () => clearTimeout(t);
  }, []);

  const showBanner = ready && !installed && !dismissed && (canInstall || ios);

  return { canInstall, installed, install, dismiss, dismissed, ios, showBanner };
}
