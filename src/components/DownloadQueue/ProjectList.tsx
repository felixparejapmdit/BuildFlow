import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Project, 
  Zone, 
  Location, 
  Estate, 
  PriorityLevel,
  CategoryItem,
  PriorityItem,
  ProjectStatus
} from '../../types';
import { ProjectRow } from './ProjectRow';
import { isProjectStale } from '../../utils/time';
import { 
  Search, 
  Plus, 
  X, 
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  LayoutGrid,
  List,
  Filter,
  SlidersHorizontal,
  Building2,
  MapPin,
  Zap,
  Target,
  ArrowUpDown,
  ChevronDown
} from 'lucide-react';

interface ProjectListProps {
  projects: Project[];
  estates: Estate[];
  locations: Location[];
  zones: Zone[];
  categories?: CategoryItem[];
  priorities?: PriorityItem[];
  onUpdateProgress: (projectId: string, newProgress: number, newStage?: string) => void;
  onOpenManpowerDrawer: (project: Project) => void;
  onOpenInspector: (project: Project) => void;
  onOpenChecklist: (project: Project) => void;
  onOpenProposals: (project: Project) => void;
  onUpdateStatus?: (projectId: string, newStatus: ProjectStatus) => void;
  onCreateProject: (newProjectData: Partial<Project>) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

type SortKey = 'updated' | 'progress' | 'priority' | 'title';
type ViewMode = 'list' | 'grid';

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  estates,
  locations,
  zones,
  categories = [],
  priorities = [],
  onUpdateProgress,
  onOpenManpowerDrawer,
  onOpenInspector,
  onOpenChecklist,
  onOpenProposals,
  onUpdateStatus,
  onCreateProject,
  isCreateModalOpen,
  setIsCreateModalOpen
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortKey>('updated');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Stable order: holds sorted project IDs so that updating progress
  // does NOT reorder rows mid-session. Only refreshed when the user
  // explicitly changes sort, filter, or search.
  const stableOrderRef = useRef<string[]>([]);
  // Track the criteria that produced the current stable order
  const lastCriteriaRef = useRef<string>('');

  // New Project Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('renovation');
  const [formPriority, setFormPriority] = useState<PriorityLevel>('normal');
  const [formZoneId, setFormZoneId] = useState('');
  const [formStage, setFormStage] = useState('');

  React.useEffect(() => {
    if (zones.length > 0 && !formZoneId) setFormZoneId(zones[0].id);
  }, [zones, formZoneId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setIsSortOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lookup Maps
  const zoneMap = useMemo(() => new Map(zones.map(z => [z.id, z])), [zones]);
  const locationMap = useMemo(() => new Map(locations.map(l => [l.id, l])), [locations]);
  const estateMap = useMemo(() => new Map(estates.map(e => [e.id, e])), [estates]);

  // KPI Computations
  const kpis = useMemo(() => {
    const total = projects.length;
    const active = projects.filter(p => p.status === 'active').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const paused = projects.filter(p => p.status === 'paused').length;
    const stale = projects.filter(p => isProjectStale(p.lastProgressUpdatedAt, p.status)).length;
    const avgProgress = total > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progressPercentage, 0) / total) : 0;
    return { total, active, completed, paused, stale, avgProgress };
  }, [projects]);

