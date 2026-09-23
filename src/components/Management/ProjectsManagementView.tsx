import React, { useState, useMemo } from 'react';
import { 
  Project, 
  Estate, 
  Location, 
  Zone, 
  ProjectCategory, 
  PriorityLevel,
  CategoryItem,
  PriorityItem,
  ProjectStatus
} from '../../types';
import { formatRelativeTime } from '../../utils/time';
import { 
  TableProperties, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  Layers, 
  Clock, 
  Calendar, 
  Users, 
  Check, 
  X,
  ExternalLink
} from 'lucide-react';

interface ProjectsManagementViewProps {
  projects: Project[];
  estates: Estate[];
  locations: Location[];
  zones: Zone[];
  categories?: CategoryItem[];
  priorities?: PriorityItem[];
  onSaveProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onOpenChecklist: (project: Project) => void;
  onOpenProposals: (project: Project) => void;
  onOpenManpower: (project: Project) => void;
  onNewProjectClick: () => void;
}

export const ProjectsManagementView: React.FC<ProjectsManagementViewProps> = ({
  projects,
  estates,
  locations,
  zones,
  categories = [],
  priorities = [],
  onSaveProject,
  onDeleteProject,
  onOpenChecklist,
  onOpenProposals,
  onOpenManpower,
  onNewProjectClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Edit Project Modal
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<ProjectCategory>('renovation');
  const [editPriority, setEditPriority] = useState<PriorityLevel>('normal');
  const [editStatus, setEditStatus] = useState<ProjectStatus>('active');
  const [editZoneId, setEditZoneId] = useState('');
  const [editStage, setEditStage] = useState('');
  const [editTargetStart, setEditTargetStart] = useState('');
  const [editTargetEnd, setEditTargetEnd] = useState('');

  // Lookup Maps
  const zoneMap = useMemo(() => new Map(zones.map(z => [z.id, z])), [zones]);
  const locationMap = useMemo(() => new Map(locations.map(l => [l.id, l])), [locations]);
  const estateMap = useMemo(() => new Map(estates.map(e => [e.id, e])), [estates]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const z = zoneMap.get(p.zoneId);
      const loc = z ? locationMap.get(z.locationId) : undefined;
      const est = loc ? estateMap.get(loc.estateId) : undefined;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchStage = p.currentStageSummary.toLowerCase().includes(q);
        const matchLoc = loc?.name.toLowerCase().includes(q) || est?.name.toLowerCase().includes(q) || z?.name.toLowerCase().includes(q);
        if (!matchTitle && !matchStage && !matchLoc) return false;
      }

      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      if (selectedPriority !== 'all' && p.priority !== selectedPriority) {
        return false;
      }
      if (selectedStatus !== 'all' && p.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [projects, searchQuery, selectedCategory, selectedPriority, selectedStatus, zoneMap, locationMap, estateMap]);

  const handleOpenEdit = (p: Project) => {
    setEditingProject(p);
    setEditTitle(p.title);
    setEditCategory(p.category);
    setEditPriority(p.priority);
    setEditStatus(p.status);
    setEditZoneId(p.zoneId);
    setEditStage(p.currentStageSummary);
    setEditTargetStart(p.targetStartDate || '');
    setEditTargetEnd(p.targetCompletionDate || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !editTitle.trim() || !editZoneId) return;

    const updated: Project = {
      ...editingProject,
      title: editTitle.trim(),
      category: editCategory,
      priority: editPriority,
      status: editStatus,
      zoneId: editZoneId,
      currentStageSummary: editStage.trim() || 'Work in progress',
      targetStartDate: editTargetStart || undefined,
      targetCompletionDate: editTargetEnd || undefined,
      lastProgressUpdatedAt: new Date().toISOString()
    };

    onSaveProject(updated);
    setEditingProject(null);
  };

  return (
    <div className="projects-management-view">
      {/* Header */}
      <div className="queue-header">
        <div className="queue-title-area">
          <h2 className="queue-title">Projects Data Management Hub</h2>
          <span className="queue-counter">
            Notion table view for all {projects.length} project workstreams
          </span>
        </div>

        <button type="button" className="btn-primary" onClick={onNewProjectClick}>
          <Plus size={14} />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="controls-row">
        <div className="search-input-wrap">
          <Search size={14} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search projects, stages, zones, or properties..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-pills">
          <select 
            value={selectedCategory} 
            onChange={e => setSelectedCategory(e.target.value)}
            style={{ fontSize: '12px', padding: '5px 10px' }}
          >
            <option value="all">All Categories</option>
            {categories.length > 0 ? (
              categories.map(c => (
                <option key={c.id} value={c.key}>{c.name}</option>
              ))
            ) : (
              <>
                <option value="renovation">Renovation</option>
                <option value="construction">Construction</option>
                <option value="maintenance">Maintenance</option>
                <option value="proposal">Design Proposal</option>
              </>
            )}
          </select>

          <select 
            value={selectedPriority} 
            onChange={e => setSelectedPriority(e.target.value)}
            style={{ fontSize: '12px', padding: '5px 10px' }}
          >
            <option value="all">All Priorities</option>
            {priorities.length > 0 ? (
              priorities.map(p => (
                <option key={p.id} value={p.key}>{p.name}</option>
              ))
            ) : (
              <>
                <option value="vip_urgent">VIP Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </>
            )}
          </select>

          <select 
            value={selectedStatus} 
            onChange={e => setSelectedStatus(e.target.value)}
            style={{ fontSize: '12px', padding: '5px 10px' }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="awaiting_feedback">Awaiting Feedback</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Notion-Style Projects Database Table */}
      <div className="notion-table-container">
        <table className="notion-table">
          <thead>
            <tr>
              <th style={{ width: '28%' }}>Project & Stage Description</th>
              <th style={{ width: '18%' }}>Property & Work Area</th>
              <th style={{ width: '10%' }}>Category</th>
              <th style={{ width: '10%' }}>Priority</th>
              <th style={{ width: '12%' }}>Progress & Crew</th>
              <th style={{ width: '12%' }}>Target Dates</th>
              <th style={{ width: '10%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-tertiary)' }}>
                  No projects match your current filters.
                </td>
              </tr>
            ) : (
              filteredProjects.map(project => {
                const z = zoneMap.get(project.zoneId);
                const loc = z ? locationMap.get(z.locationId) : undefined;
                const est = loc ? estateMap.get(loc.estateId) : undefined;

                return (
                  <tr key={project.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>
                        {project.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {project.currentStageSummary}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                        Updated {formatRelativeTime(project.lastProgressUpdatedAt)}
                      </div>
                    </td>

                    <td>
                      <span className="property-tag" style={{ display: 'inline-block', marginBottom: '2px' }}>
                        {est?.name ? est.name.replace(/\s*\([^)]*\)/g, '').trim() : 'Property'}
                      </span>
                      <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {loc?.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        {z?.name} ({z?.floorOrLevel || 'General'})
                      </div>
                    </td>

                    <td>
                      <span style={{
                        textTransform: 'capitalize',
                        fontSize: '11px',
                        padding: '2px 7px',
                        background: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        fontWeight: 500
                      }}>
                        {project.category}
                      </span>
                    </td>

                    <td>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: project.priority === 'vip_urgent' ? 'var(--accent-red)' : project.priority === 'high' ? 'var(--accent-amber)' : 'var(--text-secondary)'
                      }}>
                        {project.priority.toUpperCase()}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                            {project.progressPercentage}%
                          </span>
                          <button 
                            type="button" 
                            className="crew-pill"
                            onClick={() => onOpenManpower(project)}
                            style={{ padding: '1px 6px', fontSize: '10px' }}
                            title="Shift crew"
                          >
                            <Users size={10} />
                            <span>{project.assignedCrewCount || 0}</span>
                          </button>
                        </div>
                        <div style={{ height: '4px', background: 'var(--bg-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              width: `${project.progressPercentage}%`, 
                              height: '100%', 
                              background: project.status === 'completed' ? 'var(--accent-green)' : 'var(--accent-blue)' 
                            }} 
                          />
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '2px', fontFamily: 'var(--font-mono)' }}>
                        <div>Start: {project.targetStartDate || 'Unset'}</div>
                        <div>End: {project.targetCompletionDate || 'Unset'}</div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button 
                          type="button" 
                          className="btn-subtle" 
                          onClick={() => handleOpenEdit(project)}
                          title="Edit project details"
                          style={{ padding: '3px 6px' }}
                        >
                          <Edit3 size={12} />
                        </button>

                        <button 
                          type="button" 
                          className="btn-subtle" 
                          onClick={() => onOpenChecklist(project)}
                          title="Launch Pre-Flight Checklist"
                          style={{ padding: '3px 6px', color: 'var(--accent-green)' }}
                        >
                          <ShieldCheck size={12} />
                        </button>

                        <button 
                          type="button" 
                          className="btn-subtle" 
                          onClick={() => onOpenProposals(project)}
                          title="Manage Proposal Options"
                          style={{ padding: '3px 6px', color: 'var(--accent-purple)' }}
                        >
                          <Layers size={12} />
                        </button>

                        <button 
                          type="button" 
                          className="btn-subtle" 
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete "${project.title}"? This will permanently remove this project.`)) {
                              onDeleteProject(project.id);
                            }
                          }}
                          title={`Delete "${project.title}"`}
                          style={{ color: 'var(--accent-red)', padding: '3px 6px' }}
                        >
                          <Trash2 size={12} />
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

      {/* Modal: Edit Project Details */}
      {editingProject && (
        <div className="modal-overlay" onClick={() => setEditingProject(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Project Record</h3>
              <button type="button" className="btn-subtle" onClick={() => setEditingProject(null)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Project Title</label>
                  <input 
                    type="text" 
                    required 
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Category</label>
                    <select 
                      value={editCategory} 
                      onChange={e => setEditCategory(e.target.value as any)}
                    >
                      {categories.length > 0 ? (
                        categories.map(c => (
                          <option key={c.id} value={c.key}>{c.name}</option>
                        ))
                      ) : (
                        <>
                          <option value="renovation">Renovation</option>
                          <option value="construction">Construction</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="proposal">Design Proposal</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Priority</label>
                    <select 
                      value={editPriority} 
                      onChange={e => setEditPriority(e.target.value as any)}
                    >
                      {priorities.length > 0 ? (
                        priorities.map(p => (
                          <option key={p.id} value={p.key}>{p.name}</option>
                        ))
                      ) : (
                        <>
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                          <option value="vip_urgent">VIP Urgent</option>
                          <option value="low">Low</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select 
                      value={editStatus} 
                      onChange={e => setEditStatus(e.target.value as ProjectStatus)}
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="awaiting_feedback">Awaiting Feedback</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Property & Work Area</label>
                  <select 
                    value={editZoneId} 
                    onChange={e => setEditZoneId(e.target.value)}
                    required
                  >
                    {zones.map(z => {
                      const loc = locationMap.get(z.locationId);
                      const est = loc ? estateMap.get(loc.estateId) : undefined;
                      const label = `${est?.name || 'Property'} → ${loc?.name || 'Location'} → ${z.name}`;
                      return (
                        <option key={z.id} value={z.id}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="form-group">
                  <label>Current Stage / Description</label>
                  <input 
                    type="text" 
                    value={editStage}
                    onChange={e => setEditStage(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Target Start Date</label>
                    <input 
                      type="date" 
                      value={editTargetStart}
                      onChange={e => setEditTargetStart(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Target Completion Date</label>
                    <input 
                      type="date" 
                      value={editTargetEnd}
                      onChange={e => setEditTargetEnd(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button 
                  type="button" 
                  className="btn-subtle" 
                  onClick={() => {
                    if (editingProject && window.confirm(`Are you sure you want to delete "${editingProject.title}"? This action cannot be undone.`)) {
                      onDeleteProject(editingProject.id);
                      setEditingProject(null);
                    }
                  }}
                  style={{ color: 'var(--accent-red)', border: '1px solid var(--accent-red-border)' }}
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="btn-subtle" onClick={() => setEditingProject(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    <Check size={14} />
                    <span>Update Project</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
