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
      {/* Forest background - full page */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.5)), url(${forestHero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      />

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
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-6xl mx-auto space-y-12 flex flex-col items-center">
            {/* Frosted glass heading container */}
            <div className="space-y-3 text-center backdrop-blur-xl bg-background/20 px-12 py-8 rounded-3xl border border-white/10 shadow-2xl">
              <h1 className="text-5xl font-bold text-white tracking-wide drop-shadow-lg">
                Select Your Charity
              </h1>
              <p className="text-white/90 text-lg drop-shadow-md">
                Choose where your contributions will make the most impact.
              </p>
            </div>

            {/* Charity cards - horizontal row */}
            <div className="flex flex-wrap justify-center gap-6 w-full">
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
