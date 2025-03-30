import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Objective, ObjectiveWithRelations, ObjectiveAlignment } from '@/types/okr';
import { ObjectiveWithOwner } from '@/types/okr-extended';

export const useBFSHierarchyLoader = () => {
  const [objectiveCache, setObjectiveCache] = useState<Map<string, ObjectiveWithOwner>>(new Map());
  const [loadingState, setLoadingState] = useState<{
    isLoading: boolean;
    progress: number;
    total: number;
  }>({ isLoading: false, progress: 0, total: 0 });

  // Find root objective (objective with no parent)
  const findRootObjective = useCallback(async (startObjectiveId: string): Promise<ObjectiveWithOwner | null> => {
    console.log(`Finding root objective for: ${startObjectiveId}`);
    
    // Check if we have this objective in cache already
    if (objectiveCache.has(startObjectiveId)) {
      const cachedObj = objectiveCache.get(startObjectiveId)!;
      
      // If it doesn't have a parent, it's the root
      if (!cachedObj.parentObjectiveId) {
        return cachedObj;
      }
      
      // If parent is in cache, recursively check that
      if (objectiveCache.has(cachedObj.parentObjectiveId)) {
        return findRootObjective(cachedObj.parentObjectiveId);
      }
    }
    
    // If not in cache, fetch the objective
    try {
      const { data, error } = await supabase
        .from('objectives')
        .select('*, owner:profiles!objectives_owner_id_fkey(id, first_name, last_name, email, avatar_url)')
        .eq('id', startObjectiveId)
        .single();
      
      if (error) {
        console.error(`Error fetching objective ${startObjectiveId}:`, error);
        return null;
      }
      
      if (!data) {
        console.error(`No data found for objective ${startObjectiveId}`);
        return null;
      }
      
      // Transform the data to our format
      const objective: ObjectiveWithOwner = {
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
        updatedAt: new Date(data.updated_at),
        _fetched: false,
        owner: data.owner ? {
          id: data.owner.id,
          fullName: `${data.owner.first_name} ${data.owner.last_name}`,
          email: data.owner.email,
          avatarUrl: data.owner.avatar_url
        } : undefined
      };
      
      // Add to cache
      setObjectiveCache(prev => new Map(prev).set(objective.id, objective));
      
      // If this objective has no parent, it's the root
      if (!objective.parentObjectiveId) {
        return objective;
      }
      
      // Otherwise, recursively find the parent
      return findRootObjective(objective.parentObjectiveId);
    } catch (error) {
      console.error('Error in findRootObjective:', error);
      return null;
    }
  }, [objectiveCache]);

  // Load the entire hierarchy using BFS starting from the root
  const loadObjectiveHierarchy = useCallback(async (rootObjectiveId: string): Promise<Map<string, ObjectiveWithOwner>> => {
    console.log(`Starting BFS hierarchy load from root: ${rootObjectiveId}`);
    setLoadingState({ isLoading: true, progress: 0, total: 1 }); // At minimum, we have the root
    
    // Initialize a new cache for this operation
    const hierarchyCache = new Map<string, ObjectiveWithOwner>();
    
    // Fetch the root objective if not in cache
    let rootObjective: ObjectiveWithOwner | undefined;
    if (objectiveCache.has(rootObjectiveId)) {
      rootObjective = objectiveCache.get(rootObjectiveId);
    } else {
      const { data, error } = await supabase
        .from('objectives')
        .select('*, owner:profiles!objectives_owner_id_fkey(id, first_name, last_name, email, avatar_url)')
        .eq('id', rootObjectiveId)
        .single();
        
      if (error || !data) {
        console.error(`Error fetching root objective ${rootObjectiveId}:`, error);
        setLoadingState({ isLoading: false, progress: 0, total: 0 });
        return hierarchyCache;
      }
      
      rootObjective = {
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
        updatedAt: new Date(data.updated_at),
        _fetched: false,
        owner: data.owner ? {
          id: data.owner.id,
          fullName: `${data.owner.first_name} ${data.owner.last_name}`,
          email: data.owner.email,
          avatarUrl: data.owner.avatar_url
        } : undefined
      };
    }
    
    // Add the root to our hierarchy cache
    hierarchyCache.set(rootObjectiveId, rootObjective!);
    
    // BFS Queue - start with the root
    const queue: string[] = [rootObjectiveId];
    const processed = new Set<string>([rootObjectiveId]);
    let totalNodes = 1; // Start with 1 for the root
    let processedNodes = 0;
    
    // Process the queue (BFS)
    while (queue.length > 0) {
      const batchSize = Math.min(queue.length, 10); // Process up to 10 nodes at a time
      const currentBatch = queue.splice(0, batchSize);
      processedNodes += batchSize;
      
      // Update progress
      setLoadingState({
        isLoading: true,
        progress: processedNodes,
        total: totalNodes
      });
      
      // For each objective in the current batch
      await Promise.all(currentBatch.map(async (objectiveId) => {
        // Skip if we've already fetched this objective's relationships
        if (hierarchyCache.get(objectiveId)?._fetched) return;
        
        try {
          // 1. Fetch child objectives (direct children)
          const { data: childObjectives, error: childError } = await supabase
            .from('objectives')
            .select('*, owner:profiles!objectives_owner_id_fkey(id, first_name, last_name, email, avatar_url)')
            .eq('parent_objective_id', objectiveId);
          
          if (childError) {
            console.error(`Error fetching child objectives for ${objectiveId}:`, childError);
          } else if (childObjectives.length > 0) {
            childObjectives.forEach(child => {
              const childObj: ObjectiveWithOwner = {
                id: child.id,
                title: child.title,
                description: child.description,
                cycleId: child.cycle_id,
                ownerId: child.owner_id,
                status: child.status,
                progress: child.progress,
                visibility: child.visibility,
                parentObjectiveId: child.parent_objective_id,
                sbuId: child.sbu_id,
                approvalStatus: child.approval_status,
                createdAt: new Date(child.created_at),
                updatedAt: new Date(child.updated_at),
                _fetched: false,
                owner: child.owner ? {
                  id: child.owner.id,
                  fullName: `${child.owner.first_name} ${child.owner.last_name}`,
                  email: child.owner.email,
                  avatarUrl: child.owner.avatar_url
                } : undefined
              };
              
              // Add to hierarchy cache if not already there
              if (!hierarchyCache.has(child.id)) {
                hierarchyCache.set(child.id, childObj);
                if (!processed.has(child.id)) {
                  queue.push(child.id);
                  processed.add(child.id);
                  totalNodes++;
                }
              }
            });
          }
          
          // 2. Fetch alignments where this objective is the source
          const { data: alignments, error: alignmentError } = await supabase
            .from('okr_alignments')
            .select(`
              id,
              source_objective_id,
              aligned_objective_id,
              alignment_type,
              weight,
              aligned_objective:objectives!aligned_objective_id (
                *,
                owner:profiles!objectives_owner_id_fkey(id, first_name, last_name, email, avatar_url)
              )
            `)
            .eq('source_objective_id', objectiveId)
            .eq('alignment_type', 'parent_child');
          
          if (alignmentError) {
            console.error(`Error fetching alignments for ${objectiveId}:`, alignmentError);
          } else if (alignments.length > 0) {
            alignments.forEach(alignment => {
              if (alignment.aligned_objective) {
                const alignedObj: ObjectiveWithOwner = {
                  id: alignment.aligned_objective.id,
                  title: alignment.aligned_objective.title,
                  description: alignment.aligned_objective.description,
                  cycleId: alignment.aligned_objective.cycle_id,
                  ownerId: alignment.aligned_objective.owner_id,
                  status: alignment.aligned_objective.status,
                  progress: alignment.aligned_objective.progress,
                  visibility: alignment.aligned_objective.visibility,
                  parentObjectiveId: alignment.aligned_objective.parent_objective_id,
                  sbuId: alignment.aligned_objective.sbu_id,
                  approvalStatus: alignment.aligned_objective.approval_status,
                  createdAt: new Date(alignment.aligned_objective.created_at),
                  updatedAt: new Date(alignment.aligned_objective.updated_at),
                  _fetched: false,
                  owner: alignment.aligned_objective.owner ? {
                    id: alignment.aligned_objective.owner.id,
                    fullName: `${alignment.aligned_objective.owner.first_name} ${alignment.aligned_objective.owner.last_name}`,
                    email: alignment.aligned_objective.owner.email,
                    avatarUrl: alignment.aligned_objective.owner.avatar_url
                  } : undefined
                };
                
                // Add to hierarchy cache if not already there
                if (!hierarchyCache.has(alignedObj.id)) {
                  hierarchyCache.set(alignedObj.id, alignedObj);
                  if (!processed.has(alignedObj.id)) {
                    queue.push(alignedObj.id);
                    processed.add(alignedObj.id);
                    totalNodes++;
                  }
                }
              }
            });
          }
          
          // Mark this objective as fetched
          const currentObj = hierarchyCache.get(objectiveId);
          if (currentObj) {
            hierarchyCache.set(objectiveId, { ...currentObj, _fetched: true });
          }
          
        } catch (error) {
          console.error(`Error processing objective ${objectiveId}:`, error);
        }
      }));
    }
    
    console.log(`BFS hierarchy load complete. Processed ${processedNodes} objectives.`);
    setLoadingState({ isLoading: false, progress: processedNodes, total: totalNodes });
    
    // Update the global cache with all the objectives we found
    setObjectiveCache(prev => {
      const newCache = new Map(prev);
      hierarchyCache.forEach((value, key) => {
        newCache.set(key, value);
      });
      return newCache;
    });
    
    return hierarchyCache;
  }, [objectiveCache]);

  return {
    findRootObjective,
    loadObjectiveHierarchy,
    objectiveCache,
    loadingState
  };
};
