import React from 'react';

const tags = ['All', 'Important', 'Review', 'Formula', 'Definition', 'Example', 'Todo'];

const TagFilter = ({ activeTag, onSelectTag }) => {
    return (
        <div className="filter-tags" style={{ padding: '4px 0', overflowX: 'auto', whiteSpace: 'nowrap' }}>
            {tags.map((tag) => (
                <button
                    key={tag}
                    className={`filter-chip ${activeTag === tag ? 'active' : ''}`}
                    onClick={() => onSelectTag(tag)}
                    style={{ 
                        marginRight: '8px',
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
