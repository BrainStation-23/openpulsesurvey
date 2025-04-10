
import React from 'react';
import { ObjectiveWithRelations, KeyResult, ProgressCalculationMethod } from '@/types/okr';
import { useObjective } from '@/hooks/okr/useObjective';
import { useNavigate } from 'react-router-dom';
import { ProgressCard } from './details/ProgressCard';
import { ObjectiveMetadataCard } from './details/ObjectiveMetadataCard';
import { StatsCard } from './details/StatsCard';
import { RelationshipsCard } from './details/RelationshipsCard';

interface ObjectiveDetailsTabProps {
  objective: ObjectiveWithRelations;
  keyResults: KeyResult[];
  isAdmin?: boolean;
  canEditObjective?: boolean;
}

export const ObjectiveDetailsTab: React.FC<ObjectiveDetailsTabProps> = ({
  objective,
  keyResults,
  isAdmin = false,
  canEditObjective = false
}) => {
  const navigate = useNavigate();
  const { updateProgressCalculationMethod } = useObjective(objective.id);
  
  const handleMethodChange = (method: ProgressCalculationMethod) => {
    updateProgressCalculationMethod.mutate({ method });
  };

  const handleNavigateToCycle = () => {
    if (objective.cycleId) {
      navigate(`/${isAdmin ? 'admin' : 'user'}/okrs/cycles/${objective.cycleId}`);
    }
  };

  const handleNavigateToSBU = () => {
    if (objective.sbuId) {
      navigate(`/${isAdmin ? 'admin' : 'user'}/okrs/sbus/${objective.sbuId}`);
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <ProgressCard progress={objective.progress} />
        <ObjectiveMetadataCard 
          visibility={objective.visibility}
          approvalStatus={objective.approvalStatus}
          progressCalculationMethod={objective.progressCalculationMethod || 'weighted_sum'}
          objectiveId={objective.id}
          canEditObjective={canEditObjective}
          onMethodChange={handleMethodChange}
        />
      </div>

      <div className="space-y-6">
        <StatsCard 
          keyResults={keyResults} 
          objective={objective} 
        />
        <RelationshipsCard 
          cycleId={objective.cycleId}
          sbuId={objective.sbuId}
          isAdmin={isAdmin}
          onNavigateToCycle={handleNavigateToCycle}
          onNavigateToSBU={handleNavigateToSBU}
        />
      </div>
    </div>
  );
};
