
export interface ResponseTrendData {
  instanceId: string;
  periodNumber: number;
  startsAt: string;
  endsAt: string;
  totalResponses: number;
  uniqueRespondents: number;
  completionRate: number;
}

export interface ResponseMetrics {
  totalResponses: number;
  averageResponseRate: number;
  responseGrowth: number;
  trendDirection: 'up' | 'down' | 'stable';
}
