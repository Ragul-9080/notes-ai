import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [settings, setSettings] = useState({ pro_price: '499' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionId, setActionId] = useState(null); // track current updating/deleting id
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchData = async () => {
        const token = sessionStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            
            // Fetch Users
            const userRes = await fetch(`${API_URL}/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (userRes.status === 401 || userRes.status === 403) {
                sessionStorage.removeItem('adminToken');
                navigate('/admin/login');
                return;
            }

            const userData = await userRes.json();
            if (userData.success) setUsers(userData.users);

            // Fetch Settings
            const settingsRes = await fetch(`${API_URL}/admin/settings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const settingsData = await settingsRes.json();
            if (settingsData.success) {
                setSettings(prev => ({ ...prev, ...settingsData.settings }));
            }

        } catch (err) {
            setError('Failed to load system data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateSetting = async (key, value) => {
        const token = sessionStorage.getItem('adminToken');
        setIsUpdatingSettings(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_URL}/admin/update-settings`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ key, value })
            });

            const data = await response.json();
            if (data.success) {
                alert('Setting updated successfully');
            } else {
                alert(data.error || 'Update failed');
            }
        } catch (err) {
            alert('Connection failed');
        } finally {
            setIsUpdatingSettings(false);
        }
    };

    const handleUpdatePlan = async (userId, newPlan) => {
        const token = sessionStorage.getItem('adminToken');
        setActionId(userId);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_URL}/admin/update-plan`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId, plan: newPlan })
            });

            const data = await response.json();
            if (data.success) {
                await fetchData();
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
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_URL}/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                await fetchData();
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

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1r' : '1fr 320px', gap: '32px', alignItems: 'start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {error && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444', padding: '16px', borderRadius: '16px', fontWeight: '500' }}>
                                   ⚠️ {error}
                            </div>
                        )}

                        {/* Members Table */}
                        <div style={{ 
                            background: '#fff', 
                            borderRadius: '24px', 
                            boxShadow: '0 20px 60px rgba(0,0,0,0.02)',
                            border: '1px solid #eef2f6',
                            overflow: 'hidden'
                        }}>
                            <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Platform Members</h3>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: isMobile ? '600px' : 'auto' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                            <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member</th>
                                            <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subscription</th>
                                            <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }}>
                                                <td style={{ padding: '20px 24px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ 
                                                            width: '36px', 
                                                            height: '36px', 
                                                            borderRadius: '10px', 
                                                            background: '#e2e8f0', 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            justifyContent: 'center',
                                                            fontSize: '16px',
                                                            fontWeight: '700',
                                                            color: '#64748b'
                                                        }}>
                                                            {user.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '14px' }}>{user.full_name}</div>
                                                            <div style={{ fontSize: '12px', color: '#64748b' }}>{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px 24px' }}>
                                                    <span style={{ 
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        padding: '4px 10px', 
                                                        borderRadius: '20px', 
                                                        fontSize: '11px', 
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
                                                <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                        <button 
                                                            disabled={actionId === user.id}
                                                            onClick={() => handleUpdatePlan(user.id, user.plan === 'pro' ? 'free' : 'pro')}
                                                            style={{ 
                                                                padding: '8px 14px', 
                                                                background: user.plan === 'pro' ? '#fff' : 'var(--accent-indigo)', 
                                                                color: user.plan === 'pro' ? '#475569' : '#fff', 
                                                                borderRadius: '8px', 
                                                                border: user.plan === 'pro' ? '1px solid #e2e8f0' : 'none', 
                                                                fontSize: '12px', 
                                                                fontWeight: '700',
                                                                cursor: actionId === user.id ? 'not-allowed' : 'pointer',
                                                                transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            {user.plan === 'pro' ? 'Set Free' : 'Set Pro'}
                                                        </button>
                                                        <button 
                                                            disabled={actionId === user.id}
                                                            onClick={() => handleDeleteUser(user.id, user.email)}
                                                            style={{ 
                                                                padding: '8px 14px', 
                                                                background: '#fff', 
                                                                color: '#dc2626', 
                                                                borderRadius: '8px', 
                                                                border: '1px solid #fecaca', 
                                                                fontSize: '12px', 
                                                                fontWeight: '700',
                                                                cursor: actionId === user.id ? 'not-allowed' : 'pointer',
                                                            }}
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
                                <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                                    <p>No registered users found.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar / Settings */}
                    <div style={{ position: 'sticky', top: '20px' }}>
                        <div style={{ 
                            background: '#fff', 
                            borderRadius: '24px', 
                            padding: '32px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.02)',
                            border: '1px solid #eef2f6',
                        }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                ⚙️ System Settings
                            </h3>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
                                    Pro Plan Price (₹)
                                </label>
                                <input 
                                    type="number"
                                    value={settings.pro_price}
                                    onChange={(e) => setSettings({ ...settings, pro_price: e.target.value })}
                                    style={{ 
                                        width: '100%', 
                                        padding: '14px', 
                                        borderRadius: '12px', 
                                        border: '1px solid #e2e8f0', 
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        background: '#f8fafc',
                                        marginBottom: '16px',
                                        outline: 'none'
                                    }}
                                />
                                <button 
                                    onClick={() => handleUpdateSetting('pro_price', settings.pro_price)}
                                    disabled={isUpdatingSettings}
                                    style={{ 
                                        width: '100%', 
                                        padding: '14px', 
                                        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                                        color: 'white', 
                                        borderRadius: '12px', 
                                        border: 'none', 
                                        fontWeight: '700',
                                        cursor: isUpdatingSettings ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    {isUpdatingSettings ? 'Updating...' : 'Save Settings'}
                                </button>
                            </div>

                            <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '16px', border: '1px solid #eef2f6' }}>
                                <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                                    <strong>Note:</strong> Subscription prices are in INR. Updating this value will reflect immediately on the pricing page for all users.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes pulse {
                    from { opacity: 0.6; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1.05); }
                }
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
