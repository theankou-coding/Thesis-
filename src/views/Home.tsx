import { Link, useLocation } from "@/lib/wouter-compat";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  FileText, Upload, Briefcase, Brain, Search, Users, Building,
  ShieldCheck, Star, MapPin, Clock, ArrowRight, Badge,
  Sparkles, Code2, Palette, BarChart3, Database, Globe,
  CheckCircle2, Zap, Target, TrendingUp,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { getJobImage, getCompanyDetails } from "@/lib/job-images";

/* ─── Static data ─────────────────────────────────────────── */

const features = [
  { icon: FileText, title: "Create Professional CVs", description: "Build a structured, clean CV using our guided form with live preview.", color: "from-blue-500/20 to-blue-600/5", iconColor: "text-blue-500" },
  { icon: Upload, title: "Upload & Analyze", description: "Upload your existing CV and receive AI-powered career insights instantly.", color: "from-violet-500/20 to-violet-600/5", iconColor: "text-violet-500" },
  { icon: Briefcase, title: "Smart Job Matching", description: "Get ranked job recommendations based on your skills and experience.", color: "from-amber-500/20 to-amber-600/5", iconColor: "text-amber-500" },
  { icon: Brain, title: "LLM Career Analysis", description: "Receive natural language career profiles and personalized role rationale.", color: "from-emerald-500/20 to-emerald-600/5", iconColor: "text-emerald-500" },
];

const stats = [
  { icon: Briefcase, count: "12,000+", label: "Active Jobs" },
  { icon: Users, count: "8,000+", label: "Happy Candidates" },
  { icon: Building, count: "450+", label: "Top Employers" },
  { icon: ShieldCheck, count: "99.2%", label: "Match Accuracy" },
];

const steps = [
  { step: "01", icon: FileText, title: "Build or Upload Your CV", description: "Create a polished CV with our guided builder or import your existing one in seconds.", color: "bg-blue-500" },
  { step: "02", icon: Brain, title: "AI Analyzes Your Profile", description: "Our LLM engine reads your skills, experience, and career goals to build your talent profile.", color: "bg-violet-500" },
  { step: "03", icon: Target, title: "Get Matched Instantly", description: "Receive a ranked list of jobs that genuinely fit you — no irrelevant noise.", color: "bg-amber-500" },
  { step: "04", icon: TrendingUp, title: "Apply & Track Progress", description: "One-click apply and monitor every application from your personal dashboard.", color: "bg-emerald-500" },
];

