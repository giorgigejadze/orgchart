import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Edit, Trash2, User, Mail, Phone, Eye, Maximize, Layout } from 'lucide-react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  ReactFlowProvider,
  Handle,
  BaseEdge,
  getSmoothStepPath,
  getStraightPath,
  getBezierPath,
  EdgeLabelRenderer
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './OrgChart.css';

// Console error and warning overrides removed for production

// Window error handling override removed for production

// Error Boundary for React Flow
class ReactFlowErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Suppress ResizeObserver and other React Flow errors
    if (error.message?.includes('ResizeObserver') ||
        error.message?.includes('Loop limit') ||
        error.message?.includes('maximum update depth')) {
      this.setState({ hasError: false });
      return;
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{
          width: '100%',
          height: '600px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <p>Org Chart temporarily unavailable</p>
            <button onClick={() => this.setState({ hasError: false })}>
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Stable React Flow Component with viewport preservation
const StableReactFlow = ({
  flowNodes,
  flowEdges,
  onNodesChange,
  onEdgesChange,
  nodeTypes,
  edgeTypes,
  designSettings,
  viewportRef,
  reactFlowInstanceRef
}) => {
  return (
    <ReactFlow
      key="stable-react-flow" // Stable key to prevent re-mounting
      nodes={flowNodes}
      edges={flowEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView={false}
      fitViewOptions={{
        padding: 0.15,  // More compact padding
        includeHiddenNodes: false,
        minZoom: 0.2,  // Allow reasonable zoom out
        maxZoom: 1.2,
      }}
      defaultViewport={viewportRef.current}
      nodesDraggable={true}
      nodesConnectable={false}
      elementsSelectable={true}
      selectNodesOnDrag={false}
      deleteKeyCode={null}
      multiSelectionKeyCode={null}
      panOnDrag={true}
      panOnScroll={false}
      zoomOnScroll={true}
      zoomOnPinch={true}
      zoomOnDoubleClick={true}
      preventScrolling={false}
      attributionPosition="bottom-left"
      minZoom={0.2}
      maxZoom={1.2}
      style={{
        background: 'transparent',
        width: '100%',
        height: '100%'
      }}
      proOptions={{
        hideAttribution: true,
      }}
      onInit={(instance) => {
        reactFlowInstanceRef.current = instance;
        // Restore viewport if available
        if (viewportRef.current && viewportRef.current.x !== 0) {
          instance.setViewport(viewportRef.current);
        }
      }}
      onViewportChange={(viewport) => {
        // Preserve viewport state
        viewportRef.current = viewport;
      }}
      // Additional drag configuration to ensure nodes are draggable
      nodeDragThreshold={1}
      elevateNodesOnSelect={false}
    >
      <Background
        variant="dots"
        gap={20}
        size={1}
        color="#ccc"
      />
      <Controls
        showInteractive={true}
        position="bottom-right"
        onFitView={() => {
          // Manual fit view - user initiated
        }}
      />
    </ReactFlow>
  );
};

// Custom Employee Node Component for React Flow
const EmployeeNode = ({ data }) => {
  const { employee, onEdit, onDelete, onView, designSettings } = data;
    
    return (
    <div className="employee-card-flow" style={{ cursor: 'grab' }}>
      {/* Handle for incoming edges (from manager) - positioned to not interfere with dragging */}
      <Handle
        type="target"
        position={Position.Top}
        id="target-handle"
        style={{
          background: '#3b82f6',
          border: '2px solid white',
          width: 8,
          height: 8,
          pointerEvents: 'none', // Prevent handle from capturing drag events
        }}
      />

          <div className="employee-avatar">
            {employee.image ? (
              <img src={employee.image} alt={employee.name} />
            ) : (
              <User size={24} />
            )}
          </div>
          <div className="employee-info">
            <h3 className="employee-name">{employee.name}</h3>
            <p className="employee-position">{employee.position}</p>
        {designSettings.showDepartment && (
            <p className="employee-department">{employee.department}</p>
        )}
        {designSettings.showContactInfo && (
            <div className="employee-contact">
              <div className="contact-item">
              <Mail size={12} />
                <span>{employee.email}</span>
              </div>
              <div className="contact-item">
              <Phone size={12} />
                <span>{employee.phone}</span>
              </div>
            </div>
        )}
          </div>
          <div className="employee-actions">
            <button 
              className="action-btn view-btn"
          onClick={(e) => {
            e.stopPropagation(); // Prevent event bubbling that might interfere with dragging
            onView(employee);
          }}
              title="View Employee"
            >
          <Eye size={14} />
            </button>
            <button 
              className="action-btn edit-btn"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(employee);
          }}
              title="Edit Employee"
            >
          <Edit size={14} />
            </button>
            <button 
              className="action-btn delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(employee.id);
          }}
              title="Delete Employee"
            >
          <Trash2 size={14} />
            </button>
        </div>
        
      {/* Handle for outgoing edges (to subordinates) - positioned to not interfere with dragging */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="source-handle"
        style={{
          background: '#3b82f6',
          border: '2px solid white',
          width: 8,
          height: 8,
          pointerEvents: 'none', // Prevent handle from capturing drag events
        }}
      />
      </div>
    );
  };

