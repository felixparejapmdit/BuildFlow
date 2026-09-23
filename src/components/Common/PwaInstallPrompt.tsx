import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) return;

    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check if user dismissed prompt recently (within 7 days)
    const dismissedTime = localStorage.getItem('buildflow_pwa_dismissed');
    if (dismissedTime && Date.now() - parseInt(dismissedTime, 10) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // On iOS, if not standalone, show custom tip after 4 seconds
    if (isIosDevice && !isStandaloneMode) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 4000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('buildflow_pwa_dismissed', Date.now().toString());
  };

  if (isStandalone || !isVisible) return null;

  return (
    <div 
      className="pwa-install-banner no-print"
      style={{
        position: 'fixed',
        bottom: '72px', // sits right above the mobile bottom nav
        left: '12px',
        right: '12px',
        maxWidth: '480px',
        margin: '0 auto',
        zIndex: 1100,
        background: 'var(--bg-canvas)',
        border: '1px solid var(--accent-blue-border)',
        borderRadius: '14px',
        padding: '12px 14px',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        animation: 'slideUp 0.25s ease-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '9px',
          background: 'var(--accent-blue-bg)',
          border: '1px solid var(--accent-blue-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-blue)',
          flexShrink: 0
        }}>
          <Smartphone size={18} strokeWidth={2.2} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ 
            fontSize: '12.5px', 
            fontWeight: 700, 
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <span>Install BuildFlow</span>
            <Sparkles size={11} color="var(--accent-amber)" />
          </div>
          <p style={{ 
            margin: 0, 
            fontSize: '11px', 
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {isIOS 
              ? 'Tap Share ⎋ and "Add to Home Screen"' 
              : 'Add to Home Screen for fast mobile access'
            }
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        {!isIOS && deferredPrompt && (
          <button
            type="button"
            className="btn-primary"
            onClick={handleInstallClick}
            style={{ 
              padding: '6px 12px', 
              fontSize: '11.5px', 
              fontWeight: 600,
              borderRadius: '7px'
            }}
          >
            <Download size={12} strokeWidth={2.3} />
            <span>Install</span>
          </button>
        )}
        <button
          type="button"
          className="btn-subtle"
          onClick={handleDismiss}
          aria-label="Dismiss banner"
          style={{ 
            padding: '5px', 
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-tertiary)' 
          }}
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};
