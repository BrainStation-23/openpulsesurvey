
// Common English stop words to filter out
const STOP_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her',
  'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there',
  'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get',
  'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no',
  'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your',
  'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then',
  'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first',
  'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these',
  'give', 'day', 'most', 'us'
]);

interface WordFrequency {
  text: string;
  value: number;
  size?: number;
  color?: string;
}

export const processTextData = (answers: string[]): WordFrequency[] => {
  const wordFrequency: Record<string, number> = {};
  
  // Process all answers
  answers.forEach((answer) => {
    if (typeof answer === "string") {
      const words = answer
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter(word => 
          word.length > 2 && 
          !STOP_WORDS.has(word)
        );

      words.forEach((word) => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      });
    }
  });

  // Convert to array and sort by frequency
  const processedWords = Object.entries(wordFrequency)
    .map(([text, value]) => ({
      text,
      value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 50); // Limit to top 50 words

  // Calculate sizes (12px to 40px range)
  const maxFreq = Math.max(...processedWords.map(w => w.value));
  const minFreq = Math.min(...processedWords.map(w => w.value));
  const sizeRange = maxFreq - minFreq;

  return processedWords.map(word => ({
    ...word,
    size: 12 + ((word.value - minFreq) / sizeRange) * 28
  }));
};