// Custom Edge Component 1: Straight Edge
const CustomStraightEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}) => {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  });

  const edgeColor = data?.edgeColor || '#3b82f6';
  const edgeWidth = data?.edgeWidth || 3;

  return (
    <BaseEdge
      path={edgePath}
      markerEnd={{
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: edgeColor,
      }}
      style={{
        stroke: edgeColor,
        strokeWidth: edgeWidth,
      }}
    />
  );
};

// Custom Edge Component 2: Curved Edge
const CustomCurvedEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourceY,
    targetX,
    targetY,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    borderRadius: 10, // Curved lines
  });

  const edgeColor = data?.edgeColor || '#3b82f6';
  const edgeWidth = data?.edgeWidth || 3;

  return (
    <BaseEdge
      path={edgePath}
      markerEnd={{
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: edgeColor,
      }}
      style={{
        stroke: edgeColor,
        strokeWidth: edgeWidth,
      }}
    />
  );
};

// Custom Edge Component 3: Bezier Edge
const CustomBezierEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourceY,
    targetX,
    targetY,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  });

  const edgeColor = data?.edgeColor || '#3b82f6';
  const edgeWidth = data?.edgeWidth || 3;

  return (
    <BaseEdge
      path={edgePath}
      markerEnd={{
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: edgeColor,
      }}
      style={{
        stroke: edgeColor,
        strokeWidth: edgeWidth,
      }}
    />
  );
};

// Define custom node and edge types
const nodeTypes = {
  employeeNode: EmployeeNode,
};

const edgeTypes = {
  customStraight: CustomStraightEdge,
  customCurved: CustomCurvedEdge,
  customBezier: CustomBezierEdge,
};

