import React, { useState, useRef, useEffect } from 'react';
import { 
  FolderKanban, 
  Users, 
  MapPin, 
  Contact2, 
  Plus, 
  AlertTriangle,
  Layers,
  FileText,
  Hammer,
  TableProperties,
  ChevronDown,
  Building,
  Compass,
  Tag,
  Flame,
  Database,
  Download,
  Shield,
  Upload,
  Save,
  Lock,
  SlidersHorizontal,
  HardDriveDownload,
  Sun,
  Moon,
  LogOut,
  Settings,
  ShieldCheck,
  Menu,
  X,
  LayoutGrid,
  Home,
  MoreHorizontal,
  Camera,
  UserCheck
} from 'lucide-react';
import { getIconColorForText } from '../utils/colors';

export type NavTabType = 
  | 'projects' 
  | 'projects_table' 
  | 'manpower' 
  | 'properties' 
  | 'zones' 
  | 'categories' 
  | 'priorities' 
  | 'roster' 
  | 'trades'
  | 'quality_gates'
  | 'users'
  | 'snapshots';

interface NavbarProps {
  activeTab: NavTabType;
  onTabChange: (tab: NavTabType) => void;
  onNewProjectClick: () => void;
  onOpenDailyReport: () => void;
  onOpenStaleRadar: () => void;
  onOpenVaultSecurity: () => void;
  onBackupDb: () => void;
  onEncryptedBackup: () => void;
  onRestoreDb: () => void;
  onMergeImport: () => void;
  onSaveDailySnapshot: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout: () => void;
  adminUser: string;
  stats: {
    totalProjects: number;
    activeProjects: number;
    staleCount: number;
    deployedCount: number;
    deployableCount: number;
    totalStaff: number;
  };
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onNewProjectClick,
  onOpenDailyReport,
  onOpenStaleRadar,
  onOpenVaultSecurity,
  onBackupDb,
  onEncryptedBackup,
  onRestoreDb,
  onMergeImport,
  onSaveDailySnapshot,
  theme,
  onToggleTheme,
  onLogout,
  adminUser,
  stats
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Avatar lookup from seed user names
  const SEED_AVATARS: Record<string, string> = {
    'marcus vance':          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
    'juan dela cruz':        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
    'roberto santos':        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80',
    'clarissa tan':          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&auto=format&fit=crop&q=80',
    'mateo reyes':           'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop&q=80',
    'vip executive supervisor': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
  };
  const avatarUrl = SEED_AVATARS[adminUser.toLowerCase()] || null;
  const userInitials = adminUser
    .split(' ')
    .map(w => w[0]?.toUpperCase() || '')
    .slice(0, 2)
    .join('');
  // Shorten display name to first + last name only
  const displayName = adminUser
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isManagementActive = [
    'properties', 
    'zones', 
    'categories', 
    'priorities', 
    'roster', 
    'trades',
    'quality_gates',
    'users',
    'snapshots'
  ].includes(activeTab);

  const getManagementLabel = () => {
    switch (activeTab) {
      case 'properties': return 'Properties';
      case 'zones': return 'Specific Zones';
      case 'categories': return 'Categories';
      case 'priorities': return 'Priorities';
      case 'roster': return 'Workforce Roster';
      case 'trades': return 'Trade Specialties';
      case 'quality_gates': return 'Approval Rules';
      case 'users': return 'User Accounts';
      case 'snapshots': return 'System Snapshots';
      default: return 'Settings';
    }
  };

