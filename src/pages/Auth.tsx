import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/auth/AuthForm";
import { ImpactStats } from "@/components/auth/ImpactStats";
import { Sprout, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import forestHero from "@/assets/forest-hero.jpg";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") as "signup" | "signin" || "signup";

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user has payment method set up
        const { data: paymentMethod } = await supabase
          .from("payment_methods")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (paymentMethod) {
          navigate("/dashboard");
        } else {
          navigate("/charity-selection");
        }
      }
    };

    checkSession();
  }, [navigate]);

  return (
    <div className="min-h-screen flex">
      {/* Left side - Auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-card">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate("/")}
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="p-2 bg-primary rounded-full">
                <Sprout className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">Aspiration</span>
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          
          <AuthForm mode={mode} />
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
