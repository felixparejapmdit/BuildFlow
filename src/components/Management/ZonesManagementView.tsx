import React, { useState } from 'react';
import { Zone, Location, Estate, Project } from '../../types';
import { 
  MapPin, 
  Plus, 
  Search, 
  Compass, 
  Edit3, 
  Trash2, 
  Check, 
  X,
  Layers,
  Building,
  Briefcase
} from 'lucide-react';
import { showConfirm } from '../Common/ConfirmDialog';

interface ZonesManagementViewProps {
  zones: Zone[];
  locations: Location[];
  estates: Estate[];
  projects: Project[];
  onSaveZone: (zone: Zone) => void;
  onDeleteZone: (zoneId: string) => void;
}

export const ZonesManagementView: React.FC<ZonesManagementViewProps> = ({
  zones,
  locations,
  estates,
  projects,
  onSaveZone,
  onDeleteZone
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEstateFilter, setSelectedEstateFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formLocationId, setFormLocationId] = useState('');
  const [formFloor, setFormFloor] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const estateMap = new Map(estates.map(e => [e.id, e]));
  const locationMap = new Map(locations.map(l => [l.id, l]));

  // Active project counts per zone
  const projectCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => {
      counts[p.zoneId] = (counts[p.zoneId] || 0) + 1;
    });
    return counts;
  }, [projects]);

  const filteredZones = zones.filter(z => {
    const loc = locationMap.get(z.locationId);
    const est = loc ? estateMap.get(loc.estateId) : undefined;

    if (selectedEstateFilter !== 'all' && est?.id !== selectedEstateFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = z.name.toLowerCase().includes(q);
      const matchFloor = z.floorOrLevel?.toLowerCase().includes(q);
      const matchLoc = loc?.name.toLowerCase().includes(q);
      const matchEst = est?.name.toLowerCase().includes(q);
      if (!matchName && !matchFloor && !matchLoc && !matchEst) return false;
    }

    return true;
  });

  const handleOpenAdd = () => {
    setEditingZone(null);
    setFormName('');
    setFormLocationId(locations[0]?.id || '');
    setFormFloor('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (zone: Zone) => {
    setEditingZone(zone);
    setFormName(zone.name);
    setFormLocationId(zone.locationId);
    setFormFloor(zone.floorOrLevel || '');
    setFormNotes(zone.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formLocationId) return;

    const zoneToSave: Zone = {
      id: editingZone?.id || `zn-${Date.now().toString(36)}`,
      locationId: formLocationId,
      name: formName.trim(),
      floorOrLevel: formFloor.trim() || undefined,
      notes: formNotes.trim() || undefined,
      isActive: true,
      createdAt: editingZone?.createdAt || new Date().toISOString()
    };

    onSaveZone(zoneToSave);
    setIsModalOpen(false);
  };

  return (
    <div className="zones-management-view">
      {/* Header */}
      <div className="queue-header">
        <div className="queue-title-area">
          <h2 className="queue-title">Work Areas & Zones</h2>
          <span className="queue-counter">
            {zones.length} work areas across {locations.length} buildings and {estates.length} properties
          </span>
        </div>

        <button type="button" className="btn-primary" onClick={handleOpenAdd}>
          <Plus size={14} />
          <span>Add Work Area</span>
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
            Total Work Areas
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
            {zones.length}
          </div>
        </div>

        <div style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
            Active Projects
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)', marginTop: '2px' }}>
            {projects.length}
          </div>
        </div>

        <div style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
            Properties
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', marginTop: '2px' }}>
            {estates.length}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-row">
        <div className="search-input-wrap">
          <Search size={14} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search zones by name, floor, building, or property..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-pills">
          <button 
            type="button" 
            className={`filter-pill ${selectedEstateFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedEstateFilter('all')}
          >
            All Properties
          </button>
          {estates.map(est => (
            <button 
              key={est.id}
              type="button" 
              className={`filter-pill ${selectedEstateFilter === est.id ? 'active' : ''}`}
              onClick={() => setSelectedEstateFilter(est.id)}
            >
              {est.name.replace(/\s*\([^)]*\)/g, '').trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Notion Data Table */}
      <div className="notion-table-container">
        <table className="notion-table">
          <thead>
            <tr>
              <th style={{ width: '28%' }}>Zone / Area Name</th>
              <th style={{ width: '26%' }}>Property & Building</th>
              <th style={{ width: '18%' }}>Floor / Level</th>
              <th style={{ width: '16%' }}>Active Projects</th>
              <th style={{ width: '12%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredZones.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-tertiary)' }}>
                  No zones match your filter.
                </td>
              </tr>
            ) : (
              filteredZones.map(zone => {
                const loc = locationMap.get(zone.locationId);
                const est = loc ? estateMap.get(loc.estateId) : undefined;
                const activeCount = projectCounts[zone.id] || 0;

                return (
                  <tr key={zone.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Compass size={15} color="var(--accent-blue)" />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {zone.name}
                          </div>
                          {zone.notes && (
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              {zone.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span className="property-tag" style={{ display: 'inline-block', marginBottom: '3px' }}>
                          {est?.name ? est.name.replace(/\s*\([^)]*\)/g, '').trim() : 'Property'}
                        </span>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {loc?.name || 'Location'} {loc?.buildingCode ? `(${loc.buildingCode})` : ''}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {zone.floorOrLevel || 'General Area'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Briefcase size={12} color={activeCount > 0 ? 'var(--accent-blue)' : 'var(--text-tertiary)'} />
                        <span style={{ fontWeight: 600, fontSize: '12px', color: activeCount > 0 ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                          {activeCount} {activeCount === 1 ? 'project' : 'projects'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button 
                          type="button" 
                          className="btn-subtle" 
                          onClick={() => handleOpenEdit(zone)}
                          title="Edit zone"
                          style={{ padding: '3px 6px' }}
                        >
                          <Edit3 size={12} />
                        </button>
                        {zones.length > 1 && (
                          <button 
                            type="button" 
                            className="btn-subtle" 
                            onClick={async () => {
                              const confirmed = await showConfirm({
                                title: 'Delete Work Zone',
                                message: `Are you sure you want to delete zone "${zone.name}"?`,
                                confirmText: 'Delete Zone',
                                variant: 'danger'
                              });
                              if (confirmed) {
                                onDeleteZone(zone.id);
                              }
                            }}
                            title="Delete zone"
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
              <h3>{editingZone ? 'Edit Work Area' : 'Add New Work Area'}</h3>
              <button type="button" className="btn-subtle" onClick={() => setIsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Work Area Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Roof Deck, Kitchen, Pool Deck" 
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Property & Building</label>
                  <select 
                    value={formLocationId} 
                    onChange={e => setFormLocationId(e.target.value)}
                    required
                  >
                    {locations.map(loc => {
                      const est = estateMap.get(loc.estateId);
                      return (
                        <option key={loc.id} value={loc.id}>
                          {est?.name ? `${est.name.replace(/\s*\([^)]*\)/g, '').trim()} → ` : ''}{loc.name} {loc.buildingCode ? `(${loc.buildingCode})` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="form-group">
                  <label>Floor / Level</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Ground Floor, 2nd Floor, Roof Deck" 
                    value={formFloor}
                    onChange={e => setFormFloor(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Notes / Description</label>
                  <textarea 
                    rows={2}
                    placeholder="e.g. Requires safety harness; active work area" 
                    value={formNotes}
                    onChange={e => setFormNotes(e.target.value)}
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
                  <span>{editingZone ? 'Save Changes' : 'Create Work Area'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
