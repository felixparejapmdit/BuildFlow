import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  X, 
  ShieldCheck
} from 'lucide-react';

export type DialogVariant = 'danger' | 'warning' | 'info' | 'success';

export interface DialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: DialogVariant;
  notice?: string;
}

interface ActiveDialogState extends DialogOptions {
  type: 'confirm' | 'alert';
  resolve: (value: boolean) => void;
}

// Global listener for showConfirm / showAlert
type DialogListener = (dialog: ActiveDialogState | null) => void;
let activeListener: DialogListener | null = null;

export const showConfirm = (options: DialogOptions | string): Promise<boolean> => {
  return new Promise((resolve) => {
    const opts: DialogOptions = typeof options === 'string' ? { message: options } : options;
    if (activeListener) {
      activeListener({
        ...opts,
        type: 'confirm',
        resolve
      });
    } else {
      resolve(window.confirm(opts.message));
    }
  });
};

export const showAlert = (options: DialogOptions | string): Promise<void> => {
  return new Promise<void>((resolve) => {
    const opts: DialogOptions = typeof options === 'string' ? { message: options } : options;
    if (activeListener) {
      activeListener({
        ...opts,
        type: 'alert',
        resolve: () => {
          resolve();
        }
      });
    } else {
      window.alert(opts.message);
      resolve();
    }
  });
};

export const ConfirmDialogContainer: React.FC = () => {
  const [current, setCurrent] = useState<ActiveDialogState | null>(null);

  useEffect(() => {
    activeListener = (dialog) => {
      setCurrent(dialog);
    };
    return () => {
      activeListener = null;
    };
  }, []);

  const handleConfirm = () => {
    if (current) {
      current.resolve(true);
      setCurrent(null);
    }
  };

  const handleCancel = () => {
    if (current) {
      current.resolve(false);
      setCurrent(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!current) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [current]);

  if (!current) return null;

  const variant = current.variant || (current.type === 'confirm' ? 'danger' : 'info');

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Trash2 size={24} strokeWidth={2.2} />,
          badgeBg: 'rgba(239, 68, 68, 0.12)',
          badgeBorder: 'rgba(239, 68, 68, 0.28)',
          badgeColor: '#ef4444',
          btnBg: 'var(--accent-red)',
          btnColor: '#ffffff',
          defaultTitle: 'Confirm Deletion',
          defaultConfirmText: 'Delete'
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={24} strokeWidth={2.2} />,
          badgeBg: 'rgba(245, 158, 11, 0.12)',
          badgeBorder: 'rgba(245, 158, 11, 0.28)',
          badgeColor: '#f59e0b',
          btnBg: 'var(--accent-amber)',
          btnColor: '#ffffff',
          defaultTitle: 'Attention Required',
          defaultConfirmText: 'Proceed'
        };
      case 'success':
        return {
          icon: <CheckCircle2 size={24} strokeWidth={2.2} />,
          badgeBg: 'rgba(16, 185, 129, 0.12)',
          badgeBorder: 'rgba(16, 185, 129, 0.28)',
          badgeColor: '#10b981',
          btnBg: 'var(--accent-green)',
          btnColor: '#ffffff',
          defaultTitle: 'Completed',
          defaultConfirmText: 'OK'
        };
      case 'info':
      default:
        return {
          icon: <Info size={24} strokeWidth={2.2} />,
          badgeBg: 'rgba(59, 130, 246, 0.12)',
          badgeBorder: 'rgba(59, 130, 246, 0.28)',
          badgeColor: '#3b82f6',
          btnBg: 'var(--accent-blue)',
          btnColor: '#ffffff',
          defaultTitle: 'Notification',
          defaultConfirmText: 'OK'
        };
    }
  };

  const config = getVariantStyles();
  const title = current.title || config.defaultTitle;
  const confirmText = current.confirmText || config.defaultConfirmText;
  const cancelText = current.cancelText || 'Cancel';

  return (
    <div 
      className="modal-overlay" 
      onClick={handleCancel} 
      style={{ 
        zIndex: 2500, 
        backdropFilter: 'blur(5px)',
        backgroundColor: 'rgba(0, 0, 0, 0.65)'
      }}
    >
      <div 
        className="modal-card" 
        onClick={e => e.stopPropagation()}
        style={{ 
          maxWidth: '440px', 
          width: '92%',
          padding: '24px 26px', 
          borderRadius: '16px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.55), 0 0 0 1px var(--border-default)',
          background: 'var(--bg-canvas)',
          animation: 'fadeIn 0.15s ease-out',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {/* Header with Icon Badge and Close Button */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: config.badgeBg,
            border: `1px solid ${config.badgeBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: config.badgeColor,
            flexShrink: 0
          }}>
            {config.icon}
          </div>

          <button 
            type="button" 
            className="btn-subtle" 
            onClick={handleCancel}
            aria-label="Close dialog"
            style={{ 
              borderRadius: 'var(--radius-full)', 
              padding: '6px', 
              color: 'var(--text-tertiary)',
              border: 'none',
              background: 'transparent'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Title and Message */}
        <div>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: 700, 
            color: 'var(--text-primary)', 
            margin: '0 0 8px 0', 
            letterSpacing: '-0.01em',
            lineHeight: 1.3
          }}>
            {title}
          </h3>
          <p style={{ 
            fontSize: '13.5px', 
            color: 'var(--text-secondary)', 
            lineHeight: 1.55,
            margin: 0,
            whiteSpace: 'pre-line'
          }}>
            {current.message}
          </p>
        </div>

        {/* Optional Context Notice Strip */}
        {current.notice && (
          <div style={{
            padding: '10px 12px',
            borderRadius: '8px',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11.5px',
            color: 'var(--text-tertiary)'
          }}>
            <ShieldCheck size={14} color="var(--accent-blue)" style={{ flexShrink: 0 }} />
            <span>{current.notice}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '10px', 
          marginTop: '6px' 
        }}>
          {current.type === 'confirm' && (
            <button 
              type="button" 
              className="btn-subtle" 
              onClick={handleCancel}
              style={{
                padding: '9px 16px',
                fontSize: '13px',
                fontWeight: 500,
                borderRadius: '8px',
                border: '1px solid var(--border-default)',
                color: 'var(--text-secondary)'
              }}
            >
              {cancelText}
            </button>
          )}

          <button 
            type="button" 
            onClick={handleConfirm}
            autoFocus
            style={{
              padding: '9px 18px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '8px',
              border: 'none',
              background: config.btnBg,
              color: config.btnColor,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'opacity 0.15s ease'
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
