import React, { useState, useRef, useEffect } from 'react';
import { 
  Project, 
  Zone, 
  Location, 
  Estate,
  ProjectStatus 
} from '../../types';
import { formatRelativeTime, isProjectStale } from '../../utils/time';
import { 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Edit3, 
  Check, 
  Sliders, 
  ShieldCheck, 
  Layers, 
  FileSearch,
  ChevronDown,
  Pause,
  Play,
  MessageSquare,
  MapPin,
  Zap,
  AlertTriangle,
  ArrowRight,
  X
} from 'lucide-react';

type ViewMode = 'list' | 'grid';

interface ProjectRowProps {
  project: Project;
  zone?: Zone;
  location?: Location;
  estate?: Estate;
  viewMode?: ViewMode;
  onUpdateProgress: (projectId: string, newProgress: number, newStage?: string) => void;
  onUpdateStatus?: (projectId: string, newStatus: ProjectStatus) => void;
  onOpenManpowerDrawer: (project: Project) => void;
  onOpenInspector: (project: Project) => void;
  onOpenChecklist: (project: Project) => void;
  onOpenProposals: (project: Project) => void;
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  vip_urgent: { label: 'VIP Urgent', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)' },
  high:        { label: 'High',       color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.25)' },
  normal:      { label: 'Normal',     color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)' },
  low:         { label: 'Low',        color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)' },
};

const CATEGORY_COLOR: Record<string, string> = {
  renovation:   '#8b5cf6',
  construction: '#f97316',
  maintenance:  '#06b6d4',
  proposal:     '#10b981',
};

