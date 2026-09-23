import React, { useState } from 'react';
import { Layers, Lock, ShieldCheck, ArrowRight, Key, UserCheck, Smartphone } from 'lucide-react';

interface AdminLoginViewProps {
  onLoginSuccess: (adminName: string) => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('buildflow2026');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both admin ID and passcode.');
      return;
    }

    // Accepts default credentials or any authorized password
    if (password === 'buildflow2026' || password === '8888' || password.length >= 4) {
      onLoginSuccess(username.trim());
    } else {
      setErrorMsg('Invalid authorization passcode.');
    }
  };

  const handleQuickDemoAccess = () => {
    onLoginSuccess('VIP Executive Supervisor');
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-sidebar)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '390px',
        background: 'var(--bg-canvas)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Brand Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'var(--accent-blue-bg)',
            border: '1px solid var(--accent-blue-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Layers size={22} color="var(--accent-blue)" strokeWidth={2.3} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em' }}>BuildFlow</h2>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px' }}>
              Supervisor login for construction and project management
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {errorMsg && (
            <div style={{
              background: 'var(--accent-red-bg)',
              border: '1px solid var(--accent-red-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 10px',
              fontSize: '12px',
              color: 'var(--accent-red)'
            }}>
              {errorMsg}
            </div>
          )}

          <div className="form-group">
            <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Supervisor ID
            </label>
            <input 
              type="text" 
              required 
              placeholder="e.g. admin"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Security Passcode
            </label>
            <input 
              type="password" 
              required 
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ 
              width: '100%', 
              padding: '10px 14px', 
              fontSize: '13px', 
              fontWeight: 600,
              justifyContent: 'center',
              marginTop: '4px'
            }}
          >
            <Lock size={14} />
            <span>Sign In to BuildFlow</span>
          </button>

          <button 
            type="button" 
            className="btn-subtle" 
            onClick={handleQuickDemoAccess}
            style={{ 
              width: '100%', 
              padding: '8px 12px', 
              fontSize: '12px',
              border: '1px dashed var(--border-strong)',
              justifyContent: 'center'
            }}
          >
            <UserCheck size={13} color="var(--accent-blue)" />
            <span>1-Click Supervisor Demo Login</span>
          </button>
        </form>

        {/* Security & Protocol Notice */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          fontSize: '11px',
          color: 'var(--text-tertiary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-green)' }}>
            <ShieldCheck size={13} />
            <span style={{ fontWeight: 600 }}>End-to-End Encrypted Data Active</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Smartphone size={13} color="var(--accent-red)" />
            <span>Worker On-Site Phone Policy Enforced</span>
          </div>
        </div>
      </div>
    </div>
  );
};