  // Filter & Sort Logic with stable ordering
  const filteredProjects = useMemo(() => {
    // Build the criteria key to detect when sort/filter/search actually changed
    const criteriaKey = `${searchQuery}|${selectedFilter}|${sortBy}|${projects.map(p => p.id).join(',')}`;
    const filterCriteriaKey = `${searchQuery}|${selectedFilter}|${sortBy}`;
    const prevCriteria = lastCriteriaRef.current;
    const prevFilterCriteria = prevCriteria.split('§')[0] || '';

    // Step 1: Filter projects by current search/filter
    const filtered = projects.filter(p => {
      const z = zoneMap.get(p.zoneId);
      const loc = z ? locationMap.get(z.locationId) : undefined;
      const est = loc ? estateMap.get(loc.estateId) : undefined;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesStage = p.currentStageSummary.toLowerCase().includes(q);
        const matchesLoc = loc?.name.toLowerCase().includes(q) || est?.name.toLowerCase().includes(q) || z?.name.toLowerCase().includes(q);
        if (!matchesTitle && !matchesStage && !matchesLoc) return false;
      }

      if (selectedFilter.startsWith('estate:')) return est?.id === selectedFilter.replace('estate:', '');
      if (selectedFilter === 'stale') return isProjectStale(p.lastProgressUpdatedAt, p.status);
      if (selectedFilter === 'paused') return p.status === 'paused';
      if (selectedFilter === 'completed') return p.status === 'completed';
      if (selectedFilter === 'active') return p.status === 'active' && !isProjectStale(p.lastProgressUpdatedAt, p.status);
      return true;
    });

    // Step 2: Only re-sort when search/filter/sort criteria changed (not on data updates)
    const needsResort = filterCriteriaKey !== prevFilterCriteria;
    if (needsResort) {
      const sorted = [...filtered].sort((a, b) => {
        if (sortBy === 'updated') return new Date(b.lastProgressUpdatedAt).getTime() - new Date(a.lastProgressUpdatedAt).getTime();
        if (sortBy === 'progress') return b.progressPercentage - a.progressPercentage;
        if (sortBy === 'priority') {
          const weights: Record<PriorityLevel, number> = { vip_urgent: 4, high: 3, normal: 2, low: 1 };
          return weights[b.priority] - weights[a.priority];
        }
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return 0;
      });
      stableOrderRef.current = sorted.map(p => p.id);
      lastCriteriaRef.current = filterCriteriaKey + '§' + criteriaKey;
    }

    // Step 3: Render using the stable order — look up live project data by ID
    // so values (progress %, stage, etc.) are always current, but row position is frozen
    const projectMap = new Map(projects.map(p => [p.id, p]));
    const stableFiltered = stableOrderRef.current
      .map(id => projectMap.get(id))
      .filter((p): p is Project => {
        if (!p) return false;
        // Re-apply filter to handle status changes mid-session (e.g. completed filter)
        if (selectedFilter === 'stale') return isProjectStale(p.lastProgressUpdatedAt, p.status);
        if (selectedFilter === 'paused') return p.status === 'paused';
        if (selectedFilter === 'completed') return p.status === 'completed';
        if (selectedFilter === 'active') return p.status === 'active' && !isProjectStale(p.lastProgressUpdatedAt, p.status);
        return filtered.some(fp => fp.id === p.id);
      });

    // Also append any newly-created projects not yet in stable order
    const stableIds = new Set(stableOrderRef.current);
    for (const p of filtered) {
      if (!stableIds.has(p.id)) {
        stableFiltered.unshift(p); // new projects go to top
        stableOrderRef.current.unshift(p.id);
      }
    }

    return stableFiltered;
  }, [projects, searchQuery, selectedFilter, sortBy, zoneMap, locationMap, estateMap]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formZoneId) return;
    onCreateProject({
      title: formTitle.trim(),
      category: formCategory as any,
      priority: formPriority,
      zoneId: formZoneId,
      currentStageSummary: formStage.trim() || 'Work scheduled and in progress',
      progressPercentage: 0,
      status: 'active'
    });
    setFormTitle('');
    setFormStage('');
    setIsCreateModalOpen(false);
  };

  const sortLabels: Record<SortKey, string> = {
    updated: 'Recently Updated',
    progress: 'Progress %',
    priority: 'Priority Tier',
    title: 'A–Z Title'
  };

  return (
    <div className="project-list-container" style={{ display: 'flex', flexDirection: 'column', gap: '0', height: '100%' }}>

      {/* ── KPI Banner Row ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        marginBottom: '20px',
        padding: '0 2px'
      }}>
        {/* Total */}
        <div className="kpi-card" onClick={() => setSelectedFilter('all')} style={{ cursor: 'pointer', borderColor: selectedFilter === 'all' ? 'var(--accent-blue-border)' : undefined }}>
          <div className="kpi-icon" style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>
            <Layers size={18} />
          </div>
          <div>
            <div className="kpi-value">{kpis.total}</div>
            <div className="kpi-label">Total Projects</div>
          </div>
        </div>

        {/* Active */}
        <div className="kpi-card" onClick={() => setSelectedFilter('active')} style={{ cursor: 'pointer', borderColor: selectedFilter === 'active' ? 'var(--accent-blue-border)' : undefined }}>
          <div className="kpi-icon" style={{ background: 'rgba(6,182,212,0.12)', color: '#06b6d4' }}>
            <Zap size={18} />
          </div>
          <div>
            <div className="kpi-value" style={{ color: '#06b6d4' }}>{kpis.active}</div>
            <div className="kpi-label">Active</div>
          </div>
        </div>

        {/* Completed */}
        <div className="kpi-card" onClick={() => setSelectedFilter('completed')} style={{ cursor: 'pointer', borderColor: selectedFilter === 'completed' ? 'var(--accent-green-border)' : undefined }}>
          <div className="kpi-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="kpi-value" style={{ color: '#10b981' }}>{kpis.completed}</div>
            <div className="kpi-label">Completed</div>
          </div>
        </div>

        {/* Stale */}
        <div className="kpi-card" onClick={() => setSelectedFilter('stale')} style={{ cursor: 'pointer', borderColor: selectedFilter === 'stale' ? 'var(--accent-amber-border)' : undefined }}>
          <div className="kpi-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
            <AlertTriangle size={18} />
          </div>
          <div>
            <div className="kpi-value" style={{ color: kpis.stale > 0 ? '#f59e0b' : 'var(--text-primary)' }}>{kpis.stale}</div>
            <div className="kpi-label">Needs Follow-Up</div>
          </div>
        </div>

        {/* Avg Progress */}
        <div className="kpi-card" style={{ pointerEvents: 'none' }}>
          <div className="kpi-icon" style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}>
            <TrendingUp size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="kpi-value" style={{ color: '#8b5cf6' }}>{kpis.avgProgress}%</div>
            <div className="kpi-label">Avg. Progress</div>
          </div>
        </div>
      </div>

      {/* ── Toolbar Row ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '12px',
        flexWrap: 'wrap'
      }}>
        {/* Search */}
        <div className="search-input-wrap" style={{ flex: '1 1 220px', minWidth: '180px' }}>
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search projects, stages, zones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')} style={{ 
              background: 'none', border: 'none', cursor: 'pointer', 
              padding: '0 4px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center' 
            }}>
              <X size={12} />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div style={{ position: 'relative' }} ref={sortRef}>
          <button 
            type="button" 
            onClick={() => setIsSortOpen(prev => !prev)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', fontSize: '12px', fontWeight: 500,
              background: 'var(--bg-sidebar)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-secondary)',
              whiteSpace: 'nowrap'
            }}
          >
            <ArrowUpDown size={13} />
            <span>{sortLabels[sortBy]}</span>
            <ChevronDown size={12} style={{ opacity: 0.6 }} />
          </button>
          {isSortOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 99,
              background: 'var(--bg-canvas)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
              padding: '4px', minWidth: '170px', display: 'flex', flexDirection: 'column', gap: '2px'
            }}>
              {(Object.keys(sortLabels) as SortKey[]).map(key => (
                <button key={key} type="button" onClick={() => { setSortBy(key); setIsSortOpen(false); }} style={{
                  padding: '7px 10px', fontSize: '12px', borderRadius: 'var(--radius-sm)',
                  background: sortBy === key ? 'var(--accent-blue-bg)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  color: sortBy === key ? 'var(--accent-blue)' : 'var(--text-primary)',
                  fontWeight: sortBy === key ? 600 : 400, textAlign: 'left'
                }}>
                  {sortLabels[key]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Toggle */}
        <div style={{
          display: 'inline-flex', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-default)', overflow: 'hidden'
        }}>
          <button type="button" onClick={() => setViewMode('list')} title="List view" style={{
            padding: '6px 10px', background: viewMode === 'list' ? 'var(--accent-blue)' : 'var(--bg-sidebar)',
            border: 'none', cursor: 'pointer', color: viewMode === 'list' ? '#fff' : 'var(--text-secondary)',
            display: 'flex', alignItems: 'center'
          }}>
            <List size={14} />
          </button>
          <button type="button" onClick={() => setViewMode('grid')} title="Grid view" style={{
            padding: '6px 10px', background: viewMode === 'grid' ? 'var(--accent-blue)' : 'var(--bg-sidebar)',
            border: 'none', borderLeft: '1px solid var(--border-default)', cursor: 'pointer',
            color: viewMode === 'grid' ? '#fff' : 'var(--text-secondary)', display: 'flex', alignItems: 'center'
          }}>
            <LayoutGrid size={14} />
          </button>
        </div>

        {/* New Project Button */}
        <button
          type="button"
          className="btn-primary"
          onClick={() => setIsCreateModalOpen(true)}
          style={{ whiteSpace: 'nowrap' }}
        >
          <Plus size={14} />
          <span>New Project</span>
        </button>
      </div>

      {/* ── Filter Chips Row ── */}
      <div style={{ 
        display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px', 
        alignItems: 'center' 
      }}>
        <Filter size={12} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
        <button type="button"
          className={`filter-pill ${selectedFilter === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('all')}
        >
          All ({projects.length})
        </button>
        <button type="button"
          className={`filter-pill ${selectedFilter === 'active' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('active')}
        >
          <Zap size={10} />
          Active ({kpis.active})
        </button>
        {estates.map(est => {
          const filterKey = `estate:${est.id}`;
          const cleanName = est.name.replace(/\s*\([^)]*\)/g, '').trim();
          const count = projects.filter(p => {
            const z = zoneMap.get(p.zoneId);
            const loc = z ? locationMap.get(z.locationId) : undefined;
            return loc?.estateId === est.id;
          }).length;
          return (
            <button key={est.id} type="button"
              className={`filter-pill ${selectedFilter === filterKey ? 'active' : ''}`}
              onClick={() => setSelectedFilter(filterKey)}
            >
              <Building2 size={10} />
              {cleanName} ({count})
            </button>
          );
        })}
        <button type="button"
          className={`filter-pill ${selectedFilter === 'stale' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('stale')}
          style={selectedFilter === 'stale' ? { background: 'var(--accent-amber-bg)', color: 'var(--accent-amber)', borderColor: 'var(--accent-amber-border)' } : {}}
        >
          <AlertTriangle size={10} />
          Stale ({kpis.stale})
        </button>
        <button type="button"
          className={`filter-pill ${selectedFilter === 'paused' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('paused')}
        >
          Paused ({kpis.paused})
        </button>
        <button type="button"
          className={`filter-pill ${selectedFilter === 'completed' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('completed')}
        >
          <CheckCircle2 size={10} />
          Done ({kpis.completed})
        </button>

        {/* Results Count */}
        <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-tertiary)', flexShrink: 0 }}>
          {filteredProjects.length} of {projects.length} shown
        </span>
      </div>

      {/* ── Queue / Grid ── */}
      {filteredProjects.length === 0 ? (
        <div style={{
          padding: '60px 20px', textAlign: 'center',
          background: 'var(--bg-sidebar)', border: '1px dashed var(--border-default)',
          borderRadius: 'var(--radius-lg)', color: 'var(--text-secondary)'
        }}>
          <Target size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>
            No projects match your filter
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
            Try a different filter or search term, or create a new project.
          </p>
          <button type="button" className="btn-primary" style={{ marginTop: '16px' }}
            onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={14} /> <span>Create First Project</span>
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'download-queue-grid' : 'download-queue'}>
          {filteredProjects.map(project => {
            const z = zoneMap.get(project.zoneId);
            const loc = z ? locationMap.get(z.locationId) : undefined;
            const est = loc ? estateMap.get(loc.estateId) : undefined;
            return (
              <ProjectRow
                key={project.id}
                project={project}
                zone={z}
                location={loc}
                estate={est}
                viewMode={viewMode}
                onUpdateProgress={onUpdateProgress}
                onOpenManpowerDrawer={onOpenManpowerDrawer}
                onOpenInspector={onOpenInspector}
                onOpenChecklist={onOpenChecklist}
                onOpenProposals={onOpenProposals}
                onUpdateStatus={onUpdateStatus}
              />
            );
          })}
        </div>
      )}

      {/* ── Create Project Modal ── */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'var(--accent-blue-bg)', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <Plus size={16} color="var(--accent-blue)" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Create New Project</h3>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-tertiary)' }}>Fill in the details below</p>
                </div>
              </div>
              <button type="button" className="btn-subtle" onClick={() => setIsCreateModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Project Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master Balcony Teak Waterproofing & Sealing"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    autoFocus
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Category</label>
                    <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
                      {categories.length > 0 ? categories.map(c => (
                        <option key={c.id} value={c.key}>{c.name}</option>
                      )) : (
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
                    <select value={formPriority} onChange={(e) => setFormPriority(e.target.value as PriorityLevel)}>
                      {priorities.length > 0 ? priorities.map(p => (
                        <option key={p.id} value={p.key}>{p.name}</option>
                      )) : (
                        <>
                          <option value="vip_urgent">🔴 VIP Urgent</option>
                          <option value="high">🟠 High</option>
                          <option value="normal">🟡 Normal</option>
                          <option value="low">⚪ Low</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label><MapPin size={12} style={{ marginRight: '4px' }} />Property & Work Area</label>
                  <select value={formZoneId} onChange={(e) => setFormZoneId(e.target.value)} required>
                    {zones.map(z => {
                      const loc = locationMap.get(z.locationId);
                      const est = loc ? estateMap.get(loc.estateId) : undefined;
                      return (
                        <option key={z.id} value={z.id}>
                          {est?.name || 'Property'} → {loc?.name || 'Location'} → {z.name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="form-group">
                  <label>Current Stage / Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Applying sealant; final inspection tomorrow"
                    value={formStage}
                    onChange={(e) => setFormStage(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-subtle" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Plus size={14} />
                  <span>Create Project</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
