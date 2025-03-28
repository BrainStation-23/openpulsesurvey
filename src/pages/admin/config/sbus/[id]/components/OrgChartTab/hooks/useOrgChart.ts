
import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Edge } from '@xyflow/react';
import { HierarchyData, UserNode, nodeDefaults } from '../types';

const VERTICAL_SPACING = 180; // Increased from 120 to account for node height
const HORIZONTAL_SPACING = 400;
const NODE_HEIGHT = 140; // Approximate height of a node card

export const useOrgChart = (sbuId: string | undefined) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

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

  const { data: hierarchyData } = useQuery({
    queryKey: ['sbu-hierarchy', sbuId],
    queryFn: async () => {
      if (!sbuId) return null;

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
      } as HierarchyData;
    },
    enabled: !!sbuId,
  });

  const processHierarchyData = useCallback(
    (data: HierarchyData | null) => {
      if (!data) return { nodes: [], edges: [] };

      const newNodes: UserNode[] = [];
      const newEdges: Edge[] = [];
      const processedNodes = new Set<string>();
      const nodesByManager: { [key: string]: UserNode[] } = {};
      const orphanedNodes: UserNode[] = [];

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
            // Calculate Y position based on parent node's position plus node height and spacing
            const yPosition = parentNode.position.y + NODE_HEIGHT + VERTICAL_SPACING;
            
            node.position = {
              x: currentX + index * HORIZONTAL_SPACING,
              y: yPosition,
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

      if (orphanedNodes.length > 0) {
        const maxY = Math.max(...newNodes.map((n) => n.position.y));
        const orphanedY = maxY + NODE_HEIGHT + VERTICAL_SPACING;
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

      return { nodes: newNodes, edges: newEdges };
    },
    [expandedNodes]
  );

  return {
    hierarchyData,
    expandedNodes,
    toggleNodeExpansion,
    processHierarchyData,
  };
};
