
import { TableRow } from "@/components/ui/table";
import { useSortable } from '@dnd-kit/sortable';

export const SortableRow = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
  const style = {
    transform: transform ? `translate3d(0, ${transform.y}px, 0)` : undefined,
    transition,
  };
  
  return (
    <TableRow ref={setNodeRef} style={style} data-id={id}>
      {children}
    </TableRow>
  );
};

export const RegularRow = ({ children }: { children: React.ReactNode }) => {
  return <TableRow>{children}</TableRow>;
};
