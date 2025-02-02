import { useCallback, useRef, useEffect, useState } from "react";
import Wordcloud from "@visx/wordcloud/lib/Wordcloud";

interface WordCloudProps {
  words: Array<{
    text: string;
    value: number;
  }>;
}

interface WordData {
  text: string;
  size: number;
}

export function WordCloud({ words }: WordCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 300 });
  const colors = [
    "#9b87f5",  // Primary Purple
    "#F97316",  // Bright Orange
    "#0EA5E9",  // Ocean Blue
    "#D946EF",  // Magenta Pink
    "#8B5CF6",  // Vivid Purple
    "#D6BCFA",  // Light Purple
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    const observer = new ResizeObserver(updateDimensions);
    observer.observe(containerRef.current);
    updateDimensions();

    return () => observer.disconnect();
  }, []);

  // Convert our data format to what @visx/wordcloud expects
  const formattedWords = words.map((w) => ({
    text: w.text,
    size: w.value,
  }));

  const getRotation = useCallback(() => {
    return 0; // Fixed rotation for better readability
  }, []);

  const getFontSize = useCallback((word: WordData) => {
    const maxSize = Math.max(...words.map((w) => w.value));
    const minSize = Math.min(...words.map((w) => w.value));
    const scale = (word.size - minSize) / (maxSize - minSize || 1);
    
    // Base font size on container size
    const baseFontSize = Math.min(dimensions.width, dimensions.height) / 25;
    return Math.max(12, baseFontSize + (scale * baseFontSize * 0.5));
  }, [words, dimensions]);

  const getColor = useCallback((word: WordData) => {
    const index = Math.abs(word.text.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0)) % colors.length;
    return colors[index];
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[200px]">
      <Wordcloud
        words={formattedWords}
        width={dimensions.width}
        height={dimensions.height}
        fontSize={(w) => getFontSize(w as WordData)}
        font={"Inter"}
        padding={2}
        rotate={getRotation}
        spiral="archimedean"
      >
        {(cloudWords) => (
          <g>
            {cloudWords.map((w, i) => (
              <text
                key={i}
                fill={getColor(w as WordData)}
                textAnchor="middle"
                transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
                fontSize={w.size}
                fontFamily={w.font}
                style={{ userSelect: "none" }}
              >
                {w.text}
              </text>
            ))}
          </g>
        )}
      </Wordcloud>
    </div>
  );
}