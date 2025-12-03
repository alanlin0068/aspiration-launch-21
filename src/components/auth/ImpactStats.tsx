import { Heart, Users, Handshake, HeartPulse } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  activeUsers: number;
  totalDonated: number;
  charitiesPartnered: number;
  livesSaved: number;
}

// Estimate lives saved based on donation amounts to different charities
const estimateLivesSaved = (totalDonated: number): number => {
  // Average cost to save a life through effective charities is estimated at ~$3,500-$5,000
  // Using a conservative estimate of $4,000 per life saved
  return Math.floor(totalDonated / 4000);
};

export const ImpactStats = () => {
  const [stats, setStats] = useState<Stats>({
    activeUsers: 0,
    totalDonated: 0,
    charitiesPartnered: 0,
    livesSaved: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch active users count (profiles)
        const { count: usersCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        // Fetch total donated amount
        const { data: donations } = await supabase
          .from("donations")
          .select("amount");
        
        const totalDonated = donations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;

        // Fetch charities count
        const { count: charitiesCount } = await supabase
          .from("charities")
          .select("*", { count: "exact", head: true });

        setStats({
          activeUsers: usersCount || 0,
          totalDonated,
          charitiesPartnered: charitiesCount || 0,
          livesSaved: estimateLivesSaved(totalDonated),
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatCurrency = (num: number): string => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    }
    return `$${num.toFixed(2)}`;
  };

  const statItems = [
    { icon: Users, value: formatNumber(stats.activeUsers), label: "Active Users" },
    { icon: Heart, value: formatCurrency(stats.totalDonated), label: "Total Donated" },
    { icon: Handshake, value: stats.charitiesPartnered.toString(), label: "Charities Partnered" },
    { icon: HeartPulse, value: formatNumber(stats.livesSaved), label: "Lives Saved" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-bold text-primary-foreground mb-4">
          Join others making an impact
        </h2>
        <p className="text-xl text-primary-foreground/90">
          Here's what we've achieved together
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {statItems.map((stat) => (
          <div
            key={stat.label}
            className="bg-card/10 backdrop-blur-sm rounded-lg p-6 border border-primary-foreground/20"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <stat.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-foreground">
                  {loading ? "..." : stat.value}
                </div>
                <div className="text-primary-foreground/80">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
