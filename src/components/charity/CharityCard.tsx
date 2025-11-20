import { Button } from "@/components/ui/button";
import { Globe, Droplets, Utensils, PawPrint, ChevronRight } from "lucide-react";

interface CharityCardProps {
  name: string;
  icon: string;
  onSelect: () => void;
}

const iconMap = {
  globe: Globe,
  droplets: Droplets,
  utensils: Utensils,
  "paw-print": PawPrint,
};

export const CharityCard = ({ name, icon, onSelect }: CharityCardProps) => {
  const Icon = iconMap[icon as keyof typeof iconMap] || Globe;

  return (
    <Button
      onClick={onSelect}
      variant="outline"
      className="w-full max-w-md h-auto py-6 px-8 bg-primary hover:bg-primary/90 border-0 text-foreground hover:text-foreground rounded-full transition-all duration-200 hover:scale-105"
    >
      <div className="flex items-center justify-between w-full gap-4">
        <div className="flex items-center gap-4">
          <Icon className="h-8 w-8" />
          <span className="text-xl font-semibold">{name}</span>
        </div>
        <ChevronRight className="h-6 w-6" />
      </div>
    </Button>
  );
};
