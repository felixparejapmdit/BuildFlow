import React, { useState } from 'react';
import { QualityGateItem } from '../../types';
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X,
  AlertTriangle,
  ArrowUpDown,
  Lock,
  CheckCircle2,
  Layers,
  Box,
  Users,
  Clock,
  Eye,
  Scale
} from 'lucide-react';

interface QualityGateManagementViewProps {
  items: QualityGateItem[];
  onSaveItem: (item: QualityGateItem) => void;
  onDeleteItem: (itemId: string) => void;
}

export const QualityGateManagementView: React.FC<QualityGateManagementViewProps> = ({
  items,
  onSaveItem,
  onDeleteItem
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<QualityGateItem | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsMandatory, setFormIsMandatory] = useState(true);
  const [formOrder, setFormOrder] = useState<number>(1);
  const [formIsActive, setFormIsActive] = useState(true);

  const filteredItems = items.filter(item => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  }).sort((a, b) => a.order - b.order);

  const mandatoryCount = items.filter(i => i.isMandatory && i.isActive).length;
  const optionalCount = items.filter(i => !i.isMandatory && i.isActive).length;

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormDescription('');
    setFormIsMandatory(true);
    setFormOrder(items.length + 1);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: QualityGateItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormDescription(item.description);
    setFormIsMandatory(item.isMandatory);
    setFormOrder(item.order);
    setFormIsActive(item.isActive);
    setIsModalOpen(true);
  };

  const handleToggleMandatory = (item: QualityGateItem) => {
    onSaveItem({
      ...item,
      isMandatory: !item.isMandatory
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const newItem: QualityGateItem = {
      id: editingItem ? editingItem.id : `qg-${Date.now().toString(36)}`,
      title: formTitle.trim(),
      description: formDescription.trim(),
      isMandatory: formIsMandatory,
      order: formOrder || (items.length + 1),
      isActive: formIsActive,
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString()
    };

    onSaveItem(newItem);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete quality gate check "${title}"? This will remove it from the pre-flight checklist modal.`)) {
      onDeleteItem(id);
    }
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header Card */}
      <div style={{
        background: 'var(--bg-canvas)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-green-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={18} color="var(--accent-green)" />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Quality Checklist Rules & Standards
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '680px' }}>
              Configure the checklist verification standards required before certifying proposals and project milestones.
            </p>
          </div>

          <button 
            type="button" 
            className="btn-primary"
            onClick={handleOpenAdd}
            style={{ padding: '8px 16px', gap: '8px' }}
          >
            <Plus size={15} />
            <span>Add Quality Check</span>
          </button>
        </div>

        {/* Metrics Banner */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Gate Checks</div>
            <div style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>{items.length}</div>
          </div>
          <div style={{ background: 'var(--accent-amber-bg)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-amber-border)' }}>
            <div style={{ fontSize: '11px', color: 'var(--accent-amber)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mandatory Rules</div>
            <div style={{ fontSize: '22px', fontWeight: 600, color: 'var(--accent-amber)', marginTop: '4px' }}>{mandatoryCount}</div>
          </div>
          <div style={{ background: 'var(--accent-blue-bg)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-blue-border)' }}>
            <div style={{ fontSize: '11px', color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Optional Best Practices</div>
            <div style={{ fontSize: '22px', fontWeight: 600, color: 'var(--accent-blue)', marginTop: '4px' }}>{optionalCount}</div>
          </div>
        </div>
      </div>

      {/* Search and Table Section */}
      <div style={{
        background: 'var(--bg-canvas)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        {/* Filter bar */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border-default)',
          background: 'var(--bg-sidebar)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '380px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input 
              type="text" 
              placeholder="Search checklist rules or descriptions..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '32px' }}
            />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
            Showing {filteredItems.length} of {items.length} checks
          </div>
        </div>

        {/* Quality Checks Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-default)', background: 'var(--bg-canvas)' }}>
                <th style={{ padding: '12px 16px', width: '60px', color: 'var(--text-secondary)', fontWeight: 600 }}>#</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Quality Gate Check & Guideline</th>
                <th style={{ padding: '12px 16px', width: '150px', color: 'var(--text-secondary)', fontWeight: 600 }}>Rule Requirement</th>
                <th style={{ padding: '12px 16px', width: '110px', color: 'var(--text-secondary)', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', width: '100px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    No quality gate checks match your query. Click "+ Add Quality Check" to add one.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => (
                  <tr 
                    key={item.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 0.1s ease'
                    }}
                  >
                    <td style={{ padding: '14px 16px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                      {item.order || index + 1}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={15} color={item.isMandatory ? 'var(--accent-green)' : 'var(--text-secondary)'} />
                        <span>{item.title}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {item.description}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <button 
                        type="button"
                        onClick={() => handleToggleMandatory(item)}
                        title="Click to toggle Mandatory / Optional"
                        style={{
                          fontSize: '11px',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: item.isMandatory ? 'var(--accent-red-bg)' : 'var(--bg-subtle)',
                          color: item.isMandatory ? 'var(--accent-red)' : 'var(--text-secondary)',
                          border: `1px solid ${item.isMandatory ? 'var(--accent-red-border)' : 'var(--border-default)'}`,
                          cursor: 'pointer'
                        }}
                      >
                        {item.isMandatory ? '🔒 Mandatory Gate' : 'Optional Check'}
                      </button>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '12px',
                        color: item.isActive ? 'var(--accent-green)' : 'var(--text-tertiary)'
                      }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: item.isActive ? 'var(--accent-green)' : 'var(--border-strong)'
                        }} />
                        {item.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button 
                          type="button" 
                          className="btn-subtle"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit check details"
                          style={{ padding: '4px 8px' }}
                        >
                          <Edit3 size={13} />
                        </button>
                        <button 
                          type="button" 
                          className="btn-subtle"
                          onClick={() => handleDelete(item.id, item.title)}
                          title="Delete check"
                          style={{ padding: '4px 8px', color: 'var(--accent-red)' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add / Edit Quality Gate Check */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="var(--accent-green)" />
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>
                  {editingItem ? 'Edit Quality Gate Rule' : 'New Quality Gate Rule'}
                </h3>
              </div>
              <button type="button" className="btn-subtle" onClick={() => setIsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Requirement Title *
                  </label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. HOA / VIP Noise Curfew Permit Verified"
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Standard / Inspection Guideline
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="Describe what the supervisor must confirm on site or in stock before checking this item off..."
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      Display Order #
                    </label>
                    <input 
                      type="number" 
                      min={1} 
                      max={99} 
                      value={formOrder}
                      onChange={e => setFormOrder(parseInt(e.target.value, 10) || 1)}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      Requirement Type
                    </label>
                    <select 
                      value={formIsMandatory ? 'mandatory' : 'optional'}
                      onChange={e => setFormIsMandatory(e.target.value === 'mandatory')}
                      style={{ width: '100%' }}
                    >
                      <option value="mandatory">Mandatory (Blocks Submission)</option>
                      <option value="optional">Optional Best Practice</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                  <input 
                    type="checkbox" 
                    id="isActiveCheckbox"
                    checked={formIsActive}
                    onChange={e => setFormIsActive(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent-green)' }}
                  />
                  <label htmlFor="isActiveCheckbox" style={{ fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    Active check rule (visible in Pre-Flight Quality Gate modal)
                  </label>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" className="btn-subtle" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingItem ? 'Save Changes' : 'Create Quality Check'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
