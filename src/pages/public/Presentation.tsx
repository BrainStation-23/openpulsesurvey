import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/hooks/use-toast";
import { useSharedPresentation } from "./hooks/useSharedPresentation";
import { PublicPresentationControls } from "./components/PublicPresentationControls";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { KeyboardShortcutsHint } from "./components/KeyboardShortcutsHint";
import { SlideOverviewPanel } from "./components/SlideOverviewPanel";
import { PresentationTimer } from "./components/PresentationTimer";
import { NotesPanel } from "./components/NotesPanel";
import { TopControls } from "./components/TopControls";
import { MainContent } from "./components/MainContent";

export default function Presentation() {
  const { token } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(true);
  const [showOverview, setShowOverview] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [slideNotes, setSlideNotes] = useState<{ [idx: number]: string }>({});
  const [zoom, setZoom] = useState(1);
  const [timerRunning, setTimerRunning] = useState(true);

  const { 
    data: presentation, 
    isLoading, 
    error 
  } = useSharedPresentation(token as string);

  const campaign = presentation?.campaign;

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "This presentation link is invalid or has expired.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const surveyQuestions = (campaign?.survey.json_data.pages || []).flatMap(
    (page) => page.elements || []
  ).filter(q => q.type !== "text" && q.type !== "comment");

  const totalSlides = 3 + (surveyQuestions.length * (1 + (COMPARISON_DIMENSIONS?.length || 0)));

  const slideTitles: string[] = [
    "Title",
    "Response Distribution",
    "Response Trends",
    ...surveyQuestions.flatMap(q => [
      q.title?.substring(0, 40) || q.name,
      ...(COMPARISON_DIMENSIONS || []).map(dim => `${q.title?.substring(0, 22) || q.name} (${dim[0].toUpperCase() + dim.substring(1)})`)
    ])
  ];

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1)),
    onSwipedRight: () => setCurrentSlide((prev) => Math.max(0, prev - 1)),
    trackMouse: true,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCurrentSlide((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1));
      } else if (e.key === "f") {
        toggleFullscreen();
      } else if (e.key === "n") {
        setShowNotes(v => !v);
      } else if (e.key === "o") {
        setShowOverview((v) => !v);
      } else if (e.key === "j") {
        document.getElementById("jump-slide-trigger")?.click();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [totalSlides, setCurrentSlide]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
    }
  };

  const handleBack = () => {
    if (isFullscreen && document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
    navigate(-1);
  };

  function MiniMap() {
    return (
      <div className="flex gap-1 items-center px-2">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <span
            key={i}
            className={`inline-block w-2 h-2 rounded-full transition-all mx-0.5 ${currentSlide === i ? "bg-primary scale-125" : "bg-gray-300"}`}
            style={{ opacity: currentSlide === i ? 1 : 0.4 }}
          />
        ))}
      </div>
    );
  }

  function handleExport() {
    toast({ title: "Export", description: "Export to PPTX coming soon!", variant: "default" });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="container max-w-md mx-auto mt-20 p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invalid Link</AlertTitle>
          <AlertDescription>
            This presentation link is invalid or has expired.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen h-screen flex flex-col bg-background" {...swipeHandlers}>
      <Helmet>
        <title>{campaign.name} - Presentation</title>
      </Helmet>

      {showShortcuts && <KeyboardShortcutsHint onClose={() => setShowShortcuts(false)} />}

      <SlideOverviewPanel
        totalSlides={totalSlides}
        currentSlide={currentSlide}
        onJump={(s) => { setCurrentSlide(s); setShowOverview(false); }}
        slideTitles={slideTitles}
        visible={showOverview}
        onClose={() => setShowOverview(false)}
      />

      <NotesPanel
        visible={showNotes}
        notes={slideNotes[currentSlide] || ""}
        onChange={val => setSlideNotes({ ...slideNotes, [currentSlide]: val })}
        onClose={() => setShowNotes(false)}
      />

      <div className="fixed z-40 top-2 right-2">
        <PresentationTimer running={timerRunning} />
      </div>

      <TopControls
        onBack={handleBack}
        onOverview={() => setShowOverview(s => !s)}
        onExport={handleExport}
        onNotes={() => setShowNotes((v) => !v)}
        onFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        showOverview={showOverview}
        showNotes={showNotes}
        currentSlide={currentSlide}
        totalSlides={totalSlides}
      />

      <MainContent
        campaign={campaign}
        presentation={presentation}
        currentSlide={currentSlide}
        totalSlides={totalSlides}
        isFullscreen={isFullscreen}
        zoom={zoom}
      />
    </div>
  );
}
