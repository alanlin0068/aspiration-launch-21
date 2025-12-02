import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Sprout, Heart, TrendingUp, Users, Calendar, Ambulance } from "lucide-react";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import forestHero from "@/assets/forest-hero.jpg";
import type { Database } from "@/integrations/supabase/types";
type Charity = Database["public"]["Tables"]["charities"]["Row"];
type Donation = Database["public"]["Tables"]["donations"]["Row"];

interface DonationWithCharity extends Donation {
  charities: Charity;
}

interface DonationStats {
  thisMonth: number;
  allTime: number;
  livesImpacted: number;
  roundUps: number;
}
// Tree Growth Component
const TreeGrowth = ({ totalDonated }: { totalDonated: number }) => {
  const getTreeStage = (amount: number) => {
    if (amount >= 10000) return { imagepath: "../../images/stage10.png", message: "You're a forest legend!" };
    if (amount >= 5000) return { imagepath: "../../images/stage9.png", message: "Your forest is flourishing!" };
    if (amount >= 1000) return { imagepath: "../../images/stage8.png", message: "You're a forest champion!" };
    if (amount >= 500) return { imagepath: "../../images/stage7.png", message: "Your impact is towering!" };
    if (amount >= 300) return { imagepath: "../../images/stage6.png", message: "Growing strong and steady!" };
    if (amount >= 200) return { imagepath: "../../images/stage5.png", message: "Reaching new heights!" };
    if (amount >= 100) return { imagepath: "../../images/stage4.png", message: "Thriving and healthy!" };
    if (amount >= 10) return { imagepath: "../../images/stage3.png", message: "Growing nicely!" };
    if (amount >= 1) return { imagepath: "../../images/stage2.png", message: "Just getting started!" };
    return { imagepath: "../../images/stage1.png", message: "Plant your first seed!" };
  };

  const stage = getTreeStage(totalDonated);

  const milestones = [0, 1, 10, 50, 100, 200, 300, 500, 1000, 5000, 10000];
  const currentMilestoneIndex = milestones.findIndex(m => totalDonated < m);
  const nextMilestone = currentMilestoneIndex > 0 ? milestones[currentMilestoneIndex] : 500;
  const previousMilestone = currentMilestoneIndex > 1 ? milestones[currentMilestoneIndex - 1] : 0;
  const progress = totalDonated >= 500 ? 100 : ((totalDonated - previousMilestone) / (nextMilestone - previousMilestone)) * 100;

  return (
    <Card className="p-8 text-center">
      <h2 className="text-2xl font-bold mb-6">Your Impact Tree</h2>

      <div
        className="mb-6 p-8 rounded-2xl transition-all duration-500"
      >
        <img
          className="text-9xl mb-4 transition-all duration-500 hover:scale-110"
          style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))" }}
          src={stage.imagepath}
          alt="Tree Growth Stage"
        />
        <p className="text-muted text-sm">{stage.message}</p>
      </div>

      {totalDonated < 10000 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-muted mb-2">
            <span>${previousMilestone}</span>
            <span className="font-semibold" >
              ${totalDonated.toFixed(2)}
            </span>
            <span>${nextMilestone}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
          <p className="text-xs text-muted mt-2">
            ${(nextMilestone - totalDonated).toFixed(2)} until next stage
          </p>
        </div>
      )}

      {/* <div className="border-t pt-6 mt-6">
        <p className="text-sm text-muted mb-4">Growth Stages</p>
        <div className="grid grid-cols-4 gap-3">
          {[
            { amount: 1, imagepath: "../../images/stage1.png" },
            { amount: 10, imagepath: "../../images/stage2.png" },
            { amount: 50, imagepath: "../../images/stage3.png" },
            { amount: 100, imagepath: "../../images/stage4.png" },
            { amount: 200, imagepath: "../../images/stage5.png" },
            { amount: 300, imagepath: "../../images/stage6.png" },
            { amount: 500, imagepath: "../../images/stage7.png" },
            { amount: 1000, imagepath: "../../images/stage8.png" },
            { amount: 5000, imagepath: "../../images/stage9.png" },
            { amount: 10000, imagepath: "../../images/stage10.png" },
          ].map((milestone) => (
            <div
              key={milestone.amount}
              className={`p-3 rounded-lg border-2 transition-all ${totalDonated >= milestone.amount
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 bg-gray-50 opacity-50'
                }`}
            >
              <img src={milestone.imagepath} className="text-3xl mb-1" />
              <div className="text-xs font-semibold">${milestone.amount}</div>
            </div>
          ))}
        </div>
      </div> */}
    </Card>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState<DonationStats>({
    thisMonth: 0,
    allTime: 0,
    livesImpacted: 0,
    roundUps: 0
  });
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);
  const [donationHistory, setDonationHistory] = useState<DonationWithCharity[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  useEffect(() => {
    checkAuth();
    fetchDonationStats();
    fetchSelectedCharity();
    fetchDonationHistory();
  }, []);
  const checkAuth = async () => {
    const {
      data: {
        session
      }
    } = await supabase.auth.getSession();
    if (!session) {
      navigate("/");
    }
  };
  const fetchSelectedCharity = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;
      const {
        data: selection
      } = await supabase.from("user_charity_selections").select("charity_id").eq("user_id", user.id).order("selected_at", {
        ascending: false
      }).limit(1).maybeSingle();
      if (selection) {
        const {
          data: charity
        } = await supabase.from("charities").select("*").eq("id", selection.charity_id).single();
        if (charity) {
          setSelectedCharity(charity);
        }
      }
    } catch (error: any) {
      console.error("Error fetching charity:", error);
    }
  };

  const fetchDonationHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch donations with charity information using a JOIN
      const { data: donations, error } = await supabase
        .from("donations")
        .select(`
          *,
          charities (
            id,
            name,
            icon,
            description
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(20); // Get last 20 donations

      if (error) throw error;

      if (donations) {
        setDonationHistory(donations as DonationWithCharity[]);
      }
    } catch (error: any) {
      console.error("Error fetching donation history:", error);
      toast({
        title: "Error",
        description: "Failed to load donation history",
        variant: "destructive",
      });
    }
  };

  const fetchDonationStats = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const {
        data: donations,
        error
      } = await supabase.from("donations").select("amount, created_at, type").eq("user_id", user.id).eq("status", "completed");
      if (error) throw error;
      if (donations && donations.length > 0) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthTotal = donations.filter(d => new Date(d.created_at) >= startOfMonth).reduce((sum, d) => sum + Number(d.amount), 0);
        const allTimeTotal = donations.reduce((sum, d) => sum + Number(d.amount), 0);
        const roundUpCount = donations.filter(d => d.type === "round-up").length;
        setStats({
          thisMonth: thisMonthTotal,
          allTime: allTimeTotal,
          livesImpacted: Math.floor(allTimeTotal / 5),
          roundUps: roundUpCount
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">Loading...</div>
    </div>;
  }
  return <div className="min-h-screen relative">
    {/* Forest background bottom */}
    <div className="absolute bottom-0 left-0 right-0 h-1/3" style={{
      backgroundImage: `url(${forestHero})`,
      backgroundSize: "cover",
      backgroundPosition: "center"
    }} />

    {/* Content */}
    <div className="relative z-10 min-h-screen">
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-full">
            <Sprout className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl text-primary font-extrabold">Aspiration</span>
        </div>
        <ProfileDropdown />
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-6 pb-24">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Impact Dashboard</h1>
          <p className="text-muted text-lg">Growing impact, one seed at a time</p>
          {selectedCharity && <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-2xl">{selectedCharity.icon}</span>
            <p className="text-lg text-muted">
              Supporting <span className="font-semibold text-foreground">{selectedCharity.name}</span>
            </p>
          </div>}
        </div>
        <div className="mb-8">
          <TreeGrowth totalDonated={stats.allTime} />
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
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

        {/* Donation History */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Donation History</h2>
          </div>

          {donationHistory.length === 0 ? (
            <div className="text-center py-8 text-muted">
              <p>No donations yet. Start making an impact today!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {donationHistory.map((donation) => (
                <div
                  key={donation.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/20"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{donation.charities.icon}</span>
                    <div>
                      <p className="font-semibold text-foreground">
                        {donation.charities.name}
                      </p>
                      <p className="text-sm">
                        {formatDate(donation.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      ${Number(donation.amount).toFixed(2)}
                    </p>
                    <p className="text-xs capitalize">
                      {donation.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  </div>;
};

export default Dashboard;