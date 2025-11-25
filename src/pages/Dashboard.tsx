import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Sprout, Heart, TrendingUp, Users } from "lucide-react";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import forestHero from "@/assets/forest-hero.jpg";
import type { Database } from "@/integrations/supabase/types";

type Charity = Database["public"]["Tables"]["charities"]["Row"];

interface DonationStats {
  thisMonth: number;
  allTime: number;
  livesImpacted: number;
  roundUps: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DonationStats>({
    thisMonth: 0,
    allTime: 0,
    livesImpacted: 0,
    roundUps: 0,
  });
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchDonationStats();
    fetchSelectedCharity();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/");
    }
  };

  const fetchSelectedCharity = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: selection } = await supabase
        .from("user_charity_selections")
        .select("charity_id")
        .eq("user_id", user.id)
        .order("selected_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (selection) {
        const { data: charity } = await supabase
          .from("charities")
          .select("*")
          .eq("id", selection.charity_id)
          .single();

        if (charity) {
          setSelectedCharity(charity);
        }
      }
    } catch (error: any) {
      console.error("Error fetching charity:", error);
    }
  };

  const fetchDonationStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: donations, error } = await supabase
        .from("donations")
        .select("amount, created_at, type")
        .eq("user_id", user.id)
        .eq("status", "completed");

      if (error) throw error;

      if (donations && donations.length > 0) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const thisMonthTotal = donations
          .filter(d => new Date(d.created_at) >= startOfMonth)
          .reduce((sum, d) => sum + Number(d.amount), 0);

        const allTimeTotal = donations.reduce((sum, d) => sum + Number(d.amount), 0);
        const roundUpCount = donations.filter(d => d.type === "round-up").length;

        setStats({
          thisMonth: thisMonthTotal,
          allTime: allTimeTotal,
          livesImpacted: Math.floor(allTimeTotal / 5),
          roundUps: roundUpCount,
        });
      }
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
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
      {/* Forest background bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3"
        style={{
          backgroundImage: `url(${forestHero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-full">
              <Sprout className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Aspiration</span>
          </div>
          <ProfileDropdown />
        </header>

        {/* Main content */}
        <main className="max-w-4xl mx-auto px-6 pb-24">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Your Impact Dashboard</h1>
            <p className="text-muted text-lg">Growing impact, one seed at a time</p>
            {selectedCharity && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="text-2xl">{selectedCharity.icon}</span>
                <p className="text-lg text-muted">
                  Supporting <span className="font-semibold text-foreground">{selectedCharity.name}</span>
                </p>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* This Month */}
            <Card className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <Sprout className="h-5 w-5" />
                <span className="font-medium">This Month</span>
              </div>
              <div>
                <div className="text-4xl font-bold">${stats.thisMonth.toFixed(2)}</div>
                <div className="text-sm text-muted">Round-up donations</div>
              </div>
            </Card>

            {/* All-Time Impact */}
            <Card className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <Heart className="h-5 w-5" />
                <span className="font-medium">All-Time Impact</span>
              </div>
              <div>
                <div className="text-4xl font-bold">${stats.allTime.toFixed(2)}</div>
                <div className="text-sm text-muted">Total donations</div>
              </div>
            </Card>

            {/* Lives Impacted */}
            <Card className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <Users className="h-5 w-5" />
                <span className="font-medium">Lives Impacted</span>
              </div>
              <div>
                <div className="text-4xl font-bold">{stats.livesImpacted}</div>
                <div className="text-sm text-muted">People helped</div>
              </div>
            </Card>

            {/* Round-Ups */}
            <Card className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">Round-Ups</span>
              </div>
              <div>
                <div className="text-4xl font-bold">{stats.roundUps}</div>
                <div className="text-sm text-muted">Transactions</div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
