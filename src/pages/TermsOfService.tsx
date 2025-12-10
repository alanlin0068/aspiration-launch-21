import { Button } from "@/components/ui/button";
import { ArrowLeft, Sprout } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-full">
              <Sprout className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-[#059467]">Aspiration</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
          
          <p className="text-muted-foreground mb-6">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using Aspiration ("the Service"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground">
              Aspiration is a charitable giving platform that enables users to make donations to partner charities 
              through round-up contributions from their online purchases. We facilitate the connection between 
              donors and verified charitable organizations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground">
              To use certain features of the Service, you must create an account. You are responsible for:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete information</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Donations</h2>
            <p className="text-muted-foreground">
              All donations made through Aspiration are voluntary and non-refundable. We commit to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2">
              <li>Transferring 100% of your donations to your selected charity</li>
              <li>Providing transparent records of your donation history</li>
              <li>Partnering only with verified and reputable charitable organizations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Privacy</h2>
            <p className="text-muted-foreground">
              Your privacy is important to us. We collect and use your personal information only as described 
              in our Privacy Policy. By using the Service, you consent to our collection and use of your 
              information as outlined therein.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Modifications to Service</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify, suspend, or discontinue any part of the Service at any time. 
              We will make reasonable efforts to notify users of significant changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Aspiration is provided "as is" without warranties of any kind. We shall not be liable for any 
              indirect, incidental, special, or consequential damages arising from your use of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about these Terms of Service, please contact us through the app 
              or reach out to our support team.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
