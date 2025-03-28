
import {
  Handle,
  Position,
} from '@xyflow/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, UserPlus, Users } from 'lucide-react';
import { UserNode } from '../types';

interface CustomNodeProps {
  data: UserNode;
  toggleNodeExpansion: (userId: string) => void;
}

export const CustomNode = ({ data, toggleNodeExpansion }: CustomNodeProps) => {
  const { user, isExpanded, hasChildren, isSupervisor } = data;
  
  return (
    <div
      className={`p-3 bg-white rounded-md shadow-sm border ${
        user.isCurrentUser ? 'border-blue-500' : 'border-slate-200'
      } min-w-[250px]`}
    >
      {/* Input handle for connecting from supervisor */}
      {isSupervisor === false && (
        <Handle
          type="target"
          position={Position.Left}
          id="supervisor-input"
          className="w-2 h-6 rounded-sm bg-slate-400"
        />
      )}
      
      {/* Output handle for connecting to team members */}
      {hasChildren && (
        <Handle
          type="source"
          position={Position.Right}
          id="team-output"
          className="w-2 h-6 rounded-sm bg-slate-400"
        />
      )}
      
      <div className="flex items-center space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <div className="font-medium text-sm truncate flex items-center">
            {user.name}
            {user.isCurrentUser && (
              <Badge className="ml-2 text-xs" variant="outline">
                You
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {user.designation}
          </div>
        </div>
        
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-8 w-8"
            onClick={() => toggleNodeExpansion(user.id)}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        )}
      </div>
      
      {isSupervisor && (
        <div className="mt-2 pt-2 border-t flex items-center text-xs text-muted-foreground">
          <Users size={12} className="mr-1" />
          <span>Supervisor</span>
        </div>
      )}
    </div>
  );
};
