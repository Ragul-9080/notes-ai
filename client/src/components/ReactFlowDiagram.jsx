import React, { useState, useEffect, forwardRef } from 'react';
import { ReactFlow, Controls, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import * as d3 from 'd3';
import { HubNode, BranchNode } from './FlowNodes';

const nodeTypes = {
  hub: HubNode,
  branch: BranchNode
};

const ReactFlowDiagram = forwardRef(({ dataStr }, ref) => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        console.log('[ReactFlowDiagram] dataStr received:', dataStr?.substring(0, 100));
        if (!dataStr) return;
        try {
            setErrorMsg('');
            const parsed = JSON.parse(dataStr);
            console.log('[ReactFlowDiagram] Parsed nodes:', parsed.nodes?.length, 'edges:', parsed.edges?.length);
            const rawNodes = parsed.nodes || [];
            const rawEdges = parsed.edges || [];

            // D3 Force layout
            const simulationNodes = rawNodes.map(n => ({ ...n }));
            const simulationEdges = rawEdges.map(e => ({ ...e, source: e.source, target: e.target }));

            const simulation = d3.forceSimulation(simulationNodes)
                .force('link', d3.forceLink(simulationEdges).id(d => d.id).distance(180))
                .force('charge', d3.forceManyBody().strength(-1500))
                .force('center', d3.forceCenter(400, 300))
                .force('collide', d3.forceCollide().radius(80));

            // Sync simulation calculation
            simulation.tick(300);

            // Vibrant infographic colors
            const colors = ['#00b894', '#0984e3', '#6c5ce7', '#e84393', '#d63031', '#e17055', '#fdcb6e'];
            
            const processedNodes = simulationNodes.map((n, i) => ({
                id: n.id,
                type: n.type || 'branch',
                position: { x: n.x, y: n.y },
                data: { 
                    ...n.data, 
                    color: n.type === 'hub' ? '#fff' : colors[i % colors.length] 
                }
            }));

            setNodes(processedNodes);
            setEdges(rawEdges.map(e => ({
                id: e.id,
                source: e.source,
                target: e.target,
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#bdc3c7', strokeWidth: 3 }
            })));

        } catch(err) {
            console.error("Error parsing reactflow json", err);
            setErrorMsg(err.message || String(err));
        }
    }, [dataStr]);

    if (errorMsg) {
        return (
            <div style={{ padding: '16px', background: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                <b>Diagram Parse Error:</b> {errorMsg}
                <br/><br/><b>Raw Data:</b><br/>{dataStr}
            </div>
        );
    }

    return (
        <div ref={ref} style={{ width: '100%', height: '550px', border: '1px solid #eee', borderRadius: '12px', background: '#fcfcfc', overflow: 'hidden' }}>
            {nodes.length > 0 && (
                <ReactFlow 
                    nodes={nodes} 
                    edges={edges} 
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                >
                    <Background color="#efefef" gap={20} />
                    <Controls />
                </ReactFlow>
            )}
        </div>
    );
});

ReactFlowDiagram.displayName = 'ReactFlowDiagram';

export default ReactFlowDiagram;
