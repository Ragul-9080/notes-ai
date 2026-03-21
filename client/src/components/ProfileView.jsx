import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/api';

const ProfileView = () => {
    const { user, logout } = useAuth();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchStatus = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const response = await api.get('/subscription/status');
                setSubscription(response.data);
            } catch (error) {
                console.error('Fetch Subscription Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, [user]);

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading profile...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
            <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '32px' }}>User Profile</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Account Details */}
                <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: 'var(--card-shadow)', border: '1px solid #eee' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', color: '#666', letterSpacing: '0.5px' }}>ACCOUNT DETAILS</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                        <div style={{ 
                            width: '80px', 
                            height: '80px', 
                            borderRadius: '24px', 
                            background: 'var(--accent-indigo)', 
                            color: 'white', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontSize: '32px', 
                            fontWeight: '700',
                            boxShadow: '0 10px 25px var(--accent-indigo-glow)'
                        }}>
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>{user?.user_metadata?.full_name || 'NoteShelf User'}</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>{user?.email}</p>
                            <span style={{ 
                                marginTop: '8px',
                                display: 'inline-block',
                                padding: '4px 12px', 
                                background: subscription?.plan === 'pro' ? 'var(--accent-indigo)' : '#f0f0f0', 
                                color: subscription?.plan === 'pro' ? 'white' : '#666', 
                                borderRadius: '20px', 
                                fontSize: '11px', 
                                fontWeight: '700' 
                            }}>
                                {subscription?.plan === 'pro' ? '🚀 PRO' : '🆓 FREE'}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' }}>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: '#999', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>FULL NAME</label>
                            <div style={{ padding: '12px', background: '#fcfcfc', border: '1px solid #eee', borderRadius: '10px', fontSize: '14px', color: 'var(--text-primary)' }}>
                                {user?.user_metadata?.full_name || 'Not Set'}
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: '#999', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>PHONE NUMBER</label>
                            <div style={{ padding: '12px', background: '#fcfcfc', border: '1px solid #eee', borderRadius: '10px', fontSize: '14px', color: 'var(--text-primary)' }}>
                                {user?.phone || user?.user_metadata?.phone || 'Not Linked'}
                            </div>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: '#999', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>EMAIL ADDRESS</label>
                            <div style={{ padding: '12px', background: '#fcfcfc', border: '1px solid #eee', borderRadius: '10px', fontSize: '14px', color: 'var(--text-primary)' }}>
                                {user?.email}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Login Info (requested as separate section) */}
                <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: 'var(--card-shadow)', border: '1px solid #eee' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', color: '#666', letterSpacing: '0.5px' }}>LOGIN DETAILS</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f5f5f5' }}>
                            <span style={{ fontSize: '14px', color: '#777' }}>Login Method</span>
                            <span style={{ fontSize: '14px', fontWeight: '600' }}>Email/Password</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f5f5f5' }}>
                            <span style={{ fontSize: '14px', color: '#777' }}>Last Sign In</span>
                            <span style={{ fontSize: '14px', fontWeight: '600' }}>{new Date(user?.last_sign_in_at).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Subscription Status */}
                <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: 'var(--card-shadow)', border: '1px solid #eee' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', color: '#666', letterSpacing: '0.5px' }}>SUBSCRIPTION</h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span style={{ 
                                padding: '6px 16px', 
                                background: subscription?.plan === 'pro' ? 'var(--accent-indigo)' : '#f0f0f0', 
                                color: subscription?.plan === 'pro' ? 'white' : '#666', 
                                borderRadius: '20px', 
                                fontSize: '13px', 
                                fontWeight: '700' 
                            }}>
                                {subscription?.plan === 'pro' ? '🚀 PRO PLAN' : '🆓 FREE PLAN'}
                            </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, fontSize: '14px', color: '#888' }}>Usage this month</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                {subscription?.ai_usage_count || 0}/10 AI Notes
                            </p>
                            <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#666' }}>
                                {subscription?.mindmap_usage_count || 0}/10 Mindmaps
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '16px' }}>
                    <button 
                        onClick={logout}
                        style={{ 
                            padding: '14px 28px', 
                            borderRadius: '12px', 
                            border: '1px solid #ff6b6b', 
                            background: 'white', 
                            color: '#ff6b6b', 
                            fontWeight: '600', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        🚪 Sign Out
                    </button>
                    {subscription?.plan !== 'pro' && (
                        <button 
                            disabled 
                            style={{ 
                                flex: 1, 
                                padding: '14px 28px', 
                                borderRadius: '12px', 
                                border: 'none', 
                                background: '#f0f0f0', 
                                color: '#aaa', 
                                fontWeight: '600',
                                cursor: 'default'
                            }}
                        >
                            Account Settings (Coming Soon)
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileView;
