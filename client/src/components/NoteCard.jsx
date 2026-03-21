import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

const NoteCard = ({ note, onClick }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Strip reactflow code blocks and get clean preview content
    const previewContent = useMemo(() => {
        const raw = note.content || '';
        return raw.replace(/```reactflow\r?\n[\s\S]*?\r?\n```/g, '').trim();
    }, [note.content]);

    // Detect if the note has a mindmap
    const hasMindmap = note.content?.includes('```reactflow');

    return (
        <div className="note-card" onClick={() => onClick(note)}>
            {note.is_pinned && <div className="pin-icon">📌</div>}
            {hasMindmap && <div className="mindmap-badge">🧠</div>}
            <h3 className="note-title">{note.title}</h3>
            
            <div className="note-preview-content">
                <ReactMarkdown
                    components={{
                        // Downscale headings for the card preview
                        h1: ({ children }) => <h4 className="preview-heading">{children}</h4>,
                        h2: ({ children }) => <h5 className="preview-heading">{children}</h5>,
                        h3: ({ children }) => <h6 className="preview-heading">{children}</h6>,
                        // Simplify code blocks in preview
                        code: ({ children }) => <code className="preview-code">{children}</code>,
                        pre: ({ children }) => <div className="preview-code-block">{children}</div>,
                        // Strip images in preview
                        img: () => null,
                    }}
                >
                    {previewContent}
                </ReactMarkdown>
                <div className="preview-fade" />
            </div>

            <div className="note-tags">
                {note.tags?.map((tag, i) => (
                    <span key={i} className="tag-badge">{tag}</span>
                ))}
            </div>

            <div className="note-date">{formatDate(note.created_at)}</div>
        </div>
    );
};

export default NoteCard;
