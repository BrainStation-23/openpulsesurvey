
export type OKRCycleStatus = 'active' | 'upcoming' | 'completed' | 'archived';

export interface OKRCycle {
  id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: OKRCycleStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface CreateOKRCycleInput {
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
}

export interface UpdateOKRCycleInput extends Partial<CreateOKRCycleInput> {
  status?: OKRCycleStatus;
}

export type ObjectiveStatus = 'draft' | 'in_progress' | 'at_risk' | 'on_track' | 'completed';
export type ObjectiveVisibility = 'team' | 'organization' | 'private' | 'department';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'requested_changes';
export type AlignmentType = 'parent_child'; // Simplified to only parent_child
export type ProgressCalculationMethod = 'weighted_sum' | 'weighted_avg';

export interface Objective {
  id: string;
  title: string;
  description?: string;
  cycleId: string;
  ownerId: string;
  status: ObjectiveStatus;
  progress: number;
  visibility: ObjectiveVisibility;
  parentObjectiveId?: string;
  sbuId?: string;
  approvalStatus: ApprovalStatus;
  progressCalculationMethod?: ProgressCalculationMethod;
  createdAt: Date;
  updatedAt: Date;
}

export interface ObjectiveWithRelations extends Objective {
  childObjectives?: Objective[];
  alignedObjectives?: ObjectiveAlignment[];
  parentObjective?: Objective;
}

export interface ObjectiveAlignment {
  id: string;
  sourceObjectiveId: string;
  alignedObjectiveId: string;
  alignmentType: AlignmentType;
  weight: number;
  createdBy: string;
  createdAt: Date;
  sourceObjective?: Objective;
  alignedObjective?: Objective;
}

export interface CreateObjectiveInput {
  title: string;
  description?: string;
  cycleId: string;
  visibility: ObjectiveVisibility;
  parentObjectiveId?: string;
  sbuId?: string;
  ownerId?: string;
  progressCalculationMethod?: ProgressCalculationMethod;
}

export interface UpdateObjectiveInput extends Partial<CreateObjectiveInput> {
  status?: ObjectiveStatus;
  progress?: number;
  approvalStatus?: ApprovalStatus;
  progressCalculationMethod?: ProgressCalculationMethod;
}

export interface CreateAlignmentInput {
  sourceObjectiveId: string;
  alignedObjectiveId: string;
  alignmentType: AlignmentType;
  weight?: number;
}

export type KeyResultStatus = 'not_started' | 'in_progress' | 'at_risk' | 'on_track' | 'completed';
export type MeasurementType = 'numeric' | 'percentage' | 'currency' | 'boolean';

export interface KeyResult {
  id: string;
  title: string;
  description?: string;
  objectiveId: string;
  ownerId: string;
  krType: string;
  measurementType: MeasurementType;
  unit?: string;
  startValue: number;
  currentValue: number;
  targetValue: number;
  booleanValue?: boolean;
  weight: number;
  status: KeyResultStatus;
  progress: number;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateKeyResultInput {
  title: string;
  description?: string;
  objectiveId: string;
  ownerId: string;
  krType: string;
  measurementType: MeasurementType;
  unit?: string;
  startValue?: number;
  currentValue?: number;
  targetValue: number;
  booleanValue?: boolean;
  weight?: number;
  status?: KeyResultStatus;
  dueDate?: Date;
}

export interface UpdateKeyResultInput extends Partial<CreateKeyResultInput> {
  id: string;
}

export interface TemplateObjective {
  id?: string;
  title: string;
  description?: string;
  template_id?: string;
  key_results?: TemplateKeyResult[];
}

export interface TemplateKeyResult {
  id?: string;
  title: string;
  description?: string;
  measurement_type: 'numeric' | 'percentage' | 'currency' | 'boolean';
  start_value?: number;
  target_value?: number;
  weight: number; 
  template_objective_id?: string;
}

export interface OKRTemplate {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  created_by: string;
  is_public?: boolean;
  template_data?: any;
  objectives?: TemplateObjective[];
}

export interface OKRDefaultSettings {
  id: string;
  default_progress_calculation_method: ProgressCalculationMethod;
}
