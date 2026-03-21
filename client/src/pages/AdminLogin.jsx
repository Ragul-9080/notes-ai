import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (data.success) {
                sessionStorage.setItem('adminToken', data.token);
                navigate('/admin');
            } else {
                setError(data.error || 'Invalid password');
            }
        } catch (err) {
            setError('Server connection failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            height: '100vh', 
            width: '100%', 
            flex: 1,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            fontFamily: 'var(--font-sans)'
        }}>
            <div style={{ 
                background: '#fff', 
                padding: '48px', 
                borderRadius: '32px', 
                boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                width: '100%',
                maxWidth: '400px',
                textAlign: 'center',
                border: '1px solid var(--card-border)'
            }}>
                <div style={{ fontSize: '48px', marginBottom: '24px' }}>🔐</div>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', marginBottom: '8px' }}>Admin Access</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Please enter your master password</p>

                <form onSubmit={handleSubmit}>
                    <input 
                        type="password"
                        placeholder="Master Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ 
                            width: '100%', 
                            padding: '16px', 
                            borderRadius: '12px', 
                            border: '1px solid #ddd', 
                            marginBottom: '20px',
                            fontSize: '16px',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            boxSizing: 'border-box'
                        }}
                        required
                    />
                    
                    {error && (
                        <div style={{ color: '#ef4444', fontSize: '14px', marginBottom: '20px', fontWeight: '500' }}>
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={loading}
                        style={{ 
                            width: '100%', 
                            padding: '16px', 
                            borderRadius: '12px', 
                            border: 'none', 
                            background: 'var(--accent-indigo)', 
                            color: 'white', 
                            fontSize: '16px', 
                            fontWeight: '600', 
                            cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: '0 10px 20px var(--accent-indigo-glow)',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                        onMouseOut={(e) => !loading && (e.currentTarget.style.transform = 'none')}
                    >
                        {loading ? 'Verifying...' : 'Unlock Dashboard'}
                    </button>
                </form>

                <button 
                    onClick={() => navigate('/')}
                    style={{ 
                        marginTop: '32px', 
                        background: 'none', 
                        border: 'none', 
                        color: 'var(--text-muted)', 
                        cursor: 'pointer',
                        fontSize: '14px',
                        textDecoration: 'underline'
                    }}
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
};

export default AdminLogin;
