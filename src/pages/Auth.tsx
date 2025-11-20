import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/auth/AuthForm";
import { ImpactStats } from "@/components/auth/ImpactStats";
import { Sprout } from "lucide-react";
import forestHero from "@/assets/forest-hero.jpg";

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/charity-selection");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/charity-selection");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex">
      {/* Left side - Auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-card">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-primary rounded-full">
              <Sprout className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Aspiration</span>
          </div>
          
          <AuthForm />
        </div>
      </div>

      {/* Right side - Impact stats with forest background */}
      <div
        className="hidden lg:flex w-1/2 items-center justify-center p-12 relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${forestHero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <ImpactStats />
      </div>
    </div>
  );
};

export default Auth;
