import { Heart, Trees, Droplets, Users } from "lucide-react";

const stats = [
  { icon: Users, value: "2M+", label: "Active Members" },
  { icon: Heart, value: "$15M+", label: "Total Donated" },
  { icon: Trees, value: "500K+", label: "Trees Planted" },
  { icon: Droplets, value: "100K+", label: "Clean Water Access" },
];

export const ImpactStats = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-bold text-primary-foreground mb-4">
          Join millions making an impact
        </h2>
        <p className="text-xl text-primary-foreground/90">
          Here's what we've achieved together
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {stats.map((stat) => (
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
                  {stat.value}
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
