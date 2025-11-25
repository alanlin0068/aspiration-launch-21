import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CharityCard } from "@/components/charity/CharityCard";
import { useToast } from "@/hooks/use-toast";
import { Sprout } from "lucide-react";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import forestHero from "@/assets/forest-hero.jpg";
import type { Database } from "@/integrations/supabase/types";

type Charity = Database["public"]["Tables"]["charities"]["Row"];

const CharitySelection = () => {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchCharities();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/");
    }
  };

  const fetchCharities = async () => {
    try {
      const { data, error } = await supabase
        .from("charities")
        .select("*")
        .order("name");

      if (error) throw error;
      setCharities(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Forest background bottom half */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${forestHero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      
      {/* Gradient overlay for smooth transition */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-b from-background via-background/80 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate("/auth")}
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="p-2 bg-primary rounded-full">
                <Sprout className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">Aspiration</span>
            </button>
            <ProfileDropdown />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24 pt-8">
          <div className="w-full max-w-2xl space-y-10">
            <div className="space-y-3 text-center">
              <h1 className="text-5xl font-bold text-foreground tracking-wide">
                Select Your Charity
              </h1>
              <p className="text-muted-foreground text-lg">
                Choose where your contributions will make the most impact.
              </p>
            </div>

            <div className="space-y-5">
              {charities.map((charity) => (
                <CharityCard
                  key={charity.id}
                  name={charity.name}
                  icon={charity.icon}
                  onSelect={() => navigate(`/charity/${charity.id}`)}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CharitySelection;
