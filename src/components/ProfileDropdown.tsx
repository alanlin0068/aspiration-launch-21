import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out successfully",
        description: "See you next time!",
      });
      
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
        aria-label="Profile menu"
      >
        <User className="h-5 w-5 text-primary" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-background border border-border z-20">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-2 text-foreground rounded-lg"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </div>
        </>
      )}
    </div>
  );
};
