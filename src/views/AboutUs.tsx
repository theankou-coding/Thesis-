"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/wouter-compat";
import {
  Users,
  Target,
  Zap,
  Shield,
  Globe,
  Heart,
  ArrowRight,
  Star,
  TrendingUp,
  Award,
} from "lucide-react";

const stats = [
  { value: "50K+", label: "Jobs Listed", icon: TrendingUp },
  { value: "120K+", label: "Active Candidates", icon: Users },
  { value: "98%", label: "Match Accuracy", icon: Star },
  { value: "2,000+", label: "Partner Companies", icon: Award },
];

const values = [
  {
    icon: Target,
    title: "Precision Matching",
    description:
      "Our AI engine analyzes your skills, experience, and career goals to deliver job recommendations that genuinely fit — not just keyword matches.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Your personal data and CV content are encrypted and never sold. You control what employers see and when.",
  },
  {
    icon: Zap,
    title: "Speed & Simplicity",
    description:
      "From upload to shortlist in seconds. We remove the friction of job hunting so you can focus on what matters — preparing for your next opportunity.",
  },
  {
    icon: Heart,
    title: "Candidate-Centric",
    description:
      "Built for job seekers first. Every feature we ship is designed to give candidates a fairer, more transparent hiring experience.",
  },
  {
    icon: Globe,
    title: "Borderless Opportunities",
    description:
      "Remote, hybrid, international — we surface roles across borders so your career isn't limited by geography.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description:
      "We learn from every interaction on the platform to continuously improve recommendations for the whole community.",
  },
];

const team = [
  {
    name: "Thanh Khanh",
    role: "Co-Founder & CEO",
    initials: "TK",
    color: "from-violet-500 to-purple-600",
    bio: "10+ years in talent acquisition and HR-tech. Previously built hiring products at scale for Fortune 500 companies.",
  },
  {
    name: "An Nguyen",
    role: "CTO & AI Lead",
    initials: "AN",
    color: "from-blue-500 to-cyan-600",
    bio: "ML engineer with deep experience in NLP and recommendation systems. Obsessed with making AI genuinely useful for people.",
  },
  {
    name: "Linh Pham",
    role: "Head of Product",
    initials: "LP",
    color: "from-emerald-500 to-teal-600",
    bio: "Former UX researcher turned product leader. Champions accessible, inclusive design in every sprint.",
  },
  {
    name: "Minh Tran",
    role: "Head of Growth",
    initials: "MT",
    color: "from-rose-500 to-pink-600",
    bio: "Growth strategist who has helped three startups reach 100K users. Passionate about connecting talent with opportunity at scale.",
  },
];

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/5 py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
        </div>
        <div className="container relative text-center max-w-3xl mx-auto">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary px-4 py-1 text-sm font-medium">
            Our Story
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight mb-6">
            We're on a mission to make{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              hiring human again
            </span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            JOB CV was founded by a team frustrated with cold, impersonal job boards. We built an AI-powered platform
            where every candidate's unique story gets matched to opportunities that truly fit — not just buzzwords on a
            page.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center group">
                <div className="flex items-center justify-center mb-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground">{value}</p>
                <p className="text-sm text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 container max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="outline" className="mb-3 border-accent/40 text-accent-foreground text-xs font-semibold uppercase tracking-wider">
              How it started
            </Badge>
            <h2 className="text-3xl font-bold text-foreground mb-5">
              Born from frustration, built with purpose
            </h2>
            <div className="space-y-4 text-muted-foreground leading-7">
              <p>
                In 2023, our founders were navigating their own career transitions. They applied to dozens of jobs,
                received generic rejections, and struggled to understand why their profiles weren't resonating with the
                right employers.
              </p>
              <p>
                The problem wasn't a lack of talent — it was a broken system that couldn't see beyond keywords. So they
                built JOB CV: a platform that reads CVs like a human recruiter, understands context, and delivers
                recommendations that actually make sense.
              </p>
              <p>
                Today, JOB CV connects tens of thousands of candidates with opportunities every month, powered by a
                state-of-the-art AI engine that keeps getting smarter.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl blur-2xl" />
            <Card className="relative border-border shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary/60" />
              <CardContent className="p-8 space-y-6">
                {[
                  { year: "2023", milestone: "Founded in Ho Chi Minh City, Vietnam" },
                  { year: "2024", milestone: "Launched AI-powered CV matching engine" },
                  { year: "2024", milestone: "Reached 50,000 active users" },
                  { year: "2025", milestone: "Expanded to 10 countries across Southeast Asia" },
                  { year: "2026", milestone: "2,000+ company partners onboarded" },
                ].map(({ year, milestone }) => (
                  <div key={year + milestone} className="flex items-start gap-4">
                    <span className="shrink-0 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                      {year}
                    </span>
                    <p className="text-sm text-foreground">{milestone}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/20 border-y border-border">
        <div className="container">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3 border-primary/30 text-primary text-xs font-semibold uppercase tracking-wider">
              What we stand for
            </Badge>
            <h2 className="text-3xl font-bold text-foreground">Our Core Values</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Every product decision, every feature, every line of code is guided by these principles.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {values.map(({ icon: Icon, title, description }) => (
              <Card
                key={title}
                className="border-border bg-card shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
              >
                <CardContent className="pt-6 pb-5">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 container max-w-5xl">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-3 border-accent/40 text-accent-foreground text-xs font-semibold uppercase tracking-wider">
            The people behind the platform
          </Badge>
          <h2 className="text-3xl font-bold text-foreground">Meet the Team</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            A diverse group of engineers, designers, and career experts united by one goal: helping you land the right job.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map(({ name, role, initials, color, bio }) => (
            <Card
              key={name}
              className="border-border bg-card shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center overflow-hidden"
            >
              <div className={`h-1 bg-gradient-to-r ${color}`} />
              <CardContent className="pt-8 pb-6">
                <div
                  className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${color} text-white font-bold text-xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
                >
                  {initials}
                </div>
                <h3 className="font-semibold text-foreground">{name}</h3>
                <p className="text-xs text-primary font-medium mt-0.5 mb-3">{role}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/5 border-t border-border">
        <div className="container text-center max-w-2xl">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to find your next role?</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Join over 120,000 professionals who use JOB CV to discover smarter career opportunities.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="rounded-full px-8 font-semibold gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/jobs">
              <Button size="lg" variant="outline" className="rounded-full px-8 font-semibold gap-2">
                Browse Jobs
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
