import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'YOUR_SUPABASE_URL') {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100%', flex: 1, background: 'var(--bg-primary)' }}>
                <div style={{ background: 'white', padding: isMobile ? '24px' : '40px', borderRadius: '16px', textAlign: 'center', boxShadow: 'var(--card-shadow)' }}>
                    <h2>⚠️ Configuration Required</h2>
                    <p>Please set your Supabase credentials in <code>.env</code> to enable login.</p>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        console.log('Attempting login for:', email);
        const { error } = await login(email, password);
        if (error) {
            console.error('Login error:', error);
            setError(error.message);
        } else {
            console.log('Login successful');
            navigate('/dashboard');
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: isMobile ? '20px' : '40px 20px', width: '100%', flex: 1, background: 'var(--bg-primary)' }}>
            <div style={{ background: 'white', padding: isMobile ? '24px' : '48px', borderRadius: '16px', boxShadow: 'var(--card-shadow)', width: '100%', maxWidth: '400px' }}>
                <div className="logo" style={{ justifyContent: 'center', marginBottom: '32px' }}>📓 NoteShelf</div>
                <h2 style={{ fontFamily: 'var(--font-heading)', textAlign: 'center', marginBottom: '8px' }}>Welcome Back</h2>
                <p style={{ textAlign: 'center', color: '#888', marginBottom: '32px' }}>Sign in to access your notes</p>

                {error && <div style={{ color: '#ff6b6b', background: '#fff5f5', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '8px' }}>EMAIL ADDRESS</label>
                        <input
                            type="email"
                            className="search-input"
                            style={{ width: '100%' }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '8px' }}>PASSWORD</label>
                        <input
                            type="password"
                            className="search-input"
                            style={{ width: '100%' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-generate" style={{ marginTop: '12px' }}>Sign In</button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#666' }}>
                    Don't have an account? <Link to="/signup" style={{ color: '#4c4a8f', fontWeight: '600' }}>Create one</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
