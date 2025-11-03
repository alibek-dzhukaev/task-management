import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import type { UserResponse, UpdateUserDto } from '@nx-fullstack/shared-types';

export function UsersPage() {
  const { user: currentUser, token, logout } = useAuth();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getUsers(token || undefined);
      setUsers(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleEdit = (user: UserResponse) => {
    setEditingId(user.id);
    setEditName(user.name);
  };

  const handleSave = async (id: string) => {
    try {
      const updateData: UpdateUserDto = { name: editName };
      await apiClient.updateUser(id, updateData, token || undefined);
      setEditingId(null);
      loadUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteUser(id, token || undefined);
      loadUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Users</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {currentUser && (
            <span style={{ fontSize: '14px', color: '#666' }}>
              👤 {currentUser.name} ({currentUser.email})
            </span>
          )}
          <button
            onClick={logout}
            style={{
              padding: '8px 16px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {loading && <div>Loading...</div>}

      {error && (
        <div style={{ color: 'red', padding: '10px', background: '#ffe6e6', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            Total users: <strong>{users.length}</strong>
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Created</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px' }}>
                    {editingId === user.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        style={{ padding: '4px 8px', width: '100%' }}
                      />
                    ) : (
                      user.name
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>{user.email}</td>
                  <td style={{ padding: '12px', fontSize: '13px', color: '#666' }}>
                    {new Date(user.createdAt).toLocaleDateString('en-US')}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {editingId === user.id ? (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleSave(user.id)}
                          style={{
                            padding: '6px 12px',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px',
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          style={{
                            padding: '6px 12px',
                            background: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleEdit(user)}
                          style={{
                            padding: '6px 12px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          style={{
                            padding: '6px 12px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', background: '#f0f9ff', borderRadius: '4px', border: '1px solid #0ea5e9' }}>
        <h3 style={{ marginTop: 0 }}>Type Safety in Action</h3>
        <p style={{ fontSize: '14px', margin: '5px 0' }}>
          All user data is typed with <code>UserResponse</code> from <code>@nx-fullstack/shared-types</code>
        </p>
        <p style={{ fontSize: '14px', margin: '5px 0' }}>
          API requests go through <strong>API Gateway (3000)</strong> →
          <strong> users-service (3002)</strong>
        </p>
      </div>
    </div>
  );
}

