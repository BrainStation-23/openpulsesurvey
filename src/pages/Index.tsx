
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative bg-gradient-to-br from-[#9b87f5] via-[#1EAEDB] to-[#7E69AB] overflow-hidden"
      style={{
        minHeight: "100dvh",
      }}
    >
      {/* Glass Card */}
      <div className="relative w-full max-w-lg px-8 py-12 rounded-3xl shadow-2xl backdrop-blur-2xl bg-white/10 border border-white/30 flex flex-col items-center animate-[fade-in_0.7s_ease] select-none">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-4 text-white tracking-tight drop-shadow-lg">
          <span className="bg-gradient-to-r from-white via-[#fff5] to-white bg-clip-text text-transparent">
            Open Pulse Survey
          </span>
        </h1>
        <p className="text-lg md:text-xl text-white/90 text-center mb-8 font-medium max-w-md drop-shadow-sm">
          Capture and analyze employee feedback with clarity. <br />
          <span className="text-[#fbed96] font-semibold">
            Modern. Fast. Secure.
          </span>
        </p>

        <Button
          size="lg"
          className="font-bold text-lg px-8 py-4 rounded-xl bg-gradient-to-r from-[#ffa99f] via-[#9b87f5] to-[#1EAEDB] text-white shadow-lg hover:scale-105 transition-transform duration-200"
          onClick={() => navigate("/login")}
        >
          Get Started
        </Button>
      </div>

      {/* Decorative gradients & blurred backgrounds, as 21stdev inspiration */}
      <div className="absolute top-0 left-0 w-[30vw] h-[30vw] bg-[#ffa99f] opacity-30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[40vw] h-[40vw] bg-[#33C3F0] opacity-20 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};

export default Index;
