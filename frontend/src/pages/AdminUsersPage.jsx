import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Shield, 
  UserCheck, 
  UserX, 
  MoreVertical, 
  Mail, 
  Calendar,
  AlertTriangle,
  X,
  Loader2,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8081/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setActionLoading('creating');
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:8081/api/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setIsAddModalOpen(false);
        setFormData({ name: '', email: '', password: '', role: 'USER' });
        fetchUsers();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create user');
      }
    } catch (err) {
      setError(err.message);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setActionLoading(editingUser.id);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8081/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ name: formData.name, email: formData.email })
      });
      if (response.ok) {
        setIsEditModalOpen(false);
        setEditingUser(null);
        fetchUsers();
      } else {
        throw new Error('Failed to update user');
      }
    } catch (err) {
      setError(err.message);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, password: '', role: user.role });
    setIsEditModalOpen(true);
  };

  const handleToggleStatus = async (user) => {
    setActionLoading(user.id);
    const token = localStorage.getItem('token');
    const endpoint = user.active 
      ? `http://localhost:8081/api/users/${user.id}` 
      : `http://localhost:8081/api/users/${user.id}/activate`;
    
    try {
      const response = await fetch(endpoint, {
        method: user.active ? 'DELETE' : 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchUsers();
      } else {
        throw new Error('Action failed');
      }
    } catch (err) {
      setError(err.message);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    setActionLoading(userId);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8081/api/users/${userId}/role?role=${newRole}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchUsers();
      } else {
        throw new Error('Failed to update role');
      }
    } catch (err) {
      setError(err.message);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const s = search.toLowerCase();
    const matchesSearch = u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s);
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="admin-users-container">
      <AnimatePresence>
        {showError && (
          <motion.div 
            className="custom-toast error"
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
          >
            <div className="toast-content">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
            <button className="toast-close" onClick={() => setShowError(false)}>
              <X size={14} />
            </button>
            <div className="toast-progress"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="admin-header">
        <div className="header-text">
          <h1>User Management</h1>
          <p>Manage access, assign roles, and monitor user status.</p>
        </div>
        <div className="header-stats">
          <div className="mini-stat">
            <span className="stat-label">Total Users</span>
            <span className="stat-value">{users.length}</span>
          </div>
          <div className="mini-stat">
            <span className="stat-label">Admins</span>
            <span className="stat-value">{users.filter(u => u.role === 'ADMIN').length}</span>
          </div>
        </div>
      </header>

      <div className="user-toolbar glass-card">
        <div className="toolbar-left">
          <div className="search-bar">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <Filter size={16} />
            <select value={filterRole} onChange={e => setFilterRole(e.target.value)}>
              <option value="ALL">All Roles</option>
              <option value="USER">Students (Users)</option>
              <option value="TECHNICIAN">Technicians</option>
              <option value="ADMIN">Administrators</option>
            </select>
          </div>
        </div>
        <button 
          className="btn btn-primary btn-add"
          onClick={() => {
            setFormData({ name: '', email: '', password: '', role: 'USER' });
            setIsAddModalOpen(true);
          }}
        >
          <UserPlus size={18} /> Add New User
        </button>
      </div>

      <div className="users-table-wrapper glass-card">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined Date</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="table-loading">
                  <Loader2 className="animate-spin" />
                  <span>Fetching users...</span>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="table-empty">
                  <Users size={40} />
                  <p>No users found matching your criteria.</p>
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id} className={!user.active ? 'inactive-row' : ''}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-large">
                        {user.pictureUrl ? (
                          <img src={user.pictureUrl} alt={user.name} />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                        {!user.active && <div className="inactive-badge-dot"></div>}
                      </div>
                      <div className="user-meta">
                        <span className="user-name">{user.name} {user.id === currentUser.id && <span className="self-tag">(You)</span>}</span>
                        <span className="user-email"><Mail size={12} /> {user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={`role-badge ${user.role}`}>
                      <Shield size={12} />
                      {user.role}
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${user.active ? 'active' : 'inactive'}`}>
                      {user.active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td>
                    <div className="date-cell">
                      <Calendar size={14} />
                      {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </td>
                  <td className="text-right">
                    <div className="action-group">
                      {user.id !== currentUser.id ? (
                        <>
                          <button 
                            className="btn-icon-action" 
                            title="Edit User"
                            onClick={() => openEditModal(user)}
                          >
                            <Shield size={16} className="text-primary" />
                          </button>
                          <button 
                            className="btn-icon-action" 
                            title={user.active ? 'Deactivate' : 'Activate'}
                            onClick={() => handleToggleStatus(user)}
                            disabled={actionLoading === user.id}
                          >
                            {actionLoading === user.id ? <Loader2 size={16} className="animate-spin" /> : 
                              user.active ? <UserX size={18} className="text-danger" /> : <UserCheck size={18} className="text-success" />
                            }
                          </button>
                          <select 
                            className="role-select"
                            value={user.role}
                            onChange={(e) => handleChangeRole(user.id, e.target.value)}
                            disabled={actionLoading === user.id}
                          >
                            <option value="USER">Set as User</option>
                            <option value="TECHNICIAN">Set as Technician</option>
                            <option value="ADMIN">Set as Admin</option>
                          </select>
                        </>
                      ) : (
                        <span className="current-user-badge">Current Admin</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <motion.div 
            className="modal-content glass-card" 
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="modal-header">
              <h3>Create New User</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="close-btn"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateUser} className="modal-form">
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  required 
                  className="form-control"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  required 
                  className="form-control"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Temporary Password</label>
                <input 
                  type="password" 
                  required 
                  className="form-control"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Initial Role</label>
                <select 
                  className="form-control"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option value="USER">User</option>
                  <option value="TECHNICIAN">Technician</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading === 'creating'}>
                  {actionLoading === 'creating' ? <Loader2 className="animate-spin" /> : 'Create Account'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <motion.div 
            className="modal-content glass-card" 
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="modal-header">
              <h3>Edit User Details</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="close-btn"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdateUser} className="modal-form">
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  required 
                  className="form-control"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  required 
                  className="form-control"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading === editingUser?.id}>
                  {actionLoading === editingUser?.id ? <Loader2 className="animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <style>{`
        .admin-users-container { max-width: 1400px; margin: 40px auto; padding: 0 24px; }
        .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .header-text h1 { font-size: 32px; font-weight: 800; letter-spacing: -1px; margin-bottom: 4px; }
        .header-text p { color: var(--clr-text-muted); font-size: 15px; }
        .header-stats { display: flex; gap: 24px; }
        .mini-stat { display: flex; flex-direction: column; align-items: flex-end; }
        .stat-label { font-size: 11px; font-weight: 700; color: var(--clr-text-faint); text-transform: uppercase; letter-spacing: 0.5px; }
        .stat-value { font-size: 24px; font-weight: 800; color: var(--clr-primary); }

        .user-toolbar { padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-radius: 16px; }
        .toolbar-left { display: flex; gap: 20px; align-items: center; flex: 1; }
        
        .search-bar { 
          display: flex; align-items: center; gap: 12px; background: rgba(0,0,0,0.2); 
          padding: 10px 16px; border-radius: 12px; border: 1px solid var(--clr-border);
          flex: 1; max-width: 400px;
        }
        .search-bar input { background: none; border: none; color: var(--clr-text); font-size: 14px; outline: none; width: 100%; }
        
        .filter-group { display: flex; align-items: center; gap: 8px; color: var(--clr-text-muted); }
        .filter-group select { 
          background: rgba(0,0,0,0.2); border: 1px solid var(--clr-border); 
          color: var(--clr-text); padding: 8px 12px; border-radius: 10px; font-size: 13px; outline: none;
        }

        .users-table-wrapper { border-radius: 20px; overflow: hidden; }
        .users-table { width: 100%; border-collapse: collapse; text-align: left; }
        .users-table th { padding: 16px 24px; font-size: 12px; font-weight: 700; color: var(--clr-text-faint); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--clr-border); }
        .users-table td { padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.03); }
        
        .user-cell { display: flex; align-items: center; gap: 16px; }
        .user-avatar-large { 
          width: 44px; height: 44px; border-radius: 12px; background: var(--clr-primary); 
          display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff;
          position: relative; overflow: visible;
        }
        .user-avatar-large img { width: 100%; height: 100%; border-radius: 12px; object-fit: cover; }
        .inactive-badge-dot { position: absolute; bottom: -2px; right: -2px; width: 12px; height: 12px; background: var(--clr-danger); border: 2px solid #0d1117; border-radius: 50%; }
        
        .user-meta { display: flex; flex-direction: column; gap: 2px; }
        .user-name { font-size: 15px; font-weight: 600; color: var(--clr-text); }
        .self-tag { font-size: 11px; color: var(--clr-primary); margin-left: 6px; }
        .user-email { font-size: 13px; color: var(--clr-text-muted); display: flex; align-items: center; gap: 4px; }
        
        .role-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; }
        .role-badge.ADMIN { background: rgba(88, 166, 255, 0.1); color: var(--clr-primary); }
        .role-badge.TECHNICIAN { background: rgba(126, 231, 135, 0.1); color: #7ee787; }
        .role-badge.USER { background: rgba(139, 148, 158, 0.1); color: var(--clr-text-muted); }
        
        .status-pill { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; }
        .status-pill.active { background: rgba(63, 185, 80, 0.1); color: var(--clr-success); }
        .status-pill.inactive { background: rgba(248, 81, 73, 0.1); color: var(--clr-danger); }
        
        .date-cell { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--clr-text-muted); }
        
        .action-group { display: flex; align-items: center; gap: 12px; justify-content: flex-end; }
        .btn-icon-action { background: none; border: none; cursor: pointer; padding: 8px; border-radius: 8px; transition: all 0.2s; }
        .btn-icon-action:hover:not(:disabled) { background: rgba(255,255,255,0.05); transform: scale(1.1); }
        .btn-icon-action:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .role-select { 
          background: rgba(255,255,255,0.03); border: 1px solid var(--clr-border); 
          color: var(--clr-text-muted); padding: 6px 10px; border-radius: 8px; font-size: 12px; outline: none;
        }
        .role-select:hover { border-color: var(--clr-primary); color: var(--clr-text); }
        
        .inactive-row td { opacity: 0.6; }
        .inactive-row .user-avatar-large { filter: grayscale(1); }
        
        .current-user-badge { font-size: 11px; font-weight: 700; color: var(--clr-primary); opacity: 0.6; }
        
        .table-loading, .table-empty { height: 200px; text-align: center; color: var(--clr-text-faint); }
        .table-loading span { margin-left: 12px; font-size: 14px; }
        .table-empty p { margin-top: 12px; font-size: 14px; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal-content { width: 100%; max-width: 450px; padding: 32px; display: flex; flex-direction: column; gap: 24px; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; }
        .close-btn { background: none; border: none; color: var(--clr-text-muted); cursor: pointer; }
        .modal-form { display: flex; flex-direction: column; gap: 20px; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding-top: 12px; }
        
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-size: 13px; font-weight: 600; color: var(--clr-text-muted); }
        .form-control { background: rgba(0,0,0,0.2); border: 1px solid var(--clr-border); color: var(--clr-text); padding: 10px 14px; border-radius: 10px; outline: none; }
        .form-control:focus { border-color: var(--clr-primary); }

        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* ── Custom Toast ── */
        .custom-toast {
          position: fixed;
          top: 0;
          left: 50%;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: rgba(248, 81, 73, 0.95);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(248, 81, 73, 0.2);
          border-radius: 12px;
          color: #fff;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          min-width: 320px;
          max-width: 90vw;
          justify-content: space-between;
        }
        .toast-content { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 500; }
        .toast-close { background: none; border: none; color: rgba(255,255,255,0.7); cursor: pointer; padding: 4px; display: flex; }
        .toast-close:hover { color: #fff; }
        .toast-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background: rgba(255,255,255,0.3);
          width: 100%;
          animation: progress 3s linear forwards;
          border-bottom-left-radius: 12px;
        }
        @keyframes progress { from { width: 100%; } to { width: 0%; } }
      `}</style>
    </div>
  );
}
