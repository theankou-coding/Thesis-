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

const values = [
  {
    icon: Target,
    title: "Precision Matching",
    description:
      "The thesis model analyzes skills, experience, and job requirements to recommend roles that fit beyond simple keyword matches.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "CV content and candidate information are handled carefully so the platform can support responsible academic testing.",
  },
  {
    icon: Zap,
    title: "Speed & Simplicity",
    description:
      "From CV upload to match results, the system keeps the job search flow simple, fast, and easy to understand.",
  },
  {
    icon: Heart,
    title: "Candidate-Centric",
    description:
      "Built around job seekers, the project focuses on clearer recommendations and a more transparent application experience.",
  },
  {
    icon: Globe,
    title: "Local Career Support",
    description:
      "Designed from Phnom Penh, Cambodia, the platform explores how AI can support students and candidates entering the job market.",
  },
  {
    icon: Users,
    title: "Academic Purpose",
    description:
      "JOBLINK is developed as a thesis project to study practical AI-powered CV matching for recruitment workflows.",
  },
];

const team = [
  {
    name: "Loem Theankou",
    role: "Founder",
    initials: "LT",
    color: "from-violet-500 to-purple-600",
    bio: "Thesis project founder and developer, focused on building an AI-assisted CV matching platform for recruitment in Cambodia.",
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
            A thesis project built to make{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              CV matching smarter
            </span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            JOBLINK is an AI-powered thesis project created by Loem Theankou in Phnom Penh, Cambodia. It explores how
            candidate CVs can be analyzed and matched with suitable job opportunities using practical, user-friendly
            recruitment technology.
          </p>
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
              The project is guided by practical goals for a useful, understandable, and responsible thesis system.
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

      {/* Founder */}
      <section className="py-20 container max-w-5xl">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-3 border-accent/40 text-accent-foreground text-xs font-semibold uppercase tracking-wider">
            The person behind the platform
          </Badge>
          <h2 className="text-3xl font-bold text-foreground">Founder</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            JOBLINK is developed as a thesis project by Loem Theankou, with a focus on AI-assisted recruitment and CV
            matching for candidates in Cambodia.
          </p>
        </div>
        <div className="grid max-w-sm mx-auto gap-6">
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
            Try the thesis platform and explore how AI-assisted CV matching can support smarter job applications.
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
