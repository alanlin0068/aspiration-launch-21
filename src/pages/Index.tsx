import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sprout } from "lucide-react";
import forestHero from "@/assets/forest-hero.jpg";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/charity-selection");
      }
    });
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${forestHero})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-2xl text-center space-y-8 relative z-10">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 bg-primary rounded-full">
            <Sprout className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-5xl font-bold text-primary-foreground">Aspiration</h1>
        </div>

        <p className="text-2xl text-primary-foreground/90 mb-8">
          Make every purchase count. Support charities while you shop online.
        </p>

        <div className="flex gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="text-lg px-8"
          >
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/auth")}
            className="text-lg px-8 bg-card/80 backdrop-blur-sm"
          >
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
