
// Appending the keyResults field to the existing ObjectiveWithRelations type
// This is assuming the rest of the type definition exists already

export interface ObjectiveWithRelations extends Objective {
  childObjectives?: Objective[];
  alignedObjectives?: Alignment[];
  parentObjective?: Objective;
  keyResults?: KeyResult[];
}
