import React from 'react';

const SearchBar = ({ value, onChange }) => {
    return (
        <div className="search-container">
            <div style={{ position: 'relative', width: '300px' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>🔍</span>
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search your brain..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{ paddingLeft: '44px', width: '100%', border: 'none', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: '12px' }}
                />
            </div>
        </div>
    );
};

export default SearchBar;
