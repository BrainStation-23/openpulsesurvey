
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
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateObjectiveInput {
  title: string;
  description?: string;
  cycleId: string;
  visibility: ObjectiveVisibility;
  parentObjectiveId?: string;
  sbuId?: string;
}

export interface UpdateObjectiveInput extends Partial<CreateObjectiveInput> {
  status?: ObjectiveStatus;
  progress?: number;
  approvalStatus?: ApprovalStatus;
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
}

export interface UpdateKeyResultInput extends Partial<CreateKeyResultInput> {
  id: string;
}
