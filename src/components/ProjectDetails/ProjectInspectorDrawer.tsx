import React, { useState } from 'react';
import { 
  Project, 
  ProjectNote, 
  Estate, 
  Location, 
  Zone, 
  ManpowerAllocation, 
  Employee,
  ProjectStatus 
} from '../../types';
import { formatRelativeTime } from '../../utils/time';
import { 
  X, 
  MessageSquare, 
  ShieldAlert, 
  Users, 
  Layers, 
  ShieldCheck, 
  Plus, 
  Send, 
  Calendar, 
  MapPin, 
  Clock, 
  Check 
} from 'lucide-react';

interface ProjectInspectorDrawerProps {
  project: Project | null;
  onClose: () => void;
  notes: ProjectNote[];
  onAddNote: (projectId: string, noteType: ProjectNote['noteType'], author: string, content: string) => void;
  onOpenManpower: (project: Project) => void;
  onOpenChecklist: (project: Project) => void;
  onOpenProposals: (project: Project) => void;
  onUpdateStatus?: (projectId: string, newStatus: ProjectStatus) => void;
  estate?: Estate;
  location?: Location;
  zone?: Zone;
  allocations: ManpowerAllocation[];
  employees: Employee[];
}

export const ProjectInspectorDrawer: React.FC<ProjectInspectorDrawerProps> = ({
  project,
  onClose,
  notes,
  onAddNote,
  onOpenManpower,
  onOpenChecklist,
  onOpenProposals,
  onUpdateStatus,
  estate,
  location,
  zone,
  allocations,
  employees
}) => {
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteType, setNewNoteType] = useState<ProjectNote['noteType']>('vip_instruction');
  const [authorName, setAuthorName] = useState('Lead Operations Supervisor');

  if (!project) return null;

  const projectNotes = notes.filter(n => n.projectId === project.id);
  const projectAllocs = allocations.filter(a => a.projectId === project.id);
  const employeeMap = new Map(employees.map(e => [e.id, e]));

  const assignedStaff = projectAllocs
    .map(a => employeeMap.get(a.employeeId))
    .filter((e): e is Employee => Boolean(e));

  const handlePostNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    onAddNote(
      project.id,
      newNoteType,
      authorName.trim() || 'Operations Lead',
      newNoteContent.trim()
    );
    setNewNoteContent('');
  };

  const getNoteTypeBadge = (type: ProjectNote['noteType']) => {
    switch (type) {
      case 'vip_instruction':
        return <span className="status-badge active" style={{ fontSize: '10px' }}>VIP Instruction</span>;
      case 'delay_warning':
        return <span className="status-badge stale" style={{ fontSize: '10px' }}>Delay Warning</span>;
      case 'site_feedback':
        return <span className="status-badge completed" style={{ fontSize: '10px' }}>Site Log</span>;
      default:
        return <span className="status-badge paused" style={{ fontSize: '10px' }}>Note</span>;
    }
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <div>
            <span className="property-tag" style={{ marginBottom: '4px', display: 'inline-block' }}>
              {estate?.name} • {location?.name}
            </span>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{project.title}</h3>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
              Updated {formatRelativeTime(project.lastProgressUpdatedAt)} • Priority: {project.priority.toUpperCase()}
            </div>

            {/* Quick Status Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Status:</span>
              <select
                value={project.status}
                onChange={e => onUpdateStatus?.(project.id, e.target.value as ProjectStatus)}
                style={{
                  fontSize: '12px',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                <option value="active">Active (In progress)</option>
                <option value="paused">Paused (On hold)</option>
                <option value="awaiting_feedback">Awaiting VIP Feedback</option>
                <option value="completed">Completed (100% Finished)</option>
              </select>
            </div>
          </div>
          <button type="button" className="btn-subtle" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="drawer-body">
          {/* Quick Action Dock */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            background: 'var(--bg-sidebar)',
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)'
          }}>
            <button 
              type="button" 
              className="btn-subtle"
              onClick={() => {
                onClose();
                onOpenManpower(project);
              }}
              style={{ flexDirection: 'column', padding: '8px 4px', fontSize: '11px', background: 'var(--bg-canvas)' }}
            >
              <Users size={14} color="var(--accent-blue)" />
              <span>Shift Crew ({assignedStaff.length})</span>
            </button>

            <button 
              type="button" 
              className="btn-subtle"
              onClick={() => {
                onClose();
                onOpenChecklist(project);
              }}
              style={{ flexDirection: 'column', padding: '8px 4px', fontSize: '11px', background: 'var(--bg-canvas)' }}
            >
              <ShieldCheck size={14} color="var(--accent-green)" />
              <span>Quality Gate</span>
            </button>

            <button 
              type="button" 
              className="btn-subtle"
              onClick={() => {
                onClose();
                onOpenProposals(project);
              }}
              style={{ flexDirection: 'column', padding: '8px 4px', fontSize: '11px', background: 'var(--bg-canvas)' }}
            >
              <Layers size={14} color="var(--accent-purple)" />
              <span>Options Spec</span>
            </button>
          </div>

          {/* Progress & Current Stage */}
          <div style={{
            background: 'var(--bg-canvas)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Overall Workstream Progress</span>
              <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {project.progressPercentage}%
              </span>
            </div>
            <div style={{ height: '8px', background: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${project.progressPercentage}%`, 
                  height: '100%', 
                  background: project.status === 'completed' ? 'var(--accent-green)' : 'var(--accent-blue)' 
                }} 
              />
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              <strong>Stage:</strong> {project.currentStageSummary}
            </div>
          </div>

          {/* Activity Feed: VIP Instructions & Feedback */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={14} />
              <span>VIP Instructions, Comments & Site Logs ({projectNotes.length})</span>
            </h4>

            {projectNotes.length === 0 ? (
              <div style={{ padding: '16px', background: 'var(--bg-sidebar)', borderRadius: 'var(--radius-md)', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
                No instructions or comments recorded yet. Add one below.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {projectNotes.map(n => (
                  <div 
                    key={n.id}
                    style={{
                      background: 'var(--bg-canvas)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {getNoteTypeBadge(n.noteType)}
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>{n.authorName}</span>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-primary)', marginTop: '2px', lineHeight: 1.4 }}>
                      {n.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Instruction / Note Form */}
          <form onSubmit={handlePostNote} style={{
            background: 'var(--bg-sidebar)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Append New Instruction / Comment</span>
              <select 
                value={newNoteType} 
                onChange={e => setNewNoteType(e.target.value as any)}
                style={{ fontSize: '11px', padding: '2px 6px' }}
              >
                <option value="vip_instruction">VIP Client Instruction</option>
                <option value="site_feedback">Site Progress Feedback</option>
                <option value="delay_warning">Delay / Material Warning</option>
                <option value="daily_log">Daily Supervisor Log</option>
              </select>
            </div>

            <textarea 
              rows={2} 
              value={newNoteContent}
              onChange={e => setNewNoteContent(e.target.value)}
              placeholder="Record VIP directive, instruction, or site progress notes..."
              style={{ fontSize: '12px', resize: 'vertical' }}
              required
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-primary" style={{ padding: '4px 10px', fontSize: '12px' }}>
                <Send size={12} />
                <span>Log Instruction</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="drawer-footer">
          <button type="button" className="btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
