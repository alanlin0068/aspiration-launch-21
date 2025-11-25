import { Card } from "@/components/ui/card";
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

export const CharityCard = ({ name, icon, onSelect }: CharityCardProps) => {
  const image = imageMap[icon as keyof typeof imageMap] || charityCash;

  return (
    <Card
      onClick={onSelect}
      className="w-64 h-80 cursor-pointer rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 hover:scale-[1.02] border-border/50"
    >
      <div className="h-full flex flex-col">
        {/* Image section - top half */}
        <div className="h-48 overflow-hidden">
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Text section - bottom half with frosted-glass effect */}
        <div className="flex-1 flex items-center justify-center p-6 bg-white/20 backdrop-blur-md border border-white/30">
          <h3 className="text-lg font-semibold text-white text-center">{name}</h3>
        </div>
      </div>
    </Card>
  );
};
