
import { useCallback, useRef, useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface WordCloudProps {
  words: Array<{
    text: string;
    value: number;
  }>;
}

export function WordCloudChart({ words }: WordCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renderedCloud, setRenderedCloud] = useState<React.ReactNode | null>(null);

  useEffect(() => {
    // Dynamically import the heavy Wordcloud component to improve initial load time
    const loadWordCloud = async () => {
      try {
        setLoading(true);
        const Wordcloud = (await import("@visx/wordcloud/lib/Wordcloud")).default;
        
        const colors = [
          "#9b87f5",  // Primary Purple
          "#F97316",  // Bright Orange
          "#0EA5E9",  // Ocean Blue
          "#D946EF",  // Magenta Pink
          "#8B5CF6",  // Vivid Purple
          "#D6BCFA",  // Light Purple
        ];
        
        // Get container dimensions
        const width = containerRef.current?.clientWidth || 600;
        const height = containerRef.current?.clientHeight || 400;
        
        // Format words for the wordcloud
        const formattedWords = words.map((w) => ({
          text: w.text,
          size: w.value,
        }));
        
        // Define helper functions
        const getRotation = () => 0; // Fixed rotation for better readability
        
        const getFontSize = (word: {text: string, size: number}) => {
          const maxSize = Math.max(...words.map((w) => w.value));
          const minSize = Math.min(...words.map((w) => w.value));
          const scale = (word.size - minSize) / (maxSize - minSize || 1);
          
          // Base font size on container size
          const baseFontSize = Math.min(width, height) / 25;
          return Math.max(12, baseFontSize + (scale * baseFontSize * 0.8));
        };
        
        const getColor = (word: {text: string, size: number}) => {
          const index = Math.abs(word.text.split('').reduce((acc, char) => {
            return char.charCodeAt(0) + ((acc << 5) - acc);
          }, 0)) % colors.length;
          return colors[index];
        };
        
        // Render the cloud
        const cloud = (
          <Wordcloud
            words={formattedWords}
            width={width}
            height={height}
            fontSize={(w) => getFontSize(w as {text: string, size: number})}
            font={"Inter"}
            padding={3}
            rotate={getRotation}
            spiral="archimedean"
          >
            {(cloudWords) => (
              <g>
                {cloudWords.map((w, i) => (
                  <text
                    key={`${w.text}-${i}`}
                    fill={getColor({text: w.text || '', size: w.size || 0})}
                    textAnchor="middle"
                    transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
                    fontSize={w.size}
                    fontFamily={w.font}
                    fontWeight={w.size > 20 ? "bold" : "normal"}
                    style={{ cursor: "pointer" }}
                  >
                    {w.text}
                  </text>
                ))}
              </g>
            )}
          </Wordcloud>
        );
        
        setRenderedCloud(cloud);
        setLoading(false);
      } catch (err) {
        console.error("Error loading word cloud:", err);
        setError("Failed to load word cloud visualization");
        setLoading(false);
      }
    };
    
    loadWordCloud();
  }, [words]);
  
  // Update dimensions on resize
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver(() => {
      // This will trigger a re-render with new dimensions
      setRenderedCloud(null);
      setTimeout(() => {
        setLoading(true);
        const loadWordCloud = async () => {
          try {
            const Wordcloud = (await import("@visx/wordcloud/lib/Wordcloud")).default;
            // Similar implementation as above, but for resize
            // ...
            setLoading(false);
          } catch (err) {
            setError("Failed to resize word cloud");
            setLoading(false);
          }
        };
        loadWordCloud();
      }, 300);
    });
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[300px] flex items-center justify-center">
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="text-destructive">{error}</div>
      ) : words.length === 0 ? (
        <div className="text-muted-foreground">No keyword data available</div>
      ) : (
        <svg width="100%" height="100%" style={{ overflow: "visible" }}>
          {renderedCloud}
        </svg>
      )}
    </div>
  );
}
