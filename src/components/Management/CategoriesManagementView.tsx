import React, { useState } from 'react';
import { CategoryItem, Project } from '../../types';
import { 
  Layers, 
  Plus, 
  Search, 
  Tag, 
  Edit3, 
  Trash2, 
  Check, 
  X,
  Briefcase
} from 'lucide-react';
import { getIconColorForText } from '../../utils/colors';

interface CategoriesManagementViewProps {
  categories: CategoryItem[];
  projects: Project[];
  onSaveCategory: (category: CategoryItem) => void;
  onDeleteCategory: (categoryId: string) => void;
}

export const CategoriesManagementView: React.FC<CategoriesManagementViewProps> = ({
  categories,
  projects,
  onSaveCategory,
  onDeleteCategory
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formKey, setFormKey] = useState('');
  const [formDescription, setFormDescription] = useState('');

  // Active project counts per category
  const projectCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => {
      const k = p.category.toLowerCase();
      counts[k] = (counts[k] || 0) + 1;
    });
    return counts;
  }, [projects]);

  const filteredCategories = categories.filter(c => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchKey = c.key.toLowerCase().includes(q);
      const matchDesc = c.description?.toLowerCase().includes(q);
      if (!matchName && !matchKey && !matchDesc) return false;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormName('');
    setFormKey('');
    setFormDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: CategoryItem) => {
    setEditingCategory(category);
    setFormName(category.name);
    setFormKey(category.key);
    setFormDescription(category.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const key = formKey.trim() 
      ? formKey.trim().toLowerCase().replace(/\s+/g, '_') 
      : formName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');

    const categoryToSave: CategoryItem = {
      id: editingCategory?.id || `cat-${Date.now().toString(36)}`,
      key,
      name: formName.trim(),
      description: formDescription.trim() || undefined,
      isActive: true,
      createdAt: editingCategory?.createdAt || new Date().toISOString()
    };

    onSaveCategory(categoryToSave);
    setIsModalOpen(false);
  };

  return (
    <div className="categories-management-view">
      {/* Header */}
      <div className="queue-header">
        <div className="queue-title-area">
          <h2 className="queue-title">Project Categories Management</h2>
          <span className="queue-counter">
            {categories.length} customizable project classifications for workstreams
          </span>
        </div>

        <button type="button" className="btn-primary" onClick={handleOpenAdd}>
          <Plus size={14} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Summary Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
            Configured Categories
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
            {categories.length}
          </div>
        </div>

        <div style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
            Active Projects Categorized
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)', marginTop: '2px' }}>
            {projects.length}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-row">
        <div className="search-input-wrap">
          <Search size={14} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search categories by name, system key, or description..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Notion Data Table */}
      <div className="notion-table-container">
        <table className="notion-table">
          <thead>
            <tr>
              <th style={{ width: '28%' }}>Category Name & System Key</th>
              <th style={{ width: '42%' }}>Scope & Description</th>
              <th style={{ width: '16%' }}>Active Workstreams</th>
              <th style={{ width: '14%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-tertiary)' }}>
                  No categories match your search.
                </td>
              </tr>
            ) : (
              filteredCategories.map(cat => {
                const count = projectCounts[cat.key.toLowerCase()] || 0;

                return (
                  <tr key={cat.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Tag size={15} color={getIconColorForText(cat.name).color} />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {cat.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                            key: {cat.key}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                        {cat.description || 'Standard project category classification.'}
                      </p>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Briefcase size={12} color={count > 0 ? 'var(--accent-blue)' : 'var(--text-tertiary)'} />
                        <span style={{ fontWeight: 600, fontSize: '12px', color: count > 0 ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                          {count} {count === 1 ? 'project' : 'projects'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button 
                          type="button" 
                          className="btn-subtle" 
                          onClick={() => handleOpenEdit(cat)}
                          title="Edit category"
                          style={{ padding: '3px 6px' }}
                        >
                          <Edit3 size={12} />
                        </button>
                        {categories.length > 1 && (
                          <button 
                            type="button" 
                            className="btn-subtle" 
                            onClick={() => {
                              if (window.confirm(`Delete category "${cat.name}"?`)) {
                                onDeleteCategory(cat.id);
                              }
                            }}
                            title="Delete category"
                            style={{ color: 'var(--accent-red)', padding: '3px 6px' }}
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
              <button type="button" className="btn-subtle" onClick={() => setIsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Category Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Interior Fit-Out, Infrastructure, Historic Restoration" 
                    value={formName}
                    onChange={e => {
                      setFormName(e.target.value);
                      if (!editingCategory) {
                        setFormKey(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'));
                      }
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>System Key (Used in Filters & Database)</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. interior_fitout" 
                    value={formKey}
                    onChange={e => setFormKey(e.target.value)}
                    style={{ fontFamily: 'var(--font-mono)' }}
                  />
                </div>

                <div className="form-group">
                  <label>Scope & Description</label>
                  <textarea 
                    rows={3}
                    placeholder="Describe what types of jobs and workstreams fall under this category..." 
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-subtle" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={14} />
                  <span>{editingCategory ? 'Save Changes' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
