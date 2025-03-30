
import { Objective } from '@/types/okr';

export interface Owner {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
}

export interface ObjectiveWithOwner extends Objective {
  owner?: Owner;
  keyResultsCount?: number;
  childCount?: number;
  // Add fetched flag to help with optimization
  _fetched?: boolean;
}
