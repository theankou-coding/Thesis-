import { Link, useLocation } from "@/lib/wouter-compat";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Upload, Briefcase, Brain } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

const features = [
  { icon: FileText, title: "Create Professional CVs", description: "Build a structured, clean CV using our guided form with live preview." },
  { icon: Upload, title: "Upload & Analyze", description: "Upload your existing CV and receive AI-powered career insights instantly." },
  { icon: Briefcase, title: "Smart Job Matching", description: "Get ranked job recommendations based on your skills and experience." },
  { icon: Brain, title: "LLM Career Analysis", description: "Receive natural language career profiles and personalized role rationale." },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const handleGetJobs = () => {
    if (isAuthenticated) {
      navigate("/jobs");
    } else {
      navigate("/login");
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(220,60%,12%)] via-[hsl(220,50%,18%)] to-[hsl(220,40%,25%)] text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4UzAgOC4wNiAwIDE4czguMDYgMTggMTggMTggMTgtOC4wNiAxOC0xOCIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="container relative py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-[hsl(42,78%,52%)]" />
              Professional Career Platform
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Advance Your Career with{" "}
              <span className="text-[hsl(42,78%,52%)]">Intelligent Matching</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-gray-300 md:text-xl">
              Create a professional CV, upload your resume, and receive AI-powered job recommendations tailored to your unique skills and career trajectory.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/create-cv">
                <Button size="lg" className="bg-[hsl(42,78%,52%)] text-[hsl(220,60%,12%)] hover:bg-[hsl(42,78%,58%)] font-semibold px-8">
                  Create Your CV
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8" onClick={handleGetJobs}>
                Get Jobs
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">How It Works</h2>
            <p className="mt-4 text-muted-foreground">A streamlined process from CV creation to career opportunity.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-secondary/30 py-16">
        <div className="container text-center">
          <h2 className="text-2xl font-bold text-foreground">Ready to Find Your Next Role?</h2>
          <p className="mt-3 text-muted-foreground">Join professionals who trust our platform for career advancement.</p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">Get Started Free</Button>
            </Link>
            <Link href="/jobs">
              <Button size="lg" variant="outline">Browse Jobs</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
