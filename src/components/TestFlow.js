import React from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MarkerType,
  ReactFlowProvider,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const TestFlow = () => {
  const nodes = [
    {
      id: '1',
      type: 'default',
      position: { x: 100, y: 100 },
      data: { label: 'Node 1' },
    },
    {
      id: '2',
      type: 'default',
      position: { x: 400, y: 100 },
      data: { label: 'Node 2' },
    },
  ];

  // Custom node component for testing
  const CustomNode = ({ data }) => {
    return (
      <div style={{ padding: '10px', border: '1px solid #777', borderRadius: '5px', background: 'white' }}>
        <Handle type="target" position={Position.Left} />
        <div>{data.label}</div>
        <Handle type="source" position={Position.Right} />
      </div>
    );
  };

  const nodeTypes = {
    default: CustomNode,
  };

  const edges = [
    {
      id: 'edge-1-2',
      source: '1',
      target: '2',
      type: 'smoothstep',
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      style: {
        stroke: '#ff0000',
        strokeWidth: 3,
      },
    },
  ];

  return (
    <div style={{ width: '100%', height: '500px', border: '1px solid red' }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background variant="dots" />
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default TestFlow;
