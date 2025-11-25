import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Sprout, ChevronRight, ArrowLeft } from "lucide-react";
import forestHero from "@/assets/forest-hero.jpg";
import type { Database } from "@/integrations/supabase/types";

type Charity = Database["public"]["Tables"]["charities"]["Row"];

const CharityDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [charity, setCharity] = useState<Charity | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    if (id) {
      fetchCharity();
    }
  }, [id]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/");
    }
  };

  const fetchCharity = async () => {
    try {
      const { data, error } = await supabase
        .from("charities")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setCharity(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/charity-selection");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    navigate(`/payment-setup/${id}`);
  };

  if (loading || !charity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Forest background bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/4"
        style={{
          backgroundImage: `url(${forestHero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen">
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/charity-selection")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-6xl mx-auto px-6 pb-24">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Left column - Confirm button and image */}
            <div className="space-y-6">
              <Button
                onClick={handleConfirm}
                size="lg"
                className="w-full max-w-md text-xl py-8 rounded-full"
              >
                Confirm <ChevronRight className="ml-2 h-6 w-6" />
              </Button>

              {charity.image_url && (
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={charity.image_url}
                    alt={charity.name}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}
            </div>

            {/* Right column - Information card */}
            <Card className="p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4 text-center">OVERVIEW</h2>
                <p className="text-foreground leading-relaxed text-center">
                  {charity.overview}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3 text-center">COST-EFFECTIVENESS</h3>
                <p className="text-foreground leading-relaxed text-center">
                  {charity.cost_effectiveness}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3 text-center">EVIDENCE OF IMPACT</h3>
                <p className="text-foreground leading-relaxed text-center">
                  {charity.evidence_of_impact}
                </p>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CharityDetails;
