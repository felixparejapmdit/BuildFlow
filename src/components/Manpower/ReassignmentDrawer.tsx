import React, { useState, useMemo } from 'react';
import { 
  Project, 
  Employee, 
  ManpowerAllocation, 
  TradeSpecialtyItem 
} from '../../types';
import { 
  X, 
  UserMinus, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  HardHat, 
  Users,
  Check
} from 'lucide-react';

interface ReassignmentDrawerProps {
  project: Project | null;
  onClose: () => void;
  employees: Employee[];
  allocations: ManpowerAllocation[];
  trades: TradeSpecialtyItem[];
  onAssign: (employeeId: string, projectId: string) => void;
  onUnassign: (employeeId: string, projectId: string) => void;
  onBulkAdd: (employeeIds: string[], projectId: string) => void;
}

export const ReassignmentDrawer: React.FC<ReassignmentDrawerProps> = ({
  project,
  onClose,
  employees,
  allocations,
  trades,
  onAssign,
  onUnassign,
  onBulkAdd
}) => {
  const [benchSearch, setBenchSearch] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<string>('all');
  const [bulkCount, setBulkCount] = useState<number>(2);

  if (!project) return null;

  // Map of all allocations
  const projectAllocations = allocations.filter(a => a.projectId === project.id);
  const assignedEmployeeIds = new Set(projectAllocations.map(a => a.employeeId));
  
  // All assigned workers on THIS project
  const assignedCrew = employees.filter(e => assignedEmployeeIds.has(e.id));

  // Global assigned employee IDs (so bench excludes workers already at other sites)
  const allAssignedIds = new Set(allocations.map(a => a.employeeId));

  // Available Bench: Deployable, Active, and NOT currently assigned anywhere
  const availableBench = useMemo(() => {
    return employees.filter(e => {
      if (!e.isDeployable || !e.isActive) return false;
      if (allAssignedIds.has(e.id)) return false;

      if (selectedTrade !== 'all' && e.tradeSpecialty !== selectedTrade) {
        return false;
      }

      if (benchSearch.trim()) {
        const q = benchSearch.toLowerCase();
        const matchesName = e.fullName.toLowerCase().includes(q);
        const matchesId = e.externalPwaId.toLowerCase().includes(q);
        const matchesTrade = e.tradeSpecialty.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesTrade) return false;
      }

      return true;
    });
  }, [employees, allAssignedIds, selectedTrade, benchSearch]);

  const handleQuickBulkAdd = () => {
    const toAdd = availableBench.slice(0, bulkCount).map(e => e.id);
    if (toAdd.length > 0) {
      onBulkAdd(toAdd, project.id);
    }
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div>
            <h3 style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HardHat size={16} color="var(--accent-blue)" />
              <span>Fluid Crew Reallocation</span>
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Project: <strong>{project.title}</strong>
            </p>
          </div>
          <button type="button" className="btn-subtle" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          {/* Active Assigned Section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Assigned On-Site ({assignedCrew.length} crew)
              </h4>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                {project.progressPercentage}% progress
              </span>
            </div>

            {assignedCrew.length === 0 ? (
              <div style={{
                padding: '16px',
                background: 'var(--bg-sidebar)',
                border: '1px dashed var(--border-default)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                fontSize: '12px',
                color: 'var(--text-secondary)'
              }}>
                No crew members currently assigned. Add from the available bench below.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {assignedCrew.map(emp => (
                  <div 
                    key={emp.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '13px'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {emp.fullName}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ textTransform: 'capitalize' }}>{emp.tradeSpecialty}</span>
                        <span>•</span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>{emp.externalPwaId}</span>
                      </div>
                    </div>

                    <button 
                      type="button" 
                      className="btn-subtle"
                      onClick={() => onUnassign(emp.id, project.id)}
                      title="Return technician to available bench"
                      style={{ color: 'var(--accent-red)', padding: '4px 8px' }}
                    >
                      <UserMinus size={13} />
                      <span>Return to Bench</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '8px 0' }} />

          {/* Quick Bulk Reassign Tool */}
          <div style={{
            background: 'var(--bg-sidebar)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600 }}>Quick Headcount Dispatch</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Add next available deployable hands
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <select 
                value={bulkCount} 
                onChange={(e) => setBulkCount(Number(e.target.value))}
                style={{ padding: '3px 8px', fontSize: '12px' }}
              >
                <option value={1}>+1 Worker</option>
                <option value={2}>+2 Workers</option>
                <option value={3}>+3 Workers</option>
                <option value={5}>+5 Workers</option>
                <option value={8}>+8 Workers</option>
              </select>

              <button 
                type="button" 
                className="btn-primary" 
                onClick={handleQuickBulkAdd}
                disabled={availableBench.length === 0}
                style={{ padding: '4px 10px', fontSize: '12px' }}
              >
                <UserPlus size={13} />
                <span>Dispatch</span>
              </button>
            </div>
          </div>

          {/* Available Bench Section with Filter */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Available Bench Pool ({availableBench.length} ready)
              </h4>
            </div>

            {/* Bench Search & Trade Filter */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input 
                  type="text" 
                  placeholder="Search bench staff..."
                  value={benchSearch}
                  onChange={(e) => setBenchSearch(e.target.value)}
                  style={{ width: '100%', paddingLeft: '28px', fontSize: '12px' }}
                />
              </div>

              <select 
                value={selectedTrade} 
                onChange={(e) => setSelectedTrade(e.target.value)}
                style={{ fontSize: '12px', padding: '3px 8px' }}
              >
                <option value="all">All Trades ({trades.length})</option>
                {trades.map(t => (
                  <option key={t.id} value={t.key}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Bench Staff List */}
            <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {availableBench.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  No bench staff matching filter.
                </div>
              ) : (
                availableBench.map(emp => (
                  <div 
                    key={emp.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      background: 'var(--bg-canvas)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '12px'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        {emp.fullName}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        <span style={{ textTransform: 'capitalize' }}>{emp.tradeSpecialty}</span>
                        <span style={{ margin: '0 4px' }}>•</span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>{emp.externalPwaId}</span>
                      </div>
                    </div>

                    <button 
                      type="button" 
                      className="btn-subtle"
                      onClick={() => onAssign(emp.id, project.id)}
                      title="Assign this worker to project"
                      style={{ color: 'var(--accent-blue)', padding: '3px 8px', fontSize: '11px' }}
                    >
                      <UserPlus size={12} />
                      <span>Assign</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="drawer-footer">
          <button type="button" className="btn-primary" onClick={onClose}>
            <Check size={14} />
            <span>Done Allocating</span>
          </button>
        </div>
      </div>
    </div>
  );
};