const categories = [
  { icon: Code2, label: "Software Engineering", count: "2,340 jobs", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400", query: "software" },
  { icon: Palette, label: "Design & Creative", count: "890 jobs", color: "bg-pink-500/10 text-pink-600 dark:text-pink-400", query: "design" },
  { icon: BarChart3, label: "Data & Analytics", count: "1,120 jobs", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400", query: "data" },
  { icon: Globe, label: "Marketing & Growth", count: "670 jobs", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", query: "marketing" },
  { icon: Database, label: "Cloud & DevOps", count: "540 jobs", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400", query: "cloud" },
  { icon: Briefcase, label: "Product Management", count: "430 jobs", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400", query: "product" },
];

const companies = [
  { name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
  { name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" },
  { name: "Meta", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg" },
  { name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
  { name: "Netflix", logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" },
];

const testimonials = [
  {
    name: "Sarah Jenkins",
    role: "Senior Frontend Engineer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&h=100&auto=format&fit=crop&crop=face",
    text: "The CV builder is incredible! Coupled with the AI analysis, it matched me with my dream role at a leading fintech startup within days.",
    rating: 5,
    company: "Hired at Stripe",
  },
  {
    name: "Marcus Chen",
    role: "Data Analyst",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&h=100&auto=format&fit=crop&crop=face",
    text: "I was skeptical about AI job matching, but the skill-gap analysis pointed out exactly what was missing on my CV. Extremely helpful.",
    rating: 5,
    company: "Hired at Datadog",
  },
  {
    name: "Elena Rostova",
    role: "Product Manager",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100&h=100&auto=format&fit=crop&crop=face",
    text: "Saved me hours of searching. The recommendations score was spot-on, and the dashboard layout is absolutely premium.",
    rating: 5,
    company: "Hired at Notion",
  },
];

/* ─── Animated counter hook ───────────────────────────────── */
function useCountUp(target: string, isVisible: boolean) {
  const [count, setCount] = useState("0");
  useEffect(() => {
    if (!isVisible) return;
    const num = parseFloat(target.replace(/[^0-9.]/g, ""));
    const suffix = target.replace(/[0-9.]/g, "");
    if (isNaN(num)) { setCount(target); return; }
    let start = 0;
    const duration = 1800;
    const step = 16;
    const increment = num / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= num) { setCount(num % 1 === 0 ? `${num.toFixed(0)}${suffix}` : `${num}${suffix}`); clearInterval(timer); }
      else { setCount(num % 1 === 0 ? `${Math.floor(start)}${suffix}` : `${start.toFixed(1)}${suffix}`); }
    }, step);
    return () => clearInterval(timer);
  }, [isVisible, target]);
  return count;
}

/* ─── Stat Item ───────────────────────────────────────────── */
function StatItem({ icon: Icon, count, label }: { icon: React.ElementType; count: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const animated = useCountUp(count, visible);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className="flex flex-col items-center justify-center p-4 group">
      <div className="p-3 bg-primary/5 rounded-xl text-primary mb-3 group-hover:bg-primary/10 transition-colors">
        <Icon className="h-6 w-6" />
      </div>
      <span className="text-3xl font-extrabold text-foreground tabular-nums">{animated}</span>
      <span className="text-sm text-muted-foreground mt-1">{label}</span>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────── */
export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: jobsData, isLoading: jobsLoading } = trpc.jobs.list.useQuery({});
  const featuredJobs = jobsData?.jobs ? jobsData.jobs.slice(0, 3) : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/jobs?search=${encodeURIComponent(searchQuery.trim())}`);
    else navigate("/jobs");
  };

  const handleGetJobs = () => navigate(isAuthenticated ? "/jobs" : "/login");

  return (
    <div className="bg-background min-h-screen overflow-x-hidden">

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(222,60%,10%)] via-[hsl(222,52%,16%)] to-[hsl(230,44%,22%)] text-white">
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        {/* Glow orbs */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-amber-500/10 blur-[100px]" />

        <div className="container relative py-28 md:py-36">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-md shadow-lg">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Next-Gen AI Career Discovery Platform</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1]">
              Find Your Next Role{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                  with AI Precision
                </span>
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-amber-400/0 via-amber-400 to-amber-400/0" />
              </span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-blue-100/80 max-w-2xl mx-auto md:text-xl">
              Create a custom CV, leverage advanced AI to analyze your strengths, and connect instantly with roles tailored exactly to your experience.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearchSubmit} className="mt-10 mx-auto max-w-2xl bg-white/10 backdrop-blur-md text-white p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-2 border border-white/20">
              <div className="flex-1 flex items-center px-3 gap-2">
                <Search className="h-5 w-5 text-white/60 shrink-0" />
                <Input
                  type="text"
                  placeholder="Job title, skills, or keywords…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-1 bg-transparent text-sm w-full h-11 text-white placeholder:text-white/50"
                />
              </div>
              <Button type="submit" size="lg" className="bg-amber-400 text-[hsl(222,60%,10%)] hover:bg-amber-300 font-bold h-11 px-7 rounded-xl shadow-md shrink-0 transition-all hover:scale-[1.02]">
                Search Jobs
              </Button>
            </form>

            {/* Popular tags */}
            <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
              <span className="text-white/40 text-xs mr-1 self-center">Popular:</span>
              {["React Developer", "Product Manager", "Data Scientist", "UX Designer"].map(tag => (
                <button
                  key={tag}
                  onClick={() => navigate(`/jobs?search=${encodeURIComponent(tag)}`)}
                  className="rounded-full bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1 text-xs text-white/70 hover:text-white transition-all cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Quick CTA pills */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link href="/create-cv">
                <Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm gap-2 rounded-full px-5">
                  <FileText className="h-4 w-4" /> Create My CV
                </Button>
              </Link>
              <Link href="/upload-cv">
                <Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm gap-2 rounded-full px-5">
                  <Upload className="h-4 w-4" /> Upload & Analyze
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] rotate-180">
          <svg className="relative block w-full h-12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" className="fill-background opacity-25" />
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" className="fill-background opacity-50" />
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="fill-background" />
          </svg>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────── */}
      <section className="bg-card py-10 border-b border-border shadow-sm -mt-px">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, idx) => (
              <StatItem key={idx} icon={stat.icon} count={stat.count} label={stat.label} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Trusted Brands ──────────────────────────────────── */}
      <section className="py-10 bg-muted/30 border-b border-border/50">
        <div className="container">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-8">
            Trusted by leaders in tech & business
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50 grayscale hover:opacity-75 transition-opacity">
            {companies.map((c, i) => (
              <img key={i} src={c.logo} alt={c.name} className="h-6 object-contain" />
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section className="py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <Zap className="h-3.5 w-3.5" /> Powerful Features
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Everything You Need to Stand Out</h2>
            <p className="mt-4 text-lg text-muted-foreground">Accelerate your application process with smart tools designed for modern professionals.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="border border-border bg-card hover:shadow-xl transition-all duration-300 group hover:-translate-y-1.5 overflow-hidden">
                <div className={`h-1.5 w-full bg-gradient-to-r ${feature.color.replace("/20", "").replace("/5", "")}`} style={{ background: `linear-gradient(to right, ${feature.iconColor.replace("text-", "").replace("-500", "")}, transparent)` }} />
                <CardContent className="pt-7 pb-6">
                  <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color}`}>
                    <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-b from-muted/10 to-muted/30 border-t border-b border-border/60">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/5 border border-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-600 dark:text-violet-400 mb-4">
              <CheckCircle2 className="h-3.5 w-3.5" /> Simple Process
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">How It Works</h2>
            <p className="mt-4 text-lg text-muted-foreground">From building your profile to landing an offer — all in four easy steps.</p>
          </div>

          <div className="relative">
            {/* Connector line (desktop) */}
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500 opacity-20" />

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, idx) => (
                <div key={idx} className="relative flex flex-col items-center text-center group">
                  <div className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl ${step.color} text-white shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="h-8 w-8" />
                    <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-background border-2 border-border text-[10px] font-black text-foreground">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px] mx-auto">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/register">
              <Button size="lg" className="gap-2 px-8 font-semibold rounded-full">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Browse by Category ──────────────────────────────── */}
      <section className="py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-14">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/5 border border-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-600 dark:text-amber-400 mb-4">
              <Globe className="h-3.5 w-3.5" /> Explore Roles
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Browse by Category</h2>
            <p className="mt-4 text-lg text-muted-foreground">Discover opportunities across the most in-demand tech & business verticals.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => navigate(`/jobs?search=${encodeURIComponent(cat.query)}`)}
                className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200 text-left group cursor-pointer"
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${cat.color.split(" ")[0]}`}>
                  <cat.icon className={`h-6 w-6 ${cat.color.split(" ").slice(1).join(" ")}`} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{cat.label}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{cat.count}</p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Jobs ───────────────────────────────────── */}
      <section className="py-24 bg-muted/20 border-t border-b border-border/60">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-3">
                <Briefcase className="h-3.5 w-3.5" /> Live Openings
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Featured Opportunities</h2>
              <p className="mt-1 text-muted-foreground">High-quality openings currently accepting applications.</p>
            </div>
            <Link href="/jobs">
              <Button variant="outline" className="group gap-2 border-primary/20 text-primary hover:bg-primary/5 shrink-0">
                Browse All Jobs <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {jobsLoading ? (
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse overflow-hidden">
                  <div className="h-44 bg-muted" />
                  <CardContent className="pt-4 space-y-4">
                    <div className="h-5 rounded bg-muted w-2/3" />
                    <div className="h-4 rounded bg-muted w-1/3" />
                    <div className="h-14 rounded bg-muted w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredJobs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {featuredJobs.map((job) => {
                const jobImage = getJobImage(job.id, job.company, job.title);
                const companyInfo = getCompanyDetails(job.company);
                return (
                  <Card key={job.id} className="h-full border border-border bg-card hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col overflow-hidden group">
                    <Link href={`/jobs/${job.id}`} className="block">
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={jobImage}
                          alt={job.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        <Badge className="absolute top-3 left-3 text-[10px] uppercase font-bold tracking-wide bg-white/90 text-foreground backdrop-blur-sm border-0 shadow-sm">
                          {job.type}
                        </Badge>
                        <span className="absolute top-3 right-3 text-sm font-bold text-white bg-primary/80 backdrop-blur-sm px-2.5 py-0.5 rounded-full">
                          {job.salary}
                        </span>
                      </div>
                    </Link>

                    <CardContent className="pt-4 flex flex-col flex-1 space-y-3">
                      <div className="space-y-2">
                        <Link href={`/jobs/${job.id}`}>
                          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {job.title}
                          </h3>
                        </Link>
                        <Link
                          href={`/companies/${encodeURIComponent(job.company)}`}
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                          className="flex items-center gap-2 w-fit group/company"
                        >
                          <img src={companyInfo.logoUrl} alt={companyInfo.name} className="h-5 w-5 rounded-full object-cover border border-border" />
                          <span className="text-sm font-medium text-muted-foreground group-hover/company:text-primary transition-colors">{job.company}</span>
                        </Link>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{job.description}</p>
                      </div>
                      <div className="border-t border-border/60 pt-3 flex items-center justify-between text-xs text-muted-foreground mt-auto">
                        <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                        <span className="flex items-center gap-1.5 capitalize"><Clock className="h-3.5 w-3.5" />{job.level}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No featured positions at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────── */}
      <section className="py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/5 border border-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-4">
              <Star className="h-3.5 w-3.5 fill-current" /> Success Stories
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Candidates Love Us</h2>
            <p className="mt-4 text-lg text-muted-foreground">See how professionals are landing their dream roles with our matching engine.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, idx) => (
              <Card key={idx} className="border border-border/80 bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
                <CardContent className="pt-7 pb-6">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                  </div>
                  <p className="text-sm italic text-muted-foreground mb-6 leading-relaxed">"{t.text}"</p>
                  <div className="border-t border-border/60 pt-4 flex items-center gap-3">
                    <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-border shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-foreground text-sm truncate">{t.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.role}</p>
                    </div>
                    <span className="ml-auto text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-full px-2.5 py-1 whitespace-nowrap shrink-0">
                      {t.company}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(222,60%,12%)] via-[hsl(222,52%,18%)] to-[hsl(230,44%,24%)] text-white py-24">
        <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-blue-600/20 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-24 left-0 h-96 w-96 rounded-full bg-violet-600/15 blur-[100px]" />
        <div className="container text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-md mb-6">
            <Sparkles className="h-4 w-4 text-amber-400" />
            Your Next Chapter Starts Here
          </div>
          <h2 className="text-3xl font-extrabold sm:text-4xl md:text-5xl tracking-tight max-w-2xl mx-auto leading-tight">
            Ready to Find Your Next Career Leap?
          </h2>
          <p className="mt-5 text-lg opacity-80 max-w-xl mx-auto">
            Upload your CV and get matched with our curated listings in minutes — completely free.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-amber-400 text-[hsl(222,60%,10%)] hover:bg-amber-300 font-bold px-9 shadow-lg hover:scale-105 transition-transform rounded-full">
                Get Started Free
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white/25 text-white hover:bg-white/15 hover:text-white hover:border-white/40 px-9 rounded-full backdrop-blur-sm" onClick={handleGetJobs}>
              Browse All Jobs
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-white/50 text-xs">
            {["No credit card required", "Free for job seekers", "AI-powered matching", "Trusted by 8,000+ candidates"].map(b => (
              <span key={b} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> {b}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
