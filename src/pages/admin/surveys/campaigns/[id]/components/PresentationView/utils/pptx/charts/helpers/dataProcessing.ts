
/**
 * Process NPS (Net Promoter Score) data
 * @param validAnswers Array of valid rating answers
 * @returns Object with NPS-related metrics
 */
export const processNpsData = (validAnswers: number[]) => {
  const total = validAnswers.length;
  const detractors = validAnswers.filter(r => r <= 6).length;
  const passives = validAnswers.filter(r => r > 6 && r <= 8).length;
  const promoters = validAnswers.filter(r => r > 8).length;

  const npsScore = Math.round(
    ((promoters - detractors) / total) * 100
  );

  return {
    detractors,
    passives,
    promoters,
    total,
    npsScore
  };
};

/**
 * Process satisfaction rating data
 * @param validAnswers Array of valid rating answers
 * @returns Object with satisfaction-related metrics
 */
export const processSatisfactionData = (validAnswers: number[]) => {
  const total = validAnswers.length;
  const unsatisfied = validAnswers.filter(r => r <= 2).length;
  const neutral = validAnswers.filter(r => r === 3).length;
  const satisfied = validAnswers.filter(r => r >= 4).length;

  const satisfactionRate = Math.round((satisfied / total) * 100);

  return {
    unsatisfied,
    neutral,
    satisfied,
    total,
    satisfactionRate
  };
};

/**
 * Process supervisor satisfaction data for PPTX charts
 * @param supervisorData Data from get_supervisor_satisfaction RPC
 * @returns Processed data ready for charting
 */
export const processSupervisorData = (supervisorData: any[]) => {
  return supervisorData.map(item => ({
    dimension: item.dimension,
    unsatisfied: item.unsatisfied,
    neutral: item.neutral,
    satisfied: item.satisfied,
    total: item.total
  }));
};

/**
 * Process supervisor NPS data for PPTX charts
 * @param supervisorData Data from get_supervisor_satisfaction RPC
 * @returns Processed data ready for NPS charting
 */
export const processSupervisorNpsData = (supervisorData: any[]) => {
  return supervisorData.map(item => ({
    dimension: item.dimension,
    detractors: item.unsatisfied,
    passives: item.neutral,
    promoters: item.satisfied,
    total: item.total,
    npsScore: Math.round(((item.satisfied - item.unsatisfied) / item.total) * 100)
  }));
};
