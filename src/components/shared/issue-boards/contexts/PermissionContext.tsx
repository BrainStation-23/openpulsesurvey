import React, { createContext, useContext } from 'react';
import { useBoardPermissions, BoardPermissionResult } from '../hooks/useBoardPermissions';

interface PermissionContextType {
  permissions: BoardPermissionResult | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

interface PermissionProviderProps {
  boardId: string;
  children: React.ReactNode;
}

export function PermissionProvider({ boardId, children }: PermissionProviderProps) {
  const { 
    data: permissions, 
    isLoading, 
    error, 
    refetch 
  } = useBoardPermissions(boardId);

  return (
    <PermissionContext.Provider 
      value={{ 
        permissions, 
        isLoading, 
        error, 
        refetch 
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissionContext(): PermissionContextType {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissionContext must be used within a PermissionProvider');
  }
  return context;
}