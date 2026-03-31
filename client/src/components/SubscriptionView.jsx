import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/api';

const SubscriptionView = ({ isEmbedded = false }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [subscription, setSubscription] = useState(null);
    const [price, setPrice] = useState(499);
    const [loading, setLoading] = useState(true);
    const [upgrading, setUpgrading] = useState(false);

    useEffect(() => {
        const fetchStatusAndPrice = async () => {
            try {
                // Fetch price
                const priceRes = await api.get('/subscription/price');
                setPrice(priceRes.data.price);

                if (user) {
                    const subRes = await api.get('/subscription/status');
                    setSubscription(subRes.data);
                }
            } catch (error) {
                console.error('Fetch Initial Data Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStatusAndPrice();
    }, [user]);

    const handleUpgrade = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setUpgrading(true);
        try {
            // 1. Create Order
            console.log("Initiating order creation...");
            const { data: order } = await api.post('/subscription/create-order');
            console.log("Order created successfully:", order);
            alert("Order created successfully! Now opening payment window...");

            // 2. Initialise Razorpay Modal
            if (!window.Razorpay) {
                console.error("Razorpay SDK not found. Is it loaded in index.html?");
                alert("Razorpay SDK failed to load. Please refresh the page.");
                return;
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "NoteShelf Pro",
                description: "Upgrade to Professional Plan",
                order_id: order.id,
                handler: async (response) => {
                    console.log("Razorpay Response received:", response);
                    try {
                        console.log("Sending verification request to backend...");
                        const verifyRes = await api.post('/subscription/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        console.log("Verification response received:", verifyRes.data);

                        if (verifyRes.data.success) {
                            console.log("Upgrade successful! Redirecting...");
                            setSubscription(verifyRes.data.profile);
                            alert("Welcome to Pro! Your account has been upgraded.");
                            navigate('/dashboard');
                        } else {
                            console.warn("Verification returned success:false", verifyRes.data);
                        }
                    } catch (err) {
                        console.error("Verification failed", err);
                        alert("Payment verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: user.user_metadata?.full_name || "",
                    email: user.email || "",
                },
                theme: {
                    color: "#6366f1",
                },
                modal: {
                    ondismiss: function() {
                        setUpgrading(false);
                    },
                    escape: false,
                    backdropclose: false
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response){
                alert("Payment failed: " + response.error.description);
            });
            rzp.open();
        } catch (error) {
            console.error("Upgrade error", error);
            alert("Failed to initiate upgrade. Please try again.");
        } finally {
            setUpgrading(false);
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading status...</div>;

    const currentPlan = subscription?.plan || 'free';

    return (
        <div style={{ 
            padding: isEmbedded ? '0' : '60px 20px',
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1
        }}>
            {!isEmbedded && (
                <div style={{ marginBottom: '60px', textAlign: 'center', width: '100%' }}>
                    <h1 style={{ 
                        fontSize: 'clamp(32px, 8vw, 56px)', 
                        fontWeight: '800', 
                        fontFamily: 'var(--font-heading)', 
                        color: 'var(--text-primary)', 
                        marginBottom: '16px',
                        letterSpacing: '-1.5px',
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, var(--text-primary) 0%, #6366f1 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        margin: '0 auto'
                    }}>
                        Elevate your intelligence
                    </h1>
                    <p style={{ 
                        color: 'var(--text-muted)', 
                        fontSize: 'max(14px, 1.2vw)', 
                        maxWidth: '600px', 
                        margin: '0 auto', 
                        lineHeight: '1.6',
                        textAlign: 'center'
                    }}>
                        Join thousands of thinkers using NoteShelf Pro to build their second brain with unlimited AI power.
                    </p>
                </div>
            )}

            <div style={{ 
                display: 'flex', 
                gap: '24px', 
                justifyContent: 'center', 
                alignItems: 'stretch',
                flexWrap: 'wrap',
                width: '100%'
            }}>
                {/* Free Plan */}
                <div style={{ 
                    background: 'rgba(255, 255, 255, 0.7)', 
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    padding: '40px 32px', 
                    borderRadius: '28px', 
                    flex: '1 1 320px',
                    maxWidth: '360px', 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    position: 'relative',
                    textAlign: 'left',
                    transition: 'all 0.4s ease'
                }}
                className="pricing-card"
                onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 30px 60px rgba(0,0,0,0.08)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.03)';
                }}
                >
                    <div style={{ marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '12px', fontWeight: '800', color: '#999', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>Personal</h2>
                        <div style={{ fontSize: '40px', fontWeight: '800', color: 'var(--text-primary)' }}>₹0</div>
                        <p style={{ color: '#aaa', fontSize: '13px', marginTop: '2px' }}>Free forever.</p>
                    </div>

                    <div style={{ height: '1px', background: 'rgba(0,0,0,0.05)', marginBottom: '24px' }}></div>

                    <ul style={{ listStyle: 'none', padding: '0', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#555' }}>
                            <span style={{ fontSize: '16px' }}>🤖</span> 
                            <span>AI Notes: <strong>{subscription?.ai_usage_count || 0}/10</strong></span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#555' }}>
                            <span style={{ fontSize: '16px' }}>🧠</span> 
                            <span>AI Mindmaps: <strong>{subscription?.mindmap_usage_count || 0}/10</strong></span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#555' }}>
                            <span style={{ fontSize: '16px' }}>🔍</span> 
                            <span>Semantic Search</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#bbb', textDecoration: 'line-through' }}>
                            <span style={{ fontSize: '16px' }}>🚀</span> 
                            <span>Priority Queue</span>
                        </li>
                    </ul>

                    <button 
                        disabled 
                        style={{ 
                            width: '100%', 
                            padding: '16px', 
                            borderRadius: '14px', 
                            border: '1px solid #eee', 
                            background: '#fcfcfc', 
                            color: '#999', 
                            cursor: 'default',
                            fontWeight: '700',
                            fontSize: '14px'
                        }}
                    >
                        {currentPlan === 'free' ? 'Your Current Plan' : 'Standard Access'}
                    </button>
                </div>

                {/* Pro Plan */}
                <div style={{ 
                    background: 'rgba(255, 255, 255, 0.8)', 
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    padding: '40px 32px', 
                    borderRadius: '28px', 
                    flex: '1 1 340px',
                    maxWidth: '380px', 
                    boxShadow: '0 40px 80px rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 1)',
                    position: 'relative',
                    textAlign: 'left',
                    transition: 'all 0.4s ease',
                    zIndex: 2,
                    transform: isEmbedded ? 'none' : 'scale(1.02)'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.transform = isEmbedded ? 'translateY(-8px)' : 'scale(1.05) translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 50px 100px rgba(99, 102, 241, 0.25)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.transform = isEmbedded ? 'none' : 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 40px 80px rgba(99, 102, 241, 0.15)';
                }}
                >
                    <div style={{ 
                        position: 'absolute', 
                        top: '-14px', 
                        left: '50%', 
                        transform: 'translateX(-50%)', 
                        background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)', 
                        color: 'white', 
                        padding: '5px 16px', 
                        borderRadius: '30px', 
                        fontSize: '11px', 
                        fontWeight: '800', 
                        letterSpacing: '1px',
                        boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
                    }}>
                        MOST POPULAR
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-indigo)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>Professional</h2>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <div style={{ fontSize: '40px', fontWeight: '800', color: 'var(--text-primary)' }}>₹{price}</div>
                            <div style={{ fontSize: '14px', color: '#888' }}>/mo</div>
                        </div>
                        <p style={{ color: '#777', fontSize: '13px', marginTop: '2px' }}>Full power plan. Cancel anytime.</p>
                    </div>

                    <div style={{ height: '1px', background: 'rgba(0,0,0,0.05)', marginBottom: '24px' }}></div>

                    <ul style={{ listStyle: 'none', padding: '0', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#444' }}>
                            <span style={{ fontSize: '16px' }}>⚡</span> 
                            <span><strong>Unlimited</strong> AI Notes</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#444' }}>
                            <span style={{ fontSize: '16px' }}>🗺️</span> 
                            <span><strong>Unlimited</strong> AI Mindmaps</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#444' }}>
                            <span style={{ fontSize: '16px' }}>🎖️</span> 
                            <span>Priority AI Queue</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#444' }}>
                            <span style={{ fontSize: '16px' }}>🛠️</span> 
                            <span>Agent Customization</span>
                        </li>
                    </ul>

                    <button 
                        onClick={handleUpgrade}
                        disabled={currentPlan === 'pro' || upgrading}
                        style={{ 
                            width: '100%', 
                            padding: '16px', 
                            borderRadius: '14px', 
                            background: currentPlan === 'pro' ? '#f0f0f0' : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
                            color: currentPlan === 'pro' ? '#999' : 'white', 
                            border: 'none', 
                            fontWeight: '800', 
                            fontSize: '15px',
                            cursor: currentPlan === 'pro' ? 'default' : 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: currentPlan === 'pro' ? 'none' : '0 12px 24px rgba(99, 102, 241, 0.4)'
                        }}
                    >
                        {upgrading ? 'Processing...' : (currentPlan === 'pro' ? 'Current Active Plan' : `Upgrade to Pro`)}
                    </button>
                </div>
            </div>

            {isEmbedded && subscription?.plan === 'free' && (
                <div style={{ 
                    marginTop: '64px', 
                    padding: '32px', 
                    background: 'rgba(99, 102, 241, 0.03)', 
                    borderRadius: '24px', 
                    border: '1px solid rgba(99, 102, 241, 0.1)',
                    maxWidth: '800px',
                    margin: '64px auto 0 auto'
                }}>
                    <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: '700', fontSize: '18px' }}>Why Pro?</p>
                    <p style={{ margin: '12px 0 0 0', fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        Unlock the full potential of your second brain. Our Pro users generate 5x more ideas and build deeper connections between their thoughts using our advanced AI engine.
                    </p>
                </div>
            )}
        </div>
    );
};

export default SubscriptionView;
