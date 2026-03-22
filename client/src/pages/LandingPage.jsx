import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const features = [
        { icon: '🗂️', title: 'AI Organizer', desc: 'Seamlessly organize and categorize your digital life with intelligent grouping.' },
        { icon: '📤', title: 'Smart Uploads', desc: 'Upload PDFs or notes and let AI extract the core essence instantly.' },
        { icon: '✨', title: 'AI Generation', desc: 'Generate comprehensive notes from topics, URLs, or scratch using LLM power.' },
        { icon: '📝', title: 'Auto-Summarization', desc: 'Convert long documents into concise, readable summaries in seconds.' },
        { icon: '🧠', title: 'Visual Mind Maps', desc: 'Transform complex notes into interactive visual maps for better learning.' },
        { icon: '🔊', title: 'Voice Notes', desc: 'Listen to your notes on the go with high-quality AI voice synthesis.' }
    ];

    return (
        <div className="landing-container" style={{ 
            minHeight: '100vh', 
            width: '100%',
            background: 'var(--bg-primary)', 
            color: 'var(--text-primary)', 
            fontFamily: 'var(--font-sans)',
            overflowX: 'hidden',
            overflowY: 'auto'
        }}>
            {/* Navigation Bar */}
            <nav style={{ 
                padding: isMobile ? '16px 20px' : '24px 40px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                maxWidth: '1200px',
                margin: '0 auto',
                flexWrap: 'nowrap'
            }}>
                <div style={{ 
                    fontFamily: 'var(--font-heading)', 
                    fontSize: '28px', 
                    fontWeight: '700', 
                    color: '#ff6b6b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <span style={{ fontSize: '32px' }}>📓</span> NoteShelf
                </div>
                <div style={{ 
                    display: 'flex', 
                    gap: isMobile ? '12px' : '32px', 
                    alignItems: 'center' 
                }}>
                    {!isMobile && (
                        <button 
                            onClick={() => navigate('/pricing')}
                            style={{ border: 'none', background: 'none', fontWeight: '500', color: 'var(--text-secondary)', cursor: 'pointer' }}
                        >
                            Pricing
                        </button>
                    )}
                    <button 
                        onClick={() => navigate('/login')}
                        style={{ border: 'none', background: 'none', fontWeight: '500', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: isMobile ? '14px' : '16px' }}
                    >
                        Sign In
                    </button>
                    <button 
                        onClick={() => navigate('/signup')}
                        style={{ 
                            padding: isMobile ? '10px 16px' : '12px 24px', 
                            background: 'var(--accent-indigo)', 
                            color: '#fff', 
                            borderRadius: '8px', 
                            border: 'none', 
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: isMobile ? '14px' : '16px'
                        }}
                    >
                        Start Free
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <header style={{ 
                padding: isMobile ? '60px 20px 40px' : '120px 24px 100px 24px', 
                textAlign: 'center',
                position: 'relative'
            }}>
                {/* Decorative Background Blob */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: isMobile ? '300px' : '600px',
                    height: isMobile ? '300px' : '600px',
                    background: 'radial-gradient(circle, rgba(76, 74, 143, 0.05) 0%, transparent 70%)',
                    zIndex: 0
                }}></div>

                <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        background: '#fff',
                        borderRadius: '100px',
                        border: '1px solid var(--card-border)',
                        color: 'var(--accent-indigo)',
                        fontSize: isMobile ? '12px' : '14px',
                        fontWeight: '600',
                        marginBottom: isMobile ? '24px' : '32px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                    }}>
                        <span style={{ fontSize: isMobile ? '14px' : '18px' }}>✨</span> Powered by Llama 3.3
                    </div>

                    <h1 style={{ 
                        fontFamily: 'var(--font-heading)', 
                        fontSize: 'clamp(36px, 10vw, 72px)', 
                        fontWeight: '700', 
                        marginBottom: '20px', 
                        color: 'var(--text-primary)',
                        lineHeight: '1.1',
                        letterSpacing: '-1px'
                    }}>
                        Capture Thoughts. <br/>
                        <span style={{ color: 'var(--accent-indigo)', fontStyle: 'italic' }}>Organize Your World.</span>
                    </h1>
                    
                    <p style={{ 
                        fontFamily: 'var(--font-serif)', 
                        fontSize: 'clamp(16px, 5vw, 24px)', 
                        color: 'var(--text-secondary)', 
                        marginBottom: isMobile ? '32px' : '48px', 
                        lineHeight: '1.6',
                        maxWidth: '720px',
                        margin: '0 auto'
                    }}>
                        NoteShelf is your digital second brain. Seamlessly extract insights, 
                        generate mind maps, and transform notes into professional audio.
                    </p>

                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: isMobile ? '32px' : '48px' }}>
                        <button 
                            onClick={() => navigate('/signup')}
                            style={{ 
                                padding: isMobile ? '16px 32px' : '20px 48px', 
                                fontSize: isMobile ? '16px' : '18px', 
                                fontWeight: '600', 
                                borderRadius: '50px', 
                                background: 'var(--accent-indigo)', 
                                color: '#fff', 
                                border: 'none', 
                                cursor: 'pointer', 
                                boxShadow: '0 15px 30px -10px rgba(76, 74, 143, 0.4)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
                            }}
                        >
                            Get Started Free
                        </button>
                    </div>
                </div>

                {/* Mock Card Preview */}
                <div style={{ 
                    marginTop: isMobile ? '40px' : '80px',
                    maxWidth: '800px',
                    margin: isMobile ? '40px auto 0 auto' : '80px auto 0 auto',
                    background: '#fff',
                    borderRadius: '24px',
                    padding: isMobile ? '24px' : '40px',
                    boxShadow: '0 20px 50px -12px rgba(0,0,0,0.1)',
                    border: '1px solid var(--card-border)',
                    textAlign: 'left'
                }}>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }}></div>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }}></div>
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '20px' : '28px', marginBottom: '16px' }}>The Art of AI Prompting</h3>
                    <div style={{ height: '4px', width: '60px', background: 'var(--accent-indigo)', borderRadius: '2px', marginBottom: '24px' }}></div>
                    <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: isMobile ? '14px' : '16px' }}>
                        AI prompting is the process of structuring text that can be interpreted and understood by a generative AI model...
                    </p>
                    <div style={{ marginTop: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {['AI', 'Education', 'Future'].map(tag => (
                            <span key={tag} style={{ padding: '6px 16px', borderRadius: '20px', background: '#f5f0e8', fontSize: '12px', border: '1px solid #e5e0d8' }}>#{tag}</span>
                        ))}
                    </div>
                </div>
            </header>

            {/* Features Grid */}
            <section style={{ padding: isMobile ? '60px 20px' : '100px 24px', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: isMobile ? '40px' : '80px' }}>
                    <h2 style={{ 
                        fontFamily: 'var(--font-heading)', 
                        fontSize: isMobile ? '32px' : '48px', 
                        fontWeight: '700', 
                        color: 'var(--text-primary)',
                        marginBottom: '16px'
                    }}>
                        Empower Your Learning
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? '16px' : '18px' }}>Everything you need to master your knowledge stream.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: isMobile ? '24px' : '40px' }}>
                    {features.map((feature, i) => (
                        <div key={i} style={{ 
                            background: 'var(--card-bg)', 
                            padding: isMobile ? '32px' : '48px', 
                            borderRadius: '24px', 
                            boxShadow: 'var(--card-shadow)', 
                            border: '1px solid var(--card-border)', 
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer'
                        }}
                             onMouseOver={(e) => {
                                 e.currentTarget.style.transform = 'translateY(-12px)';
                                 e.currentTarget.style.borderColor = 'var(--accent-indigo)';
                                 e.currentTarget.style.background = '#fff';
                                 e.currentTarget.style.boxShadow = '0 30px 60px -12px rgba(0,0,0,0.15)';
                             }}
                             onMouseOut={(e) => {
                                 e.currentTarget.style.transform = 'translateY(0)';
                                 e.currentTarget.style.borderColor = 'var(--card-border)';
                                 e.currentTarget.style.background = 'var(--card-bg)';
                                 e.currentTarget.style.boxShadow = 'var(--card-shadow)';
                             }}
                        >
                            <div style={{ 
                                width: '64px', 
                                height: '64px', 
                                borderRadius: '16px', 
                                background: '#f5f0e8', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontSize: '32px', 
                                marginBottom: '24px' 
                            }}>
                                {feature.icon}
                            </div>
                            <h3 style={{ 
                                fontFamily: 'var(--font-heading)', 
                                fontSize: '24px', 
                                fontWeight: '700', 
                                marginBottom: '16px', 
                                color: 'var(--text-primary)' 
                            }}>
                                {feature.title}
                            </h3>
                            <p style={{ 
                                fontFamily: 'var(--font-serif)', 
                                color: 'var(--text-secondary)', 
                                lineHeight: '1.8',
                                fontSize: '16px'
                            }}>
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pricing Section (Preview) */}
            <section style={{ padding: isMobile ? '60px 20px' : '100px 24px', background: '#fff' }}>
                <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '32px' : '42px', marginBottom: '16px' }}>Simple Pricing</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? '16px' : '18px', marginBottom: isMobile ? '32px' : '48px' }}>Start for free and scale as you grow.</p>
                </div>
                <div style={{ display: 'flex', gap: isMobile ? '24px' : '32px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ background: '#fcfcfc', padding: '32px', borderRadius: '24px', border: '1px solid #eee', width: '100%', maxWidth: isMobile ? '100%' : '300px' }}>
                        <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Free Plan</h3>
                        <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>₹0 <span style={{ fontSize: '14px', color: '#888' }}>/ mo</span></div>
                        <ul style={{ listStyle: 'none', padding: '0', fontSize: '14px', color: '#666', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                            <li>✅ 10 AI Notes</li>
                            <li>✅ 10 Mindmaps</li>
                            <li>✅ Basic Search</li>
                        </ul>
                        <button onClick={() => navigate('/signup')} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', color: '#4c4a8f', fontWeight: '600', cursor: 'pointer' }}>Get Started</button>
                    </div>
                    <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', border: '2px solid #4c4a8f', width: '100%', maxWidth: isMobile ? '100%' : '300px', transform: isMobile ? 'none' : 'scale(1.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Pro Plan</h3>
                        <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>₹499 <span style={{ fontSize: '14px', color: '#888' }}>/ mo</span></div>
                        <ul style={{ listStyle: 'none', padding: '0', fontSize: '14px', color: '#666', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                            <li>✨ Unlimited AI Notes</li>
                            <li>✨ Unlimited Mindmaps</li>
                            <li>✨ Priority Support</li>
                            <li>✨ Ad-Free</li>
                        </ul>
                        <button onClick={() => alert('Please contact the administrator to activate Pro access.')} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: '#4c4a8f', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Contact Admin to Go Pro</button>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ padding: isMobile ? '60px 20px' : '100px 24px', textAlign: 'center', background: '#fff', borderTop: '1px solid var(--card-border)' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '32px' : '42px', marginBottom: '24px' }}>Ready to organize?</h2>
                <p style={{ fontSize: isMobile ? '16px' : '18px', color: 'var(--text-secondary)', marginBottom: '40px' }}>Join thousands of thinkers using NoteShelf.</p>
                <button 
                    onClick={() => navigate('/signup')}
                    style={{ 
                        padding: isMobile ? '16px 32px' : '18px 48px', 
                        fontSize: isMobile ? '16px' : '18px', 
                        fontWeight: '600', 
                        borderRadius: '50px', 
                        background: 'var(--accent-indigo)', 
                        color: '#fff', 
                        border: 'none', 
                        cursor: 'pointer'
                    }}
                >
                    Get Started Free
                </button>
            </section>

            {/* Footer */}
            <footer style={{ padding: '60px 24px', textAlign: 'center', background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: '700', color: '#ff6b6b', marginBottom: '24px' }}>
                    📓 NoteShelf
                </div>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '14px' }}>
                    © 2026 NoteShelf AI • Capture. Organize. Master.
                </p>
            </footer>
        </div>
    );
};

export default LandingPage;
