import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CharityCard } from "@/components/charity/CharityCard";
import { useToast } from "@/hooks/use-toast";
import { Sprout, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
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
          backgroundImage: `url(${forestHero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-full">
                <Sprout className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">Aspiration</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/auth")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
          <div className="w-full max-w-2xl space-y-8">
            <h1 className="text-4xl font-bold text-center text-foreground">
              Select Your Charity
            </h1>

            <div className="space-y-4">
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
