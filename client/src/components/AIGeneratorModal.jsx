import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const AIGeneratorModal = ({ isOpen, onClose, onGenerated }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('topic');
    const [style, setStyle] = useState('Structured');
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [subscription, setSubscription] = useState(null);

    useEffect(() => {
        if (isOpen) {
            const fetchSubscription = async () => {
                try {
                    const response = await api.get('/subscription/status');
                    setSubscription(response.data);
                } catch (error) {
                    console.error('Fetch Subscription Error:', error);
                }
            };
            fetchSubscription();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleGenerate = async () => {
        if (activeTab === 'pdf' && !file) {
            alert('Please select a PDF file first.');
            return;
        }
        if (activeTab !== 'pdf' && !input.trim()) return;
        
        setLoading(true);
        try {
            let response;
            if (activeTab === 'pdf') {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('style', style);
                response = await api.post('/ai/generate-from-pdf', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                response = await api.post('/ai/generate', {
                    mode: activeTab,
                    input,
                    style
                });
            }
            onGenerated(response.data);
            onClose();
        } catch (error) {
            console.error('Generation Error:', error);
            if (error.response?.data?.code === 'LIMIT_REACHED') {
                if (window.confirm(`${error.response.data.error}\n\nWould you like to upgrade to Pro for unlimited access?`)) {
                    navigate('/pricing');
                    onClose();
                }
            } else {
                const errorMsg = error.response?.data?.error || error.message || 'Unknown error';
                alert(`Generation failed: ${errorMsg}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'topic', label: 'By Topic', icon: '📁' },
        { id: 'url', label: 'From URL', icon: '🌐' },
        { id: 'text', label: 'Paste Text', icon: '📋' },
        { id: 'pdf', label: 'PDF Upload', icon: '📄' }
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '0' }}>
                <div style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', color: '#4c4a8f' }}>✨ AI Note Generator</h2>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>✕</button>
                    </div>
                    <p style={{ color: '#888', marginBottom: '24px' }}>Generate notes from a topic, URL, or pasted text</p>

                    <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #eee', marginBottom: '32px' }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '12px 16px',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: activeTab === tab.id ? '2px solid #4c4a8f' : '2px solid transparent',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontWeight: activeTab === tab.id ? '600' : '400',
                                    color: activeTab === tab.id ? '#4c4a8f' : '#666'
                                }}
                            >
                                <span>{tab.icon}</span> {tab.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '32px', marginBottom: '32px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '8px' }}>NOTE STYLE</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {['Structured', 'Bullets', 'Summary', 'Mindmap'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setStyle(s)}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: '1px solid #ddd',
                                            background: style === s ? '#4c4a8f' : 'white',
                                            color: style === s ? 'white' : '#666',
                                            fontSize: '13px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '8px' }}>
                            {activeTab === 'topic' ? 'TOPIC OR CONCEPT' : activeTab === 'url' ? 'SOURCE URL' : activeTab === 'pdf' ? 'SELECT PDF' : 'PASTE RAW TEXT'}
                        </label>
                        {activeTab === 'text' ? (
                            <textarea
                                placeholder="Paste your source text here..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                style={{ width: '100%', height: '150px', padding: '16px', borderRadius: '8px', border: '1px solid #ddd', resize: 'none' }}
                            />
                        ) : activeTab === 'pdf' ? (
                            <div style={{ width: '100%', padding: '24px', borderRadius: '8px', border: '2px dashed #ddd', textAlign: 'center', background: '#fcfcfc' }}>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    id="pdf-upload"
                                />
                                <label htmlFor="pdf-upload" style={{ cursor: 'pointer' }}>
                                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📁</div>
                                    <div style={{ color: '#4c4a8f', fontWeight: '600' }}>{file ? file.name : 'Click to upload PDF'}</div>
                                    <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Max size 10MB</div>
                                </label>
                            </div>
                        ) : (
                            <input
                                type="text"
                                placeholder={activeTab === 'topic' ? "e.g. Newton's Laws of Motion, World War II causes..." : "Paste URL here..."}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                style={{ width: '100%', padding: '16px', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                        )}
                        <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
                            {activeTab === 'topic' ? 'AI will generate comprehensive, exam-ready notes on this topic' : activeTab === 'url' ? 'AI will read and summarize the content from the provided URL' : activeTab === 'pdf' ? 'AI will extract key concepts and facts from your uploaded PDF' : 'AI will extract key points and organize the pasted text'}
                        </p>
                    </div>

                    <button
                        className="btn-generate"
                        style={{ width: '100%', padding: '16px', borderRadius: '12px' }}
                        onClick={handleGenerate}
                        disabled={loading}
                    >
                        {loading ? '✨ Generating...' : '✨ Generate Notes'}
                    </button>

                    {subscription && subscription.plan === 'free' && (
                        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#666' }}>
                            Remaining: {Math.max(0, 10 - subscription.ai_usage_count)} AI Notes, {Math.max(0, 10 - subscription.mindmap_usage_count)} Mindmaps
                            <div style={{ marginTop: '8px' }}>
                                <button 
                                    onClick={() => { navigate('/pricing'); onClose(); }}
                                    style={{ background: 'none', border: 'none', color: '#4c4a8f', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    Upgrade to Pro for Unlimited
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIGeneratorModal;
