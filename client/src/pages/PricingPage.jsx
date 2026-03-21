import React from 'react';
import { useNavigate } from 'react-router-dom';
import SubscriptionView from '../components/SubscriptionView';

const PricingPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{ 
            minHeight: '100vh', 
            width: '100%',
            flex: 1,
            background: 'var(--bg-primary)', 
            padding: '40px 20px',
            position: 'relative',
            overflowX: 'hidden',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            {/* Premium Background Effects */}
            <div style={{ 
                position: 'fixed', 
                top: '-100px', 
                left: '-100px', 
                width: '600px', 
                height: '600px', 
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(99, 102, 241, 0) 70%)',
                borderRadius: '50%',
                filter: 'blur(80px)',
                zIndex: 0,
                pointerEvents: 'none'
            }}></div>
            <div style={{ 
                position: 'fixed', 
                bottom: '-100px', 
                right: '-100px', 
                width: '700px', 
                height: '700px', 
                background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, rgba(168, 85, 247, 0) 70%)',
                borderRadius: '50%',
                filter: 'blur(100px)',
                zIndex: 0,
                pointerEvents: 'none'
            }}></div>

            <div style={{ 
                width: '100%',
                maxWidth: '1200px', 
                position: 'relative', 
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <SubscriptionView isEmbedded={false} />
                
                <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '60px' }}>
                    <button 
                        onClick={() => navigate('/')}
                        style={{ 
                            background: 'rgba(255,255,255,0.8)', 
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(0,0,0,0.05)', 
                            color: 'var(--text-muted)', 
                            padding: '14px 28px',
                            borderRadius: '16px',
                            cursor: 'pointer', 
                            fontSize: '15px',
                            fontWeight: '600',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                        }}
                        onMouseOver={(e) => { 
                            e.currentTarget.style.background = '#fff'; 
                            e.currentTarget.style.transform = 'translateY(-2px)'; 
                            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.06)';
                            e.currentTarget.style.borderColor = 'var(--accent-indigo)';
                            e.currentTarget.style.color = 'var(--accent-indigo)';
                        }}
                        onMouseOut={(e) => { 
                            e.currentTarget.style.background = 'rgba(255,255,255,0.8)'; 
                            e.currentTarget.style.transform = 'none'; 
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
                            e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)';
                            e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
