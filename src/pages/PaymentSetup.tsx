import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Sprout, CreditCard } from "lucide-react";
import forestHero from "@/assets/forest-hero.jpg";

const PaymentSetup = () => {
  const { charityId } = useParams<{ charityId: string }>();
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create payment method record
      const { error: paymentError } = await supabase
        .from("payment_methods")
        .upsert({
          user_id: user.id,
          is_active: true,
          round_up_enabled: true,
        });

      if (paymentError) throw paymentError;

      // Create initial donation record
      const { error: donationError } = await supabase
        .from("donations")
        .insert({
          user_id: user.id,
          charity_id: charityId,
          amount: 0.25,
          type: "round-up",
          status: "completed",
        });

      if (donationError) throw donationError;

      toast({
        title: "Success!",
        description: "Round-up donations enabled successfully!",
      });
      
      navigate("/dashboard");
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
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-full">
              <Sprout className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Aspiration</span>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-6xl mx-auto px-6 pb-24">
          <h1 className="text-4xl font-bold text-center mb-12">
            Set up Round-Up Donations
          </h1>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Left column - Payment form */}
            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    stripe
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card number</Label>
                  <div className="relative">
                    <Input
                      id="cardNumber"
                      type="text"
                      placeholder="1234 1234 1234 1234"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      maxLength={19}
                      required
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                      <CreditCard className="h-4 w-4 text-muted" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiration date</Label>
                    <Input
                      id="expiryDate"
                      type="text"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      maxLength={5}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cvv">Security code</Label>
                    <Input
                      id="cvv"
                      type="text"
                      placeholder="CVV"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      maxLength={4}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Confirm"}
                </Button>
              </form>
            </Card>

            {/* Right column - Example visualization */}
            <Card className="p-8 bg-accent">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted">Fries</p>
                    <p className="text-sm text-muted">1/1/21</p>
                  </div>
                  <p className="text-lg font-semibold">$2.75</p>
                </div>

                <div className="bg-primary text-primary-foreground rounded-lg p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sprout className="h-5 w-5" />
                    <span className="font-medium">Round-Up</span>
                  </div>
                  <p className="text-3xl font-bold">+$0.25</p>
                </div>

                <div className="text-center text-sm text-muted">
                  Every purchase rounds up to the nearest dollar, automatically donating the difference to your selected charity.
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PaymentSetup;
