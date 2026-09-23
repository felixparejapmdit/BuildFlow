import React, { useState, useMemo } from 'react';
import { Project, ChecklistSubmission, QualityGateItem } from '../../types';
import { storage } from '../../services/storage';
import { 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ShieldCheck, 
  FileCheck2, 
  Layers, 
  Clock, 
  Users, 
  Box, 
  Eye, 
  Scale, 
  Check 
} from 'lucide-react';

interface PreFlightChecklistModalProps {
  project: Project;
  onClose: () => void;
  onSubmitPass: (submission: ChecklistSubmission) => void;
  qualityGateItems?: QualityGateItem[];
}

export const PreFlightChecklistModal: React.FC<PreFlightChecklistModalProps> = ({
  project,
  onClose,
  onSubmitPass,
  qualityGateItems
}) => {
  // Use provided items or load directly from storage
  const activeItems = useMemo(() => {
    const list = qualityGateItems || storage.getQualityGateItems();
    return list.filter(i => i.isActive).sort((a, b) => a.order - b.order);
  }, [qualityGateItems]);

  const [checkedItemIds, setCheckedItemIds] = useState<Set<string>>(new Set());
  const [inspectorName, setInspectorName] = useState('Lead Operations Supervisor');

  const toggleItem = (id: string) => {
    setCheckedItemIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const mandatoryItems = activeItems.filter(i => i.isMandatory);
  const mandatoryCheckedCount = mandatoryItems.filter(i => checkedItemIds.has(i.id)).length;
  const isFullyCompliant = mandatoryItems.length === 0 || mandatoryCheckedCount === mandatoryItems.length;

  const handleQuickCheckAll = () => {
    setCheckedItemIds(new Set(activeItems.map(i => i.id)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFullyCompliant) return;

    const submission: ChecklistSubmission = {
      id: `check-${Date.now()}`,
      projectId: project.id,
      checklistType: project.category === 'proposal' ? 'proposal_submission' : 'daily_report',
      checkedItemIds: Array.from(checkedItemIds),
      stockVerified: true,
      manpowerAssigned: true,
      timelineConfirmed: true,
      multipleOptionsPresent: true,
      designPegsIncluded: true,
      samplesReferenced: true,
      prosConsCompleted: true,
      isFullyCompliant: true,
      checkedByName: inspectorName.trim() || 'Operations Lead',
      submittedAt: new Date().toISOString()
    };

    onSubmitPass(submission);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color={isFullyCompliant ? 'var(--accent-green)' : 'var(--accent-amber)'} />
              <h3 style={{ fontSize: '16px' }}>Project Approval Checklist</h3>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Project: <strong>{project.title}</strong>
            </p>
          </div>
          <button type="button" className="btn-subtle" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {/* Warning Alert */}
            <div style={{
              background: isFullyCompliant ? 'var(--accent-green-bg)' : 'var(--accent-amber-bg)',
              border: `1px solid ${isFullyCompliant ? 'var(--accent-green-border)' : 'var(--accent-amber-border)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isFullyCompliant ? (
                  <CheckCircle2 size={18} color="var(--accent-green)" />
                ) : (
                  <AlertTriangle size={18} color="var(--accent-amber)" />
                )}
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: isFullyCompliant ? 'var(--accent-green)' : 'var(--accent-amber)' }}>
                    {isFullyCompliant 
                      ? 'All Checklist Requirements Met' 
                      : `${mandatoryCheckedCount} of ${mandatoryItems.length} Required Items Checked`}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {isFullyCompliant 
                      ? 'Project passes quality standards. Ready for client delivery.'
                      : `Please check all ${mandatoryItems.length} required items before submitting.`}
                  </div>
                </div>
              </div>

              {!isFullyCompliant && (
                <button 
                  type="button" 
                  className="btn-subtle" 
                  onClick={handleQuickCheckAll}
                  style={{ fontSize: '11px', padding: '4px 8px', whiteSpace: 'nowrap' }}
                >
                  Verify All
                </button>
              )}
            </div>

            {/* Quality Gate Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              {activeItems.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No active quality gate checks configured. You may certify directly.
                </div>
              ) : (
                activeItems.map((item, idx) => {
                  const isChecked = checkedItemIds.has(item.id);
                  return (
                    <label
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: isChecked ? 'var(--bg-canvas)' : 'var(--bg-sidebar)',
                        border: `1px solid ${isChecked ? 'var(--border-strong)' : 'var(--border-subtle)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleItem(item.id)}
                        style={{ marginTop: '2px', width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {item.title}
                          </span>
                          {item.isMandatory ? (
                            <span style={{
                              fontSize: '10px',
                              padding: '1px 5px',
                              borderRadius: 'var(--radius-full)',
                              background: 'var(--accent-red-bg)',
                              color: 'var(--accent-red)',
                              border: '1px solid var(--accent-red-border)'
                            }}>
                              Mandatory
                            </span>
                          ) : (
                            <span style={{
                              fontSize: '10px',
                              padding: '1px 5px',
                              borderRadius: 'var(--radius-full)',
                              background: 'var(--bg-subtle)',
                              color: 'var(--text-tertiary)'
                            }}>
                              Optional
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                            {item.description}
                          </p>
                        )}
                      </div>
                      {isChecked && (
                        <span className="status-badge completed" style={{ fontSize: '10px', padding: '2px 6px' }}>
                          <Check size={10} /> Verified
                        </span>
                      )}
                    </label>
                  );
                })
              )}
            </div>

            {/* Inspector Verification Signature */}
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Inspected & Verified By (Supervisor Name)
              </label>
              <input 
                type="text" 
                value={inspectorName}
                onChange={e => setInspectorName(e.target.value)}
                placeholder="e.g. Danilo Santos (Site Supervisor)"
                required
                style={{ width: '100%', marginTop: '4px' }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn-subtle" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={!isFullyCompliant}
              title={isFullyCompliant ? 'Lock and certify submission' : `Complete all ${mandatoryItems.length} mandatory checklist items first`}
              style={{
                opacity: isFullyCompliant ? 1 : 0.5,
                cursor: isFullyCompliant ? 'pointer' : 'not-allowed'
              }}
            >
              <FileCheck2 size={14} />
              <span>Certify & Submit to VIP</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