  return (
    <header className="navbar no-print">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="brand" onClick={() => onTabChange('projects')} style={{ cursor: 'pointer' }}>
          <Layers size={18} strokeWidth={2.2} color="var(--accent-blue)" />
          <span>BuildFlow</span>
        </div>

        {/* Primary Nav Links */}
        <nav className="nav-links">
          <button 
            type="button"
            className={`nav-tab ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => onTabChange('projects')}
          >
            <FolderKanban size={15} color={getIconColorForText('Projects Queue').color} />
            <span>Projects Queue</span>
          </button>

          <button 
            type="button"
            className={`nav-tab ${activeTab === 'projects_table' ? 'active' : ''}`}
            onClick={() => onTabChange('projects_table')}
          >
            <TableProperties size={15} color={getIconColorForText('Projects Manager').color} />
            <span>Projects Manager</span>
          </button>

          <button 
            type="button"
            className={`nav-tab ${activeTab === 'manpower' ? 'active' : ''}`}
            onClick={() => onTabChange('manpower')}
          >
            <Users size={15} color={getIconColorForText('Crew Allocator').color} />
            <span>Crew Allocator</span>
          </button>

          {/* Unified Settings Dropdown (Combines Management Hubs & Admin DB Tools) */}
          <div className="nav-dropdown-container" ref={settingsRef}>
            <button 
              type="button"
              className={`nav-tab ${isManagementActive ? 'active' : ''}`}
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              title="Management Hubs, Database Tools & Preferences"
            >
              <Settings size={14} color={getIconColorForText(isManagementActive ? getManagementLabel() : 'Settings').color} />
              <span>{isManagementActive ? getManagementLabel() : 'Settings'}</span>
              <ChevronDown size={12} style={{ opacity: 0.7, transform: isSettingsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
            </button>

            {isSettingsOpen && (
              <div className="nav-dropdown-menu" style={{ minWidth: '260px' }}>
                <div className="dropdown-header">MANAGEMENT HUBS</div>

                <button 
                  type="button" 
                  className={`dropdown-item ${activeTab === 'properties' ? 'active' : ''}`}
                  onClick={() => {
                    onTabChange('properties');
                    setIsSettingsOpen(false);
                  }}
                >
                  <Building size={14} color={getIconColorForText('Properties').color} />
                  <span>Properties (Estates)</span>
                </button>

                <button 
                  type="button" 
                  className={`dropdown-item ${activeTab === 'zones' ? 'active' : ''}`}
                  onClick={() => {
                    onTabChange('zones');
                    setIsSettingsOpen(false);
                  }}
                >
                  <Compass size={14} color={getIconColorForText('Specific Zones').color} />
                  <span>Specific Zones</span>
                </button>

                <button 
                  type="button" 
                  className={`dropdown-item ${activeTab === 'categories' ? 'active' : ''}`}
                  onClick={() => {
                    onTabChange('categories');
                    setIsSettingsOpen(false);
                  }}
                >
                  <Tag size={14} color={getIconColorForText('Project Categories').color} />
                  <span>Project Categories</span>
                </button>

                <button 
                  type="button" 
                  className={`dropdown-item ${activeTab === 'priorities' ? 'active' : ''}`}
                  onClick={() => {
                    onTabChange('priorities');
                    setIsSettingsOpen(false);
                  }}
                >
                  <Flame size={14} color={getIconColorForText('Priority Tiers').color} />
                  <span>Priority Tiers</span>
                </button>

                <button 
                  type="button" 
                  className={`dropdown-item ${activeTab === 'trades' ? 'active' : ''}`}
                  onClick={() => {
                    onTabChange('trades');
                    setIsSettingsOpen(false);
                  }}
                >
                  <Hammer size={14} color={getIconColorForText('Trade Specialties').color} />
                  <span>Trade Specialties</span>
                </button>

                <button 
                  type="button" 
                  className={`dropdown-item ${activeTab === 'roster' ? 'active' : ''}`}
                  onClick={() => {
                    onTabChange('roster');
                    setIsSettingsOpen(false);
                  }}
                >
                  <Contact2 size={14} color={getIconColorForText('Workforce Roster').color} />
                  <span>Workforce Roster</span>
                </button>

                <button 
                  type="button" 
                  className={`dropdown-item ${activeTab === 'quality_gates' ? 'active' : ''}`}
                  onClick={() => {
                    onTabChange('quality_gates');
                    setIsSettingsOpen(false);
                  }}
                >
                  <ShieldCheck size={14} color={getIconColorForText('Quality Gate Checklists').color} />
                  <span>Quality Gate Checklists</span>
                </button>

                <button 
                  type="button" 
                  className={`dropdown-item ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => {
                    onTabChange('users');
                    setIsSettingsOpen(false);
                  }}
                >
                  <Users size={14} color={getIconColorForText('User Accounts').color} />
                  <span>User Accounts & Roles</span>
                </button>

                <div className="dropdown-divider" />
                <div className="dropdown-header">DATABASE & BACKUP TOOLS</div>

                <button 
                  type="button" 
                  className={`dropdown-item ${activeTab === 'snapshots' ? 'active' : ''}`}
                  onClick={() => {
                    onTabChange('snapshots');
                    setIsSettingsOpen(false);
                  }}
                >
                  <Camera size={14} color={getIconColorForText('System Snapshots').color} />
                  <span>System Snapshots (Point-in-Time)</span>
                </button>

                <button 
                  type="button" 
                  className="dropdown-item"
                  onClick={() => {
                    onBackupDb();
                    setIsSettingsOpen(false);
                  }}
                >
                  <Download size={14} color={getIconColorForText('Backup DB').color} />
                  <span>Backup DB</span>
                </button>

                <button 
                  type="button" 
                  className="dropdown-item"
                  onClick={() => {
                    onEncryptedBackup();
                    setIsSettingsOpen(false);
                  }}
                >
                  <Shield size={14} color={getIconColorForText('Encrypted Backup').color} />
                  <span>Encrypted Backup (.agwcz)</span>
                </button>

                <button 
                  type="button" 
                  className="dropdown-item"
                  onClick={() => {
                    onRestoreDb();
                    setIsSettingsOpen(false);
                  }}
                >
                  <Upload size={14} color={getIconColorForText('Restore DB').color} />
                  <span>Restore DB</span>
                </button>

                <button 
                  type="button" 
                  className="dropdown-item"
                  onClick={() => {
                    onMergeImport();
                    setIsSettingsOpen(false);
                  }}
                >
                  <HardDriveDownload size={14} color={getIconColorForText('Merge Import').color} />
                  <span>Merge Import</span>
                </button>

                <button 
                  type="button" 
                  className="dropdown-item"
                  onClick={() => {
                    onSaveDailySnapshot();
                    setIsSettingsOpen(false);
                  }}
                >
                  <Save size={14} color={getIconColorForText('Save Daily Snapshot').color} />
                  <span>Save Daily Snapshot</span>
                </button>

                <button 
                  type="button" 
                  className="dropdown-item"
                  onClick={() => {
                    onOpenVaultSecurity();
                    setIsSettingsOpen(false);
                  }}
                >
                  <Lock size={14} color={getIconColorForText('Vault Security').color} />
                  <span>Vault Security & E2EE</span>
                </button>


                <div className="dropdown-divider" />
                <div className="dropdown-header">PREFERENCES & ACCESS</div>

                <button 
                  type="button" 
                  className="dropdown-item"
                  onClick={onToggleTheme}
                >
                  {theme === 'dark' ? <Sun size={14} color="var(--accent-amber)" /> : <Moon size={14} color="var(--accent-blue)" />}
                  <span>Switch to {theme === 'dark' ? 'Light Notion' : 'Dark Obsidian'} Mode</span>
                </button>

              </div>
            )}
          </div>
        </nav>

        {/* Right: Quick Actions + User Identity Chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Theme Toggle */}
          <button 
            type="button" 
            className="btn-subtle" 
            onClick={onToggleTheme}
            style={{ border: '1px solid var(--border-default)', padding: '6px 9px' }}
            title={`Toggle Theme Mode (Current: ${theme})`}
          >
            {theme === 'dark' ? <Sun size={15} color="var(--accent-amber)" /> : <Moon size={15} color="var(--accent-blue)" />}
          </button>

          <button 
            type="button" 
            className="btn-subtle desktop-only-action" 
            onClick={onOpenDailyReport}
            style={{ border: '1px solid var(--border-default)' }}
            title="Open Daily Summary &amp; Export"
          >
            <FileText size={14} color="var(--accent-blue)" />
            <span>Daily Report</span>
          </button>

          {/* New Project Button */}
          {activeTab === 'projects' ? (
            <button 
              type="button" 
              className="btn-primary desktop-only-action" 
              onClick={onNewProjectClick}
              title="Add a new project to the download queue"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>New Project</span>
            </button>
          ) : (
            <button 
              type="button" 
              className="btn-primary desktop-only-action" 
              disabled
              style={{ 
                opacity: 0.35, 
                cursor: 'not-allowed', 
                filter: 'grayscale(0.7)',
                pointerEvents: 'auto'
              }}
              title="New Project creation is active only on Projects Queue"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>New Project</span>
            </button>
          )}

          {/* ── User Identity + Logout Chip ── */}
          <div className="user-chip" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            overflow: 'hidden',
            background: 'var(--bg-sidebar)',
            flexShrink: 0
          }}>
            {/* Avatar + Name pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '4px 10px 4px 6px',
              borderRight: '1px solid var(--border-default)'
            }}>
              {/* Avatar */}
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                background: 'var(--accent-blue-bg)',
                border: '1.5px solid var(--accent-blue-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 700,
                color: 'var(--accent-blue)'
              }}>
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={displayName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : userInitials}
              </div>
              {/* Name */}
              <span className="user-name-text" style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                maxWidth: '110px',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis'
              }}>
                {displayName}
              </span>
            </div>

            {/* Lock & Logout Icon Button */}
            <button
              type="button"
              onClick={onLogout}
              title="Lock &amp; Sign Out"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 9px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-tertiary)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)';
                (e.currentTarget as HTMLButtonElement).style.color = '#ef4444';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'none';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-tertiary)';
              }}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Persistent Operations Telemetry Strip */}
      <div className="telemetry-strip">
        <div className="telemetry-inner">
          <div className="telemetry-group">
            <div className="telemetry-item">
              <span>Active Projects:</span>
              <strong>{stats.activeProjects}</strong> of {stats.totalProjects}
            </div>

            <div className="telemetry-item">
              <span>Field Deployed:</span>
              <strong>{stats.deployedCount}</strong> crew members
              <span style={{ color: 'var(--text-tertiary)' }}>({stats.deployableCount} deployable / {stats.totalStaff} roster)</span>
            </div>
          </div>

          <div className="telemetry-group">
            {stats.staleCount > 0 ? (
              <button 
                type="button"
                className="telemetry-badge stale" 
                onClick={onOpenStaleRadar}
                style={{ cursor: 'pointer', border: '1px solid var(--accent-red-border)' }}
                title="Click to view Stale Radar and 1-Click VIP Follow-up Drafts"
              >
                <AlertTriangle size={12} />
                <span>{stats.staleCount} Stale / Follow-Up Needed</span>
              </button>
            ) : (
              <button 
                type="button"
                className="telemetry-badge info"
                onClick={onOpenStaleRadar}
                style={{ cursor: 'pointer' }}
              >
                <span>✓ All Projects Synchronized & Active</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Image 2) */}
      <nav className="mobile-bottom-nav no-print">
        <button 
          type="button" 
          className={`mobile-bottom-btn ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => { onTabChange('projects'); setIsMobileMenuOpen(false); }}
        >
          <Home size={19} className="bottom-nav-icon home-icon" />
          <span>Home</span>
        </button>

        <button 
          type="button" 
          className={`mobile-bottom-btn ${activeTab === 'projects_table' ? 'active' : ''}`}
          onClick={() => { onTabChange('projects_table'); setIsMobileMenuOpen(false); }}
        >
          <TableProperties size={19} className="bottom-nav-icon manager-icon" />
          <span>Manager</span>
        </button>

        <button 
          type="button" 
          className="mobile-bottom-btn"
          onClick={() => { onOpenDailyReport(); setIsMobileMenuOpen(false); }}
        >
          <FileText size={19} className="bottom-nav-icon reports-icon" />
          <span>Reports</span>
        </button>

        <button 
          type="button" 
          className={`mobile-bottom-btn ${isMobileMenuOpen || (!['projects', 'projects_table'].includes(activeTab)) ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <MoreHorizontal size={20} className="bottom-nav-icon more-icon" />
          <span>More</span>
        </button>
      </nav>

      {/* Mobile Navigation & Tools Bottom Sheet (Image 3) */}
      {isMobileMenuOpen && (
        <div className="mobile-sheet-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-sheet-card" onClick={e => e.stopPropagation()}>
            <div className="mobile-sheet-handle" />
            
            <div className="mobile-sheet-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <LayoutGrid size={18} color="var(--accent-blue)" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.01em', margin: 0, color: 'var(--text-primary)' }}>
                  BuildFlow Navigation & Tools
                </h3>
              </div>
              <button 
                type="button" 
                className="btn-subtle" 
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close navigation sheet"
                style={{ 
                  borderRadius: '50%', 
                  width: '32px',
                  height: '32px',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-secondary)'
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="mobile-menu-grid">
              <button 
                type="button"
                className={`mobile-grid-card ${activeTab === 'manpower' ? 'active' : ''}`}
                onClick={() => { onTabChange('manpower'); setIsMobileMenuOpen(false); }}
              >
                <div className="mobile-grid-icon" style={{ background: getIconColorForText('Crew Allocator').bg, color: getIconColorForText('Crew Allocator').color }}>
                  <Users size={20} />
                </div>
                <div className="mobile-grid-info">
                  <div className="mobile-grid-title">Crew Allocator</div>
                  <div className="mobile-grid-sub">Manpower deployment</div>
                </div>
              </button>

              <button 
                type="button"
                className={`mobile-grid-card ${activeTab === 'roster' ? 'active' : ''}`}
                onClick={() => { onTabChange('roster'); setIsMobileMenuOpen(false); }}
              >
                <div className="mobile-grid-icon" style={{ background: getIconColorForText('Workforce Roster').bg, color: getIconColorForText('Workforce Roster').color }}>
                  <Contact2 size={20} />
                </div>
                <div className="mobile-grid-info">
                  <div className="mobile-grid-title">Team Roster</div>
                  <div className="mobile-grid-sub">50 Pinoy celebrities</div>
                </div>
              </button>

              <button 
                type="button"
                className={`mobile-grid-card ${activeTab === 'properties' ? 'active' : ''}`}
                onClick={() => { onTabChange('properties'); setIsMobileMenuOpen(false); }}
              >
                <div className="mobile-grid-icon" style={{ background: getIconColorForText('Properties').bg, color: getIconColorForText('Properties').color }}>
                  <Building size={20} />
                </div>
                <div className="mobile-grid-info">
                  <div className="mobile-grid-title">Properties &amp; Sites</div>
                  <div className="mobile-grid-sub">Estates &amp; buildings</div>
                </div>
              </button>

              <button 
                type="button"
                className={`mobile-grid-card ${activeTab === 'zones' ? 'active' : ''}`}
                onClick={() => { onTabChange('zones'); setIsMobileMenuOpen(false); }}
              >
                <div className="mobile-grid-icon" style={{ background: getIconColorForText('Specific Zones').bg, color: getIconColorForText('Specific Zones').color }}>
                  <Compass size={20} />
                </div>
                <div className="mobile-grid-info">
                  <div className="mobile-grid-title">Specific Zones</div>
                  <div className="mobile-grid-sub">Rooms &amp; sections</div>
                </div>
              </button>

              <button 
                type="button"
                className={`mobile-grid-card ${activeTab === 'categories' ? 'active' : ''}`}
                onClick={() => { onTabChange('categories'); setIsMobileMenuOpen(false); }}
              >
                <div className="mobile-grid-icon" style={{ background: getIconColorForText('Project Categories').bg, color: getIconColorForText('Project Categories').color }}>
                  <Tag size={20} />
                </div>
                <div className="mobile-grid-info">
                  <div className="mobile-grid-title">Project Categories</div>
                  <div className="mobile-grid-sub">Builds &amp; repairs</div>
                </div>
              </button>

              <button 
                type="button"
                className={`mobile-grid-card ${activeTab === 'priorities' ? 'active' : ''}`}
                onClick={() => { onTabChange('priorities'); setIsMobileMenuOpen(false); }}
              >
                <div className="mobile-grid-icon" style={{ background: getIconColorForText('Priority Tiers').bg, color: getIconColorForText('Priority Tiers').color }}>
                  <Flame size={20} />
                </div>
                <div className="mobile-grid-info">
                  <div className="mobile-grid-title">Priority Levels</div>
                  <div className="mobile-grid-sub">VIP Urgent to Low</div>
                </div>
              </button>

              <button 
                type="button"
                className={`mobile-grid-card ${activeTab === 'trades' ? 'active' : ''}`}
                onClick={() => { onTabChange('trades'); setIsMobileMenuOpen(false); }}
              >
                <div className="mobile-grid-icon" style={{ background: getIconColorForText('Trade Specialties').bg, color: getIconColorForText('Trade Specialties').color }}>
                  <Hammer size={20} />
                </div>
                <div className="mobile-grid-info">
                  <div className="mobile-grid-title">Trade Specialties</div>
                  <div className="mobile-grid-sub">Carpentry, electrical...</div>
                </div>
              </button>

              <button 
                type="button"
                className={`mobile-grid-card ${activeTab === 'quality_gates' ? 'active' : ''}`}
                onClick={() => { onTabChange('quality_gates'); setIsMobileMenuOpen(false); }}
              >
                <div className="mobile-grid-icon" style={{ background: getIconColorForText('Quality Gate Checklists').bg, color: getIconColorForText('Quality Gate Checklists').color }}>
                  <ShieldCheck size={20} />
                </div>
                <div className="mobile-grid-info">
                  <div className="mobile-grid-title">Approval Rules</div>
                  <div className="mobile-grid-sub">Quality check gates</div>
                </div>
              </button>

              <button 
                type="button"
                className={`mobile-grid-card ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => { onTabChange('users'); setIsMobileMenuOpen(false); }}
              >
                <div className="mobile-grid-icon" style={{ background: getIconColorForText('User Accounts').bg, color: getIconColorForText('User Accounts').color }}>
                  <UserCheck size={20} />
                </div>
                <div className="mobile-grid-info">
                  <div className="mobile-grid-title">User Accounts</div>
                  <div className="mobile-grid-sub">Roles &amp; access control</div>
                </div>
              </button>

              <button 
                type="button"
                className={`mobile-grid-card ${activeTab === 'snapshots' ? 'active' : ''}`}
                onClick={() => { onTabChange('snapshots'); setIsMobileMenuOpen(false); }}
              >
                <div className="mobile-grid-icon" style={{ background: getIconColorForText('System Snapshots').bg, color: getIconColorForText('System Snapshots').color }}>
                  <Camera size={20} />
                </div>
                <div className="mobile-grid-info">
                  <div className="mobile-grid-title">System Snapshots</div>
                  <div className="mobile-grid-sub">Point-in-time backups</div>
                </div>
              </button>

              <button 
                type="button"
                className="mobile-grid-card"
                onClick={() => { onOpenStaleRadar(); setIsMobileMenuOpen(false); }}
              >
                <div className="mobile-grid-icon" style={{ background: getIconColorForText('Stale Radar').bg, color: getIconColorForText('Stale Radar').color }}>
                  <AlertTriangle size={20} />
                </div>
                <div className="mobile-grid-info">
                  <div className="mobile-grid-title">Stale Radar</div>
                  <div className="mobile-grid-sub">{stats.staleCount} items need review</div>
                </div>
              </button>

              <button 
                type="button"
                className="mobile-grid-card"
                onClick={() => { onToggleTheme(); }}
              >
                <div className="mobile-grid-icon" style={{ background: 'rgba(139, 92, 246, 0.14)', color: '#8b5cf6' }}>
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </div>
                <div className="mobile-grid-info">
                  <div className="mobile-grid-title">Theme Mode</div>
                  <div className="mobile-grid-sub">{theme === 'dark' ? 'Light Notion' : 'Dark Obsidian'}</div>
                </div>
              </button>

              <button 
                type="button"
                className="mobile-grid-card danger"
                onClick={() => { setIsMobileMenuOpen(false); onLogout(); }}
              >
                <div className="mobile-grid-icon" style={{ background: 'rgba(239, 68, 68, 0.14)', color: '#ef4444' }}>
                  <LogOut size={20} />
                </div>
                <div className="mobile-grid-info">
                  <div className="mobile-grid-title" style={{ color: 'var(--accent-red)' }}>Lock &amp; Sign Out</div>
                  <div className="mobile-grid-sub">End session safely</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
