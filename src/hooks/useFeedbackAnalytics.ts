
import { useCallback } from 'react';

export interface AnalyticsEvent {
  event: string;
  questionId?: string;
  questionTitle?: string;
  data?: Record<string, any>;
  timestamp: number;
}

export function useFeedbackAnalytics() {
  const logEvent = useCallback((event: string, data?: Record<string, any>) => {
    const analyticsEvent: AnalyticsEvent = {
      event,
      ...data,
      timestamp: Date.now()
    };
    
    // Log to console for development
    console.log('Analytics Event:', analyticsEvent);
    
    // In a real implementation, you might send this to a server
    // or analytics service
    
    return analyticsEvent;
  }, []);
  
  const logQuestionView = useCallback((questionId: string, questionTitle: string) => {
    return logEvent('question_view', { questionId, questionTitle });
  }, [logEvent]);
  
  const logQuestionExport = useCallback((questionId: string, questionTitle: string, format: string) => {
    return logEvent('question_export', { questionId, questionTitle, format });
  }, [logEvent]);
  
  const logFilterChange = useCallback((filterType: string, value: string) => {
    return logEvent('filter_change', { filterType, value });
  }, [logEvent]);
  
  const logSearch = useCallback((searchTerm: string, resultsCount: number) => {
    return logEvent('search', { searchTerm, resultsCount });
  }, [logEvent]);
  
  const logPerformanceMetric = useCallback((metricName: string, durationMs: number) => {
    return logEvent('performance', { metricName, durationMs });
  }, [logEvent]);
  
  return {
    logEvent,
    logQuestionView,
    logQuestionExport,
    logFilterChange,
    logSearch,
    logPerformanceMetric
  };
}
