
import { useState, useEffect } from 'react';
import { ObjectiveWithRelations, Objective } from '@/types/okr';
import { supabase } from '@/integrations/supabase/client';

export const useObjectivePath = (objective: ObjectiveWithRelations) => {
  const [rootObjective, setRootObjective] = useState<Objective | null>(null);
  const [currentObjectivePath, setCurrentObjectivePath] = useState<string[]>([]);
  const [cachedData, setCachedData] = useState<Map<string, ObjectiveWithRelations>>(new Map());

  useEffect(() => {
    const findRootAndPath = async () => {
      if (!objective) return;
      
      if (!objective.parentObjectiveId) {
        setRootObjective(objective);
        setCurrentObjectivePath([objective.id]);
        return;
      }
      
      try {
        let currentObj = { ...objective };
        const path = [currentObj.id];
        
        while (currentObj.parentObjectiveId) {
          // Check cache first before making a database call
          const cachedObj = cachedData.get(currentObj.parentObjectiveId);
          
          if (cachedObj) {
            currentObj = cachedObj;
          } else {
            const { data, error } = await supabase
              .from('objectives')
              .select('*')
              .eq('id', currentObj.parentObjectiveId)
              .single();
              
            if (error || !data) break;
            
            currentObj = {
              id: data.id,
              title: data.title,
              description: data.description,
              cycleId: data.cycle_id,
              ownerId: data.owner_id,
              status: data.status,
              progress: data.progress,
              visibility: data.visibility,
              parentObjectiveId: data.parent_objective_id,
              sbuId: data.sbu_id,
              approvalStatus: data.approval_status,
              createdAt: new Date(data.created_at),
              updatedAt: new Date(data.updated_at)
            } as Objective;
            
            // Update cache with the new object
            setCachedData(prev => new Map(prev).set(currentObj.id, currentObj as ObjectiveWithRelations));
          }
          
          path.unshift(currentObj.id);
        }
        
        setRootObjective(currentObj);
        setCurrentObjectivePath(path);
      } catch (error) {
        console.error('Error finding root objective:', error);
      }
    };
    
    findRootAndPath();
  }, [objective, cachedData]);

  return {
    rootObjective,
    currentObjectivePath,
    cachedData
  };
};
