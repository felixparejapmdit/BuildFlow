import React, { useState } from 'react';
import { Project, Proposal, Estate, Location, Zone } from '../../types';
import { isProjectStale, formatRelativeTime } from '../../utils/time';
import { 
  AlertTriangle, 
  X, 
  Copy, 
  Check, 
  Clock, 
  Send, 
  MessageSquare, 
  ExternalLink 
} from 'lucide-react';

interface StaleRadarModalProps {
  projects: Project[];
  proposals: Proposal[];
  estates: Estate[];
  locations: Location[];
  zones: Zone[];
  onClose: () => void;
  onOpenProject: (project: Project) => void;
}

export const StaleRadarModal: React.FC<StaleRadarModalProps> = ({
  projects,
  proposals,
  estates,
  locations,
  zones,
  onClose,
  onOpenProject
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const zoneMap = new Map(zones.map(z => [z.id, z]));
  const locationMap = new Map(locations.map(l => [l.id, l]));
  const estateMap = new Map(estates.map(e => [e.id, e]));

  // Stale projects (>24h without progress)
  const staleProjects = projects.filter(p => isProjectStale(p.lastProgressUpdatedAt, p.status));

  // Stale proposals (>48h awaiting VIP response)
  const staleProposals = proposals.filter(p => {
    if (p.status !== 'submitted') return false;
    if (!p.submittedToVipAt) return false;
    const hours = (Date.now() - new Date(p.submittedToVipAt).getTime()) / (1000 * 3600);
    return hours > 48;
  });

  const generateFollowUpMessage = (title: string, estateName: string, submittedAgo: string, optionsCount: number) => {
    return `Good day Sir/Ma'am. Brief operational update regarding ${title} (${estateName}).\n\n` +
      `We submitted ${optionsCount} comparative options ${submittedAgo} with warehouse stock and physical samples verified.\n\n` +
      `Kindly share your preferred direction (e.g. Option A vs B) when convenient so our field crew can proceed without schedule downtime.\n\n` +
      `Thank you,\nBuildFlow Site Operations`;
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '720px' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="var(--accent-red)" />
            <h3 style={{ fontSize: '16px' }}>Overdue Projects & Follow-Up Radar</h3>
          </div>
          <button type="button" className="btn-subtle" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Clients expect timely progress. This radar flags projects with no activity for &gt;24h and proposals awaiting client feedback for &gt;48h.
          </p>

          {/* Stale Proposals Section */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-red)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} />
              <span>Proposals Awaiting Client Decision (&gt;48 Hours) ({staleProposals.length})</span>
            </h4>

            {staleProposals.length === 0 ? (
              <div style={{ padding: '14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                ✓ No proposals currently overdue for VIP feedback.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {staleProposals.map(prop => {
                  const targetProject = projects.find(p => p.id === prop.projectId);
                  const z = targetProject ? zoneMap.get(targetProject.zoneId) : undefined;
                  const loc = z ? locationMap.get(z.locationId) : undefined;
                  const est = loc ? estateMap.get(loc.estateId) : undefined;
                  const submittedAgo = prop.submittedToVipAt ? formatRelativeTime(prop.submittedToVipAt) : 'Recently';
                  const draftMessage = generateFollowUpMessage(
                    prop.title, 
                    est?.name || 'Property', 
                    submittedAgo, 
                    prop.options.length
                  );

                  return (
                    <div 
                      key={prop.id}
                      style={{
                        background: 'var(--bg-canvas)',
                        border: '1px solid var(--accent-red-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <span className="property-tag" style={{ background: 'var(--accent-red-bg)', color: 'var(--accent-red)' }}>
                            {est?.name} • Awaiting VIP: {submittedAgo}
                          </span>
                          <h5 style={{ fontSize: '14px', fontWeight: 600, marginTop: '4px' }}>
                            {prop.title}
                          </h5>
                        </div>

                        <button 
                          type="button" 
                          className="btn-subtle" 
                          onClick={() => handleCopy(prop.id, draftMessage)}
                          style={{ border: '1px solid var(--border-default)', fontSize: '12px' }}
                        >
                          {copiedId === prop.id ? (
                            <>
                              <Check size={12} color="var(--accent-green)" />
                              <span style={{ color: 'var(--accent-green)' }}>Copied VIP Message!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Copy 1-Click Follow-Up</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Message preview snippet */}
                      <div style={{
                        background: 'var(--bg-sidebar)',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-secondary)',
                        whiteSpace: 'pre-line'
                      }}>
                        {draftMessage}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />

          {/* Stale Projects Section */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-amber)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} />
              <span>Projects with No Progress Logs (&gt;24 Hours) ({staleProjects.length})</span>
            </h4>

            {staleProjects.length === 0 ? (
              <div style={{ padding: '14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                ✓ All active projects have logged updates within the last 24 hours.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {staleProjects.map(proj => {
                  const z = zoneMap.get(proj.zoneId);
                  const loc = z ? locationMap.get(z.locationId) : undefined;
                  const est = loc ? estateMap.get(loc.estateId) : undefined;
                  const updatedAgo = formatRelativeTime(proj.lastProgressUpdatedAt);

                  return (
                    <div 
                      key={proj.id}
                      style={{
                        background: 'var(--bg-canvas)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-md)',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <span className="property-tag">{est?.name || 'Property'}</span>
                        <div style={{ fontWeight: 600, fontSize: '13px', marginTop: '2px' }}>
                          {proj.title}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                          Last progress update: {updatedAgo} • Current Progress: {proj.progressPercentage}%
                        </div>
                      </div>

                      <button 
                        type="button" 
                        className="btn-primary"
                        onClick={() => {
                          onOpenProject(proj);
                          onClose();
                        }}
                        style={{ fontSize: '11px', padding: '4px 10px' }}
                      >
                        Inspect & Log
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="btn-primary" onClick={onClose}>
            Done Reviewing
          </button>
        </div>
      </div>
    </div>
  );
};
