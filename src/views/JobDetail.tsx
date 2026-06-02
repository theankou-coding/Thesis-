"use client";

import { trpc } from "@/lib/trpc";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Share2,
  Bookmark,
  Send,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getJobImage, getCompanyDetails } from "@/lib/job-images";

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className ?? ""}`} />;
}

export default function JobDetail() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const { data: job, isLoading } = trpc.jobs.getById.useQuery(
    { id },
    { enabled: !isNaN(id) && id > 0 }
  );

  const { data: user } = trpc.auth.me.useQuery();
  const utils = trpc.useUtils();

  const { data: savedJobs } = trpc.saved.mySaved.useQuery(undefined, { enabled: !!user });
  const { data: appliedJobs } = trpc.applications.myApplications.useQuery(undefined, { enabled: !!user });

  const saveMutation = trpc.saved.save.useMutation({
    onSuccess: () => {
      utils.saved.mySaved.invalidate();
    }
  });

  const unsaveMutation = trpc.saved.unsave.useMutation({
    onSuccess: () => {
      utils.saved.mySaved.invalidate();
    }
  });

  const applyMutation = trpc.applications.submit.useMutation({
    onSuccess: () => {
      utils.applications.myApplications.invalidate();
    }
  });

  const [localSaved, setLocalSaved] = useState<number[]>([]);
  const [localApplied, setLocalApplied] = useState<number[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("saved-jobs");
        if (saved) setLocalSaved(JSON.parse(saved));
        const applied = localStorage.getItem("applied-jobs");
        if (applied) setLocalApplied(JSON.parse(applied));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const isSaved = job ? (user ? (savedJobs?.some(s => s.jobId === job.id) ?? false) : localSaved.includes(job.id)) : false;
  const isApplied = job ? (user ? (appliedJobs?.some(a => a.jobId === job.id) ?? false) : localApplied.includes(job.id)) : false;

  const handleToggleSave = async () => {
    if (!job) return;
    if (user) {
      try {
        if (isSaved) {
          await unsaveMutation.mutateAsync({ jobId: job.id });
          toast.success("Job removed from saved list");
        } else {
          await saveMutation.mutateAsync({ jobId: job.id });
          toast.success("Job added to saved list");
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to update saved job");
      }
    } else {
      try {
        const saved = localStorage.getItem("saved-jobs");
        let ids: number[] = saved ? JSON.parse(saved) : [];
        if (ids.includes(job.id)) {
          ids = ids.filter(x => x !== job.id);
          toast.success("Job removed from saved list");
        } else {
          ids.push(job.id);
          toast.success("Job added to saved list");
        }
        localStorage.setItem("saved-jobs", JSON.stringify(ids));
        setLocalSaved(ids);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleApply = async (targetPath: string) => {
    if (!job) return;
    if (!user) {
      toast.error("Please log in to apply for this job.");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      if (isApplied) {
        toast.info("You have already applied to this job.");
        router.push(targetPath);
        return;
      }
      await applyMutation.mutateAsync({ jobId: job.id });
      toast.success("Application submitted successfully!");
      router.push(targetPath);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit application");
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Job link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="container py-10 max-w-4xl">
        {/* Back */}
        <SkeletonBlock className="h-5 w-28 mb-8" />
        {/* Hero card */}
        <Card className="mb-6">
          <CardContent className="pt-8 pb-6">
            <div className="flex items-start gap-5">
              <SkeletonBlock className="h-16 w-16 rounded-xl shrink-0" />
              <div className="flex-1 space-y-3">
                <SkeletonBlock className="h-7 w-2/3" />
                <SkeletonBlock className="h-4 w-1/3" />
                <div className="flex gap-4 mt-4">
                  {[1, 2, 3].map(i => <SkeletonBlock key={i} className="h-4 w-24" />)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <SkeletonBlock className="h-48 w-full rounded-xl" />
            <SkeletonBlock className="h-32 w-full rounded-xl" />
          </div>
          <SkeletonBlock className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container py-24 text-center">
        <Briefcase className="mx-auto h-16 w-16 text-muted-foreground/40 mb-6" />
        <h1 className="text-2xl font-bold text-foreground">Job Not Found</h1>
        <p className="mt-2 text-muted-foreground mb-8">
          This position may have been filled or removed.
        </p>
        <Button asChild>
          <Link href="/jobs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Link>
        </Button>
      </div>
    );
  }

  const skills = job.skills.split(",").map(s => s.trim()).filter(Boolean);

  const hrProfile = (job as any).hrProfile;
  const companyName = String(hrProfile?.company || job.company);
  const companyInfo = getCompanyDetails(companyName);
  const profileImageUrl = String(hrProfile?.profileImageUrl || companyInfo.logoUrl);
  const dbImages: string[] = ((job as any).images ?? [])
    .map((img: any) => img.imageUrl)
    .filter((url: unknown): url is string => typeof url === "string" && url.trim().length > 0);
  const jobImages = Array.from(
    new Set<string>(
      dbImages.length > 0
        ? dbImages
        : [getJobImage(job.id, companyName, job.title)]
    )
  );

  const postedDate = job.createdAt
    ? new Date(job.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : "Recently";

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav breadcrumb */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-[3.5rem] z-10">
        <div className="container py-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/jobs" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Jobs
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium truncate max-w-xs">{job.title}</span>
        </div>
      </div>

      <div className="container py-8 max-w-5xl">
        <Carousel
          opts={{ align: "start", loop: jobImages.length > 1 }}
          className="mb-6 overflow-hidden rounded-2xl shadow-lg"
        >
          <CarouselContent className="-ml-0">
            {jobImages.map((imageUrl, index) => (
              <CarouselItem key={imageUrl} className="pl-0">
                <div className="h-65 bg-muted md:h-80">
                  <img
                    src={imageUrl}
                    alt={`${job.title} image ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {jobImages.length > 1 && (
            <>
              <CarouselPrevious className="left-3 border-white/50 bg-background/85 shadow-md hover:bg-background" />
              <CarouselNext className="right-3 border-white/50 bg-background/85 shadow-md hover:bg-background" />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
                {jobImages.length} images
              </div>
            </>
          )}
        </Carousel>

        {/* Hero Card */}
        <Card className="mb-6 overflow-hidden border-0 shadow-lg bg-card text-card-foreground">
          <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary/60" />
          <CardContent className="pt-7 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-5">
              {/* Company Logo */}
              <Link href={`/companies/${encodeURIComponent(companyName)}`} className="shrink-0">
                <img
                  src={profileImageUrl}
                  alt={companyName}
                  className="h-16 w-16 rounded-2xl object-cover shadow-md border border-border hover:ring-2 hover:ring-primary/40 transition-all"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge className="bg-accent/15 text-accent-foreground border-accent/30 font-medium">
                    {job.type}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {job.level}
                  </Badge>
                  {isApplied && (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 font-medium">
                      Applied
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                  {job.title}
                </h1>
                <Link
                  href={`/companies/${encodeURIComponent(companyName)}`}
                  className="mt-1 text-base text-muted-foreground font-medium flex items-center gap-1.5 hover:text-primary transition-colors w-fit group/company"
                >
                  <Building2 className="h-4 w-4 shrink-0" />
                  {companyName}
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover/company:opacity-100 transition-opacity" />
                </Link>

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary/70 shrink-0" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-primary/70 shrink-0" />
                    {job.salary}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary/70 shrink-0" />
                    {job.level}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-primary/70 shrink-0" />
                    Posted {postedDate}
                  </span>
                </div>
              </div>

              {/* Action buttons – top right */}
              <div className="flex sm:flex-col gap-2 sm:items-end">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full h-9 w-9 border ${isSaved ? "bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20 hover:text-amber-600" : "hover:bg-muted"}`}
                  title={isSaved ? "Saved" : "Save job"}
                  onClick={handleToggleSave}
                >
                  <Bookmark className={`h-4 w-4 ${isSaved ? "fill-amber-500" : ""}`} />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 border hover:bg-muted" title="Share job" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Body */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left – description + skills */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            <Card className="border border-border bg-card text-card-foreground shadow-sm">
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold text-foreground mb-3">About This Role</h2>
                <p className="text-sm leading-7 text-muted-foreground whitespace-pre-line">
                  {job.description}
                </p>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="border border-border bg-card text-card-foreground shadow-sm">
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-colors dark:border-primary/35 dark:bg-primary/20 dark:text-white"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Why apply callout */}
            {user?.role !== "hr" && (
              <div className="rounded-xl border border-accent/30 bg-accent/5 p-5">
                <h3 className="font-semibold text-foreground mb-2">Ready to apply?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload your CV and let our AI match your profile to this role instantly.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="default" className="gap-2" onClick={() => handleApply("/upload-cv")}>
                    <Send className="h-4 w-4" />
                    {isApplied ? "Applied (Go to Upload)" : "Apply with CV Upload"}
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => handleApply("/create-cv")}>
                    <Briefcase className="h-4 w-4" />
                    Build a Tailored CV
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right – quick info sidebar */}
          <aside className="space-y-4">
            {/* Quick Apply */}
            <Card className="border shadow-sm bg-primary text-primary-foreground border-none">
              <CardContent className="pt-6 pb-5 text-center">
                <p className="text-sm font-medium opacity-90 mb-1">Salary Range</p>
                <p className="text-2xl font-bold mb-4">{job.salary}</p>
                {user?.role !== "hr" ? (
                  <Button
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
                    onClick={() => handleApply("/upload-cv")}
                  >
                    {isApplied ? "Applied Successfully" : "Quick Apply"}
                  </Button>
                ) : (
                  <p className="text-xs opacity-75 font-medium mt-2">
                    Recruiter Account
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Job Overview */}
            <Card className="border border-border bg-card text-card-foreground shadow-sm">
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-semibold text-foreground">Overview</h3>
                {[
                  { icon: Building2, label: "Company", value: companyName, isLink: true },
                  { icon: MapPin, label: "Location", value: job.location },
                  { icon: Briefcase, label: "Type", value: job.type },
                  { icon: Clock, label: "Level", value: job.level },
                  { icon: CalendarDays, label: "Posted", value: postedDate },
                ].map(({ icon: Icon, label, value, isLink }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      {isLink ? (
                        <Link
                          href={`/companies/${encodeURIComponent(value)}`}
                          className="text-sm font-medium text-primary hover:underline truncate block"
                        >
                          {value}
                        </Link>
                      ) : (
                        <p className="text-sm font-medium text-foreground truncate">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Back button */}
            <Button
              variant="outline"
              className="w-full gap-2 text-foreground border-border bg-background hover:bg-muted"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Listings
            </Button>
          </aside>
        </div>
      </div>
    </div>
  );
}
