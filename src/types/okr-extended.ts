
import { Objective, KeyResult } from './okr';

export interface ObjectiveWithOwner extends Objective {
  owner?: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  keyResultsCount?: number;
}

export interface KeyResultWithOwner extends KeyResult {
  owner?: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
}
