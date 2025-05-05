
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SystemVersion {
  version: string;
  releasedAt: Date;
  appliedAt: Date;
  schemaVersion: string;
  frontendVersion: string;
  edgeFunctionsVersion: string;
  changelog: string | null;
  releaseNotes: string | null;
}

export function useSystemVersion() {
  const [version, setVersion] = useState<SystemVersion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSystemVersion() {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase.rpc('get_current_system_version');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const versionData = data[0];
          setVersion({
            version: versionData.version,
            releasedAt: new Date(versionData.released_at),
            appliedAt: new Date(versionData.applied_at),
            schemaVersion: versionData.schema_version,
            frontendVersion: versionData.frontend_version,
            edgeFunctionsVersion: versionData.edge_functions_version,
            changelog: versionData.changelog,
            releaseNotes: versionData.release_notes
          });
        }
      } catch (err: any) {
        console.error('Error fetching system version:', err);
        setError(err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch system version information"
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchSystemVersion();
  }, [toast]);

  return { version, isLoading, error };
}

// Hook to fetch version history
export function useVersionHistory() {
  const [versions, setVersions] = useState<SystemVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchVersionHistory() {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('system_versions')
          .select('*')
          .order('applied_at', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          setVersions(data.map(item => ({
            version: item.version,
            releasedAt: new Date(item.released_at),
            appliedAt: new Date(item.applied_at),
            schemaVersion: item.schema_version,
            frontendVersion: item.frontend_version,
            edgeFunctionsVersion: item.edge_functions_version,
            changelog: item.changelog,
            releaseNotes: item.release_notes
          })));
        }
      } catch (err: any) {
        console.error('Error fetching version history:', err);
        setError(err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch version history"
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchVersionHistory();
  }, [toast]);

  return { versions, isLoading, error };
}
