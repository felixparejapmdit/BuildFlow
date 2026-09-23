import React, { useState } from 'react';
import { Snapshot } from '../../types';
import { 
  Camera, 
  RotateCcw, 
  Download, 
  Trash2, 
  Plus, 
  Search, 
  Check, 
  X, 
  Database, 
  HardDrive, 
  Calendar, 
  FileText, 
  ShieldCheck,
  AlertTriangle,
  FolderKanban,
  Users,
  Building
} from 'lucide-react';
import { getIconColorForText } from '../../utils/colors';

interface SnapshotsViewProps {
  snapshots: Snapshot[];
  onCreateSnapshot: (label: string, notes?: string) => void;
  onRestoreSnapshot: (snapshotId: string) => void;
  onDeleteSnapshot: (snapshotId: string) => void;
  liveStats: {
    totalProjects: number;
    totalWorkers: number;
    totalEstates: number;
    totalUsers: number;
  };
}

export const SnapshotsView: React.FC<SnapshotsViewProps> = ({
  snapshots,
  onCreateSnapshot,
  onRestoreSnapshot,
  onDeleteSnapshot,
  liveStats
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLabel, setFormLabel] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Storage footprint calculation
  const totalSizeBytes = snapshots.reduce((acc, s) => acc + (s.sizeBytes || 0), 0);
  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const filteredSnapshots = snapshots.filter(s => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchLabel = s.label.toLowerCase().includes(q);
      const matchNotes = s.notes?.toLowerCase().includes(q);
      const matchDate = s.createdAt.toLowerCase().includes(q);
      if (!matchLabel && !matchNotes && !matchDate) return false;
    }
    return true;
  });

  const handleOpenCreate = () => {
    const dateStr = new Date().toLocaleString();
    setFormLabel(`Operations Snapshot - ${dateStr}`);
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLabel.trim()) return;

    onCreateSnapshot(formLabel.trim(), formNotes.trim() || undefined);
    setIsModalOpen(false);
  };

  const handleDownload = (snapshot: Snapshot) => {
    try {
      // Decode or directly package snapshot
      const exportBlob = new Blob([snapshot.encryptedPayload], { type: 'application/json' });
      const url = URL.createObjectURL(exportBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `buildflow_snapshot_${snapshot.id}_${snapshot.createdAt.split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download snapshot file.');
    }
  };

  const handleRestore = (snapshot: Snapshot) => {
    if (window.confirm(`⚠️ RESTORE POINT-IN-TIME SNAPSHOT:\n\nAre you sure you want to restore "${snapshot.label}"?\nCaptured on: ${new Date(snapshot.createdAt).toLocaleString()}\n\nThis will restore the entire database state to this exact snapshot.`)) {
      onRestoreSnapshot(snapshot.id);
    }
  };

  const handleDelete = (snapshot: Snapshot) => {
    if (window.confirm(`Delete snapshot "${snapshot.label}" permanently?`)) {
      onDeleteSnapshot(snapshot.id);
    }
  };

  const cameraIconColor = getIconColorForText('snapshot');

  return (
    <div className="snapshots-management-view">
      {/* Header */}
      <div className="queue-header">
        <div className="queue-title-area">
          <h2 className="queue-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={20} color={cameraIconColor.color} />
            <span>Point-in-Time System Snapshots</span>
          </h2>
          <span className="queue-counter">
            {snapshots.length} cryptographic point-in-time states recorded with 1-click restore & export
          </span>
        </div>

        <button 
          type="button" 
          className="btn-primary" 
          onClick={handleOpenCreate}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Camera size={14} strokeWidth={2.2} />
          <span>Take Snapshot Now</span>
        </button>
      </div>

      {/* Summary Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
            Saved Snapshots
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '2px', color: 'var(--text-primary)' }}>
            {snapshots.length}
          </div>
        </div>

        <div style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
            Total Vault Storage
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#0ea5e9', marginTop: '2px' }}>
            {formatSize(totalSizeBytes)}
          </div>
        </div>

        <div style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
            Current Live State
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '5px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--accent-blue)' }}>{liveStats.totalProjects} Proj</span>
            <span>•</span>
            <span style={{ color: '#10b981' }}>{liveStats.totalWorkers} Staff</span>
            <span>•</span>
            <span style={{ color: '#8b5cf6' }}>{liveStats.totalUsers} Users</span>
          </div>
        </div>

        <div style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
            Latest Capture
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-mono)', marginTop: '6px', color: 'var(--text-primary)' }}>
            {snapshots[0] ? new Date(snapshots[0].createdAt).toLocaleString() : 'No captures yet'}
          </div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="controls-row">
        <div className="search-input-wrap">
          <Search size={14} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search snapshots by label, notes, or date..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Snapshots Table */}
      <div className="notion-table-container">
        <table className="notion-table">
          <thead>
            <tr>
              <th style={{ width: '28%' }}>Snapshot Name & Timestamp</th>
              <th style={{ width: '26%' }}>Records Summary</th>
              <th style={{ width: '24%' }}>Scope Notes & Vault Size</th>
              <th style={{ width: '22%', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSnapshots.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                  No snapshots captured yet. Click "Take Snapshot Now" to record a baseline state.
                </td>
              </tr>
            ) : (
              filteredSnapshots.map(snap => {
                const s = snap.recordsSummary || {} as any;
                const snapColor = getIconColorForText(snap.label);

                return (
                  <tr key={snap.id}>
                    {/* Name & Time */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '8px', 
                          background: snapColor.bg, 
                          border: `1px solid ${snapColor.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Camera size={16} color={snapColor.color} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {snap.label}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                            {new Date(snap.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Records Summary */}
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        <span 
                          className="tag" 
                          style={{ 
                            fontSize: '11px', 
                            background: 'rgba(59, 130, 246, 0.12)', 
                            color: '#3b82f6', 
                            borderColor: 'rgba(59, 130, 246, 0.28)' 
                          }}
                          title="Projects Count"
                        >
                          <FolderKanban size={10} style={{ marginRight: '3px' }} />
                          {s.projectsCount ?? 0} Projects
                        </span>

                        <span 
                          className="tag" 
                          style={{ 
                            fontSize: '11px', 
                            background: 'rgba(16, 185, 129, 0.12)', 
                            color: '#10b981', 
                            borderColor: 'rgba(16, 185, 129, 0.28)' 
                          }}
                          title="Employees Count"
                        >
                          <Users size={10} style={{ marginRight: '3px' }} />
                          {s.employeesCount ?? 0} Roster
                        </span>

                        <span 
                          className="tag" 
                          style={{ 
                            fontSize: '11px', 
                            background: 'rgba(139, 92, 246, 0.12)', 
                            color: '#8b5cf6', 
                            borderColor: 'rgba(139, 92, 246, 0.28)' 
                          }}
                          title="Users Count"
                        >
                          {s.usersCount ?? 0} Users
                        </span>

                        <span 
                          className="tag" 
                          style={{ 
                            fontSize: '11px', 
                            background: 'rgba(245, 158, 11, 0.12)', 
                            color: '#f59e0b', 
                            borderColor: 'rgba(245, 158, 11, 0.28)' 
                          }}
                          title="Properties & Zones"
                        >
                          <Building size={10} style={{ marginRight: '3px' }} />
                          {s.estatesCount ?? 0} Estates
                        </span>
                      </div>
                    </td>

                    {/* Notes & Size */}
                    <td>
                      <div>
                        <div style={{ fontSize: '12px', color: snap.notes ? 'var(--text-secondary)' : 'var(--text-tertiary)', fontStyle: snap.notes ? 'normal' : 'italic' }}>
                          {snap.notes || 'No description notes'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                          Payload: {formatSize(snap.sizeBytes)} • AES-256 E2EE
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <button 
                          type="button" 
                          className="btn-subtle" 
                          onClick={() => handleRestore(snap)}
                          title="1-Click restore active database to this snapshot"
                          style={{ 
                            padding: '5px 9px', 
                            color: 'var(--accent-blue)', 
                            borderColor: 'rgba(59, 130, 246, 0.3)',
                            background: 'rgba(59, 130, 246, 0.06)'
                          }}
                        >
                          <RotateCcw size={12} style={{ marginRight: '4px' }} />
                          <span>Restore</span>
                        </button>

                        <button 
                          type="button" 
                          className="btn-subtle" 
                          onClick={() => handleDownload(snap)}
                          title="Download snapshot JSON file"
                          style={{ padding: '5px 8px' }}
                        >
                          <Download size={13} />
                        </button>

                        <button 
                          type="button" 
                          className="btn-subtle" 
                          onClick={() => handleDelete(snap)}
                          title="Delete snapshot permanently"
                          style={{ padding: '5px 8px', color: 'var(--accent-red)' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Take Snapshot Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={18} color="var(--accent-blue)" />
                <h3 style={{ margin: 0 }}>Capture Point-in-Time Snapshot</h3>
              </div>
              <button 
                type="button" 
                className="btn-subtle" 
                onClick={() => setIsModalOpen(false)}
                style={{ padding: '4px' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ 
                padding: '12px 14px', 
                background: 'rgba(59, 130, 246, 0.08)', 
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: 'var(--radius-md)',
                fontSize: '12px',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ fontWeight: 600, color: 'var(--accent-blue)', marginBottom: '4px' }}>
                  Live System Scope Included in Snapshot:
                </div>
                <div>
                  • {liveStats.totalProjects} Projects & Queue Statuses<br />
                  • {liveStats.totalWorkers} Team Roster & Deployments<br />
                  • {liveStats.totalEstates} Estates, Locations & Zones<br />
                  • {liveStats.totalUsers} User Accounts & Credentials<br />
                  • Full Quality Checklists & Priority Taxonomies
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Snapshot Label / Identifier *
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Pre-Handover Milestone" 
                  value={formLabel}
                  onChange={e => setFormLabel(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Notes & Context (Optional)
                </label>
                <textarea 
                  className="form-input" 
                  rows={3}
                  placeholder="Briefly state why this snapshot is being taken (e.g. before major batch updates)..." 
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button 
                  type="button" 
                  className="btn-subtle" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Camera size={14} />
                  <span>Capture & Encrypt Snapshot</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
