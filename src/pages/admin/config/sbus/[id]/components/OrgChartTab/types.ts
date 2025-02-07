
import { Node, Position } from '@xyflow/react';

export interface CategoryWithColor {
  name: string;
  color_code: string;
}

export interface UserNodeData extends Record<string, unknown> {
  label: string;
  subtitle: string;
  email: string;
  userId: string;
  isExpanded?: boolean;
  hasChildren?: boolean;
  employmentType?: CategoryWithColor;
  employeeType?: CategoryWithColor;
  employeeRole?: CategoryWithColor;
  level?: CategoryWithColor;
}

export interface UserNode extends Node<UserNodeData> {
  data: UserNodeData;
}

export const nodeDefaults = {
  sourcePosition: Position.Bottom,
  targetPosition: Position.Top,
  style: {
    minWidth: '350px',
    padding: '0',
    borderRadius: '8px',
  },
};

export interface OrgChartProps {
  sbuId: string | undefined;
}

export interface HierarchyData {
  sbu: {
    id: string;
    name: string;
    head: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      designation: string;
      employment_type: CategoryWithColor;
      employee_type: CategoryWithColor;
      employee_role: CategoryWithColor;
      level: CategoryWithColor;
    };
  };
  employees: Array<{
    user: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      designation: string;
      employment_type: CategoryWithColor;
      employee_type: CategoryWithColor;
      employee_role: CategoryWithColor;
      level: CategoryWithColor;
      supervisors: Array<{
        is_primary: boolean;
        supervisor: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          designation: string;
        };
      }>;
    };
  }>;
}
