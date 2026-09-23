import React from 'react';
import { Employee, ManpowerAllocation } from '../../types';
import { Users, HardHat, ShieldAlert, CheckCircle } from 'lucide-react';

interface CrewBalancerProps {
  employees: Employee[];
  allocations: ManpowerAllocation[];
}

export const CrewBalancer: React.FC<CrewBalancerProps> = ({
  employees,
  allocations
}) => {
  const totalEmployees = employees.length; // 169
  const deployableEmployees = employees.filter(e => e.isDeployable && e.isActive);
  const deployableCount = deployableEmployees.length;
  const restrictedCount = totalEmployees - deployableCount;

  // Set of assigned employee IDs (only deployable should be active on site)
  const assignedEmployeeIds = new Set(allocations.map(a => a.employeeId));
  const activeDeployedCount = deployableEmployees.filter(e => assignedEmployeeIds.has(e.id)).length;
  const benchAvailableCount = deployableCount - activeDeployedCount;

  // Percentage segments for visual capacity bar
  const deployedPct = totalEmployees > 0 ? (activeDeployedCount / totalEmployees) * 100 : 0;
  const benchPct = totalEmployees > 0 ? (benchAvailableCount / totalEmployees) * 100 : 0;
  const restrictedPct = totalEmployees > 0 ? (restrictedCount / totalEmployees) * 100 : 0;

  return (
    <div className="headcount-card">
      <div className="headcount-stats-row">
        <div className="stat-box">
          <span className="stat-label">Total Employee Pool</span>
          <span className="stat-number">{totalEmployees}</span>
          <span className="stat-sub">From existing employee PWA</span>
        </div>

        <div className="stat-box">
          <span className="stat-label" style={{ color: 'var(--accent-blue)' }}>
            Active on Sites
          </span>
          <span className="stat-number" style={{ color: 'var(--accent-blue)' }}>
            {activeDeployedCount}
          </span>
          <span className="stat-sub">Distributed across projects</span>
        </div>

        <div className="stat-box">
          <span className="stat-label" style={{ color: 'var(--accent-green)' }}>
            Available Bench
          </span>
          <span className="stat-number" style={{ color: 'var(--accent-green)' }}>
            {benchAvailableCount}
          </span>
          <span className="stat-sub">Deployable & ready for dispatch</span>
        </div>

        <div className="stat-box">
          <span className="stat-label" style={{ color: 'var(--text-tertiary)' }}>
            Shop / Non-Deployable
          </span>
          <span className="stat-number" style={{ color: 'var(--text-tertiary)' }}>
            {restrictedCount}
          </span>
          <span className="stat-sub">Fabrication, logistics, off-site</span>
        </div>
      </div>

      {/* Visual Capacity Split Bar */}
      <div className="capacity-visual-bar" title={`Deployed: ${activeDeployedCount} | Bench: ${benchAvailableCount} | Restricted: ${restrictedCount}`}>
        <div className="bar-segment-deployed" style={{ width: `${deployedPct}%` }} />
        <div className="bar-segment-bench" style={{ width: `${benchPct}%` }} />
        <div className="bar-segment-restricted" style={{ width: `${restrictedPct}%` }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-blue)' }} />
            Deployed on VIP Sites ({Math.round(deployedPct)}%)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)' }} />
            Available Bench ({Math.round(benchPct)}%)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--border-strong)' }} />
            Non-Deployable / Off-Site ({Math.round(restrictedPct)}%)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-amber)' }}>
          <ShieldAlert size={12} />
          <span>VIP Protocol: Zero Worker Smartphone Access Enforced</span>
        </div>
      </div>
    </div>
  );
};
