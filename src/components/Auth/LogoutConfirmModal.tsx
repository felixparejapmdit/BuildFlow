import React, { useEffect } from 'react';
import { LogOut, X, ShieldCheck } from 'lucide-react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmLogout
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter') onConfirmLogout();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onConfirmLogout]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div 
        className="modal-card" 
        onClick={e => e.stopPropagation()}
        style={{ 
          maxWidth: '430px', 
          width: '90%',
          padding: '26px', 
          borderRadius: '18px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
          border: '1px solid var(--border-default)',
          background: 'var(--bg-canvas)',
          animation: 'fadeIn 0.16s ease-out'
        }}
      >
        {/* Header with Icon and Close Button */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '14px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444'
          }}>
            <LogOut size={24} strokeWidth={2.2} />
          </div>

          <button 
            type="button" 
            className="btn-subtle" 
            onClick={onClose}
            aria-label="Close dialog"
            style={{ borderRadius: 'var(--radius-full)', padding: '7px', color: 'var(--text-tertiary)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '19px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.01em' }}>
            Lock BuildFlow Session?
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            Lock BuildFlow and return to login screen? You will need your supervisor credentials to unlock the application.
          </p>
        </div>

        {/* Security badge notice */}
        <div style={{
          padding: '11px 14px',
          borderRadius: '10px',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          marginBottom: '22px'
        }}>
          <ShieldCheck size={16} color="var(--accent-green)" style={{ flexShrink: 0 }} />
          <span>All local databases, project schedules, and notes remain encrypted and safe.</span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            type="button" 
            className="btn-subtle" 
            onClick={onClose}
            style={{ 
              flex: 1, 
              padding: '11px 16px', 
              fontSize: '13px', 
              fontWeight: 600,
              justifyContent: 'center', 
              borderRadius: '10px',
              border: '1px solid var(--border-default)' 
            }}
          >
            Cancel
          </button>

          <button 
            type="button" 
            className="btn-primary" 
            onClick={onConfirmLogout}
            style={{ 
              flex: 1.2, 
              padding: '11px 16px', 
              fontSize: '13px', 
              fontWeight: 600,
              justifyContent: 'center',
              borderRadius: '10px',
              background: '#dc2626',
              borderColor: '#b91c1c',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
            }}
          >
            <LogOut size={15} />
            <span>Lock & Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
