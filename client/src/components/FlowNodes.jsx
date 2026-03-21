import React from 'react';
import { Handle, Position } from '@xyflow/react';

export const HubNode = ({ data }) => {
    return (
        <div style={{
            padding: '24px',
            borderRadius: '50%',
            background: '#fff',
            border: '4px solid #4A90E2',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            minWidth: '130px',
            minHeight: '130px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            fontWeight: 'bold',
            color: '#333',
            fontSize: '16px'
        }}>
            <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
            <Handle type="source" position={Position.Left} style={{ opacity: 0 }} />
            <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
            <Handle type="target" position={Position.Bottom} style={{ opacity: 0 }} />
            <div>{data.label}</div>
        </div>
    );
};

export const BranchNode = ({ data }) => {
    const color = data.color || '#F39C12';
    return (
        <div style={{
            padding: '12px 24px',
            borderRadius: '30px',
            background: color,
            color: '#fff',
            fontWeight: '600',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            textAlign: 'center',
            minWidth: '100px'
        }}>
            <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
            <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
            <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
            <Handle type="target" position={Position.Bottom} style={{ opacity: 0 }} />
            <div>{data.label}</div>
        </div>
    );
};
