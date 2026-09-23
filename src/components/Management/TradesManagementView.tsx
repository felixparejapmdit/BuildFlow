import React, { useState } from 'react';
import { TradeSpecialtyItem, Employee } from '../../types';
import { 
  Wrench, 
  Plus, 
  Search, 
  Users, 
  Tag, 
  Edit3, 
  Trash2, 
  Check, 
  X,
  Layers,
  Hammer
} from 'lucide-react';

interface TradesManagementViewProps {
  trades: TradeSpecialtyItem[];
  employees: Employee[];
  onSaveTrade: (trade: TradeSpecialtyItem) => void;
  onDeleteTrade: (tradeId: string) => void;
}

export const TradesManagementView: React.FC<TradesManagementViewProps> = ({
  trades,
  employees,
  onSaveTrade,
  onDeleteTrade
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<TradeSpecialtyItem | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formKey, setFormKey] = useState('');
  const [formCategory, setFormCategory] = useState<TradeSpecialtyItem['category']>('Finishes');
  const [formDescription, setFormDescription] = useState('');

  // Compute counts per trade from the 169 employees
  const tradeStats = React.useMemo(() => {
    const totalMap: Record<string, number> = {};
    const deployableMap: Record<string, number> = {};

    employees.forEach(emp => {
      const key = emp.tradeSpecialty.toLowerCase();
      totalMap[key] = (totalMap[key] || 0) + 1;
      if (emp.isDeployable && emp.isActive) {
        deployableMap[key] = (deployableMap[key] || 0) + 1;
      }
    });

    return { totalMap, deployableMap };
  }, [employees]);

  const filteredTrades = trades.filter(t => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchKey = t.key.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      if (!matchName && !matchKey && !matchDesc) return false;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingTrade(null);
    setFormName('');
    setFormKey('');
    setFormCategory('Finishes');
    setFormDescription('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (t: TradeSpecialtyItem) => {
    setEditingTrade(t);
    setFormName(t.name);
    setFormKey(t.key);
    setFormCategory(t.category || 'Finishes');
    setFormDescription(t.description || '');
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const key = formKey.trim() 
      ? formKey.trim().toLowerCase().replace(/\s+/g, '_') 
      : formName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');

    const tradeToSave: TradeSpecialtyItem = {
      id: editingTrade?.id || `trd-${Date.now().toString(36)}`,
      key,
      name: formName.trim(),
      category: formCategory,
      description: formDescription.trim(),
      isActive: true,
      createdAt: editingTrade?.createdAt || new Date().toISOString()
    };

    onSaveTrade(tradeToSave);
    setIsAddModalOpen(false);
  };

  return (
    <div className="trades-management-view">
      {/* Header */}
      <div className="queue-header">
        <div className="queue-title-area">
          <h2 className="queue-title">Trade Specialties & Skills</h2>
          <span className="queue-counter">
            {trades.length} trades configured for {employees.length} team members
          </span>
        </div>

        <button type="button" className="btn-primary" onClick={handleOpenAdd}>
          <Plus size={14} />
          <span>Add Trade</span>
        </button>
      </div>

      {/* Summary Metrics Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
            Configured Trades
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
            {trades.length}
          </div>
        </div>

        <div style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
            Employees Categorized
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)', marginTop: '2px' }}>
            {employees.length}
          </div>
        </div>

        <div style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
            Deployable Crew Members
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', marginTop: '2px' }}>
            {employees.filter(e => e.isDeployable).length}
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="controls-row">
        <div className="search-input-wrap">
          <Search size={14} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search trades by name, identifier, or skill scope..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-pills">
          <button 
            type="button" 
            className={`filter-pill ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Categories
          </button>
          <button 
            type="button" 
            className={`filter-pill ${selectedCategory === 'Finishes' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('Finishes')}
          >
            Finishes
          </button>
          <button 
            type="button" 
            className={`filter-pill ${selectedCategory === 'Structure' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('Structure')}
          >
            Structure
          </button>
          <button 
            type="button" 
            className={`filter-pill ${selectedCategory === 'MEP' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('MEP')}
          >
            MEP (Mech/Elec/Plumb)
          </button>
          <button 
            type="button" 
            className={`filter-pill ${selectedCategory === 'Grounds' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('Grounds')}
          >
            Grounds
          </button>
          <button 
            type="button" 
            className={`filter-pill ${selectedCategory === 'General' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('General')}
          >
            General
          </button>
        </div>
      </div>

      {/* Trades Notion Table */}
      <div className="notion-table-container">
        <table className="notion-table">
          <thead>
            <tr>
              <th style={{ width: '28%' }}>Trade Specialty & Identifier</th>
              <th style={{ width: '14%' }}>Discipline Category</th>
              <th style={{ width: '34%' }}>Skill Scope & Description</th>
              <th style={{ width: '12%' }}>Headcount (169 Pool)</th>
              <th style={{ width: '12%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrades.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-tertiary)' }}>
                  No trade specialties match your search.
                </td>
              </tr>
            ) : (
              filteredTrades.map(trade => {
                const totalCount = tradeStats.totalMap[trade.key.toLowerCase()] || 0;
                const deployableCount = tradeStats.deployableMap[trade.key.toLowerCase()] || 0;

                return (
                  <tr key={trade.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Hammer size={15} color="var(--accent-blue)" />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {trade.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                            key: {trade.key}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="property-tag" style={{ fontSize: '10px' }}>
                        {trade.category || 'General'}
                      </span>
                    </td>
                    <td>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {trade.description || 'General craftsman role.'}
                      </p>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                          {totalCount} staff
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--accent-green)' }}>
                          {deployableCount} deployable
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button 
                          type="button" 
                          className="btn-subtle" 
                          onClick={() => handleOpenEdit(trade)}
                          title="Edit trade details"
                          style={{ padding: '3px 6px' }}
                        >
                          <Edit3 size={12} />
                        </button>
                        {trades.length > 1 && (
                          <button 
                            type="button" 
                            className="btn-subtle" 
                            onClick={() => onDeleteTrade(trade.id)}
                            title="Delete trade"
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

      {/* Modal: Add/Edit Trade Specialty */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingTrade ? 'Edit Trade Specialty' : 'Add New Trade Specialty'}</h3>
              <button type="button" className="btn-subtle" onClick={() => setIsAddModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Trade Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Architectural Joinery & Millwork, Stone Restoration"
                    value={formName}
                    onChange={e => {
                      setFormName(e.target.value);
                      if (!editingTrade) {
                        setFormKey(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'));
                      }
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Internal System Key</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. millwork, marble_restoration"
                      value={formKey}
                      onChange={e => setFormKey(e.target.value)}
                      style={{ fontFamily: 'var(--font-mono)' }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Discipline Category</label>
                    <select 
                      value={formCategory} 
                      onChange={e => setFormCategory(e.target.value as any)}
                    >
                      <option value="Finishes">Finishes (Millwork, Paint, Glass)</option>
                      <option value="Structure">Structure (Masonry, Framing, Concrete)</option>
                      <option value="MEP">MEP (Electrical, Plumbing, HVAC)</option>
                      <option value="Grounds">Grounds (Landscaping, Irrigation)</option>
                      <option value="General">General (Logistics, Labor)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Skill Scope & Standards Description</label>
                  <textarea 
                    rows={3}
                    placeholder="Describe specific craftsmanship scope, technical certifications, or field duties..."
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-subtle" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={14} />
                  <span>{editingTrade ? 'Save Changes' : 'Create Trade'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
