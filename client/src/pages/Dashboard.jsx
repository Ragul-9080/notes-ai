import React, { useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import TagFilter from '../components/TagFilter';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';
import AIGeneratorModal from '../components/AIGeneratorModal';
import SubscriptionView from '../components/SubscriptionView';
import ProfileView from '../components/ProfileView';
import { useNotes } from '../hooks/useNotes';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'favorites'
    const [activeTag, setActiveTag] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedNote, setSelectedNote] = useState(null);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const filters = useMemo(() => ({
        tag: activeTag === 'All' ? null : activeTag,
        search: searchQuery,
        is_pinned: activeTab === 'favorites' ? 'true' : null
    }), [activeTag, searchQuery, activeTab]);

    const { notes = [], loading, createNote, updateNote, deleteNote } = useNotes(filters);

    const handleCreateNew = () => {
        setSelectedNote({ title: '', content: '', tags: [] });
        setIsNoteModalOpen(true);
    };

    const handleNoteClick = (note) => {
        setSelectedNote(note);
        setIsNoteModalOpen(true);
    };

    const handleSaveNote = async (noteData) => {
        try {
            if (noteData.id) {
                await updateNote(noteData.id, noteData);
            } else {
                await createNote(noteData);
            }
        } catch (err) {
            console.error('Save Note Error:', err);
            alert('Failed to save note. Please try again.');
        }
    };

    const handleAIGenerated = (generatedNote) => {
        setSelectedNote(generatedNote);
        setIsNoteModalOpen(true);
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="layout-container" style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            {/* Mobile Nav Bar */}
            <div className="mobile-nav">
                <button className="menu-toggle" onClick={toggleSidebar}>☰</button>
                <div className="logo" style={{ color: 'var(--text-primary)', fontSize: '20px' }}>📓 NoteShelf</div>
                <button className="btn-generate" style={{ padding: '8px 12px', fontSize: '12px' }} onClick={() => setIsAIModalOpen(true)}>✨ AI</button>
            </div>

            {/* Mobile Overlay */}
            <div 
                className={`mobile-overlay ${isSidebarOpen ? 'visible' : ''}`} 
                onClick={() => setIsSidebarOpen(false)}
            />

            <Sidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onGenerateAI={() => { setIsAIModalOpen(true); setIsSidebarOpen(false); }}
                onNewNote={() => { handleCreateNew(); setIsSidebarOpen(false); }}
                className={isSidebarOpen ? 'mobile-open' : ''}
            />

            <main className="main-content">
                <header className="content-header">
                    <div className="title-group">
                        <h1>
                            {activeTab === 'favorites' ? 'Favorites' : 
                             activeTab === 'mindmaps' ? 'My Mindmaps' : 
                             activeTab === 'profile' ? 'My Profile' : 
                             activeTab === 'subscription' ? 'Plan & Billing' : 
                             'My Notes'}
                        </h1>
                        <p className="title-meta">
                            {activeTab === 'profile' || activeTab === 'subscription' ? 
                                `Manage your ${activeTab === 'profile' ? 'identity' : 'subscription'}` : 
                                `${Array.isArray(notes) ? notes.length : 0} notes • ${Array.isArray(notes) ? notes.filter(n => n.tags?.includes('AI')).length : 0} AI-generated`}
                        </p>
                    </div>
                    {activeTab !== 'profile' && activeTab !== 'subscription' && (
                        <SearchBar value={searchQuery} onChange={setSearchQuery} />
                    )}
                </header>

                {activeTab !== 'profile' && activeTab !== 'subscription' && (
                    <TagFilter activeTag={activeTag} onSelectTag={setActiveTag} />
                )}

                {activeTab === 'subscription' ? (
                    <div style={{ marginTop: '24px' }}>
                        <SubscriptionView isEmbedded={true} />
                    </div>
                ) : activeTab === 'profile' ? (
                    <div style={{ marginTop: '24px' }}>
                        <ProfileView />
                    </div>
                ) : loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading notes...</div>
                ) : Array.isArray(notes) && notes.length > 0 && (
                    activeTab === 'mindmaps' 
                        ? notes.filter(n => n.content?.includes('```reactflow')).length > 0 
                        : true
                ) ? (
                    <div className="notes-grid">
                        {(activeTab === 'mindmaps' ? notes.filter(n => n.content?.includes('```reactflow')) : notes).map(note => (
                            <NoteCard key={note.id} note={note} onClick={handleNoteClick} />
                        ))}
                    </div>
                ) : (
                    <div style={{ 
                        flex: 1, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        marginTop: '40px',
                        textAlign: 'center'
                    }}>
                        <div style={{ 
                            width: '120px', 
                            height: '120px', 
                            background: '#fff', 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontSize: '64px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                            marginBottom: '32px'
                        }}>
                            {activeTab === 'favorites' ? '⭐' : activeTab === 'mindmaps' ? '🧠' : '✍️'}
                        </div>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', marginBottom: '16px', color: 'var(--text-primary)' }}>
                            {activeTab === 'favorites' ? 'No favorites yet' : activeTab === 'mindmaps' ? 'No mindmaps generated' : 'Your second brain is empty'}
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '400px', lineHeight: '1.6', marginBottom: '24px' }}>
                            {activeTab === 'favorites' 
                                ? 'Pin important notes to see them here.' 
                                : activeTab === 'mindmaps'
                                    ? 'Click the "🪄 Create Mindmap" button on any note to generate a visual diagram.'
                                    : 'Capture ideas, organize thoughts, and let AI help you learn faster.'}
                        </p>
                        {activeTab !== 'favorites' && activeTab !== 'mindmaps' && (
                            <button 
                                onClick={handleCreateNew} 
                                style={{ 
                                    background: 'var(--accent-indigo)', 
                                    color: 'white', 
                                    border: 'none', 
                                    padding: '14px 28px', 
                                    borderRadius: '12px', 
                                    fontWeight: '600', 
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 10px 20px var(--accent-indigo-glow)'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
                            >
                                + Start Writing
                            </button>
                        )}
                    </div>
                )}
            </main>

            <NoteModal
                isOpen={isNoteModalOpen}
                note={selectedNote}
                onClose={() => setIsNoteModalOpen(false)}
                onSave={handleSaveNote}
                onDelete={deleteNote}
            />
            
            <AIGeneratorModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                onGenerated={handleAIGenerated}
            />
        </div>
    );
};

export default Dashboard;
