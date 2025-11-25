import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, LogOut, Heart, CreditCard, Lock, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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

  const handleChangeCharity = () => {
    setIsOpen(false);
    navigate("/charity-selection");
  };

  const handleChangePayment = () => {
    setIsOpen(false);
    toast({
      title: "Coming Soon",
      description: "Payment method update will be available soon.",
    });
  };

  const handleChangePassword = async () => {
    setIsOpen(false);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return;

    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth`,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for a password reset link.",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete user data from tables
      await supabase.from("user_charity_selections").delete().eq("user_id", user.id);
      await supabase.from("donations").delete().eq("user_id", user.id);
      await supabase.from("payment_methods").delete().eq("user_id", user.id);
      await supabase.from("profiles").delete().eq("id", user.id);

      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
      });

      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    setShowDeleteDialog(false);
  };

  return (
    <>
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
            <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-background border border-border z-20 py-1">
              <button
                onClick={handleChangeCharity}
                className="w-full px-4 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2 text-foreground"
              >
                <Heart className="h-4 w-4" />
                Change Charity
              </button>
              <button
                onClick={handleChangePayment}
                className="w-full px-4 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2 text-foreground"
              >
                <CreditCard className="h-4 w-4" />
                Change Payment Method
              </button>
              <button
                onClick={handleChangePassword}
                className="w-full px-4 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2 text-foreground"
              >
                <Lock className="h-4 w-4" />
                Change Password
              </button>
              <div className="my-1 h-px bg-border" />
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowDeleteDialog(true);
                }}
                className="w-full px-4 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2 text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </button>
              <div className="my-1 h-px bg-border" />
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2 text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            </div>
          </>
        )}
      </div>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
