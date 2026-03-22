import React from 'react';

const tags = ['All', 'Important', 'Review', 'Formula', 'Definition', 'Example', 'Todo'];

const TagFilter = ({ activeTag, onSelectTag }) => {
    return (
        <div className="filter-tags" style={{ 
            padding: '8px 4px', 
            overflowX: 'auto', 
            display: 'flex', 
            flexWrap: 'nowrap', 
            gap: '8px',
            flexShrink: 0,
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none'
        }}>
            {tags.map((tag) => (
                <button
                    key={tag}
                    className={`filter-chip ${activeTag === tag ? 'active' : ''}`}
                    onClick={() => onSelectTag(tag)}
                    style={{ 
                        flexShrink: 0,
                        border: activeTag === tag ? 'none' : '1px solid var(--card-border)',
                        boxShadow: activeTag === tag ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                    }}
                >
                    {tag}
                </button>
            ))}
        </div>
    );
};

export default TagFilter;
