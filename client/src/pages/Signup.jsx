import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'YOUR_SUPABASE_URL') {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100%', flex: 1, background: 'var(--bg-primary)' }}>
                <div style={{ background: 'white', padding: '40px', borderRadius: '16px', textAlign: 'center', boxShadow: 'var(--card-shadow)' }}>
                    <h2>⚠️ Configuration Required</h2>
                    <p>Please set your Supabase credentials in <code>.env</code> to enable signup.</p>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        const { error } = await signup(email, password, { 
            full_name: fullName,
            phone: phone
        });

        if (error) {
            setError(error.message);
        } else {
            setIsSuccess(true);
        }
    };

    if (isSuccess) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '40px 20px', width: '100%', flex: 1, background: 'var(--bg-primary)' }}>
                <div style={{ background: 'white', padding: '48px', borderRadius: '24px', boxShadow: 'var(--card-shadow)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                    <div style={{ fontSize: '64px', marginBottom: '24px' }}>✉️</div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', marginBottom: '16px', color: 'var(--text-primary)' }}>Check your email</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' }}>
                        We've sent a verification link to <strong>{email}</strong>. Please click the link to activate your account.
                    </p>
                    <button 
                        onClick={() => navigate('/login')}
                        className="btn-generate"
                        style={{ width: '100%' }}
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '40px 20px', width: '100%', flex: 1, background: 'var(--bg-primary)' }}>
            <div style={{ background: 'white', padding: '48px', borderRadius: '16px', boxShadow: 'var(--card-shadow)', width: '100%', maxWidth: '400px' }}>
                <div className="logo" style={{ justifyContent: 'center', marginBottom: '32px' }}>📓 NoteShelf</div>
                <h2 style={{ fontFamily: 'var(--font-heading)', textAlign: 'center', marginBottom: '8px' }}>Get Started</h2>
                <p style={{ textAlign: 'center', color: '#888', marginBottom: '24px' }}>Create an account to start organizing</p>

                {error && <div style={{ color: '#ff6b6b', background: '#fff5f5', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#666', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>FULL NAME</label>
                        <input
                            type="text"
                            className="search-input"
                            style={{ width: '100%' }}
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#666', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>EMAIL ADDRESS</label>
                        <input
                            type="email"
                            className="search-input"
                            style={{ width: '100%' }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@mail.com"
                            required
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#666', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>PHONE NUMBER</label>
                        <input
                            type="tel"
                            className="search-input"
                            style={{ width: '100%' }}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 234 567 890"
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#666', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>PASSWORD</label>
                        <input
                            type="password"
                            className="search-input"
                            style={{ width: '100%' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button type="submit" className="btn-generate" style={{ marginTop: '12px' }}>Create Account</button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#666' }}>
                    Already have an account? <Link to="/login" style={{ color: '#4c4a8f', fontWeight: '600' }}>Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
