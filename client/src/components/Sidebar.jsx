import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/api';

const Sidebar = ({ onGenerateAI, onNewNote, activeTab, onTabChange, className }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [subscription, setSubscription] = useState(null);

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const response = await api.get('/subscription/status');
                setSubscription(response.data);
            } catch (error) {
                console.error('Fetch Subscription Error:', error);
            }
        };
        fetchSubscription();
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className={`sidebar ${className || ''}`}>
            <div className="sidebar-header">
                <div className="logo">
                    <span style={{ filter: 'drop-shadow(0 0 8px rgba(255,107,107,0.3))' }}>📓</span> NoteShelf
                </div>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '8px', letterSpacing: '0.5px' }}>AI-Powered Second Brain</p>
            </div>

            <div style={{ flex: 1, padding: '24px 0' }}>

                <div className="nav-list">
                    <div 
                        className={`nav-item ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => onTabChange('all')}
                    >
                        <span className="nav-icon">📁</span>
                        <span className="nav-name">My Notes</span>
                    </div>
                    <div 
                        className={`nav-item ${activeTab === 'favorites' ? 'active' : ''}`}
                        onClick={() => onTabChange('favorites')}
                    >
                        <span className="nav-icon">⭐</span>
                        <span className="nav-name">Favorites</span>
                    </div>
                    <div 
                        className={`nav-item ${activeTab === 'mindmaps' ? 'active' : ''}`}
                        onClick={() => onTabChange('mindmaps')}
                    >
                        <span className="nav-icon">🧠</span>
                        <span className="nav-name">Mindmaps</span>
                    </div>
                    <div className="nav-item">
                        <span className="nav-icon">🏷️</span>
                        <span className="nav-name">Tags</span>
                    </div>
                    <div 
                        className={`nav-item ${activeTab === 'subscription' ? 'active' : ''}`}
                        onClick={() => onTabChange('subscription')}
                    >
                        <span className="nav-icon">🚀</span>
                        <span className="nav-name">Pro Plan</span>
                    </div>
                    <div 
                        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => onTabChange('profile')}
                    >
                        <span className="nav-icon">👤</span>
                        <span className="nav-name">Profile</span>
                    </div>
                </div>
            </div>

            <div className="sidebar-footer">
                <button className="btn-generate" onClick={onGenerateAI}>
                    <span>✨</span> Generate with AI
                </button>
                <button className="btn-new-note" onClick={onNewNote}>
                    + Create New Note
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
