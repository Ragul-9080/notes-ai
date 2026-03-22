import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import api from '../lib/api';
import ReactFlowDiagram from './ReactFlowDiagram';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

const NoteModal = ({ note, isOpen, onClose, onSave, onDelete }) => {
    const navigate = useNavigate();
    const [editedNote, setEditedNote] = useState(note || { title: '', content: '', tags: [] });
    const [view, setView] = useState('edit');
    const [isGenerating, setIsGenerating] = useState(false);
    const [diagramJson, setDiagramJson] = useState(null);
    const diagramRef = useRef(null);

    // Voice notes state (Web Speech API)
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [voiceLanguage, setVoiceLanguage] = useState('en-US');

    const LANGUAGES = [
        { code: 'en-US', label: '🇺🇸 English' },
        { code: 'ta-IN', label: '🇮🇳 Tamil' },
        { code: 'hi-IN', label: '🇮🇳 Hindi' },
        { code: 'es-ES', label: '🇪🇸 Spanish' },
        { code: 'fr-FR', label: '🇫🇷 French' },
        { code: 'de-DE', label: '🇩🇪 German' },
        { code: 'ja-JP', label: '🇯🇵 Japanese' },
        { code: 'ko-KR', label: '🇰🇷 Korean' },
        { code: 'zh-CN', label: '🇨🇳 Chinese' },
        { code: 'ar-SA', label: '🇸🇦 Arabic' },
        { code: 'pt-BR', label: '🇧🇷 Portuguese' },
        { code: 'it-IT', label: '🇮🇹 Italian' },
        { code: 'ru-RU', label: '🇷🇺 Russian' },
        { code: 'nl-NL', label: '🇳🇱 Dutch' },
        { code: 'pl-PL', label: '🇵🇱 Polish' },
    ];

    useEffect(() => {
        if (note) {
            setEditedNote(note);
            // Saved notes open in preview, new notes open in edit
            setView(note.id ? 'preview' : 'edit');
            const content = note.content || '';
            const match = /```reactflow\r?\n([\s\S]*?)\r?\n```/.exec(content);
            setDiagramJson(match ? match[1] : null);
        }
        // Stop speech on note change
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
                setIsPaused(false);
            }
        };
    }, [note]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedNote(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onSave(editedNote);
        onClose();
    };

    const handleRemoveTag = (tagToRemove) => {
        setEditedNote(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tagToRemove)
        }));
    };

    const handleAddTag = () => {
        const newTag = prompt('Enter new tag:');
        if (newTag && !editedNote.tags.includes(newTag)) {
            setEditedNote(prev => ({
                ...prev,
                tags: [...prev.tags, newTag]
            }));
        }
    };

    const handleGenerateMindmap = async () => {
        if (!editedNote.content.trim()) return;
        setIsGenerating(true);
        try {
            const response = await api.post('/ai/generate', {
                mode: 'text',
                input: editedNote.content,
                style: 'Mindmap'
            });
            const mindmapContent = response.data.content;
            setEditedNote(prev => ({
                ...prev,
                content: prev.content + '\n\n' + mindmapContent
            }));
            const match = /```reactflow\r?\n([\s\S]*?)\r?\n```/.exec(mindmapContent);
            if (match) {
                setDiagramJson(match[1]);
                setView('mindmap');
            } else {
                alert('Mindmap was generated but diagram data could not be parsed.');
            }
        } catch (error) {
            console.error('Mindmap Generation Error:', error);
            if (error.response?.data?.code === 'LIMIT_REACHED') {
                alert(`${error.response.data.error}\n\nPlease contact the administrator to activate Pro access.`);
            }
 else {
                alert('Failed to generate mindmap from note.');
            }
        } finally {
            setIsGenerating(false);
        }
    };

    // --- Voice Note Handlers (Web Speech API) ---
    const handleSpeak = async () => {
        if (!window.speechSynthesis) {
            alert('Your browser does not support text-to-speech.');
            return;
        }

        // If paused, resume
        if (isPaused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
            return;
        }

        // Stop any current speech
        window.speechSynthesis.cancel();

        let content = editedNote.content || '';

        // Translation logic: If not English, translate the note first
        if (voiceLanguage !== 'en-US') {
            const targetLangLabel = LANGUAGES.find(l => l.code === voiceLanguage)?.label.split(' ')[1] || 'target language';
            setIsTranslating(true);
            try {
                const response = await api.post('/ai/translate', {
                    text: content,
                    targetLanguage: targetLangLabel
                });
                const translatedText = response.data.translatedText;
                if (translatedText) {
                    content = translatedText;
                    setEditedNote(prev => ({ ...prev, content: translatedText }));
                    // Also switch back to preview to show the translated text
                    if (view === 'edit') setView('preview');
                }
            } catch (error) {
                console.error('Translation Error:', error);
                alert('Failed to translate note. Proceeding with original text.');
            } finally {
                setIsTranslating(false);
            }
        }

        const plainText = content
            .replace(/```reactflow\r?\n[\s\S]*?\r?\n```/g, '')
            .replace(/```[\s\S]*?```/g, '')
            .replace(/#{1,6}\s/g, '')
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .replace(/^[\s]*[-*+]\s/gm, '')
            .replace(/^>\s/gm, '')
            .trim();

        if (!plainText) return;

        const utterance = new SpeechSynthesisUtterance(plainText);
        utterance.lang = voiceLanguage;
        utterance.rate = 0.95;
        utterance.pitch = 1;

        // Try to find a matching voice
        const voices = window.speechSynthesis.getVoices();
        const matchingVoice = voices.find(v => v.lang.startsWith(voiceLanguage.split('-')[0]));
        if (matchingVoice) utterance.voice = matchingVoice;

        utterance.onstart = () => { setIsSpeaking(true); setIsPaused(false); };
        utterance.onend = () => { setIsSpeaking(false); setIsPaused(false); };
        utterance.onerror = () => { setIsSpeaking(false); setIsPaused(false); };

        window.speechSynthesis.speak(utterance);
    };

    const handlePause = () => {
        if (window.speechSynthesis.speaking && !isPaused) {
            window.speechSynthesis.pause();
            setIsPaused(true);
        }
    };

    const handleStop = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
    };

    // --- Download Handlers ---

    const getCleanTextContent = () => {
        // Strip the reactflow code block from content for clean text export
        return (editedNote.content || '').replace(/```reactflow\r?\n[\s\S]*?\r?\n```/g, '').trim();
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const title = editedNote.title || 'Untitled Note';
        const cleanContent = getCleanTextContent();

        // Title
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 20, 25);

        // Tags
        if (editedNote.tags?.length > 0) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(120, 120, 120);
            doc.text('Tags: ' + editedNote.tags.join(', '), 20, 35);
            doc.setTextColor(0, 0, 0);
        }

        // Content
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(cleanContent, 170);
        let y = 45;
        for (const line of lines) {
            if (y > 280) {
                doc.addPage();
                y = 20;
            }
            doc.text(line, 20, y);
            y += 7;
        }

        doc.save(`${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    };

    const handleDownloadWord = async () => {
        const title = editedNote.title || 'Untitled Note';
        const cleanContent = getCleanTextContent();
        
        // Build HTML for the Word doc
        const htmlContent = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
            <head><meta charset="utf-8"><title>${title}</title></head>
            <body style="font-family: Calibri, sans-serif; padding: 20px;">
                <h1 style="color: #333; border-bottom: 2px solid #4c4a8f; padding-bottom: 8px;">${title}</h1>
                ${editedNote.tags?.length > 0 ? `<p style="color: #888; font-size: 11px;">Tags: ${editedNote.tags.join(', ')}</p>` : ''}
                ${cleanContent.split('\n').map(line => {
                    if (line.startsWith('### ')) return `<h3>${line.slice(4)}</h3>`;
                    if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`;
                    if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`;
                    if (line.startsWith('- ') || line.startsWith('* ')) return `<li>${line.slice(2)}</li>`;
                    if (line.trim() === '') return '<br/>';
                    return `<p>${line}</p>`;
                }).join('\n')}
            </body></html>
        `;

        const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDownloadMindmapImage = async () => {
        if (!diagramRef.current) return;
        try {
            const dataUrl = await toPng(diagramRef.current, { 
                backgroundColor: '#ffffff',
                pixelRatio: 2 
            });
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `${(editedNote.title || 'mindmap').replace(/[^a-zA-Z0-9]/g, '_')}_mindmap.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (err) {
            console.error('Mindmap export error:', err);
            alert('Failed to export mindmap as image.');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content note-modal-content" onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '8px' }}>
                    <div className="view-toggle" style={{ flex: '0 1 auto', minWidth: 0 }}>
                        <button 
                            className={view === 'edit' ? 'active' : ''} 
                            onClick={() => setView('edit')}
                        >
                            Edit
                        </button>
                        <button 
                            className={view === 'preview' ? 'active' : ''} 
                            onClick={() => setView('preview')}
                        >
                            Preview
                        </button>
                        {diagramJson && (
                            <button 
                                className={view === 'mindmap' ? 'active' : ''} 
                                onClick={() => setView('mindmap')}
                            >
                                Mindmap
                            </button>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
                        <button key="pin" onClick={() => setEditedNote(p => ({ ...p, is_pinned: !p.is_pinned }))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>
                            {editedNote.is_pinned ? '📌' : '📍'}
                        </button>
                        <button key="close" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>✕</button>
                    </div>
                </div>

                <input
                    name="title"
                    className="note-modal-title"
                    placeholder="Note Title"
                    value={editedNote.title}
                    onChange={handleChange}
                />

                {view === 'edit' ? (
                    <textarea
                        name="content"
                        className="note-textarea"
                        placeholder="Start writing your notes..."
                        value={editedNote.content}
                        onChange={handleChange}
                    />
                ) : view === 'preview' ? (
                    <div className="markdown-preview" style={{ 
                        minHeight: '400px', 
                        overflowY: 'auto',
                        padding: '10px 0'
                    }}>
                        <ReactMarkdown
                            components={{
                                code({node, className, children, ...props}) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    if (match && match[1] === 'reactflow') {
                                        return null;
                                    }
                                    return <code className={className} {...props}>{children}</code>;
                                }
                            }}
                        >
                            {editedNote.content}
                        </ReactMarkdown>
                    </div>
                ) : view === 'mindmap' && diagramJson ? (
                    <div style={{ height: '550px', width: '100%', marginTop: '16px' }}>
                        <ReactFlowDiagram ref={diagramRef} dataStr={diagramJson} />
                    </div>
                ) : null}

                <div className="note-modal-footer">
                    <div className="note-tags">
                        {editedNote.tags?.map((tag, i) => (
                            <span key={i} className="tag-badge" style={{ cursor: 'pointer' }} onClick={() => handleRemoveTag(tag)}>
                                {tag} ✕
                            </span>
                        ))}
                        <button 
                            onClick={handleAddTag}
                            style={{ background: 'none', border: '1px dashed #ccc', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer' }}
                        >
                            + Tag
                        </button>
                    </div>
                    <div className="btn-group" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
                        {note?.id && (
                            <button onClick={() => onDelete(note.id)} style={{ color: '#ff6b6b', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '13px', width: '100%', textAlign: 'left', padding: '4px 0' }}>Delete Note</button>
                        )}

                        {/* Download Buttons */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', width: '100%' }} className="mobile-action-buttons">
                            <button 
                                onClick={handleDownloadPDF}
                                title="Download as PDF"
                                style={{ background: 'none', border: '1px solid #e17055', color: '#e17055', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                            >
                                📥 PDF
                            </button>
                            <button 
                                onClick={handleDownloadWord}
                                title="Download as Word"
                                style={{ background: 'none', border: '1px solid #0984e3', color: '#0984e3', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                            >
                                📥 Word
                            </button>
                            {diagramJson && (
                                <button 
                                    onClick={handleDownloadMindmapImage}
                                    title="Save Mindmap as Image"
                                    style={{ background: 'none', border: '1px solid #6c5ce7', color: '#6c5ce7', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                                >
                                    🖼️ Map
                                </button>
                            )}
                            <button 
                                onClick={handleGenerateMindmap} 
                                disabled={isGenerating}
                                style={{ background: 'none', border: '1px solid #4c4a8f', color: '#4c4a8f', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                            >
                                {isGenerating ? '⏳...' : '🪄 Map'}
                            </button>
                        </div>
                        <button onClick={handleSave} className="btn-generate" style={{ padding: '10px', width: '100%', marginTop: '4px', fontSize: '14px' }}>Save Note</button>
                    </div>
                </div>

                {/* Voice Notes Player */}
                <div className="voice-player-section">
                    <div className="voice-controls">
                        <select 
                            className="voice-language-select"
                            value={voiceLanguage} 
                            onChange={(e) => setVoiceLanguage(e.target.value)}
                            disabled={isSpeaking}
                        >
                            {LANGUAGES.map(lang => (
                                <option key={lang.code} value={lang.code}>{lang.label}</option>
                            ))}
                        </select>
                        {!isSpeaking ? (
                            <button 
                                className="voice-generate-btn"
                                onClick={handleSpeak}
                                disabled={!editedNote.content?.trim() || isTranslating}
                            >
                                {isTranslating ? (
                                    <><span className="voice-spinner" /> Translating...</>
                                ) : (
                                    '🔊 Convert to Voice'
                                )}
                            </button>
                        ) : (
                            <div className="voice-playback-controls">
                                <button 
                                    className="voice-control-btn pause"
                                    onClick={isPaused ? handleSpeak : handlePause}
                                    title={isPaused ? 'Resume' : 'Pause'}
                                >
                                    {isPaused ? '▶️' : '⏸️'}
                                </button>
                                <button 
                                    className="voice-control-btn stop"
                                    onClick={handleStop}
                                    title="Stop"
                                >
                                    ⏹️
                                </button>
                                <span className="voice-speaking-indicator">
                                    <span className="voice-wave" />
                                    <span className="voice-wave" />
                                    <span className="voice-wave" />
                                    {isPaused ? 'Paused' : 'Speaking...'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoteModal;
