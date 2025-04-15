
export const calculateChartStatistics = (responses: any[]) => {
  // Skip if no responses
  if (!responses || responses.length === 0) {
    return {
      average: 0,
      total: 0,
      distribution: {}
    };
  }

  // Calculate totals and distribution
  const validResponses = responses.filter(r => r !== null && r !== undefined);
  const total = validResponses.length;
  
  if (total === 0) return { average: 0, total: 0, distribution: {} };

  const sum = validResponses.reduce((acc, val) => acc + Number(val), 0);
  const average = sum / total;

  // Create distribution object
  const distribution = validResponses.reduce((acc: Record<string, number>, val) => {
    const key = String(val);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return {
    average,
    total,
    distribution
  };
};
