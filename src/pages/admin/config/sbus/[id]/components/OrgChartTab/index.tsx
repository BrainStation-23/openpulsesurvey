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
    minWidth: '250px',
    padding: '0',
    borderRadius: '8px',
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

      // Fetch all employees and their supervisors in this SBU
      const { data: employeesData } = await supabase
        .from('user_sbus')
        .select(`
          user:profiles!user_sbus_user_id_fkey (
            id,
            first_name,
            last_name,
            email,
            designation,
            supervisors:user_supervisors!user_supervisors_user_id_fkey (
              is_primary,
              supervisor:profiles!user_supervisors_supervisor_id_fkey (
                id,
                first_name,
                last_name,
                email,
                designation
              )
            )
          )
        `)
        .eq('sbu_id', sbuId)
        .eq('is_primary', true);

      return {
        sbu: sbuData,
        employees: employeesData || [],
      };
    },
    enabled: !!sbuId
  });

  const processHierarchyData = useCallback((data: typeof hierarchyData) => {
    if (!data) return;

    const newNodes = [];
    const newEdges = [];
    const levelMap = new Map();
    const processedNodes = new Set();

    // Add SBU head node at level 0
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
    levelMap.set(data.sbu.head.id, 0);
    processedNodes.add(data.sbu.head.id);

    // Process all employees and build hierarchy
    const employees = data.employees.map(e => e.user).filter(Boolean);
    let currentLevel = 1;
    let nodesToProcess = [data.sbu.head.id];

    while (nodesToProcess.length > 0) {
      const nextLevel = [];
      const levelNodes = [];

      for (const supervisorId of nodesToProcess) {
        // Find direct reports for this supervisor
        const directReports = employees.filter(emp => 
          emp.supervisors?.some(s => s.is_primary && s.supervisor.id === supervisorId)
        );

        directReports.forEach((emp, index) => {
          if (!processedNodes.has(emp.id)) {
            const xOffset = (index - Math.floor(directReports.length / 2)) * 300;
            const baseX = 400; // Center position

            levelNodes.push({
              id: emp.id,
              position: { x: baseX + xOffset, y: currentLevel * 200 },
              data: {
                label: `${emp.first_name} ${emp.last_name}`,
                subtitle: emp.designation || 'Team Member',
                email: emp.email,
              },
              ...nodeDefaults,
            });

            newEdges.push({
              id: `${supervisorId}-${emp.id}`,
              source: supervisorId,
              target: emp.id,
              type: 'smoothstep',
              style: { stroke: '#64748b', strokeWidth: 2 },
            });

            processedNodes.add(emp.id);
            nextLevel.push(emp.id);
          }
        });
      }

      newNodes.push(...levelNodes);
      nodesToProcess = nextLevel;
      currentLevel++;
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [setNodes, setEdges]);

  useEffect(() => {
    if (hierarchyData) {
      processHierarchyData(hierarchyData);
    }
  }, [hierarchyData, processHierarchyData]);

  const renderNodeContent = useCallback(({ data }: any) => {
    return (
      <Card className="p-4 w-full">
        <div className="font-medium text-base">{data.label}</div>
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