
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AnimatedAuroraBackground from "@/components/ui/animated-aurora-background";
import { Button } from "@/components/ui/button";
import ServerStatus from "@/components/ui/ServerStatus";

// MAIN HERO SECTION - matches your screenshot style and instructions
const Index = () => {
  const navigate = useNavigate();

  return (
    <AnimatedAuroraBackground>
      <section className="flex flex-col items-center justify-center w-full min-h-screen py-20 relative z-10">
        {/* Server Status */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 animate-fade-in">
          <ServerStatus />
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.2, ease: "easeOut" }}
          className="font-black text-4xl md:text-7xl bg-gradient-to-r from-[#1EAEDB] via-[#9b87f5] to-pink-400 bg-clip-text text-transparent text-center drop-shadow-xl leading-tight max-w-4xl"
        >
          Open Pulse Survey
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.35, ease: "easeOut" }}
          className="md:text-2xl text-lg mt-6 text-center font-bold text-white/90"
        >
          Transform Your Office Feedback Culture
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.5, ease: "easeOut" }}
          className="mx-auto max-w-xl text-center text-zinc-300 font-medium text-base md:text-lg mt-4 mb-10"
        >
          Create, manage, and analyze employee surveys with powerful insights.
          Make data-driven decisions to improve your workplace.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.75, ease: "easeOut" }}
          className=""
        >
          <Button
            size="lg"
            className="font-bold text-lg px-10 py-4 rounded-xl bg-gradient-to-r from-[#ffa99f] via-[#9b87f5] to-[#1EAEDB] text-white shadow-lg hover:scale-105 transition-transform duration-200 animate-fade-in"
            onClick={() => navigate("/login")}
          >
            Get Started
          </Button>
        </motion.div>
      </section>
    </AnimatedAuroraBackground>
  );
};

export default Index;
