
import { useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from '@xyflow/react';
import { supabase } from '@/integrations/supabase/client';
import '@xyflow/react/dist/style.css';
import { Card } from '@/components/ui/card';

interface OrgChartProps {
  sbuId: string | undefined;
}

const nodeDefaults = {
  sourcePosition: 'bottom',
  targetPosition: 'top',
  style: {
    padding: '12px',
    borderRadius: '8px',
    minWidth: '150px',
    textAlign: 'center' as const,
  },
};

export default function OrgChartTab({ sbuId }: OrgChartProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const { data: hierarchyData } = useQuery({
    queryKey: ['sbu-hierarchy', sbuId],
    queryFn: async () => {
      if (!sbuId) return null;

      // Fetch SBU head
      const { data: sbuData } = await supabase
        .from('sbus')
        .select(`
          id,
          name,
          head:profiles!sbus_head_id_fkey (
            id,
            first_name,
            last_name,
            email,
            designation
          )
        `)
        .eq('id', sbuId)
        .single();

      if (!sbuData?.head) return null;

      // Fetch all supervisors in this SBU
      const { data: supervisorsData } = await supabase
        .from('user_supervisors')
        .select(`
          user_id,
          is_primary,
          user:profiles!user_supervisors_user_id_fkey (
            id,
            first_name,
            last_name,
            email,
            designation
          ),
          supervisor:profiles!user_supervisors_supervisor_id_fkey (
            id,
            first_name,
            last_name,
            email,
            designation
          )
        `)
        .eq('supervisor_id', sbuData.head.id);

      return {
        sbu: sbuData,
        supervisors: supervisorsData || [],
      };
    },
    enabled: !!sbuId
  });

  // Use useCallback to handle data processing
  const processHierarchyData = useCallback((data: typeof hierarchyData) => {
    if (!data) return;

    const newNodes = [];
    const newEdges = [];
    
    // Add SBU head node
    const headNode = {
      id: data.sbu.head.id,
      position: { x: 400, y: 50 },
      data: {
        label: `${data.sbu.head.first_name} ${data.sbu.head.last_name}`,
        subtitle: data.sbu.head.designation || 'SBU Head',
        email: data.sbu.head.email,
      },
      ...nodeDefaults,
    };
    newNodes.push(headNode);

    // Add direct reports
    data.supervisors.forEach((relation, index) => {
      const user = relation.user;
      const xOffset = (index - Math.floor(data.supervisors.length / 2)) * 200;
      
      newNodes.push({
        id: user.id,
        position: { x: 400 + xOffset, y: 200 },
        data: {
          label: `${user.first_name} ${user.last_name}`,
          subtitle: user.designation || 'Team Member',
          email: user.email,
        },
        ...nodeDefaults,
      });

      newEdges.push({
        id: `${data.sbu.head.id}-${user.id}`,
        source: data.sbu.head.id,
        target: user.id,
        type: 'smoothstep',
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [setNodes, setEdges]);

  // Update nodes and edges when data changes
  useEffect(() => {
    if (hierarchyData) {
      processHierarchyData(hierarchyData);
    }
  }, [hierarchyData, processHierarchyData]);

  const renderNodeContent = useCallback(({ data }: any) => {
    return (
      <Card className="p-3 min-w-[200px]">
        <div className="font-medium">{data.label}</div>
        <div className="text-sm text-muted-foreground">{data.subtitle}</div>
        <div className="text-xs text-muted-foreground mt-1">{data.email}</div>
      </Card>
    );
  }, []);

  return (
    <div className="h-[600px] border rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={{
          default: ({ data }) => renderNodeContent({ data }),
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
