
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
