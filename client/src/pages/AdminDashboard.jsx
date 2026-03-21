import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionId, setActionId] = useState(null); // track current updating/deleting id
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchUsers = async () => {
        const token = sessionStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401 || response.status === 403) {
                sessionStorage.removeItem('adminToken');
                navigate('/admin/login');
                return;
            }

            const data = await response.json();
            if (data.success) {
                setUsers(data.users);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleUpdatePlan = async (userId, newPlan) => {
        const token = sessionStorage.getItem('adminToken');
        setActionId(userId);

        try {
            const response = await fetch('http://localhost:5000/api/admin/update-plan', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId, plan: newPlan })
            });

            const data = await response.json();
            if (data.success) {
                await fetchUsers();
            } else {
                alert(data.error || 'Update failed');
            }
        } catch (err) {
            alert('Connection failed');
        } finally {
            setActionId(null);
        }
    };

    const handleDeleteUser = async (userId, userEmail) => {
        const confirmed = window.confirm(`Are you absolutely sure you want to delete user ${userEmail}? This action cannot be undone.`);
        if (!confirmed) return;

        const token = sessionStorage.getItem('adminToken');
        setActionId(userId);

        try {
            const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                await fetchUsers();
            } else {
                alert(data.error || 'Deletion failed');
            }
        } catch (err) {
            alert('Connection failed');
        } finally {
            setActionId(null);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('adminToken');
        navigate('/');
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'pulse 2s infinite alternate' }}>🛡️</div>
                    <h2 style={{ fontFamily: 'var(--font-sans)', color: '#64748b' }}>Accessing Secure Terminal...</h2>
                </div>
            </div>
        );
    }

    return (
        <div style={{ 
            minHeight: '100vh', 
            width: '100%',
            flex: 1,
            background: '#f8fafc', 
            fontFamily: 'var(--font-sans)',
            padding: isMobile ? '20px 12px' : '40px 20px',
            color: '#1e293b',
            overflowY: 'auto'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <header style={{ 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? '20px' : '0',
                    justifyContent: 'space-between', 
                    alignItems: isMobile ? 'stretch' : 'center', 
                    marginBottom: '40px',
                    background: '#fff',
                    padding: '24px 32px',
                    borderRadius: '24px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                    border: '1px solid #eef2f6'
                }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '32px' }}>🛡️</span> Admin Console
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '14px' }}>System Administration Portal</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button 
                            onClick={() => navigate('/dashboard')}
                            style={{ 
                                padding: '12px 20px', 
                                background: '#fff', 
                                border: '1px solid #e2e8f0', 
                                borderRadius: '12px', 
                                color: '#475569',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '14px',
                                flex: isMobile ? 1 : 'none'
                            }}
                        >
                            App Dashboard
                        </button>
                        <button 
                            onClick={handleLogout}
                            style={{ 
                                padding: '12px 20px', 
                                background: '#fee2e2', 
                                border: '1px solid #fecaca', 
                                borderRadius: '12px', 
                                color: '#dc2626',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '14px',
                                flex: isMobile ? 1 : 'none'
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {error && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444', padding: '16px', borderRadius: '16px', marginBottom: '24px', fontWeight: '500' }}>
                           ⚠️ {error}
                    </div>
                )}

                <div style={{ 
                    background: '#fff', 
                    borderRadius: '24px', 
                    boxShadow: '0 20px 60px rgba(0,0,0,0.02)',
                    border: '1px solid #eef2f6',
                    overflow: 'hidden'
                }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: isMobile ? '600px' : 'auto' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                    <th style={{ padding: '24px', fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member</th>
                                    <th style={{ padding: '24px', fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subscription</th>
                                    <th style={{ padding: '24px', fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Usage</th>
                                    <th style={{ padding: '24px', fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ 
                                                    width: '40px', 
                                                    height: '40px', 
                                                    borderRadius: '12px', 
                                                    background: '#e2e8f0', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
                                                    fontSize: '18px',
                                                    fontWeight: '700',
                                                    color: '#64748b'
                                                }}>
                                                    {user.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '700', color: '#1e293b' }}>{user.full_name}</div>
                                                    <div style={{ fontSize: '13px', color: '#64748b' }}>{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '24px' }}>
                                            <span style={{ 
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '6px 12px', 
                                                borderRadius: '20px', 
                                                fontSize: '12px', 
                                                fontWeight: '800',
                                                textTransform: 'uppercase',
                                                background: user.plan === 'pro' ? '#e0e7ff' : '#f1f5f9',
                                                color: user.plan === 'pro' ? '#4338ca' : '#475569',
                                                border: `1px solid ${user.plan === 'pro' ? '#c7d2fe' : '#e2e8f0'}`
                                            }}>
                                                {user.plan === 'pro' && <span>⭐</span>}
                                                {user.plan}
                                            </span>
                                        </td>
                                        <td style={{ padding: '24px' }}>
                                            <div style={{ fontSize: '13px', color: '#475569' }}>
                                                <span style={{ fontWeight: '700' }}>{user.ai_usage}</span> AI • <span style={{ fontWeight: '700' }}>{user.mindmap_usage}</span> Mindmap
                                            </div>
                                        </td>
                                        <td style={{ padding: '24px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button 
                                                    disabled={actionId === user.id}
                                                    onClick={() => handleUpdatePlan(user.id, user.plan === 'pro' ? 'free' : 'pro')}
                                                    style={{ 
                                                        padding: '10px 16px', 
                                                        background: user.plan === 'pro' ? '#fff' : 'var(--accent-indigo)', 
                                                        color: user.plan === 'pro' ? '#475569' : '#fff', 
                                                        borderRadius: '10px', 
                                                        border: user.plan === 'pro' ? '1px solid #e2e8f0' : 'none', 
                                                        fontSize: '13px', 
                                                        fontWeight: '700',
                                                        cursor: actionId === user.id ? 'not-allowed' : 'pointer',
                                                        opacity: actionId === user.id ? 0.7 : 1,
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {user.plan === 'pro' ? 'Set to Free' : 'Access Pro'}
                                                </button>
                                                <button 
                                                    disabled={actionId === user.id}
                                                    onClick={() => handleDeleteUser(user.id, user.email)}
                                                    style={{ 
                                                        padding: '10px 16px', 
                                                        background: '#fff', 
                                                        color: '#dc2626', 
                                                        borderRadius: '10px', 
                                                        border: '1px solid #fecaca', 
                                                        fontSize: '13px', 
                                                        fontWeight: '700',
                                                        cursor: actionId === user.id ? 'not-allowed' : 'pointer',
                                                        opacity: actionId === user.id ? 0.7 : 1,
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={(e) => !actionId && (e.currentTarget.style.background = '#fef2f2')}
                                                    onMouseOut={(e) => !actionId && (e.currentTarget.style.background = '#fff')}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {users.length === 0 && (
                        <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                            <h3>No registered users found.</h3>
                            <p>Once users sign up, they will appear in this console.</p>
                        </div>
                    )}
                </div>
            </div>
            
            <style>{`
                @keyframes pulse {
                    from { opacity: 0.6; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1.05); }
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
