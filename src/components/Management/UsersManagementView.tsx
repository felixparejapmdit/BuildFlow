import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { 
  Users, 
  UserPlus, 
  Search, 
  Shield, 
  HardHat, 
  Briefcase, 
  Crown, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Mail, 
  Phone, 
  Building2, 
  Calendar,
  Lock,
  UserCheck,
  UserX
} from 'lucide-react';
import { getIconColorForText } from '../../utils/colors';
import { showConfirm, showAlert } from '../Common/ConfirmDialog';

interface UsersManagementViewProps {
  users: User[];
  onSaveUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
];

export const UsersManagementView: React.FC<UsersManagementViewProps> = ({
  users,
  onSaveUser,
  onDeleteUser
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [formFullName, setFormFullName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('supervisor');
  const [formDepartment, setFormDepartment] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAvatarUrl, setFormAvatarUrl] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  // Statistics
  const adminCount = users.filter(u => u.role === 'admin').length;
  const activeCount = users.filter(u => u.isActive).length;
  const supervisorCount = users.filter(u => u.role === 'supervisor' || u.role === 'lead').length;
  const liaisonCount = users.filter(u => u.role === 'vip_representative' || u.role === 'inspector').length;

  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter === 'active' && !u.isActive) return false;
    if (statusFilter === 'inactive' && u.isActive) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.fullName.toLowerCase().includes(q);
      const matchUsername = u.username.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchDept = u.department?.toLowerCase().includes(q);
      const matchRole = u.role.toLowerCase().includes(q);
      if (!matchName && !matchUsername && !matchEmail && !matchDept && !matchRole) return false;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormFullName('');
    setFormUsername('');
    setFormEmail('');
    setFormRole('supervisor');
    setFormDepartment('Site Operations');
    setFormPhone('');
    setFormAvatarUrl(PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)]);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormFullName(user.fullName);
    setFormUsername(user.username);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormDepartment(user.department || '');
    setFormPhone(user.phone || '');
    setFormAvatarUrl(user.avatarUrl || PRESET_AVATARS[0]);
    setFormIsActive(user.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName.trim() || !formEmail.trim()) return;

    const username = formUsername.trim()
      ? formUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
      : formFullName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

    const userToSave: User = {
      id: editingUser?.id || `usr-${Date.now().toString(36)}`,
      username,
      fullName: formFullName.trim(),
      email: formEmail.trim().toLowerCase(),
      role: formRole,
      department: formDepartment.trim() || undefined,
      phone: formPhone.trim() || undefined,
      avatarUrl: formAvatarUrl.trim() || undefined,
      isActive: formIsActive,
      lastLoginAt: editingUser?.lastLoginAt,
      createdAt: editingUser?.createdAt || new Date().toISOString()
    };

    onSaveUser(userToSave);
    setIsModalOpen(false);
  };

  const handleDelete = async (user: User) => {
    if (user.role === 'admin' && adminCount <= 1) {
      showAlert({
        title: 'Action Restricted',
        message: 'Cannot delete the only remaining Administrator account.\n\nAssign another Administrator before removing this user.',
        variant: 'warning',
        notice: 'Security policy • At least one admin account must remain active'
      });
      return;
    }
    const confirmed = await showConfirm({
      title: 'Delete User Account',
      message: `Are you sure you want to delete user account "${user.fullName}" (@${user.username})?\n\nThis will permanently revoke their access credentials to BuildFlow.`,
      confirmText: 'Delete Account',
      variant: 'danger',
      notice: 'User session & credentials revoked'
    });
    if (confirmed) {
      onDeleteUser(user.id);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const roleStyle = getIconColorForText(role);
    switch (role) {
      case 'admin':
        return (
          <span 
            className="tag" 
            style={{ 
              background: roleStyle.bg, 
              color: roleStyle.color, 
              borderColor: roleStyle.border,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 600
            }}
          >
            <Shield size={11} color={roleStyle.color} />
            <span>Administrator</span>
          </span>
        );
      case 'supervisor':
        return (
          <span 
            className="tag" 
            style={{ 
              background: roleStyle.bg, 
              color: roleStyle.color, 
              borderColor: roleStyle.border,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 600
            }}
          >
            <HardHat size={11} color={roleStyle.color} />
            <span>Site Supervisor</span>
          </span>
        );
      case 'lead':
        return (
          <span 
            className="tag" 
            style={{ 
              background: roleStyle.bg, 
              color: roleStyle.color, 
              borderColor: roleStyle.border,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 600
            }}
          >
            <Briefcase size={11} color={roleStyle.color} />
            <span>Operations Lead</span>
          </span>
        );
      case 'vip_representative':
        return (
          <span 
            className="tag" 
            style={{ 
              background: roleStyle.bg, 
              color: roleStyle.color, 
              borderColor: roleStyle.border,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 600
            }}
          >
            <Crown size={11} color={roleStyle.color} />
            <span>VIP Representative</span>
          </span>
        );
      case 'inspector':
        return (
          <span 
            className="tag" 
            style={{ 
              background: roleStyle.bg, 
              color: roleStyle.color, 
              borderColor: roleStyle.border,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 600
            }}
          >
            <CheckCircle2 size={11} color={roleStyle.color} />
            <span>Quality Inspector</span>
          </span>
        );
    }
  };

  const userAddIconStyle = getIconColorForText('Add User');

  return (
    <div className="users-management-view">
      {/* Header */}
      <div className="queue-header">
        <div className="queue-title-area">
          <h2 className="queue-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="var(--accent-blue)" />
            <span>User Accounts & Team Access</span>
          </h2>
          <span className="queue-counter">
            {users.length} registered accounts across management, operations, and quality roles
          </span>
        </div>

        <button 
          type="button" 
          className="btn-primary" 
          onClick={handleOpenAdd}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <UserPlus size={15} strokeWidth={2.2} />
          <span>Add New User</span>
        </button>
      </div>

      {/* Summary Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
            Total Accounts
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '2px', color: 'var(--text-primary)' }}>
            {users.length}
          </div>
        </div>

        <div style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
            Active / Enabled
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#10b981', marginTop: '2px' }}>
            {activeCount}
          </div>
        </div>

        <div style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
            Administrators
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#8b5cf6', marginTop: '2px' }}>
            {adminCount}
          </div>
        </div>

        <div style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
            Field & Ops Leads
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#3b82f6', marginTop: '2px' }}>
            {supervisorCount}
          </div>
        </div>

        <div style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
            VIP Liaison & QA
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#f59e0b', marginTop: '2px' }}>
            {liaisonCount}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="controls-row" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-input-wrap" style={{ flex: '1 1 240px' }}>
          <Search size={14} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search users by name, username, email, department, or role..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Role Filter */}
        <select 
          value={roleFilter} 
          onChange={e => setRoleFilter(e.target.value)}
          style={{ 
            padding: '7px 12px', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--border-default)', 
            background: 'var(--bg-primary)', 
            color: 'var(--text-primary)',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          <option value="all">All Roles (5)</option>
          <option value="admin">Administrator</option>
          <option value="supervisor">Site Supervisor</option>
          <option value="lead">Operations Lead</option>
          <option value="vip_representative">VIP Representative</option>
          <option value="inspector">Quality Inspector</option>
        </select>

        {/* Status Filter */}
        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)}
          style={{ 
            padding: '7px 12px', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--border-default)', 
            background: 'var(--bg-primary)', 
            color: 'var(--text-primary)',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="inactive">Suspended Only</option>
        </select>
      </div>

      {/* Users Data Table */}
      <div className="notion-table-container">
        <table className="notion-table">
          <thead>
            <tr>
              <th style={{ width: '28%' }}>Team Member Profile</th>
              <th style={{ width: '18%' }}>System Role</th>
              <th style={{ width: '22%' }}>Contact & Department</th>
              <th style={{ width: '12%' }}>Status</th>
              <th style={{ width: '10%' }}>Last Active</th>
              <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                  No team members match your current filter criteria.
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => {
                const userIconColor = getIconColorForText(user.role);
                return (
                  <tr key={user.id}>
                    {/* Member Profile */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ position: 'relative' }}>
                          <img 
                            src={user.avatarUrl || PRESET_AVATARS[0]} 
                            alt={user.fullName}
                            style={{ 
                              width: '38px', 
                              height: '38px', 
                              borderRadius: '50%', 
                              objectFit: 'cover',
                              border: `2px solid ${userIconColor.border}`
                            }}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <span 
                            style={{ 
                              position: 'absolute', 
                              bottom: '0px', 
                              right: '0px', 
                              width: '10px', 
                              height: '10px', 
                              borderRadius: '50%', 
                              backgroundColor: user.isActive ? '#10b981' : '#9ca3af',
                              border: '2px solid var(--bg-primary)'
                            }} 
                            title={user.isActive ? 'Active' : 'Suspended'}
                          />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{user.fullName}</span>
                            {user.role === 'admin' && (
                              <span title="Administrator Access" style={{ color: '#8b5cf6' }}>★</span>
                            )}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td>
                      {getRoleBadge(user.role)}
                    </td>

                    {/* Contact & Department */}
                    <td>
                      <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
                          <Mail size={12} style={{ opacity: 0.7 }} />
                          <span style={{ fontFamily: 'var(--font-mono)' }}>{user.email}</span>
                        </div>
                        {user.department && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-tertiary)', fontSize: '11px' }}>
                            <Building2 size={11} style={{ opacity: 0.6 }} />
                            <span>{user.department}</span>
                          </div>
                        )}
                        {user.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-tertiary)', fontSize: '11px' }}>
                            <Phone size={11} style={{ opacity: 0.6 }} />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      {user.isActive ? (
                        <span 
                          className="tag" 
                          style={{ 
                            background: 'rgba(16, 185, 129, 0.12)', 
                            color: '#10b981', 
                            borderColor: 'rgba(16, 185, 129, 0.3)',
                            fontSize: '11px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <UserCheck size={11} />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span 
                          className="tag" 
                          style={{ 
                            background: 'rgba(156, 163, 175, 0.12)', 
                            color: 'var(--text-tertiary)', 
                            borderColor: 'var(--border-default)',
                            fontSize: '11px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <UserX size={11} />
                          <span>Suspended</span>
                        </span>
                      )}
                    </td>

                    {/* Last Active */}
                    <td>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                      </div>
                    </td>

                    {/* Actions */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <button 
                          type="button" 
                          className="btn-subtle" 
                          onClick={() => handleOpenEdit(user)}
                          title="Edit user details and access level"
                          style={{ padding: '5px 8px' }}
                        >
                          <Edit3 size={13} />
                        </button>
                        <button 
                          type="button" 
                          className="btn-subtle" 
                          onClick={() => handleDelete(user)}
                          title="Delete user account"
                          style={{ padding: '5px 8px', color: 'var(--accent-red)' }}
                        >
                          <Trash2 size={13} />
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

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="var(--accent-blue)" />
                <h3 style={{ margin: 0 }}>{editingUser ? 'Edit User Account' : 'Add New User Account'}</h3>
              </div>
              <button 
                type="button" 
                className="btn-subtle" 
                onClick={() => setIsModalOpen(false)}
                style={{ padding: '4px' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Avatar Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Portrait Photo / Avatar
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <img 
                    src={formAvatarUrl || PRESET_AVATARS[0]} 
                    alt="Preview"
                    style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '50%', 
                      objectFit: 'cover',
                      border: '2px solid var(--accent-blue)'
                    }} 
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                      Choose from curated team portraits:
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {PRESET_AVATARS.map((url, idx) => (
                        <img 
                          key={idx}
                          src={url}
                          alt={`Preset ${idx + 1}`}
                          onClick={() => setFormAvatarUrl(url)}
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            cursor: 'pointer',
                            border: formAvatarUrl === url ? '2px solid var(--accent-blue)' : '1px solid var(--border-default)',
                            transform: formAvatarUrl === url ? 'scale(1.15)' : 'none',
                            transition: 'all 0.15s ease'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Or enter custom image URL..." 
                  value={formAvatarUrl}
                  onChange={e => setFormAvatarUrl(e.target.value)}
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                />
              </div>

              {/* Full Name & Username */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Full Name *
                  </label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Maria Clara" 
                    value={formFullName}
                    onChange={e => setFormFullName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Username
                  </label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. mclara" 
                    value={formUsername}
                    onChange={e => setFormUsername(e.target.value)}
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Email Address *
                  </label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="e.g. m.clara@buildflow.vip" 
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Phone Number
                  </label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="+63 917..." 
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Role & Department */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    User Role *
                  </label>
                  <select 
                    className="form-input" 
                    value={formRole} 
                    onChange={e => setFormRole(e.target.value as UserRole)}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="admin">Administrator (Full Control)</option>
                    <option value="supervisor">Site Supervisor (Operations)</option>
                    <option value="lead">Operations Lead (Field Team)</option>
                    <option value="vip_representative">VIP Representative (Client Liaison)</option>
                    <option value="inspector">Quality Inspector (QA & Gates)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Department / Division
                  </label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Site Operations" 
                    value={formDepartment}
                    onChange={e => setFormDepartment(e.target.value)}
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)'
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Account Status
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    {formIsActive ? 'Account is active and authorized to log in.' : 'Account is suspended; login blocked.'}
                  </div>
                </div>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={formIsActive}
                    onChange={e => setFormIsActive(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent-blue)' }}
                  />
                  <span style={{ fontSize: '12px', fontWeight: 500 }}>Active</span>
                </label>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button 
                  type="button" 
                  className="btn-subtle" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Check size={14} />
                  <span>{editingUser ? 'Save Changes' : 'Create User'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
