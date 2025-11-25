import { Card } from "@/components/ui/card";
import { Globe, Droplets, Utensils, PawPrint, ChevronRight } from "lucide-react";
import charityMalaria from "@/assets/charity-malaria.jpg";
import charityCash from "@/assets/charity-cash.jpg";
import charityNutrition from "@/assets/charity-nutrition.jpg";
import charityAnimals from "@/assets/charity-animals.jpg";

interface CharityCardProps {
  name: string;
  icon: string;
  onSelect: () => void;
}

const imageMap = {
  droplets: charityMalaria,
  globe: charityCash,
  utensils: charityNutrition,
  "paw-print": charityAnimals,
};

const iconMap = {
  globe: Globe,
  droplets: Droplets,
  utensils: Utensils,
  "paw-print": PawPrint,
};

export const CharityCard = ({ name, icon, onSelect }: CharityCardProps) => {
  const image = imageMap[icon as keyof typeof imageMap] || charityCash;
  const Icon = iconMap[icon as keyof typeof iconMap] || Globe;

  return (
    <Card
      onClick={onSelect}
      className="w-72 h-32 cursor-pointer rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 hover:scale-[1.02] border-border/50 relative group"
    >
      {/* Background image with reduced brightness/saturation */}
      <div 
        className="absolute inset-0 bg-cover bg-center brightness-[0.6] saturate-[0.7] transition-all duration-200 group-hover:brightness-[0.65]"
        style={{ backgroundImage: `url(${image})` }}
      />
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Content */}
      <div className="relative h-full flex items-center justify-between px-6 py-5">
        <Icon className="h-8 w-8 stroke-[2] text-white flex-shrink-0" />
        <h3 className="flex-1 text-lg font-semibold text-white text-center px-4">{name}</h3>
        <ChevronRight className="h-6 w-6 stroke-[2.5] text-white flex-shrink-0" />
      </div>
    </Card>
  );
};
