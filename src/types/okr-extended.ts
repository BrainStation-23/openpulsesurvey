
import { Objective, KeyResult } from './okr';

export interface ObjectiveWithOwner extends Objective {
  owner?: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  keyResultsCount?: number;
  ownerName?: string; // Added for compatibility with the database view
  sbuName?: string;   // Added for compatibility with the database view
  cycleName?: string; // Added for compatibility with the database view
  alignmentsCount?: number; // Added for compatibility with the database view
  completedKeyResults?: number; // Added for compatibility with the database view
}

export interface KeyResultWithOwner extends KeyResult {
  owner?: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
}
