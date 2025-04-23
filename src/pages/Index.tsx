
import { useNavigate } from "react-router-dom";
import AnimatedAuroraBackground from "@/components/ui/animated-aurora-background";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <AnimatedAuroraBackground>
      <section className="flex flex-col items-center justify-center w-full relative">
        {/* Kokonut UI label */}
        <div className="absolute left-1/2 -translate-x-[65%] top-0 mt-2 px-3 py-1 rounded-full bg-neutral-900/80 text-sm text-neutral-200 border border-neutral-700 shadow backdrop-blur flex items-center gap-2 animate-fade-in z-20">
          <span className="inline-block w-2 h-2 rounded-full bg-pink-500 mr-2" />
          Kokonut UI
        </div>
        {/* Big headline */}
        <h1 className="font-extrabold text-center text-4xl md:text-7xl tracking-tight leading-[1.1] mt-10 mb-3 bg-gradient-to-r from-white via-indigo-200 to-pink-300 bg-clip-text text-transparent drop-shadow-xl animate-fade-in">
          Elevate Your <span className="text-indigo-200 bg-gradient-to-r from-indigo-200 to-pink-300 bg-clip-text text-transparent">Digital Vision</span>
        </h1>
        <p className="mx-auto max-w-xl text-center text-zinc-400 font-medium text-base md:text-xl mt-4 mb-8 animate-fade-in" style={{animationDelay:'0.25s', animationFillMode:'forwards'}}>
          Crafting exceptional digital experiences through innovative design and cutting-edge technology.
        </p>
        <Button
          size="lg"
          className="font-bold text-lg px-8 py-4 rounded-xl bg-gradient-to-r from-[#ffa99f] via-[#9b87f5] to-[#1EAEDB] text-white shadow-lg hover:scale-105 transition-transform duration-200 animate-fade-in"
          onClick={() => navigate("/login")}
        >
          Get Started
        </Button>
      </section>
    </AnimatedAuroraBackground>
  );
};

export default Index;
