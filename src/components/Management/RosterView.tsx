import React, { useState, useMemo } from 'react';
import { Employee, Project, TradeSpecialtyItem, TradeSpecialty } from '../../types';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  Plus, 
  Check, 
  X,
  Edit3,
  Trash2,
  Upload,
  Image as ImageIcon,
  FileSpreadsheet,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface RosterViewProps {
  employees: Employee[];
  projects: Project[];
  trades: TradeSpecialtyItem[];
  onToggleDeployable: (employeeId: string) => void;
  onSaveEmployee: (employee: Employee) => void;
  onDeleteEmployee?: (employeeId: string) => void;
  onBulkAddEmployees?: (employees: Employee[]) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80'
];

export const RosterView: React.FC<RosterViewProps> = ({
  employees,
  projects,
  trades,
  onToggleDeployable,
  onSaveEmployee,
  onDeleteEmployee,
  onBulkAddEmployees
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<string>('all');
  const [deployableFilter, setDeployableFilter] = useState<'all' | 'deployable' | 'restricted'>('all');
  
  // Single Worker Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Single Worker Form state
  const [formFullName, setFormFullName] = useState('');
  const [formTrade, setFormTrade] = useState<string>('general');
  const [formExternalId, setFormExternalId] = useState('');
  const [formAvatarUrl, setFormAvatarUrl] = useState('');
  const [formIsDeployable, setFormIsDeployable] = useState(true);

  // Bulk Import Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkInputText, setBulkInputText] = useState('');
  const [bulkImportSuccessMsg, setBulkImportSuccessMsg] = useState<string | null>(null);

  // Pagination State (25 workers per page)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = emp.fullName.toLowerCase().includes(q);
        const matchesId = emp.externalPwaId.toLowerCase().includes(q);
        const matchesTrade = emp.tradeSpecialty.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesTrade) return false;
      }

      // Trade filter
      if (selectedTrade !== 'all' && emp.tradeSpecialty.toLowerCase() !== selectedTrade.toLowerCase()) {
        return false;
      }

      // Deployable filter
      if (deployableFilter === 'deployable' && !emp.isDeployable) return false;
      if (deployableFilter === 'restricted' && emp.isDeployable) return false;

      return true;
    });
  }, [employees, searchQuery, selectedTrade, deployableFilter]);

  // Reset to page 1 whenever filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTrade, deployableFilter]);

  const totalPages = Math.ceil(filteredEmployees.length / pageSize) || 1;
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, currentPage, pageSize]);

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setFormFullName('');
    setFormTrade(trades[0]?.key || 'general');
    setFormExternalId('');
    setFormAvatarUrl(PRESET_AVATARS[employees.length % PRESET_AVATARS.length]);
    setFormIsDeployable(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormFullName(emp.fullName);
    setFormTrade(emp.tradeSpecialty);
    setFormExternalId(emp.externalPwaId);
    setFormAvatarUrl(emp.avatarUrl || '');
    setFormIsDeployable(emp.isDeployable);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName.trim()) return;

    const nextNum = employees.length + 1;
    const employeeToSave: Employee = {
      id: editingEmployee?.id || `emp-${Date.now().toString(36)}`,
      externalPwaId: formExternalId.trim() || editingEmployee?.externalPwaId || `PWA-HR-${1000 + nextNum}`,
      fullName: formFullName.trim(),
      tradeSpecialty: formTrade as TradeSpecialty,
      avatarUrl: formAvatarUrl.trim() || undefined,
      isDeployable: formIsDeployable,
      isActive: true,
      phoneRestrictedAcknowledged: true,
      createdAt: editingEmployee?.createdAt || new Date().toISOString()
    };

    onSaveEmployee(employeeToSave);
    setIsModalOpen(false);
  };

  // Parse bulk text into Employee objects
  const parsedBulkEmployees = useMemo(() => {
    if (!bulkInputText.trim()) return [];

    const lines = bulkInputText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const validTrades = new Set(trades.map(t => t.key.toLowerCase()));
    const result: Employee[] = [];
    const timestamp = Date.now();

    lines.forEach((line, index) => {
      // Split by comma, tab, or semicolon
      const parts = line.split(/[,;\t]/).map(p => p.trim()).filter(Boolean);
      if (parts.length === 0) return;

      const fullName = parts[0];
      let trade: TradeSpecialty = 'general';
      let externalId = `PWA-HR-${1050 + index + employees.length}`;
      let avatarUrl = PRESET_AVATARS[(index + employees.length) % PRESET_AVATARS.length];

      if (parts.length > 1) {
        const rawTrade = parts[1].toLowerCase();
        // Check if matching any trade key or name
        const matched = trades.find(t => t.key.toLowerCase() === rawTrade || t.name.toLowerCase().includes(rawTrade));
        if (matched) {
          trade = matched.key as TradeSpecialty;
        } else if (validTrades.has(rawTrade)) {
          trade = rawTrade as TradeSpecialty;
        }
      }

      if (parts.length > 2 && parts[2]) {
        externalId = parts[2];
      }

      if (parts.length > 3 && parts[3].startsWith('http')) {
        avatarUrl = parts[3];
      }

      result.push({
        id: `emp-bulk-${timestamp}-${index}`,
        externalPwaId: externalId,
        fullName,
        tradeSpecialty: trade,
        avatarUrl,
        isDeployable: true,
        isActive: true,
        phoneRestrictedAcknowledged: true,
        createdAt: new Date().toISOString()
      });
    });

    return result;
  }, [bulkInputText, trades, employees.length]);

  const handleExecuteBulkImport = () => {
    if (parsedBulkEmployees.length === 0) return;

    if (onBulkAddEmployees) {
      onBulkAddEmployees(parsedBulkEmployees);
    } else {
      parsedBulkEmployees.forEach(emp => onSaveEmployee(emp));
    }

    setBulkImportSuccessMsg(`✓ Successfully added ${parsedBulkEmployees.length} workers to the team roster.`);
    setTimeout(() => {
      setBulkImportSuccessMsg(null);
      setIsBulkModalOpen(false);
      setBulkInputText('');
    }, 1500);
  };

  const handleLoadSampleBulkData = () => {
    setBulkInputText(
      `Piolo Pascual, Carpentry\n` +
      `Jericho Rosales, Electrical\n` +
      `Dingdong Dantes, Masonry\n` +
      `Coco Martin, Plumbing\n` +
      `Alden Richards, Painting\n` +
      `Daniel Padilla, General`
    );
  };

  const deployableTotal = employees.filter(e => e.isDeployable).length;

  return (
    <div className="roster-view">
      {/* Header */}
      <div className="queue-header">
        <div className="queue-title-area">
          <h2 className="queue-title">Team Roster & Workers</h2>
          <span className="queue-counter">
            {deployableTotal} of {employees.length} workers ready for project assignment
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            type="button" 
            className="btn-subtle" 
            onClick={() => {
              setBulkInputText('');
              setBulkImportSuccessMsg(null);
              setIsBulkModalOpen(true);
            }}
            style={{ border: '1px solid var(--border-strong)', padding: '6px 12px' }}
            title="Import a list of multiple workers at once"
          >
            <Upload size={14} color="var(--accent-blue)" />
            <span>+ Import Workers</span>
          </button>

          <button type="button" className="btn-primary" onClick={handleOpenAdd}>
            <Plus size={14} />
            <span>Add Worker</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="controls-row">
        <div className="search-input-wrap">
          <Search size={14} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search workers by name, trade, or ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-pills">
          <button 
            type="button" 
            className={`filter-pill ${deployableFilter === 'all' ? 'active' : ''}`}
            onClick={() => setDeployableFilter('all')}
          >
            All Workers ({employees.length})
          </button>
          <button 
            type="button" 
            className={`filter-pill ${deployableFilter === 'deployable' ? 'active' : ''}`}
            onClick={() => setDeployableFilter('deployable')}
          >
            Available ({deployableTotal})
          </button>
          <button 
            type="button" 
            className={`filter-pill ${deployableFilter === 'restricted' ? 'active' : ''}`}
            onClick={() => setDeployableFilter('restricted')}
          >
            Off-Site ({employees.length - deployableTotal})
          </button>
        </div>

        <select 
          value={selectedTrade} 
          onChange={e => setSelectedTrade(e.target.value)}
          style={{ fontSize: '12px', padding: '6px 10px', minWidth: '150px' }}
        >
          <option value="all">All Trades ({employees.length})</option>
          {trades.map(t => (
            <option key={t.id} value={t.key}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Roster Table */}
      <div className="notion-table-container">
        <table className="notion-table">
          <thead>
            <tr>
              <th style={{ width: '32%' }}>Worker Name & Photo</th>
              <th style={{ width: '20%' }}>Trade</th>
              <th style={{ width: '22%' }}>Availability</th>
              <th style={{ width: '14%' }}>Status</th>
              <th style={{ width: '12%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-tertiary)' }}>
                  No workers found matching your search.
                </td>
              </tr>
            ) : (
              paginatedEmployees.map(emp => (
                <tr key={emp.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {emp.avatarUrl ? (
                        <img 
                          src={emp.avatarUrl} 
                          alt={emp.fullName}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '1.5px solid var(--border-default)',
                            flexShrink: 0
                          }}
                          onError={(e) => {
                            // If image link fails, fallback gracefully
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div 
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'var(--accent-blue-bg)',
                            color: 'var(--accent-blue)',
                            fontWeight: 700,
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1.5px solid var(--accent-blue-border)',
                            flexShrink: 0
                          }}
                        >
                          {emp.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>
                          {emp.fullName}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                          {emp.externalPwaId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span 
                      style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        background: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '11px',
                        fontWeight: 500,
                        textTransform: 'capitalize'
                      }}
                    >
                      {emp.tradeSpecialty}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {emp.isDeployable ? (
                        <span className="status-badge active" style={{ fontSize: '11px' }}>
                          <Check size={11} />
                          Available
                        </span>
                      ) : (
                        <span className="status-badge paused" style={{ fontSize: '11px' }}>
                          Off-Site
                        </span>
                      )}
                      <button 
                        type="button" 
                        className="btn-subtle"
                        onClick={() => onToggleDeployable(emp.id)}
                        style={{ padding: '2px 6px', fontSize: '10px', border: '1px solid var(--border-subtle)' }}
                        title="Toggle availability"
                      >
                        {emp.isDeployable ? 'Set Off-Site' : 'Make Available'}
                      </button>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--accent-green)' }}>
                      <ShieldCheck size={13} />
                      <span>Active & Verified</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button 
                        type="button" 
                        className="btn-subtle"
                        onClick={() => handleOpenEdit(emp)}
                        title="Edit worker record"
                        style={{ padding: '4px 6px' }}
                      >
                        <Edit3 size={13} />
                      </button>

                      {employees.length > 1 && onDeleteEmployee && (
                        <button 
                          type="button" 
                          className="btn-subtle"
                          onClick={() => {
                            if (window.confirm(`Delete ${emp.fullName} (${emp.externalPwaId}) from roster?`)) {
                              onDeleteEmployee(emp.id);
                            }
                          }}
                          title="Delete worker"
                          style={{ color: 'var(--accent-red)', padding: '4px 6px' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Bar (25 items per page) */}
        {filteredEmployees.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            background: 'var(--bg-canvas)',
            borderTop: '1px solid var(--border-default)',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Showing <strong>{(currentPage - 1) * pageSize + 1}</strong>–<strong>{Math.min(currentPage * pageSize, filteredEmployees.length)}</strong> of <strong>{filteredEmployees.length}</strong> workers
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                className="btn-subtle"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                style={{
                  padding: '5px 12px',
                  fontSize: '12px',
                  opacity: currentPage === 1 ? 0.4 : 1,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    border: pageNum === currentPage ? '1px solid var(--accent-blue)' : '1px solid var(--border-default)',
                    background: pageNum === currentPage ? 'var(--accent-blue)' : 'var(--bg-subtle)',
                    color: pageNum === currentPage ? '#fff' : 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                className="btn-subtle"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                style={{
                  padding: '5px 12px',
                  fontSize: '12px',
                  opacity: currentPage === totalPages ? 0.4 : 1,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add/Edit Single Employee */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingEmployee ? 'Edit Worker Record' : 'Add Worker to Team'}</h3>
              <button type="button" className="btn-subtle" onClick={() => setIsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Photo Preview & URL */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {formAvatarUrl ? (
                    <img 
                      src={formAvatarUrl} 
                      alt="Preview"
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid var(--accent-blue)',
                        flexShrink: 0
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      background: 'var(--bg-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px dashed var(--border-strong)',
                      flexShrink: 0
                    }}>
                      <ImageIcon size={20} color="var(--text-tertiary)" />
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '4px' }}>
                      Worker Photo / Avatar URL
                    </label>
                    <input 
                      type="url" 
                      placeholder="Paste image web link (https://...)"
                      value={formAvatarUrl}
                      onChange={e => setFormAvatarUrl(e.target.value)}
                      style={{ fontSize: '12px', padding: '6px 8px' }}
                    />
                  </div>
                </div>

                {/* Quick Avatar Presets */}
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '6px' }}>
                    Or pick a preset worker photo:
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {PRESET_AVATARS.map((url, i) => (
                      <img 
                        key={i}
                        src={url}
                        alt={`Preset ${i}`}
                        onClick={() => setFormAvatarUrl(url)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          cursor: 'pointer',
                          border: formAvatarUrl === url ? '2px solid var(--accent-blue)' : '1px solid var(--border-default)',
                          opacity: formAvatarUrl === url ? 1 : 0.75,
                          transition: 'opacity 0.15s, border 0.15s'
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Danilo Santos"
                    value={formFullName}
                    onChange={e => setFormFullName(e.target.value)}
                    autoFocus
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Trade / Skill</label>
                    <select value={formTrade} onChange={e => setFormTrade(e.target.value)}>
                      {trades.map(t => (
                        <option key={t.id} value={t.key}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Worker ID</label>
                    <input 
                      type="text" 
                      placeholder="e.g. PWA-HR-1051"
                      value={formExternalId}
                      onChange={e => setFormExternalId(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                  <input 
                    type="checkbox" 
                    id="chk-deployable" 
                    checked={formIsDeployable} 
                    onChange={e => setFormIsDeployable(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="chk-deployable" style={{ fontSize: '13px', cursor: 'pointer' }}>
                    Available for on-site project assignment
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-subtle" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">
                  <Check size={14} />
                  <span>{editingEmployee ? 'Save Changes' : 'Add Worker'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bulk Import Multiple Workers */}
      {isBulkModalOpen && (
        <div className="modal-overlay" onClick={() => setIsBulkModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSpreadsheet size={18} color="var(--accent-blue)" />
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Import Multiple Workers</h3>
              </div>
              <button type="button" className="btn-subtle" onClick={() => setIsBulkModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {bulkImportSuccessMsg ? (
                <div style={{
                  padding: '24px',
                  textAlign: 'center',
                  background: 'var(--accent-green-bg)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--accent-green)',
                  fontWeight: 600
                }}>
                  <CheckCircle2 size={32} style={{ margin: '0 auto 8px', display: 'block' }} />
                  {bulkImportSuccessMsg}
                </div>
              ) : (
                <>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600 }}>
                        Paste Worker List (Name, Trade)
                      </label>
                      <button 
                        type="button" 
                        className="btn-subtle" 
                        onClick={handleLoadSampleBulkData}
                        style={{ fontSize: '11px', padding: '2px 8px' }}
                      >
                        <Sparkles size={11} color="var(--accent-blue)" />
                        <span>Load Sample List</span>
                      </button>
                    </div>

                    <textarea 
                      rows={6}
                      placeholder="Enter one worker per line:&#10;Mateo Cruz, Carpentry&#10;Danilo Mendoza, Electrical&#10;Rafael Garcia, Masonry"
                      value={bulkInputText}
                      onChange={e => setBulkInputText(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: '12px',
                        fontFamily: 'var(--font-mono)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-default)',
                        background: 'var(--bg-canvas)',
                        color: 'var(--text-primary)',
                        resize: 'vertical'
                      }}
                    />
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                      Format: <code>Full Name, Trade</code> (e.g. Carpentry, Electrical, Masonry, Plumbing, Painting, General)
                    </div>
                  </div>

                  {/* Parsed Preview */}
                  {parsedBulkEmployees.length > 0 && (
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-blue)', marginBottom: '6px' }}>
                        Ready to Import: {parsedBulkEmployees.length} Worker{parsedBulkEmployees.length > 1 ? 's' : ''}
                      </div>

                      <div style={{
                        maxHeight: '160px',
                        overflowY: 'auto',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-sidebar)'
                      }}>
                        {parsedBulkEmployees.map((emp, idx) => (
                          <div 
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '6px 10px',
                              borderBottom: idx < parsedBulkEmployees.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                              fontSize: '12px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {emp.avatarUrl && (
                                <img 
                                  src={emp.avatarUrl} 
                                  alt="" 
                                  style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} 
                                />
                              )}
                              <span style={{ fontWeight: 600 }}>{emp.fullName}</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>({emp.externalPwaId})</span>
                            </div>
                            <span style={{
                              padding: '2px 6px',
                              background: 'var(--bg-canvas)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '10px',
                              textTransform: 'capitalize',
                              border: '1px solid var(--border-default)'
                            }}>
                              {emp.tradeSpecialty}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {!bulkImportSuccessMsg && (
              <div className="modal-footer">
                <button type="button" className="btn-subtle" onClick={() => setIsBulkModalOpen(false)}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn-primary" 
                  disabled={parsedBulkEmployees.length === 0}
                  onClick={handleExecuteBulkImport}
                  style={{ opacity: parsedBulkEmployees.length === 0 ? 0.5 : 1 }}
                >
                  <Upload size={14} />
                  <span>Import {parsedBulkEmployees.length > 0 ? `${parsedBulkEmployees.length} Workers` : 'Workers'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
