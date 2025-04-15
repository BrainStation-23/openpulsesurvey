
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export function TokenInputForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [token, setToken] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      toast({
        title: "Error",
        description: "Please enter a presentation token",
        variant: "destructive",
      });
      return;
    }
    
    navigate(`/presentation/${token.trim()}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Access Presentation</h1>
          <p className="text-muted-foreground mt-2">Enter your presentation token to view the shared presentation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter presentation token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
          >
            View Presentation
          </Button>
        </form>
      </div>
    </div>
  );
}
