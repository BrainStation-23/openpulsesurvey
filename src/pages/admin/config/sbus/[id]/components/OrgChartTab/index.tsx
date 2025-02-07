
import { useEffect } from 'react';
import {
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import { FlowWrapper } from './components/FlowWrapper';
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
    <FlowWrapper
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      toggleNodeExpansion={toggleNodeExpansion}
    />
  );
}