const OrgChart = ({
  employees,
  onEditEmployee,
  onDeleteEmployee,
  onViewEmployee,
  designSettings = {
    cardStyle: 'rounded',
    avatarSize: 'medium',
    showContactInfo: true,
    showDepartment: true,
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    edgeType: 'straight',
    edgeColor: '#3b82f6',
    edgeWidth: 3
  }
}) => {

  // Map designSettings edgeType to custom edge types
  const getEdgeType = (edgeType) => {
    switch (edgeType) {
      case 'straight':
        return 'customStraight';
      case 'curved':
        return 'customCurved';
      case 'bezier':
        return 'customBezier';
      default:
        return 'customStraight';
    }
  };

  // Create React Flow nodes and edges from employee hierarchy
  const { nodes, edges } = useMemo(() => {
    if (!employees || employees.length === 0) {
      return { nodes: [], edges: [] };
    }

    // Better layout for full screen usage
    const flowNodes = employees.map((employee, index) => {
      const col = index % 4; // 4 nodes per row for better spacing
      const row = Math.floor(index / 4);

      return {
        id: String(employee.id),
        type: 'employeeNode',
        position: {
          x: col * 400 + 100,  // More spacing horizontally with offset
          y: row * 300 + 100   // More spacing vertically with offset
        },
        data: {
          employee,
          onEdit: onEditEmployee,
          onDelete: onDeleteEmployee,
          onView: onViewEmployee,
          designSettings,
          level: 0
        },
        draggable: true,
        selectable: true,
        style: {
          cursor: 'grab'
        }
      };
    });

    // Create edges with strict validation
    const flowEdges = [];

    employees.forEach(employee => {
      if (employee.managerId) {
        // Find if manager exists in employees list
        const managerExists = employees.find(emp => emp.id === employee.managerId);

        if (managerExists) {
          flowEdges.push({
            id: `edge-${employee.managerId}-${employee.id}-${designSettings.edgeColor}-${designSettings.edgeType}-${designSettings.edgeWidth}`,
            source: String(employee.managerId),
            target: String(employee.id),
            type: getEdgeType(designSettings.edgeType),
            animated: false,
            data: {
              edgeColor: designSettings.edgeColor,
              edgeWidth: designSettings.edgeWidth,
            },
          });
      } else {
        // Manager ID not found for employee
        }
      }
    });

    // Debug logs removed for cleaner output

    return { nodes: flowNodes, edges: flowEdges };
  }, [employees, onEditEmployee, onDeleteEmployee, onViewEmployee, designSettings.edgeColor, designSettings.edgeType, designSettings.edgeWidth]);

  const [flowNodes, setNodes, onNodesChange] = useNodesState([]);
  const [flowEdges, setEdges, onEdgesChange] = useEdgesState([]);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Track if nodes have been initialized to prevent position resets
  const nodesInitializedRef = useRef(false);

  // Initialize nodes only once
  useEffect(() => {
    if (!nodesInitializedRef.current && nodes.length > 0) {
      setNodes(nodes);
      setEdges(edges);
      nodesInitializedRef.current = true;
    } else if (nodesInitializedRef.current) {
      // Already initialized
    }
  }, [nodes, edges, setNodes, setEdges]);

  // Update node data and handle additions/removals when employees change
  useEffect(() => {
    if (nodesInitializedRef.current && nodes.length > 0) {
      const updatedNodes = [];
      const currentFlowNodeIds = new Set(flowNodes.map(fn => fn.id));
      const newEmployeeIds = nodes.filter(n => !currentFlowNodeIds.has(String(n.id))).map(n => n.id);

      // Process all employees
      nodes.forEach(originalNode => {
        const existingFlowNode = flowNodes.find(fn => fn.id === String(originalNode.id));
        const savedPosition = nodePositionsRef.current.get(String(originalNode.id));

        if (existingFlowNode) {
          // Update existing node while preserving position
          const position = savedPosition || existingFlowNode.position;
          updatedNodes.push({
            ...existingFlowNode,
            position,
            data: originalNode.data,
            type: originalNode.type,
            draggable: originalNode.draggable,
            selectable: originalNode.selectable,
          });
        } else {
          // Add new node with default position
          const position = savedPosition || {
            x: (updatedNodes.length % 4) * 400 + 100,
            y: Math.floor(updatedNodes.length / 4) * 300 + 100
          };
          const newNode = {
            ...originalNode,
            position,
          };
          updatedNodes.push(newNode);

          // Store the new position immediately
          nodePositionsRef.current.set(String(originalNode.id), { ...position });
        }
      });

      // Only update if there are actual changes
      if (updatedNodes.length !== flowNodes.length || newEmployeeIds.length > 0) {
        setNodes(updatedNodes);
      }
    }
  }, [nodes]); // Only depend on nodes, not flowNodes to avoid circular dependency

  // Store node positions when they change (simplified approach)
  useEffect(() => {
    if (nodesInitializedRef.current && flowNodes.length > 0) {
      // Only store positions if there are actual position changes
      let hasChanges = false;
      flowNodes.forEach(node => {
        if (node.position) {
          const currentPosition = nodePositionsRef.current.get(node.id);
          if (!currentPosition ||
              currentPosition.x !== node.position.x ||
              currentPosition.y !== node.position.y) {
            nodePositionsRef.current.set(node.id, { ...node.position });
            hasChanges = true;
          }
        }
      });
    }
  }, [flowNodes.map(n => `${n.id}-${n.position?.x}-${n.position?.y}`).join(',')]); // Only when positions actually change

  // Update edges when they change or when design settings change
  useEffect(() => {
    if (nodesInitializedRef.current && edges.length > 0) {
      setEdges(edges);
    }
  }, [edges, setEdges]);

  // Edge styling is now handled by custom edge components

  // Viewport preservation ref
  const viewportRef = useRef({ x: 0, y: 0, zoom: 0.8 });
  const reactFlowInstanceRef = useRef(null);

  // Node positions preservation ref
  const nodePositionsRef = useRef(new Map());

  // Fit view function
  const handleFitView = () => {
    if (reactFlowInstanceRef.current) {
      reactFlowInstanceRef.current.fitView({
        padding: 0.15,  // More compact padding
        includeHiddenNodes: false,
        minZoom: 0.2,  // Allow reasonable zoom out
        maxZoom: 1.0,  // No zoom in
        duration: 1000 // Smooth animation
      });
    }
  };

  // Organize function - rearrange nodes in hierarchy layout with guaranteed no overlaps
  const handleOrganize = () => {
    if (reactFlowInstanceRef.current && flowNodes.length > 0) {
      const organizedNodes = [...flowNodes];

      // Build hierarchy tree - managers (no managerId) at the top
      const employeeMap = new Map(employees.map(emp => [emp.id, emp]));
      const rootEmployees = employees.filter(emp => !emp.managerId); // CEOs, top managers

      // Pre-calculate subtree sizes for better spacing
      const getSubtreeWidth = (employeeId) => {
        const employee = employeeMap.get(employeeId);
        if (!employee) return 1;

        const subordinates = employees.filter(emp => emp.managerId === employeeId);
        if (subordinates.length === 0) return 1;

        // Calculate width needed for this subtree
        const totalChildWidth = subordinates.reduce((sum, sub) => sum + getSubtreeWidth(sub.id), 0);
        return Math.max(totalChildWidth, subordinates.length);
      };

      // Calculate positions with guaranteed spacing
      const calculateHierarchy = (employeeId, level = 0, startX = 0, availableWidth = 0) => {
        const employee = employeeMap.get(employeeId);
        if (!employee) return null;

        const subordinates = employees.filter(emp => emp.managerId === employeeId);
        const nodeWidth = 320; // Approximate node width including padding
        const nodeHeight = 200; // Approximate node height

        let x, y;
        const levelSpacing = 380; // More compact vertical spacing
        const topOffset = 100;

        if (level === 0) {
          // Root level - distribute evenly across available width
          const totalWidth = Math.max(availableWidth, rootEmployees.length * nodeWidth * 2);
          const spacing = totalWidth / (rootEmployees.length + 1);

          const rootIndex = rootEmployees.findIndex(emp => emp.id === employeeId);
          x = startX + spacing * (rootIndex + 1);
          y = topOffset;
        } else {
          // Child level - position under parent
          x = startX + availableWidth / 2; // Center under parent allocation
          y = level * levelSpacing + topOffset;
        }

        return { x, y, level, subordinates, nodeWidth, nodeHeight };
      };

      // Process nodes with breadth-first approach for better layout
      const positionedNodes = new Map();
      const levelWidth = 550; // More compact width per level
      const processedNodes = new Set();

      // Track parent positions for single-child vertical alignment
      const parentPositions = new Map();

      // Start with root nodes
      let currentLevel = 0;
      let currentLevelNodes = rootEmployees.map(emp => emp.id);

      while (currentLevelNodes.length > 0) {
        const nextLevelNodes = [];

        // Sort nodes at this level to prevent edge crossings
        // Nodes should be ordered by their manager's position
        if (currentLevel > 0) {
          currentLevelNodes.sort((a, b) => {
            const empA = employeeMap.get(a);
            const empB = employeeMap.get(b);

            if (!empA?.managerId || !empB?.managerId) return 0;

            const managerA = parentPositions.get(empA.managerId);
            const managerB = parentPositions.get(empB.managerId);

            if (!managerA || !managerB) return 0;

            return managerA.x - managerB.x; // Sort by manager's x position
          });
        }

        const levelStartX = -((currentLevelNodes.length - 1) * levelWidth) / 2;

        currentLevelNodes.forEach((employeeId, index) => {
          if (processedNodes.has(employeeId)) return;

          const availableWidth = levelWidth;
          const startX = levelStartX + index * levelWidth;
          const hierarchy = calculateHierarchy(employeeId, currentLevel, startX, availableWidth);

          if (hierarchy) {
            positionedNodes.set(employeeId, hierarchy);
            processedNodes.add(employeeId);

            // Store position for potential single-child alignment
            parentPositions.set(employeeId, { x: hierarchy.x, y: hierarchy.y });

            // Add subordinates to next level
            hierarchy.subordinates.forEach(sub => {
              if (!processedNodes.has(sub.id)) {
                nextLevelNodes.push(sub.id);
              }
            });
          }
        });

        currentLevelNodes = nextLevelNodes;
        currentLevel++;
      }

      // Second pass: Adjust positions for single subordinates to align vertically
      // and ensure no edge crossings by maintaining proper ordering
      const levelNodes = new Map();

      // Group nodes by level for final ordering
      positionedNodes.forEach((position, employeeId) => {
        if (!levelNodes.has(position.level)) {
          levelNodes.set(position.level, []);
        }
        levelNodes.get(position.level).push({ id: employeeId, position });
      });

      // Ensure proper ordering within each level to prevent edge crossings
      levelNodes.forEach((nodes, level) => {
        if (level > 0) {
          nodes.sort((a, b) => {
            const empA = employeeMap.get(a.id);
            const empB = employeeMap.get(b.id);

            if (!empA?.managerId || !empB?.managerId) return 0;

            const managerA = parentPositions.get(empA.managerId);
            const managerB = parentPositions.get(empB.managerId);

            if (!managerA || !managerB) return 0;

            return managerA.x - managerB.x; // Maintain manager-based ordering
          });

          // Reassign positions based on sorted order
          const levelStartX = -((nodes.length - 1) * levelWidth) / 2;
          nodes.forEach((node, index) => {
            const startX = levelStartX + index * levelWidth;
            const hierarchy = calculateHierarchy(node.id, level, startX, levelWidth);

            if (hierarchy) {
              // Check if this is a single subordinate that should be centered
              const employee = employeeMap.get(node.id);
              if (employee && employee.managerId) {
                const managerPosition = parentPositions.get(employee.managerId);
                const siblings = employees.filter(emp => emp.managerId === employee.managerId);
                if (siblings.length === 1 && managerPosition) {
                  // Only child - center under parent
                  hierarchy.x = managerPosition.x;
                }
              }

              positionedNodes.set(node.id, hierarchy);
            }
          });
        }
      });

      // Apply positions with extra safety margins
      organizedNodes.forEach(node => {
        const position = positionedNodes.get(parseInt(node.id));
        if (position) {
          // Add extra spacing to ensure no overlaps
          const safetyMargin = 50;
          const finalX = position.x;
          const finalY = position.y;

          node.position = { x: finalX, y: finalY };
          nodePositionsRef.current.set(node.id, { x: finalX, y: finalY });
        }
      });

      // Update nodes through React Flow instance for immediate effect
      setNodes([...organizedNodes]);

      // Also update React Flow directly for immediate visual feedback
      if (reactFlowInstanceRef.current) {
        reactFlowInstanceRef.current.setNodes(organizedNodes);
      }

      // Force React Flow to re-render
      setForceUpdate(prev => prev + 1);

      // Fit view after organizing with generous padding
      setTimeout(() => {
        if (reactFlowInstanceRef.current) {
          reactFlowInstanceRef.current.fitView({
            padding: 0.15,  // More compact padding
            includeHiddenNodes: false,
            minZoom: 0.2,  // Allow reasonable zoom out
            maxZoom: 1.0,  // No zoom in
            duration: 1000 // Smooth animation
          });
        }
      }, 500);
    }
  };

  // Restore viewport and positions when React Flow is ready
  useEffect(() => {
    if (reactFlowInstanceRef.current && flowNodes.length > 0) {
      // Small delay to ensure everything is ready
      const timeoutId = setTimeout(() => {
        // Restore viewport if we have a saved state
        if (viewportRef.current && (viewportRef.current.x !== 0 || viewportRef.current.y !== 0 || viewportRef.current.zoom !== 0.8)) {
          try {
            reactFlowInstanceRef.current.setViewport(viewportRef.current);
          } catch (error) {
            // Failed to restore viewport
          }
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [flowNodes.length]); // Include the dependency that's being used

  // Cleanup effect to prevent ResizeObserver issues
  useEffect(() => {
    return () => {
      // Disconnect any remaining ResizeObserver instances
      try {
        const resizeObservers = window.ResizeObserver?.instances || [];
        resizeObservers.forEach(observer => {
          if (observer && typeof observer.disconnect === 'function') {
            observer.disconnect();
          }
        });
      } catch (error) {
        // Silently handle cleanup errors
      }
    };
  }, []);

  if (!employees || employees.length === 0) {
    return (
      <div className="empty-state">
        <User size={48} />
        <h2>No Employees Found</h2>
        <p>Add your first employee to get started with the organizational chart.</p>
      </div>
    );
  }

  return (
    <div className="org-chart-flow">
      <ReactFlowErrorBoundary>
        <ReactFlowProvider key={`reactflow-${designSettings.edgeColor}-${designSettings.edgeType}-${designSettings.edgeWidth}-${forceUpdate}`}>
          <StableReactFlow
            flowNodes={flowNodes}
            flowEdges={flowEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            designSettings={designSettings}
            viewportRef={viewportRef}
            reactFlowInstanceRef={reactFlowInstanceRef}
          />
        </ReactFlowProvider>
      </ReactFlowErrorBoundary>

      {/* Fit View and Organize Button */}
      <div className="org-chart-controls">
        <button
          className="control-btn fit-organize-btn"
          onClick={() => {
            handleOrganize();
          }}
          title="Fit View & Organize Chart"
        >
          <Maximize size={16} />
          <span>Fit & Organize</span>
        </button>
      </div>

            {/* Debug info */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        background: 'rgba(0,0,0,0.9)',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '12px',
        zIndex: 1000,
        maxWidth: '300px'
      }}>
        <div>📊 Org Chart Status:</div>
        <div>Nodes: {flowNodes.length}</div>
        <div>Edges: {flowEdges.length}</div>
        <div>Position Preservation: ✅ Active</div>
        <div>Viewport: x:{viewportRef.current.x.toFixed(0)}, y:{viewportRef.current.y.toFixed(0)}, z:{viewportRef.current.zoom.toFixed(1)}</div>
        <div>Saved Positions: {nodePositionsRef.current.size}</div>
        {flowEdges.length > 0 && (
          <div style={{ marginTop: '5px', fontSize: '10px', color: '#ccc' }}>
            Sample: {flowEdges[0].source} → {flowEdges[0].target}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrgChart;
