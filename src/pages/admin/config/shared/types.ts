
export interface ConfigItem {
  id: string;
  name: string;
  color_code?: string;
  status: 'active' | 'inactive';
  rank?: number;
}

export interface ConfigPageProps<T extends ConfigItem> {
  title: string;
  items: T[];
  isLoading: boolean;
  sortOrder: 'asc' | 'desc';
  onSort: () => void;
  onCreate: (values: { name: string; color_code?: string }) => void;
  onUpdate: (id: string, values: { name: string; color_code?: string }) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, newStatus: 'active' | 'inactive') => void;
  onReorder?: (items: T[]) => void;
  draggable?: boolean;
}

export interface ConfigTableProps<T extends ConfigItem> {
  items: T[];
  onEdit: (item: T) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, newStatus: 'active' | 'inactive') => void;
  isLoading: boolean;
  sortOrder: 'asc' | 'desc';
  onSort: () => void;
  onReorder?: (items: T[]) => void;
  draggable?: boolean;
}

export interface ConfigFormProps {
  onSubmit: (values: { name: string; color_code?: string }) => void;
  initialValues?: { name: string; color_code?: string } | null;
  submitLabel: string;
}
