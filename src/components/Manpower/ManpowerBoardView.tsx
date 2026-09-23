import React from 'react';
import { 
  Project, 
  Employee, 
  ManpowerAllocation, 
  Estate, 
  Location, 
  Zone 
} from '../../types';
import { CrewBalancer } from './CrewBalancer';
import { Users, HardHat, Building, ArrowRight, ShieldCheck } from 'lucide-react';

interface ManpowerBoardViewProps {
  projects: Project[];
  employees: Employee[];
  allocations: ManpowerAllocation[];
  estates: Estate[];
  locations: Location[];
  zones: Zone[];
  onOpenReassignDrawer: (project: Project) => void;
}

export const ManpowerBoardView: React.FC<ManpowerBoardViewProps> = ({
  projects,
  employees,
  allocations,
  estates,
  locations,
  zones,
  onOpenReassignDrawer
}) => {
  const employeeMap = new Map(employees.map(e => [e.id, e]));
  const zoneMap = new Map(zones.map(z => [z.id, z]));
  const locationMap = new Map(locations.map(l => [l.id, l]));
  const estateMap = new Map(estates.map(e => [e.id, e]));

  // Group active projects with their assigned employees
  const projectsWithCrew = projects.map(p => {
    const projectAllocs = allocations.filter(a => a.projectId === p.id);
    const assignedStaff = projectAllocs
      .map(a => employeeMap.get(a.employeeId))
      .filter((e): e is Employee => Boolean(e));

    const z = zoneMap.get(p.zoneId);
    const loc = z ? locationMap.get(z.locationId) : undefined;
    const est = loc ? estateMap.get(loc.estateId) : undefined;

    return {
      project: p,
      assignedStaff,
      zone: z,
      location: loc,
      estate: est
    };
  });

  return (
    <div className="manpower-board">
      {/* Global Headcount Capacity Balancer */}
      <CrewBalancer employees={employees} allocations={allocations} />

      <div className="queue-header" style={{ marginTop: '20px' }}>
        <div className="queue-title-area">
          <h2 className="queue-title">Site Deployments & Crew Assignments</h2>
          <span className="queue-counter">
            Fluid headcount across {projects.length} managed sites
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '14px' }}>
        {projectsWithCrew.map(({ project, assignedStaff, zone, location, estate }) => {
          // Count trades in this squad
          const tradeCounts: Record<string, number> = {};
          assignedStaff.forEach(s => {
            tradeCounts[s.tradeSpecialty] = (tradeCounts[s.tradeSpecialty] || 0) + 1;
          });

          const cleanEstateName = estate?.name ? estate.name.replace(/\s*\([^)]*\)/g, '').trim() : 'Property';

          return (
            <div 
              key={project.id}
              style={{
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span 
                    className="property-tag" 
                    style={{ 
                      marginBottom: '6px', 
                      display: 'inline-block',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      lineHeight: '1.3'
                    }}
                  >
                    {cleanEstateName} • {location?.name || 'Location'}
                  </span>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.4', margin: 0, wordBreak: 'break-word' }}>
                    {project.title}
                  </h4>
                </div>

                <span 
                  className="crew-pill" 
                  style={{ 
                    flexShrink: 0, 
                    marginTop: '2px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Users size={12} />
                  <span>{assignedStaff.length} Crew</span>
                </span>
              </div>

              {/* Progress mini indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <span>Progress: <strong>{project.progressPercentage}%</strong></span>
                <div style={{ flex: 1, height: '4px', background: 'var(--bg-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${project.progressPercentage}%`, 
                      height: '100%', 
                      background: project.status === 'completed' ? 'var(--accent-green)' : 'var(--accent-blue)' 
                    }} 
                  />
                </div>
              </div>

              {/* Trade breakdown pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {Object.keys(tradeCounts).length === 0 ? (
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                    No crew assigned yet
                  </span>
                ) : (
                  Object.entries(tradeCounts).map(([trade, count]) => (
                    <span 
                      key={trade}
                      style={{
                        fontSize: '11px',
                        padding: '2px 7px',
                        background: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        textTransform: 'capitalize'
                      }}
                    >
                      {count} {trade}
                    </span>
                  ))
                )}
              </div>

              {/* Action Button */}
              <button 
                type="button" 
                className="btn-subtle"
                onClick={() => onOpenReassignDrawer(project)}
                style={{ 
                  marginTop: 'auto', 
                  justifyContent: 'space-between', 
                  border: '1px solid var(--border-subtle)',
                  padding: '6px 10px',
                  fontSize: '12px'
                }}
              >
                <span>Manage & Shift Crew</span>
                <ArrowRight size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
