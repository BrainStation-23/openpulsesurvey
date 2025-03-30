
import { useObjectivePath } from './useObjectivePath';
import { useObjectiveData } from './useObjectiveData';
import { useHierarchyProcessor } from './useHierarchyProcessor';
import { useAlignmentHelpers } from './useAlignmentHelpers';
import { ObjectiveWithRelations } from '@/types/okr';
import { useBFSHierarchyLoader } from './useBFSHierarchyLoader';

export const useObjectiveTree = (objective: ObjectiveWithRelations, isAdmin: boolean, canEdit: boolean) => {
  // Get the objective path and root
  const { rootObjective, currentObjectivePath, cachedData } = useObjectivePath(objective);
  
  // Get objective data fetching capabilities
  const { fetchObjectiveWithRelations } = useObjectiveData(cachedData);
  
  // Get alignment helper functions
  const { findParentAlignmentId, findChildAlignments, handleDeleteAlignment } = useAlignmentHelpers(objective);
  
  // Get BFS hierarchy loader
  const { findRootObjective, loadObjectiveHierarchy, objectiveCache, loadingState } = useBFSHierarchyLoader();
  
  // Get hierarchy processor
  const { processHierarchyData, hasProcessedData } = useHierarchyProcessor({
    isAdmin,
    canEdit,
    objective,
    handleDeleteAlignment,
    fetchObjectiveWithRelations
  });

  return {
    rootObjective,
    currentObjectivePath,
    findParentAlignmentId,
    findChildAlignments,
    handleDeleteAlignment,
    processHierarchyData,
    hasProcessedData,
    findRootObjective,
    loadObjectiveHierarchy,
    objectiveCache,
    loadingState
  };
};