export const ProjectRow: React.FC<ProjectRowProps> = ({
  project,
  zone,
  location,
  estate,
  viewMode = 'list',
  onUpdateProgress,
  onUpdateStatus,
  onOpenManpowerDrawer,
  onOpenInspector,
  onOpenChecklist,
  onOpenProposals
}) => {
  const [isEditingStage, setIsEditingStage] = useState(false);
  const [stageInput, setStageInput] = useState(project.currentStageSummary);
  const [showSlider, setShowSlider] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  const stale = isProjectStale(project.lastProgressUpdatedAt, project.status);
  const priority = PRIORITY_CONFIG[project.priority] || PRIORITY_CONFIG.normal;
  const catColor = CATEGORY_COLOR[project.category] || '#3b82f6';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target as Node)) {
        setIsStatusMenuOpen(false);
      }
    };
    if (isStatusMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isStatusMenuOpen]);

  const handleStep = (delta: number) => {
    const nextVal = Math.max(0, Math.min(100, project.progressPercentage + delta));
    onUpdateProgress(project.id, nextVal);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateProgress(project.id, parseInt(e.target.value, 10));
  };

  const handleSaveStage = () => {
    setIsEditingStage(false);
    onUpdateProgress(project.id, project.progressPercentage, stageInput);
  };

  const handleSelectStatus = (newStatus: ProjectStatus) => {
    setIsStatusMenuOpen(false);
    if (onUpdateStatus) onUpdateStatus(project.id, newStatus);
  };

  const locationTag = [
    estate?.name ? estate.name.replace(/portfolio|residence \d/i, '').trim() : '',
    location?.name,
    zone?.name
  ].filter(Boolean).slice(0, 2).join(' › ');

  const getStatusConfig = () => {
    if (stale) return { label: 'Needs Follow-Up', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: <AlertTriangle size={11} strokeWidth={2.5} /> };
    switch (project.status) {
      case 'active': return { label: 'In Progress', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', icon: <Zap size={11} strokeWidth={2.5} /> };
      case 'awaiting_feedback': return { label: 'Awaiting Feedback', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', icon: <MessageSquare size={11} strokeWidth={2.5} /> };
      case 'paused': return { label: 'Paused', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', icon: <Pause size={11} strokeWidth={2.5} /> };
      case 'completed': return { label: 'Completed', color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: <CheckCircle2 size={11} strokeWidth={2.5} /> };
      default: return { label: project.status, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', icon: <Clock size={11} strokeWidth={2.5} /> };
    }
  };
  const statusCfg = getStatusConfig();

  const getProgressColor = () => {
    if (project.status === 'completed') return '#10b981';
    if (stale) return '#f59e0b';
    if (project.progressPercentage >= 75) return '#06b6d4';
    if (project.progressPercentage >= 40) return '#3b82f6';
    return '#8b5cf6';
  };

  if (viewMode === 'grid') {
    return (
      <div className={`project-card-grid ${stale ? 'is-stale' : ''}`} style={{
        background: 'var(--bg-sidebar)',
        border: `1px solid ${stale ? 'var(--accent-amber-border)' : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Category accent stripe */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
          background: stale ? '#f59e0b' : (project.status === 'completed' ? '#10b981' : catColor)
        }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
              <MapPin size={10} color="var(--text-tertiary)" />
              <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {locationTag || 'No location'}
              </span>
            </div>
            <h4
              onClick={() => onOpenInspector(project)}
              style={{
                margin: 0, fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                color: 'var(--text-primary)', lineHeight: 1.3,
                overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
              }}
            >
              {project.title}
            </h4>
          </div>
          {/* Priority badge */}
          <span style={{
            flexShrink: 0, fontSize: '9px', fontWeight: 700, padding: '2px 6px',
            borderRadius: '4px', background: priority.bg, color: priority.color,
            border: `1px solid ${priority.border}`, textTransform: 'uppercase', letterSpacing: '0.4px'
          }}>
            {priority.label}
          </span>
        </div>

        {/* Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Progress</span>
            <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: getProgressColor() }}>
              {project.progressPercentage}%
            </span>
          </div>
          <div style={{ height: '5px', background: 'var(--border-default)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${project.progressPercentage}%`,
              background: getProgressColor(),
              borderRadius: '99px',
              transition: 'width 0.4s ease',
              boxShadow: `0 0 8px ${getProgressColor()}60`
            }} />
          </div>
        </div>

        {/* Stage */}
        <p style={{
          margin: 0, fontSize: '11px', color: 'var(--text-secondary)',
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          lineHeight: 1.4
        }}>
          {project.currentStageSummary || 'No stage description'}
        </p>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontSize: '10px', fontWeight: 600, padding: '3px 7px', borderRadius: '6px',
            background: statusCfg.bg, color: statusCfg.color
          }}>
            {statusCfg.icon} {statusCfg.label}
          </span>
          <button type="button" onClick={() => onOpenInspector(project)} style={{
            display: 'inline-flex', alignItems: 'center', gap: '3px',
            fontSize: '11px', color: 'var(--accent-blue)', background: 'none', border: 'none',
            cursor: 'pointer', padding: '2px 4px', borderRadius: '4px'
          }}>
            View <ArrowRight size={11} />
          </button>
        </div>

        {/* Quick Actions */}
        <div style={{
          display: 'flex', gap: '4px', paddingTop: '8px',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <button type="button" onClick={() => handleStep(-5)} disabled={project.progressPercentage <= 0}
            className="btn-scrub" style={{ flex: 1, justifyContent: 'center', fontSize: '10px' }}>-5%</button>
          <button type="button" onClick={() => handleStep(5)} disabled={project.progressPercentage >= 100}
            className="btn-scrub" style={{ flex: 1, justifyContent: 'center', fontSize: '10px' }}>+5%</button>
          <button type="button" onClick={() => onOpenManpowerDrawer(project)}
            className="btn-scrub" style={{ flex: 1, justifyContent: 'center', fontSize: '10px' }}>
            <Users size={11} />
          </button>
          <button type="button" onClick={() => onOpenChecklist(project)}
            className="btn-scrub" style={{ flex: 1, justifyContent: 'center', color: 'var(--accent-green)' }}>
            <ShieldCheck size={11} />
          </button>
        </div>
      </div>
    );
  }

  // ── LIST VIEW ──
  return (
    <div className={`download-row ${stale ? 'is-stale' : ''}`} style={{ position: 'relative' }}>
      {/* Left category accent line */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
        background: stale ? '#f59e0b' : (project.status === 'completed' ? '#10b981' : catColor),
        borderRadius: '4px 0 0 4px'
      }} />
      <div style={{ paddingLeft: '12px' }}>

        {/* Top Header Row */}
        <div className="download-row-top">
          <div className="row-title-meta">
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
              <MapPin size={10} color="var(--text-tertiary)" />
              <span className="property-tag" title={`${estate?.name || ''} › ${location?.name || ''}`}>
                {locationTag || 'No location set'}
              </span>
              {/* Priority chip */}
              <span style={{
                fontSize: '9px', fontWeight: 700, padding: '1px 5px',
                borderRadius: '4px', background: priority.bg, color: priority.color,
                border: `1px solid ${priority.border}`, textTransform: 'uppercase', letterSpacing: '0.4px'
              }}>
                {priority.label}
              </span>
              {/* Category chip */}
              <span style={{
                fontSize: '9px', fontWeight: 600, padding: '1px 5px',
                borderRadius: '4px', background: `${catColor}18`, color: catColor,
                textTransform: 'capitalize'
              }}>
                {project.category}
              </span>
            </div>
            <h4
              className="project-title-text"
              title="Click to view project details and activity feed"
              onClick={() => onOpenInspector(project)}
              style={{ cursor: 'pointer' }}
            >
              {project.title}
            </h4>
          </div>

          <div className="row-pills">
            <button type="button" className="btn-subtle" onClick={() => onOpenChecklist(project)}
              title="Quality Gate Checklist"
              style={{ padding: '2px 7px', fontSize: '11px', color: 'var(--accent-green)' }}>
              <ShieldCheck size={13} /><span>Gate</span>
            </button>
            <button type="button" className="btn-subtle" onClick={() => onOpenProposals(project)}
              title="Proposal Options"
              style={{ padding: '2px 7px', fontSize: '11px', color: 'var(--accent-purple)' }}>
              <Layers size={13} /><span>Options</span>
            </button>
            <button type="button" className="crew-pill" onClick={() => onOpenManpowerDrawer(project)}
              title="Reassign crew">
              <Users size={12} strokeWidth={2.2} />
              <span>{project.assignedCrewCount || 0} Crew</span>
            </button>

            {/* Status Badge + Dropdown */}
            <div style={{ position: 'relative' }} ref={statusMenuRef}>
              <span
                className={`status-badge ${stale ? 'stale' : project.status}`}
                onClick={() => setIsStatusMenuOpen(prev => !prev)}
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', userSelect: 'none' }}
              >
                {statusCfg.icon}
                <span>{statusCfg.label}</span>
                <ChevronDown size={10} style={{ opacity: 0.7 }} />
              </span>

              {isStatusMenuOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 99,
                  background: 'var(--bg-canvas)', border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
                  minWidth: '210px', padding: '6px', display: 'flex', flexDirection: 'column', gap: '2px'
                }}>
                  <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-tertiary)', padding: '4px 8px' }}>
                    Change Status
                  </div>
                  {stale && (
                    <div style={{ fontSize: '11px', color: 'var(--accent-amber)', background: 'var(--accent-amber-bg)', border: '1px solid var(--accent-amber-border)', padding: '6px 8px', borderRadius: 'var(--radius-sm)', marginBottom: '4px', lineHeight: 1.3 }}>
                      ⚠️ Idle &gt;24h. Selecting any status updates the timestamp.
                    </div>
                  )}
                  {([
                    { status: 'active' as ProjectStatus, label: 'Active (In Progress)', icon: <Zap size={12} color="#06b6d4" />, color: '#06b6d4' },
                    { status: 'paused' as ProjectStatus, label: 'Paused (On Hold)', icon: <Pause size={12} color="var(--text-secondary)" />, color: 'var(--text-secondary)' },
                    { status: 'awaiting_feedback' as ProjectStatus, label: 'Awaiting VIP Feedback', icon: <MessageSquare size={12} color="#8b5cf6" />, color: '#8b5cf6' },
                    { status: 'completed' as ProjectStatus, label: 'Completed (100% Done)', icon: <CheckCircle2 size={12} color="#10b981" />, color: '#10b981' },
                  ] as Array<{ status: ProjectStatus; label: string; icon: React.ReactNode; color: string }>).map(opt => (
                    <button key={opt.status} type="button" onClick={() => handleSelectStatus(opt.status)} style={{
                      width: '100%', justifyContent: 'flex-start', padding: '7px 8px', fontSize: '12px',
                      background: project.status === opt.status && !stale ? 'var(--bg-subtle)' : 'transparent',
                      border: 'none', color: opt.color, borderRadius: 'var(--radius-sm)', fontWeight: project.status === opt.status && !stale ? 600 : 400,
                      display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
                    }}>
                      {opt.icon}
                      <span>{opt.label}</span>
                      {project.status === opt.status && !stale && <Check size={12} style={{ marginLeft: 'auto' }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-track" title={`${project.progressPercentage}% complete`}>
            <div
              className={`progress-fill ${project.status === 'completed' ? 'completed' : stale ? 'stale' : ''}`}
              style={{ width: `${project.progressPercentage}%`, background: getProgressColor(), boxShadow: `0 0 8px ${getProgressColor()}50` }}
            />
          </div>
          <span className="progress-value" style={{ color: getProgressColor() }}>
            {project.progressPercentage}%
          </span>

          {/* Scrub Controls */}
          <div className="scrub-controls">
            <button type="button" className="btn-scrub" onClick={() => handleStep(-5)} disabled={project.progressPercentage <= 0}>-5</button>
            <button type="button" className="btn-scrub" onClick={() => handleStep(5)} disabled={project.progressPercentage >= 100}>+5</button>
            <button type="button" className={`btn-scrub ${showSlider ? 'btn-primary' : ''}`} onClick={() => setShowSlider(!showSlider)} title="Fine precision slider">
              <Sliders size={11} />
            </button>
          </div>
        </div>

        {/* Precision Slider */}
        {showSlider && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 0' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>0%</span>
            <input type="range" min="0" max="100" value={project.progressPercentage} onChange={handleSliderChange}
              style={{ flex: 1, height: '4px', cursor: 'pointer' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>100%</span>
          </div>
        )}

        {/* Bottom Row */}
        <div className="download-row-bottom">
          <div className="stage-summary">
            <span className="stage-label">Stage:</span>
            {isEditingStage ? (
              <div className="stage-edit-form">
                <input
                  type="text" 
                  value={stageInput}
                  onChange={(e) => setStageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveStage();
                    if (e.key === 'Escape') setIsEditingStage(false);
                  }}
                  autoFocus
                  className="stage-input"
                  placeholder="Describe current stage..."
                />
                <button type="button" className="btn-scrub" onClick={handleSaveStage} title="Save stage">
                  <Check size={12} />
                </button>
                <button type="button" className="btn-subtle" onClick={() => setIsEditingStage(false)} title="Cancel">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div className="stage-content-wrap">
                <span 
                  onClick={() => setIsEditingStage(true)} 
                  title="Click to edit stage description"
                  className="stage-text"
                >
                  {project.currentStageSummary || 'Click to add stage description...'}
                </span>
                <button 
                  type="button" 
                  className="btn-subtle stage-edit-btn" 
                  onClick={() => setIsEditingStage(true)}
                  title="Edit stage description"
                >
                  <Edit3 size={11} />
                </button>
              </div>
            )}
          </div>

          <div className="timestamp-meta">
            <span onClick={() => onOpenInspector(project)}
              style={{ cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted' }}
              title="View notes & timeline">
              Details & Notes
            </span>
            <span>•</span>
            <span>Updated {formatRelativeTime(project.lastProgressUpdatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
