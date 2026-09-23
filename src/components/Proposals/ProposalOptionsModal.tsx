import React, { useState } from 'react';
import { Project, Proposal, ProposalOption } from '../../types';
import { 
  X, 
  Layers, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Users, 
  Scale, 
  ExternalLink, 
  ShieldCheck, 
  Send
} from 'lucide-react';

interface ProposalOptionsModalProps {
  project: Project;
  proposal?: Proposal;
  onClose: () => void;
  onSaveProposal: (proposal: Proposal) => void;
  onOpenChecklist: () => void;
}

export const ProposalOptionsModal: React.FC<ProposalOptionsModalProps> = ({
  project,
  proposal,
  onClose,
  onSaveProposal,
  onOpenChecklist
}) => {
  const [title, setTitle] = useState(proposal?.title || `${project.title} - Proposal Specifications`);
  const [options, setOptions] = useState<ProposalOption[]>(
    proposal?.options || [
      {
        id: `opt-${Date.now()}-1`,
        proposalId: proposal?.id || 'new',
        optionNumber: 1,
        title: 'Option A: Premium Natural Stone (Warehouse Stocked)',
        materialsInStock: true,
        estimatedTimelineDays: 5,
        estimatedManpower: 4,
        designPegsReference: 'Architectural Digest Paris Penthouse Vol 4, p.88',
        physicalSamplesReady: true,
        pros: '100% in stock; zero shipment delay; timeless organic elegance.',
        cons: 'Requires skilled stone mason for seamless mitering.'
      },
      {
        id: `opt-${Date.now()}-2`,
        proposalId: proposal?.id || 'new',
        optionNumber: 2,
        title: 'Option B: Custom Engineered Composite Finish',
        materialsInStock: true,
        estimatedTimelineDays: 3,
        estimatedManpower: 3,
        designPegsReference: 'Milan Design Week 2025 Architectural Dossier',
        physicalSamplesReady: true,
        pros: 'Ultra-lightweight; fast 3-day installation; high stain resistance.',
        cons: 'Synthetic composition lacks natural stone grain variance.'
      }
    ]
  );

  const handleUpdateOption = (index: number, field: keyof ProposalOption, value: any) => {
    setOptions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddOption = () => {
    const nextNum = options.length + 1;
    const letter = String.fromCharCode(64 + nextNum);
    const newOpt: ProposalOption = {
      id: `opt-${Date.now()}-${nextNum}`,
      proposalId: proposal?.id || 'new',
      optionNumber: nextNum,
      title: `Option ${letter}: Architectural Alternative Spec`,
      materialsInStock: false,
      estimatedTimelineDays: 7,
      estimatedManpower: 4,
      designPegsReference: 'Reference catalog folio',
      physicalSamplesReady: false,
      pros: 'Tailored aesthetic finish; high durability.',
      cons: 'Special order required from regional distributor.'
    };
    setOptions(prev => [...prev, newOpt]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 1) return;
    setOptions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const updated: Proposal = {
      id: proposal?.id || `prop-${Date.now()}`,
      projectId: project.id,
      title: title.trim(),
      status: proposal?.status || 'draft',
      options,
      createdAt: proposal?.createdAt || new Date().toISOString()
    };
    onSaveProposal(updated);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="var(--accent-blue)" />
              <h3 style={{ fontSize: '16px' }}>VIP Proposal Dossier & Comparative Options</h3>
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
        <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
          {/* VIP Requirement Reminder Banner */}
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
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                VIP Standard: Minimum 2 Comparative Options Required
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Every proposal must detail: in-stock status, manpower, duration, design pegs, and physical samples.
              </div>
            </div>

            <button 
              type="button" 
              className="btn-subtle" 
              onClick={handleAddOption}
              style={{ fontSize: '12px', border: '1px solid var(--border-subtle)', padding: '4px 10px' }}
            >
              <Plus size={13} />
              <span>Add Option {String.fromCharCode(65 + options.length)}</span>
            </button>
          </div>

          <div className="form-group">
            <label>Proposal Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="e.g. Master Bedroom Acoustic Fabric Paneling Options"
            />
          </div>

          {/* Options Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {options.map((opt, idx) => (
              <div 
                key={opt.id}
                style={{
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-canvas)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <span className="property-tag" style={{ background: 'var(--accent-blue-bg)', color: 'var(--accent-blue)', borderColor: 'var(--accent-blue-border)' }}>
                      OPTION {String.fromCharCode(65 + idx)}
                    </span>
                    <input 
                      type="text" 
                      value={opt.title} 
                      onChange={e => handleUpdateOption(idx, 'title', e.target.value)}
                      placeholder="Option Title"
                      style={{ fontWeight: 600, flex: 1 }}
                    />
                  </div>

                  {options.length > 2 && (
                    <button 
                      type="button" 
                      className="btn-subtle" 
                      onClick={() => handleRemoveOption(idx)}
                      style={{ color: 'var(--accent-red)', padding: '2px 6px', fontSize: '11px' }}
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Grid for Stock, Timeline, Manpower, Samples */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', background: 'var(--bg-subtle)', padding: '6px 10px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={opt.materialsInStock} 
                      onChange={e => handleUpdateOption(idx, 'materialsInStock', e.target.checked)} 
                    />
                    <span style={{ fontWeight: opt.materialsInStock ? 600 : 400, color: opt.materialsInStock ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
                      {opt.materialsInStock ? '✓ Materials In Stock' : '⚠️ Sourcing Required'}
                    </span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', background: 'var(--bg-subtle)', padding: '6px 10px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={opt.physicalSamplesReady} 
                      onChange={e => handleUpdateOption(idx, 'physicalSamplesReady', e.target.checked)} 
                    />
                    <span style={{ fontWeight: opt.physicalSamplesReady ? 600 : 400, color: opt.physicalSamplesReady ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
                      {opt.physicalSamplesReady ? '✓ Physical Samples Ready' : 'Swatches Pending'}
                    </span>
                  </label>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', background: 'var(--bg-subtle)', padding: '6px 10px', borderRadius: 'var(--radius-md)' }}>
                    <Clock size={13} color="var(--text-secondary)" />
                    <span>Timeline:</span>
                    <input 
                      type="number" 
                      value={opt.estimatedTimelineDays} 
                      onChange={e => handleUpdateOption(idx, 'estimatedTimelineDays', Number(e.target.value))}
                      style={{ width: '45px', padding: '2px 4px', fontSize: '11px', textAlign: 'center' }} 
                    />
                    <span>days</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', background: 'var(--bg-subtle)', padding: '6px 10px', borderRadius: 'var(--radius-md)' }}>
                    <Users size={13} color="var(--text-secondary)" />
                    <span>Crew:</span>
                    <input 
                      type="number" 
                      value={opt.estimatedManpower} 
                      onChange={e => handleUpdateOption(idx, 'estimatedManpower', Number(e.target.value))}
                      style={{ width: '45px', padding: '2px 4px', fontSize: '11px', textAlign: 'center' }} 
                    />
                    <span>hands</span>
                  </div>
                </div>

                {/* Design Pegs Reference */}
                <div className="form-group">
                  <label style={{ fontSize: '11px' }}>Design Pegs & Inspiration Reference</label>
                  <input 
                    type="text" 
                    value={opt.designPegsReference} 
                    onChange={e => handleUpdateOption(idx, 'designPegsReference', e.target.value)}
                    placeholder="e.g. Architectural Digest Milan Suite Ref #AD-2025"
                    style={{ fontSize: '12px' }}
                  />
                </div>

                {/* Pros and Cons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '11px', color: 'var(--accent-green)' }}>Pros & Advantages</label>
                    <textarea 
                      rows={2}
                      value={opt.pros}
                      onChange={e => handleUpdateOption(idx, 'pros', e.target.value)}
                      placeholder="e.g. In stock; rapid 3-day installation; executive finish"
                      style={{ fontSize: '12px', resize: 'vertical' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '11px', color: 'var(--accent-red)' }}>Cons & Trade-Offs</label>
                    <textarea 
                      rows={2}
                      value={opt.cons}
                      onChange={e => handleUpdateOption(idx, 'cons', e.target.value)}
                      placeholder="e.g. Higher cost; requires periodic maintenance"
                      style={{ fontSize: '12px', resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <span>{options.length} options prepared</span>
            <span>•</span>
            <span style={{ color: options.length >= 2 ? 'var(--accent-green)' : 'var(--accent-amber)' }}>
              {options.length >= 2 ? '✓ Meets VIP 2-Option Requirement' : '⚠️ Need at least 2 options'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button type="button" className="btn-subtle" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn-subtle" onClick={handleSave} style={{ border: '1px solid var(--border-default)' }}>
              Save Draft
            </button>
            <button 
              type="button" 
              className="btn-primary"
              onClick={() => {
                handleSave();
                onOpenChecklist();
              }}
            >
              <ShieldCheck size={14} />
              <span>Launch Pre-Flight Checklist</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
