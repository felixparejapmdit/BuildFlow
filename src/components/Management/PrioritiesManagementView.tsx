import React, { useState } from 'react';
import { PriorityItem, Project } from '../../types';
import { 
  AlertCircle, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X,
  Flame,
  Briefcase
} from 'lucide-react';
import { showConfirm } from '../Common/ConfirmDialog';

interface PrioritiesManagementViewProps {
  priorities: PriorityItem[];
  projects: Project[];
  onSavePriority: (priority: PriorityItem) => void;
  onDeletePriority: (priorityId: string) => void;
}

export const PrioritiesManagementView: React.FC<PrioritiesManagementViewProps> = ({
  priorities,
  projects,
  onSavePriority,
  onDeletePriority
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPriority, setEditingPriority] = useState<PriorityItem | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formKey, setFormKey] = useState('');
  const [formLevel, setFormLevel] = useState<number>(2);
  const [formColor, setFormColor] = useState('var(--text-secondary)');
  const [formDescription, setFormDescription] = useState('');

  // Active project counts per priority
  const projectCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => {
      const k = p.priority.toLowerCase();
      counts[k] = (counts[k] || 0) + 1;
    });
    return counts;
  }, [projects]);

  const filteredPriorities = priorities.filter(p => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchKey = p.key.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      if (!matchName && !matchKey && !matchDesc) return false;
    }
    return true;
  }).sort((a, b) => b.level - a.level); // Sort highest priority level first

  const handleOpenAdd = () => {
    setEditingPriority(null);
    setFormName('');
    setFormKey('');
    setFormLevel(2);
    setFormColor('var(--accent-blue)');
    setFormDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prio: PriorityItem) => {
    setEditingPriority(prio);
    setFormName(prio.name);
    setFormKey(prio.key);
    setFormLevel(prio.level);
    setFormColor(prio.colorTag || 'var(--text-secondary)');
    setFormDescription(prio.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const key = formKey.trim() 
      ? formKey.trim().toLowerCase().replace(/\s+/g, '_') 
      : formName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');

    const priorityToSave: PriorityItem = {
      id: editingPriority?.id || `prio-${Date.now().toString(36)}`,
      key,
      name: formName.trim(),
      level: Number(formLevel),
      colorTag: formColor,
      description: formDescription.trim() || undefined,
      isActive: true,
      createdAt: editingPriority?.createdAt || new Date().toISOString()
    };

    onSavePriority(priorityToSave);
    setIsModalOpen(false);
  };

  return (
    <div className="priorities-management-view">
      {/* Header */}
      <div className="queue-header">
        <div className="queue-title-area">
          <h2 className="queue-title">Priority Tiers & SLA Management</h2>
          <span className="queue-counter">
            {priorities.length} urgency tiers governing field dispatch and supervisor escalation
          </span>
        </div>

        <button type="button" className="btn-primary" onClick={handleOpenAdd}>
          <Plus size={14} />
          <span>Add Priority Tier</span>
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
          <div style={{ fontSize: '11px', color: 'var(--accent-red)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
            VIP Urgent Workstreams
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-red)', marginTop: '2px' }}>
            {projectCounts['vip_urgent'] || 0}
          </div>
        </div>

        <div style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', color: 'var(--accent-amber)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
            High Priority Workstreams
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', marginTop: '2px' }}>
            {projectCounts['high'] || 0}
          </div>
        </div>

        <div style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
            Standard / Normal Workstreams
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
            {projectCounts['normal'] || 0}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-row">
        <div className="search-input-wrap">
          <Search size={14} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search priorities by name, key, or SLA description..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Notion Data Table */}
      <div className="notion-table-container">
        <table className="notion-table">
          <thead>
            <tr>
              <th style={{ width: '25%' }}>Priority Name & System Key</th>
              <th style={{ width: '15%' }}>Urgency Tier</th>
              <th style={{ width: '34%' }}>SLA Guidelines & Protocol</th>
              <th style={{ width: '14%' }}>Active Workstreams</th>
              <th style={{ width: '12%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPriorities.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-tertiary)' }}>
                  No priority tiers match your search.
                </td>
              </tr>
            ) : (
              filteredPriorities.map(prio => {
                const count = projectCounts[prio.key.toLowerCase()] || 0;

                return (
                  <tr key={prio.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div 
                          style={{ 
                            width: '10px', 
                            height: '10px', 
                            borderRadius: '50%', 
                            background: prio.colorTag || 'var(--text-secondary)' 
                          }} 
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {prio.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                            key: {prio.key}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span 
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: prio.level >= 4 ? 'var(--accent-red-bg)' : prio.level === 3 ? 'var(--accent-amber-bg)' : 'var(--bg-subtle)',
                          color: prio.level >= 4 ? 'var(--accent-red)' : prio.level === 3 ? 'var(--accent-amber)' : 'var(--text-secondary)',
                          border: `1px solid ${prio.level >= 4 ? 'var(--accent-red-border)' : prio.level === 3 ? 'var(--accent-amber-border)' : 'var(--border-subtle)'}`
                        }}
                      >
                        {prio.level >= 4 && <Flame size={11} />}
                        Level {prio.level} of 4
                      </span>
                    </td>
                    <td>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                        {prio.description || 'Standard project prioritization.'}
                      </p>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Briefcase size={12} color={count > 0 ? 'var(--accent-blue)' : 'var(--text-tertiary)'} />
                        <span style={{ fontWeight: 600, fontSize: '12px', color: count > 0 ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                          {count} {count === 1 ? 'project' : 'projects'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button 
                          type="button" 
                          className="btn-subtle" 
                          onClick={() => handleOpenEdit(prio)}
                          title="Edit priority tier"
                          style={{ padding: '3px 6px' }}
                        >
                          <Edit3 size={12} />
                        </button>
                        {priorities.length > 1 && (
                          <button 
                            type="button" 
                            className="btn-subtle" 
                            onClick={async () => {
                              const confirmed = await showConfirm({
                                title: 'Delete Priority Tier',
                                message: `Are you sure you want to delete priority tier "${prio.name}"?\n\nExisting workstreams with this tier may need priority re-classification.`,
                                confirmText: 'Delete Priority',
                                variant: 'danger',
                                notice: 'Taxonomy priority adjustment'
                              });
                              if (confirmed) {
                                onDeletePriority(prio.id);
                              }
                            }}
                            title="Delete priority"
                            style={{ color: 'var(--accent-red)', padding: '3px 6px' }}
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingPriority ? 'Edit Priority Tier' : 'Add New Priority Tier'}</h3>
              <button type="button" className="btn-subtle" onClick={() => setIsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Priority Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. VIP Urgent, Immediate Dispatch, Scheduled Maintenance" 
                    value={formName}
                    onChange={e => {
                      setFormName(e.target.value);
                      if (!editingPriority) {
                        setFormKey(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'));
                      }
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>System Key</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. vip_urgent" 
                      value={formKey}
                      onChange={e => setFormKey(e.target.value)}
                      style={{ fontFamily: 'var(--font-mono)' }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Urgency Level (1–4)</label>
                    <select 
                      value={formLevel} 
                      onChange={e => setFormLevel(Number(e.target.value))}
                    >
                      <option value={4}>Level 4 (Highest / VIP Urgent)</option>
                      <option value={3}>Level 3 (High Priority)</option>
                      <option value={2}>Level 2 (Normal / Standard)</option>
                      <option value={1}>Level 1 (Low / Routine)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Color Accent</label>
                  <select 
                    value={formColor} 
                    onChange={e => setFormColor(e.target.value)}
                  >
                    <option value="var(--accent-red)">Red (Urgent / Critical)</option>
                    <option value="var(--accent-amber)">Amber / Orange (High)</option>
                    <option value="var(--accent-blue)">Blue (Normal)</option>
                    <option value="var(--accent-green)">Green (Complete / Safe)</option>
                    <option value="var(--text-secondary)">Neutral Gray (Routine)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>SLA Guidelines & Protocol Description</label>
                  <textarea 
                    rows={3}
                    placeholder="Describe escalation rules, supervisor notification intervals, and field expectations..." 
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-subtle" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={14} />
                  <span>{editingPriority ? 'Save Changes' : 'Create Priority Tier'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
