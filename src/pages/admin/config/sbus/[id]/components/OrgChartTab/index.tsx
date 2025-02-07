
import { useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CustomNode } from './components/CustomNode';
import { useOrgChart } from './hooks/useOrgChart';
import { OrgChartProps } from './types';

export default function OrgChartTab({ sbuId }: OrgChartProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  const { hierarchyData, toggleNodeExpansion, processHierarchyData } = useOrgChart(sbuId);

  useEffect(() => {
    if (hierarchyData) {
      const { nodes: newNodes, edges: newEdges } = processHierarchyData(hierarchyData);
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [hierarchyData, processHierarchyData, setNodes, setEdges]);

  return (
    <div className="h-[600px] border rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={{
          userNode: (props) => <CustomNode {...props} toggleNodeExpansion={toggleNodeExpansion} />,
        }}
        fitView
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Controls />
        <MiniMap zoomable pannable />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
