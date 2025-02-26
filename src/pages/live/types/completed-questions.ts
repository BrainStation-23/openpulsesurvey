
import { ActiveQuestion } from "../types";

export interface CompletedQuestion extends ActiveQuestion {
  responses: any[];
  completedAt: string;
}
