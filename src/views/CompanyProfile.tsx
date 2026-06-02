"use client";

import { trpc } from "@/lib/trpc";
import { getCompanyDetails, getJobImage } from "@/lib/job-images";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  Clock,
  Globe,
  Users,
  CalendarDays,
  Briefcase,
  ArrowLeft,
  ChevronRight,
  Star,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface CompanyProfileProps {
  companyName: string;
}

export default function CompanyProfile({ companyName }: CompanyProfileProps) {
  const decodedName = decodeURIComponent(companyName);
  const company = getCompanyDetails(decodedName);

  const { data: jobsData, isLoading } = trpc.jobs.list.useQuery({});

  const companyJobs = jobsData?.jobs
    ? jobsData.jobs.filter(
        (job) => job.company.toLowerCase() === decodedName.toLowerCase()
      )
    : [];

  const rating = 4.5 + Math.random() * 0.4; // Simulated rating between 4.5 and 4.9
  const reviewCount = Math.floor(50 + Math.random() * 200);

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-[3.5rem] z-10">
        <div className="container py-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/jobs"
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Jobs
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium truncate max-w-xs">
            {company.name}
          </span>
        </div>
      </div>

      {/* Banner */}
      <div className="relative h-52 md:h-72 w-full overflow-hidden">
        <img
          src={company.bannerUrl}
          alt={`${company.name} banner`}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      <div className="container max-w-5xl -mt-20 relative z-10 pb-16">
        {/* Company Header Card */}
        <Card className="mb-8 overflow-hidden border-0 shadow-xl bg-card text-card-foreground">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              {/* Logo */}
              <div className="h-20 w-20 shrink-0 rounded-2xl overflow-hidden shadow-lg border-2 border-border bg-card -mt-14 sm:-mt-16">
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    {company.name}
                  </h1>
                  <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Verified Employer
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground font-medium">
                  {company.industry}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(rating)
                            ? "fill-amber-400 text-amber-400"
                            : i < rating
                            ? "fill-amber-400/50 text-amber-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({reviewCount} reviews)
                  </span>
                </div>

                {/* Quick stats row */}
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary/70 shrink-0" />
                    {company.hq}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-primary/70 shrink-0" />
                    {company.size}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-primary/70 shrink-0" />
                    Founded {company.founded}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Globe className="h-4 w-4 text-primary/70 shrink-0" />
                    <a
                      href={`https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors underline underline-offset-2"
                    >
                      {company.website}
                    </a>
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Left - About & Jobs */}
          <div className="md:col-span-2 space-y-6">
            {/* About Section */}
            <Card className="border border-border bg-card shadow-sm">
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  About {company.name}
                </h2>
                <p className="text-sm leading-7 text-muted-foreground">
                  {company.bio}
                </p>
              </CardContent>
            </Card>

            {/* Open Positions */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Open Positions
                {companyJobs.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {companyJobs.length}
                  </Badge>
                )}
              </h2>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Card key={i} className="animate-pulse overflow-hidden">
                      <div className="flex">
                        <div className="h-28 w-40 bg-muted shrink-0" />
                        <CardContent className="pt-4 space-y-3 flex-1">
                          <div className="h-5 rounded bg-muted w-3/4" />
                          <div className="h-4 rounded bg-muted w-1/2" />
                          <div className="h-4 rounded bg-muted w-full" />
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : companyJobs.length > 0 ? (
                <div className="space-y-4">
                  {companyJobs.map((job) => {
                    const jobImage = getJobImage(
                      job.id,
                      job.company,
                      job.title
                    );
                    return (
                      <Link
                        key={job.id}
                        href={`/jobs/${job.id}`}
                        className="group block"
                      >
                        <Card className="border border-border hover:shadow-md hover:border-primary/30 transition-all duration-300 overflow-hidden">
                          <div className="flex flex-col sm:flex-row">
                            <div className="h-36 sm:h-auto sm:w-40 shrink-0 overflow-hidden">
                              <img
                                src={jobImage}
                                alt={job.title}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            </div>
                            <CardContent className="pt-4 pb-4 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className="bg-primary/5 text-primary border-primary/10 font-medium text-[10px] tracking-wide uppercase px-2 py-0.5">
                                  {job.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {job.level}
                                </span>
                              </div>
                              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                {job.title}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                                {job.description}
                              </p>
                              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-4">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {job.location}
                                  </span>
                                  <span className="font-semibold text-primary text-sm">
                                    {job.salary}
                                  </span>
                                </div>
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                  View Details{" "}
                                  <ArrowRight className="h-3 w-3" />
                                </span>
                              </div>
                            </CardContent>
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <Card className="border border-border/80 bg-muted/10">
                  <CardContent className="text-center py-12">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
                    <h3 className="text-lg font-bold text-foreground mb-1">
                      No Open Positions
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                      {company.name} doesn't have any active job openings right
                      now. Check back soon!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="space-y-4">
            {/* Quick Info */}
            <Card className="border border-border bg-card shadow-sm">
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-semibold text-foreground">
                  Company Details
                </h3>
                {[
                  {
                    icon: Building2,
                    label: "Industry",
                    value: company.industry,
                  },
                  { icon: Users, label: "Company Size", value: company.size },
                  { icon: MapPin, label: "Headquarters", value: company.hq },
                  {
                    icon: CalendarDays,
                    label: "Founded",
                    value: company.founded,
                  },
                  { icon: Globe, label: "Website", value: company.website },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="border shadow-sm bg-primary text-primary-foreground border-none">
              <CardContent className="pt-6 pb-5 text-center">
                <p className="text-sm font-medium opacity-90 mb-1">
                  Active Openings
                </p>
                <p className="text-3xl font-extrabold mb-4">
                  {companyJobs.length}
                </p>
                <Button
                  asChild
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
                >
                  <Link href="/jobs">Browse All Jobs</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Back */}
            <Button
              asChild
              variant="outline"
              className="w-full gap-2 text-foreground border-border bg-background hover:bg-muted"
            >
              <Link href="/jobs">
                <ArrowLeft className="h-4 w-4" />
                Back to Listings
              </Link>
            </Button>
          </aside>
        </div>
      </div>
    </div>
  );
}
