
import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Node,
  Position,
} from '@xyflow/react';
import { supabase } from '@/integrations/supabase/client';
import '@xyflow/react/dist/style.css';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, UserCircle2, Briefcase, Users, Shield, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrgChartProps {
  sbuId: string | undefined;
}

interface UserNode extends Node {
  data: {
    label: string;
    subtitle: string;
    email: string;
    userId: string;
    isExpanded?: boolean;
    hasChildren?: boolean;
    employmentType?: {
      name: string;
      color_code: string;
    };
    employeeType?: {
      name: string;
      color_code: string;
    };
    employeeRole?: {
      name: string;
      color_code: string;
    };
    level?: {
      name: string;
      color_code: string;
    };
  };
}

const nodeDefaults = {
  sourcePosition: Position.Bottom,
  targetPosition: Position.Top,
  style: {
    minWidth: '350px',
    padding: '0',
    borderRadius: '8px',
  },
};

const VERTICAL_SPACING = 120;
const HORIZONTAL_SPACING = 400;

export default function OrgChartTab({ sbuId }: OrgChartProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

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
            designation,
            employment_type:employment_types(name, color_code),
            employee_type:employee_types(name, color_code),
            employee_role:employee_roles(name, color_code),
            level:levels(name, color_code)
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
            employment_type:employment_types(name, color_code),
            employee_type:employee_types(name, color_code),
            employee_role:employee_roles(name, color_code),
            level:levels(name, color_code),
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
    enabled: !!sbuId,
  });

  const toggleNodeExpansion = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const processHierarchyData = useCallback(
    (data: typeof hierarchyData) => {
      if (!data) return;

      const newNodes: UserNode[] = [];
      const newEdges: any[] = [];
      const processedNodes = new Set<string>();
      const nodesByManager: { [key: string]: UserNode[] } = {};
      const orphanedNodes: UserNode[] = [];

      // Process all employees first to build the hierarchy map
      const employees = data.employees.map((e) => e.user).filter(Boolean);
      employees.forEach((emp) => {
        const primarySupervisor = emp.supervisors?.find((s) => s.is_primary)?.supervisor;
        const node: UserNode = {
          id: emp.id,
          type: 'userNode',
          position: { x: 0, y: 0 },
          data: {
            label: `${emp.first_name} ${emp.last_name}`,
            subtitle: emp.designation || 'Team Member',
            email: emp.email,
            userId: emp.id,
            isExpanded: expandedNodes.has(emp.id),
            hasChildren: false,
            employmentType: emp.employment_type,
            employeeType: emp.employee_type,
            employeeRole: emp.employee_role,
            level: emp.level,
          },
          ...nodeDefaults,
        };

        if (primarySupervisor) {
          if (!nodesByManager[primarySupervisor.id]) {
            nodesByManager[primarySupervisor.id] = [];
          }
          nodesByManager[primarySupervisor.id].push(node);
        } else {
          orphanedNodes.push(node);
        }
      });

      // Add SBU head at the top
      const headNode: UserNode = {
        id: data.sbu.head.id,
        type: 'userNode',
        position: { x: 400, y: 50 },
        data: {
          label: `${data.sbu.head.first_name} ${data.sbu.head.last_name}`,
          subtitle: data.sbu.head.designation || 'SBU Head',
          email: data.sbu.head.email,
          userId: data.sbu.head.id,
          isExpanded: expandedNodes.has(data.sbu.head.id),
          hasChildren: nodesByManager[data.sbu.head.id]?.length > 0,
          employmentType: data.sbu.head.employment_type,
          employeeType: data.sbu.head.employee_type,
          employeeRole: data.sbu.head.employee_role,
          level: data.sbu.head.level,
        },
        ...nodeDefaults,
      };
      newNodes.push(headNode);
      processedNodes.add(data.sbu.head.id);

      // Position nodes using the same logic as before
      const positionNodes = (
        managerId: string,
        level: number,
        startX: number,
        parentNode: UserNode
      ) => {
        if (!expandedNodes.has(managerId)) return;

        const directReports = nodesByManager[managerId] || [];
        const totalWidth = directReports.length * HORIZONTAL_SPACING;
        let currentX = startX - totalWidth / 2;

        directReports.forEach((node, index) => {
          if (!processedNodes.has(node.id)) {
            node.position = {
              x: currentX + index * HORIZONTAL_SPACING,
              y: level * VERTICAL_SPACING,
            };
            node.data.hasChildren = !!nodesByManager[node.id]?.length;
            newNodes.push(node);
            processedNodes.add(node.id);

            newEdges.push({
              id: `${managerId}-${node.id}`,
              source: managerId,
              target: node.id,
              type: 'smoothstep',
              style: { stroke: '#64748b', strokeWidth: 2 },
            });

            if (expandedNodes.has(node.id)) {
              positionNodes(node.id, level + 1, currentX + index * HORIZONTAL_SPACING, node);
            }
          }
        });
      };

      positionNodes(data.sbu.head.id, 1, 400, headNode);

      // Position orphaned nodes
      if (orphanedNodes.length > 0) {
        const orphanedY = Math.max(...newNodes.map((n) => n.position.y)) + VERTICAL_SPACING * 2;
        orphanedNodes.forEach((node, index) => {
          if (!processedNodes.has(node.id)) {
            node.position = {
              x: 400 + (index - Math.floor(orphanedNodes.length / 2)) * HORIZONTAL_SPACING,
              y: orphanedY,
            };
            node.data.hasChildren = !!nodesByManager[node.id]?.length;
            newNodes.push(node);
          }
        });
      }

      setNodes(newNodes);
      setEdges(newEdges);
    },
    [setNodes, setEdges, expandedNodes]
  );

  useEffect(() => {
    if (hierarchyData) {
      processHierarchyData(hierarchyData);
    }
  }, [hierarchyData, processHierarchyData, expandedNodes]);

  const CustomNode = ({ data }: { data: UserNode['data'] }) => {
    return (
      <Card className="w-full">
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            {data.hasChildren && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => toggleNodeExpansion(data.userId)}
              >
                {data.isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <UserCircle2 className="h-5 w-5 text-muted-foreground" />
                <div className="font-medium text-base">{data.label}</div>
              </div>
              <div className="text-sm text-muted-foreground">{data.subtitle}</div>
              <div className="text-xs text-muted-foreground mt-1">{data.email}</div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {data.employmentType && (
              <Badge 
                style={{ backgroundColor: data.employmentType.color_code }}
                className="flex items-center gap-1"
              >
                <Briefcase className="h-3 w-3" />
                {data.employmentType.name}
              </Badge>
            )}
            {data.employeeType && (
              <Badge 
                style={{ backgroundColor: data.employeeType.color_code }}
                className="flex items-center gap-1"
              >
                <Users className="h-3 w-3" />
                {data.employeeType.name}
              </Badge>
            )}
            {data.employeeRole && (
              <Badge 
                style={{ backgroundColor: data.employeeRole.color_code }}
                className="flex items-center gap-1"
              >
                <Shield className="h-3 w-3" />
                {data.employeeRole.name}
              </Badge>
            )}
            {data.level && (
              <Badge 
                style={{ backgroundColor: data.level.color_code }}
                className="flex items-center gap-1"
              >
                <Layers className="h-3 w-3" />
                {data.level.name}
              </Badge>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="h-[600px] border rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={{
          userNode: CustomNode,
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
