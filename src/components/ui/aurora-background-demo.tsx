
"use client";
import { motion } from "framer-motion";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function AuroraBackgroundDemo() {
  const navigate = useNavigate();
  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-6 items-center justify-center px-4"
      >
        <div className="flex flex-col gap-2 items-center">
          <div className="text-4xl md:text-6xl font-extrabold text-center tracking-tight text-zinc-900 dark:text-white">
            Open Pulse Survey
          </div>
          <div className="text-lg md:text-2xl font-thin text-center text-zinc-600 dark:text-neutral-200">
            Anonymous &amp; modern employee feedback, instantly.
          </div>
        </div>
        {/* Decorative image can be enabled if needed:
        <img
          src="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80"
          alt="Office theme"
          className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover mb-4"
        />
        */}
        <Button
          size="lg"
          className="rounded-full text-lg px-10 py-4 font-bold shadow-xl bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white transition hover:scale-105"
          onClick={() => navigate("/login")}
        >
          Get Started
        </Button>
      </motion.div>
    </AuroraBackground>
  );
}
