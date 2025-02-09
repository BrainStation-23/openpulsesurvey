
export interface ConfigItem {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface ConfigFormProps {
  onSubmit: (values: { name: string }) => void;
  initialValues?: { name: string };
  submitLabel?: string;
}

export interface ConfigTableProps<T extends ConfigItem> {
  items: T[];
  onEdit: (item: T) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, newStatus: 'active' | 'inactive') => void;
  isLoading?: boolean;
  sortOrder: 'asc' | 'desc';
  onSort: () => void;
}

export interface ConfigPageProps<T extends ConfigItem> {
  title: string;
  items: T[];
  isLoading: boolean;
  sortOrder: 'asc' | 'desc';
  onSort: () => void;
  onCreate: (values: { name: string }) => void;
  onUpdate: (id: string, values: { name: string }) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, newStatus: 'active' | 'inactive') => void;
}
