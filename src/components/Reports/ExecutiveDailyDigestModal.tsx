import React, { useState } from 'react';
import { Project, Estate, Location, Zone, ManpowerAllocation } from '../../types';
import { formatRelativeTime } from '../../utils/time';
import { 
  FileText, 
  X, 
  Copy, 
  Check, 
  Printer, 
  Building, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

interface ExecutiveDailyDigestModalProps {
  projects: Project[];
  estates: Estate[];
  locations: Location[];
  zones: Zone[];
  allocations: ManpowerAllocation[];
  onClose: () => void;
}

export const ExecutiveDailyDigestModal: React.FC<ExecutiveDailyDigestModalProps> = ({
  projects,
  estates,
  locations,
  zones,
  allocations,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  const zoneMap = new Map(zones.map(z => [z.id, z]));
  const locationMap = new Map(locations.map(l => [l.id, l]));
  const estateMap = new Map(estates.map(e => [e.id, e]));

  const todayDateStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Group projects by estate
  const projectsByEstate = estates.map(est => {
    const estProjects = projects.filter(p => {
      const z = zoneMap.get(p.zoneId);
      const loc = z ? locationMap.get(z.locationId) : undefined;
      return loc?.estateId === est.id;
    });

    return {
      estate: est,
      projects: estProjects
    };
  }).filter(group => group.projects.length > 0);

  // Generate clean text summary for 1-click clipboard copying
  const generateTextSummary = () => {
    let text = `BUILDFLOW DAILY OPERATIONS SUMMARY\nDate: ${todayDateStr}\nActive Projects: ${projects.length}\n\n`;

    projectsByEstate.forEach(({ estate, projects }) => {
      text += `--- ${estate.name.toUpperCase()} ---\n`;
      projects.forEach(p => {
        const z = zoneMap.get(p.zoneId);
        const loc = z ? locationMap.get(z.locationId) : undefined;
        text += `• [${p.progressPercentage}%] ${p.title} (${loc?.name || 'Site'})\n`;
        text += `  Stage: ${p.currentStageSummary}\n`;
        if (p.status === 'awaiting_feedback') {
          text += `  * AWAITING CLIENT FEEDBACK\n`;
        }
      });
      text += `\n`;
    });

    text += `Field Crew On-Site: ${allocations.length} workers active today.`;
    return text;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generateTextSummary());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card print-container" style={{ maxWidth: '820px' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="var(--accent-blue)" />
            <h3 style={{ fontSize: '16px' }}>Daily Operations Summary</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button type="button" className="btn-subtle" onClick={handlePrint} title="Print or save as PDF">
              <Printer size={14} />
              <span>Print / PDF</span>
            </button>
            <button type="button" className="btn-subtle" onClick={handleCopyText}>
              {copied ? <Check size={14} color="var(--accent-green)" /> : <Copy size={14} />}
              <span>{copied ? 'Copied Digest!' : 'Copy Summary'}</span>
            </button>
            <button type="button" className="btn-subtle" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable / Viewable Report Body */}
        <div className="modal-body" style={{ maxHeight: '78vh', overflowY: 'auto', padding: '24px' }}>
          {/* Executive Header */}
          <div style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                VIP Portfolio Daily Operations Overview
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                {todayDateStr}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Consolidated progress tracking across 3 Residential Compounds, 5 Corporate Offices, and 69,000 sqm Estate.
            </p>
          </div>

          {/* Grouped Properties List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {projectsByEstate.map(({ estate, projects }) => (
              <div key={estate.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building size={14} color="var(--text-secondary)" />
                  <h4 style={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-primary)' }}>
                    {estate.name}
                  </h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    ({projects.length} active workstreams)
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {projects.map(p => {
                    const z = zoneMap.get(p.zoneId);
                    const loc = z ? locationMap.get(z.locationId) : undefined;

                    return (
                      <div 
                        key={p.id}
                        style={{
                          background: 'var(--bg-canvas)',
                          border: '1px solid var(--border-default)',
                          borderRadius: 'var(--radius-md)',
                          padding: '12px 14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="property-tag" style={{ fontSize: '10px' }}>
                              {loc?.name || 'Area'}
                            </span>
                            <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                              {p.title}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '12px' }}>
                              {p.progressPercentage}%
                            </span>
                            {p.status === 'awaiting_feedback' && (
                              <span className="status-badge awaiting_feedback" style={{ fontSize: '10px' }}>
                                Awaiting Client Choice
                              </span>
                            )}
                            {p.status === 'completed' && (
                              <span className="status-badge completed" style={{ fontSize: '10px' }}>
                                Completed
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ height: '6px', background: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              width: `${p.progressPercentage}%`, 
                              height: '100%', 
                              background: p.status === 'completed' ? 'var(--accent-green)' : 'var(--accent-blue)',
                              transition: 'width 0.3s ease'
                            }} 
                          />
                        </div>

                        {/* Current Stage */}
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                          <span><strong>Current Stage:</strong> {p.currentStageSummary}</span>
                          <span style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                            Updated {formatRelativeTime(p.lastProgressUpdatedAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Metadata */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)' }}>
            <span>Verified by Site Operations Lead</span>
            <span>VIP Protocol: Zero Field Smartphones / No Photo Capture Enforced</span>
          </div>
        </div>

        {/* Modal Footer (Screen only) */}
        <div className="modal-footer no-print">
          <button type="button" className="btn-subtle" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn-primary" onClick={handleCopyText}>
            <Copy size={13} />
            <span>Copy Text Summary for Messaging</span>
          </button>
        </div>
      </div>
    </div>
  );
};
