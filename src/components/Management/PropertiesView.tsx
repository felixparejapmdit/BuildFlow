import React, { useState } from 'react';
import { Estate, Location, Zone, EstateType } from '../../types';
import { 
  Building, 
  Plus, 
  ChevronRight, 
  FolderPlus,
  Compass,
  Trash2,
  Edit3,
  Check,
  X
} from 'lucide-react';

interface PropertiesViewProps {
  estates: Estate[];
  locations: Location[];
  zones: Zone[];
  onSaveEstate: (estate: Estate) => void;
  onSaveLocation: (location: Location) => void;
  onSaveZone: (zone: Zone) => void;
  onDeleteEstate?: (estateId: string) => void;
  onDeleteLocation?: (locationId: string) => void;
  onDeleteZone?: (zoneId: string) => void;
}

export const PropertiesView: React.FC<PropertiesViewProps> = ({
  estates,
  locations,
  zones,
  onSaveEstate,
  onSaveLocation,
  onSaveZone,
  onDeleteEstate,
  onDeleteLocation,
  onDeleteZone
}) => {
  const [selectedEstateId, setSelectedEstateId] = useState<string>(estates[0]?.id || '');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');

  // Creation & Editing Modals
  const [isAddingEstate, setIsAddingEstate] = useState(false);
  const [editingEstate, setEditingEstate] = useState<Estate | null>(null);
  
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const [isAddingZone, setIsAddingZone] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);

  // Form states - Estate
  const [estateFormName, setEstateFormName] = useState('');
  const [estateFormType, setEstateFormType] = useState<EstateType>('residential');
  const [estateFormArea, setEstateFormArea] = useState<number>(5000);
  const [estateFormAddress, setEstateFormAddress] = useState('');

  // Form states - Location
  const [locFormName, setLocFormName] = useState('');
  const [locFormCode, setLocFormCode] = useState('');

  // Form states - Zone
  const [zoneFormName, setZoneFormName] = useState('');
  const [zoneFormFloor, setZoneFormFloor] = useState('');

  // Filtered lists
  const currentEstate = estates.find(e => e.id === selectedEstateId) || estates[0];
  const estateLocations = locations.filter(l => l.estateId === (currentEstate?.id || ''));
  const activeLocation = estateLocations.find(l => l.id === selectedLocationId) || estateLocations[0];
  const locationZones = zones.filter(z => z.locationId === (activeLocation?.id || ''));

  // Open Estate Add
  const handleOpenAddEstate = () => {
    setEditingEstate(null);
    setEstateFormName('');
    setEstateFormType('residential');
    setEstateFormArea(5000);
    setEstateFormAddress('');
    setIsAddingEstate(true);
  };

  // Open Estate Edit
  const handleOpenEditEstate = (est: Estate) => {
    setEditingEstate(est);
    setEstateFormName(est.name);
    setEstateFormType(est.type);
    setEstateFormArea(est.totalAreaSqm || 5000);
    setEstateFormAddress(est.address || '');
    setIsAddingEstate(true);
  };

  // Save Estate
  const handleSaveEstateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!estateFormName.trim()) return;

    const estateToSave: Estate = {
      id: editingEstate?.id || `est-${Date.now().toString(36)}`,
      name: estateFormName.trim(),
      type: estateFormType,
      totalAreaSqm: Number(estateFormArea),
      address: estateFormAddress.trim() || undefined,
      isActive: true,
      createdAt: editingEstate?.createdAt || new Date().toISOString()
    };
    onSaveEstate(estateToSave);
    if (!editingEstate) {
      setSelectedEstateId(estateToSave.id);
    }
    setIsAddingEstate(false);
  };

  // Open Location Add
  const handleOpenAddLocation = () => {
    setEditingLocation(null);
    setLocFormName('');
    setLocFormCode('');
    setIsAddingLocation(true);
  };

  // Open Location Edit
  const handleOpenEditLocation = (loc: Location) => {
    setEditingLocation(loc);
    setLocFormName(loc.name);
    setLocFormCode(loc.buildingCode || '');
    setIsAddingLocation(true);
  };

  // Save Location
  const handleSaveLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locFormName.trim() || !currentEstate) return;

    const locToSave: Location = {
      id: editingLocation?.id || `loc-${Date.now().toString(36)}`,
      estateId: editingLocation?.estateId || currentEstate.id,
      name: locFormName.trim(),
      buildingCode: locFormCode.trim() || undefined,
      isActive: true,
      createdAt: editingLocation?.createdAt || new Date().toISOString()
    };
    onSaveLocation(locToSave);
    if (!editingLocation) {
      setSelectedLocationId(locToSave.id);
    }
    setIsAddingLocation(false);
  };

  // Open Zone Add
  const handleOpenAddZone = () => {
    setEditingZone(null);
    setZoneFormName('');
    setZoneFormFloor('');
    setIsAddingZone(true);
  };

  // Open Zone Edit
  const handleOpenEditZone = (z: Zone) => {
    setEditingZone(z);
    setZoneFormName(z.name);
    setZoneFormFloor(z.floorOrLevel || '');
    setIsAddingZone(true);
  };

  // Save Zone
  const handleSaveZoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneFormName.trim() || !activeLocation) return;

    const zoneToSave: Zone = {
      id: editingZone?.id || `zn-${Date.now().toString(36)}`,
      locationId: editingZone?.locationId || activeLocation.id,
      name: zoneFormName.trim(),
      floorOrLevel: zoneFormFloor.trim() || undefined,
      isActive: true,
      createdAt: editingZone?.createdAt || new Date().toISOString()
    };
    onSaveZone(zoneToSave);
    setIsAddingZone(false);
  };

  return (
    <div className="properties-view">
      <div className="queue-header">
        <div className="queue-title-area">
          <h2 className="queue-title">Properties & Buildings</h2>
          <span className="queue-counter">
            Manage properties, buildings, and work areas
          </span>
        </div>

        <button className="btn-primary" onClick={handleOpenAddEstate}>
          <Plus size={14} />
          <span>Add Property</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'start' }}>
        {/* Left Column: Estates Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', padding: '0 4px' }}>
            Properties List ({estates.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {estates.map(est => (
              <button
                key={est.id}
                type="button"
                className={`nav-tab ${selectedEstateId === est.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedEstateId(est.id);
                  setSelectedLocationId('');
                }}
                style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 10px' }}
              >
                <Building size={14} />
                <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {est.name.replace(/\s*\([^)]*\)/g, '').trim()}
                </span>
                <ChevronRight size={12} color="var(--text-tertiary)" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Selected Estate Details & Granular Hierarchy */}
        {currentEstate && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: 'span 2' }}>
            {/* Estate Header Card */}
            <div style={{
              background: 'var(--bg-sidebar)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <span className="property-tag" style={{ marginBottom: '4px', display: 'inline-block' }}>
                  {currentEstate.type.toUpperCase()}
                </span>
                <h3 style={{ fontSize: '17px', fontWeight: 600 }}>{currentEstate.name}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {currentEstate.address || 'Property Site'} • {currentEstate.totalAreaSqm?.toLocaleString()} sqm
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  className="btn-subtle" 
                  onClick={() => handleOpenEditEstate(currentEstate)}
                  style={{ border: '1px solid var(--border-subtle)' }}
                  title="Edit Property Details"
                >
                  <Edit3 size={13} />
                  <span>Edit Property</span>
                </button>

                <button 
                  className="btn-subtle" 
                  onClick={handleOpenAddLocation} 
                  style={{ border: '1px solid var(--border-subtle)' }}
                  title="Add Structure/Building"
                >
                  <FolderPlus size={13} />
                  <span>Add Building</span>
                </button>

                {estates.length > 1 && onDeleteEstate && (
                  <button 
                    className="btn-subtle" 
                    onClick={() => {
                      if (window.confirm(`Delete property "${currentEstate.name}" and all its structures?`)) {
                        onDeleteEstate(currentEstate.id);
                        const remaining = estates.filter(e => e.id !== currentEstate.id);
                        if (remaining[0]) setSelectedEstateId(remaining[0].id);
                      }
                    }} 
                    style={{ color: 'var(--accent-red)', border: '1px solid var(--border-subtle)' }}
                    title="Delete Property"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Locations & Buildings Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Buildings & Structures in {currentEstate.name} ({estateLocations.length})
                </h4>
              </div>

              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {estateLocations.length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontStyle: 'italic', padding: '6px 0' }}>
                    No buildings created yet. Click "Add Building" above.
                  </div>
                ) : (
                  estateLocations.map(loc => (
                    <div 
                      key={loc.id} 
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        background: (activeLocation?.id === loc.id) ? 'var(--bg-active)' : 'var(--bg-subtle)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-full)',
                        padding: '3px 10px',
                        gap: '6px'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedLocationId(loc.id)}
                        style={{ border: 'none', background: 'transparent', padding: 0, fontSize: '12px', fontWeight: (activeLocation?.id === loc.id) ? 600 : 500 }}
                      >
                        {loc.name} {loc.buildingCode && `(${loc.buildingCode})`}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditLocation(loc)}
                        style={{ border: 'none', background: 'transparent', padding: '1px', color: 'var(--text-secondary)' }}
                        title="Edit building"
                      >
                        <Edit3 size={11} />
                      </button>

                      {onDeleteLocation && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete structure "${loc.name}"?`)) {
                              onDeleteLocation(loc.id);
                              const rem = estateLocations.filter(l => l.id !== loc.id);
                              if (rem[0]) setSelectedLocationId(rem[0].id);
                            }
                          }}
                          style={{ border: 'none', background: 'transparent', padding: '1px', color: 'var(--accent-red)' }}
                          title="Delete building"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Zones within Selected Location */}
            {activeLocation && (
              <div className="notion-table-container">
                <div style={{
                  padding: '12px 16px',
                  background: 'var(--bg-sidebar)',
                  borderBottom: '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div>
                    <h5 style={{ fontSize: '13px', fontWeight: 600 }}>
                      Sub-Zones in {activeLocation.name}
                    </h5>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Granular work areas scheduled by field supervisors
                    </p>
                  </div>

                  <button className="btn-primary" onClick={handleOpenAddZone} style={{ padding: '4px 10px', fontSize: '12px' }}>
                    <Plus size={12} />
                    <span>Add Zone</span>
                  </button>
                </div>

                <table className="notion-table">
                  <thead>
                    <tr>
                      <th style={{ width: '45%' }}>Zone Name</th>
                      <th style={{ width: '30%' }}>Level / Elevation</th>
                      <th style={{ width: '25%' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locationZones.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)' }}>
                          No zones defined for this structure yet. Click "Add Zone" above.
                        </td>
                      </tr>
                    ) : (
                      locationZones.map(z => (
                        <tr key={z.id}>
                          <td style={{ fontWeight: 600 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Compass size={14} color="var(--accent-blue)" />
                              <span>{z.name}</span>
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{z.floorOrLevel || 'General Area'}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <button 
                                type="button" 
                                className="btn-subtle" 
                                onClick={() => handleOpenEditZone(z)}
                                title="Edit zone"
                                style={{ padding: '3px 6px' }}
                              >
                                <Edit3 size={12} />
                              </button>
                              {onDeleteZone && (
                                <button 
                                  type="button" 
                                  className="btn-subtle" 
                                  onClick={() => {
                                    if (window.confirm(`Delete zone "${z.name}"?`)) {
                                      onDeleteZone(z.id);
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Add/Edit Estate */}
      {isAddingEstate && (
        <div className="modal-overlay" onClick={() => setIsAddingEstate(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingEstate ? 'Edit Property / Estate' : 'Add New Property / Estate'}</h3>
              <button type="button" className="btn-subtle" onClick={() => setIsAddingEstate(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveEstateSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Property Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Alpine Chalet Sanctuary or Harbor Wharf Office"
                    value={estateFormName}
                    onChange={e => setEstateFormName(e.target.value)}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Category Type</label>
                    <select value={estateFormType} onChange={e => setEstateFormType(e.target.value as any)}>
                      <option value="residential">Residential Estate</option>
                      <option value="office">Executive Office</option>
                      <option value="estate">Large Grounds Estate</option>
                      <option value="other">Other Facility</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Approx. Area (sqm)</label>
                    <input 
                      type="number" 
                      value={estateFormArea}
                      onChange={e => setEstateFormArea(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Address / Access Note</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Ridge Road Private Access, Sector 4"
                    value={estateFormAddress}
                    onChange={e => setEstateFormAddress(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-subtle" onClick={() => setIsAddingEstate(false)}>Cancel</button>
                <button type="submit" className="btn-primary">
                  <Check size={14} />
                  <span>{editingEstate ? 'Save Changes' : 'Save Property'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Location */}
      {isAddingLocation && (
        <div className="modal-overlay" onClick={() => setIsAddingLocation(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingLocation ? 'Edit Structure/Building' : `Add Building to ${currentEstate?.name}`}</h3>
              <button type="button" className="btn-subtle" onClick={() => setIsAddingLocation(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveLocationSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Building / Location Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. North Guest Annex, Poolhouse, Chiller Plant"
                    value={locFormName}
                    onChange={e => setLocFormName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Building Code (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. ANX-02, BLD-B"
                    value={locFormCode}
                    onChange={e => setLocFormCode(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-subtle" onClick={() => setIsAddingLocation(false)}>Cancel</button>
                <button type="submit" className="btn-primary">
                  <Check size={14} />
                  <span>{editingLocation ? 'Save Changes' : 'Save Building'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Zone */}
      {isAddingZone && (
        <div className="modal-overlay" onClick={() => setIsAddingZone(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingZone ? 'Edit Specific Zone' : `Add Zone in ${activeLocation?.name}`}</h3>
              <button type="button" className="btn-subtle" onClick={() => setIsAddingZone(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveZoneSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Specific Work Zone Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Primary Bedroom Ensuite, Balcony Deck, Server Room"
                    value={zoneFormName}
                    onChange={e => setZoneFormName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Floor / Level / Grounds Zone</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 2nd Floor, Penthouse, West Garden"
                    value={zoneFormFloor}
                    onChange={e => setZoneFormFloor(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-subtle" onClick={() => setIsAddingZone(false)}>Cancel</button>
                <button type="submit" className="btn-primary">
                  <Check size={14} />
                  <span>{editingZone ? 'Save Changes' : 'Save Zone'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
