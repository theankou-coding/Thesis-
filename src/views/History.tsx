"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/lib/wouter-compat";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import {
  Briefcase,
  Bookmark,
  FileText,
  Loader2,
  Trash2,
  ArrowRight,
  ExternalLink,
  MapPin,
  DollarSign,
  History as HistoryIcon,
  CheckCircle2,
  Clock,
  User,
} from "lucide-react";

type TabType = "applied" | "saved" | "uploads";

export default function History() {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("applied");

  const utils = trpc.useUtils();

  const { data: appliedJobs, isLoading: appliedLoading } = trpc.applications.myApplications.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: savedJobs, isLoading: savedLoading } = trpc.saved.mySaved.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: cvUploads, isLoading: cvLoading } = trpc.cv.myUploads.useQuery(
    undefined,
    { enabled: isAuthenticated && activeTab === "uploads" }
  );

  const unsaveMutation = trpc.saved.unsave.useMutation({
    onSuccess: () => {
      utils.saved.mySaved.invalidate();
      toast.success("Job removed from saved list");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to remove saved job");
    }
  });

  // Load active tab query params on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "applied" || tab === "saved" || tab === "uploads") {
        setActiveTab(tab as TabType);
      }
    }
  }, []);

  const handleRemoveSaved = async (jobId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await unsaveMutation.mutateAsync({ jobId });
    } catch (e) {
      console.error(e);
    }
  };

  const getApplicationStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "applied":
        return { label: "Applied", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" };
      case "reviewing":
        return { label: "Reviewing", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
      case "shortlisted":
        return { label: "Shortlisted", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" };
      case "interview":
        return { label: "Interviewing", color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" };
      case "offered":
        return { label: "Offered", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
      case "rejected":
        return { label: "Rejected", color: "bg-rose-500/10 text-rose-500 border-rose-500/20" };
      default:
        return { label: status, color: "bg-muted text-muted-foreground border-border" };
    }
  };

  const getApplicationDate = (dateString: string | null) => {
    if (!dateString) return "Recently";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container py-20 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-muted-foreground text-sm">Loading your history…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-24 text-center max-w-md mx-auto">
        <div className="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
          <HistoryIcon className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Sign in to view your history</h1>
        <p className="text-muted-foreground mb-6">
          Track your job applications, saved listings, and uploaded CV files.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild>
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
          <Link href="/register">
            <Button variant="outline">Create Account</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isTabLoading = activeTab === "applied" ? appliedLoading : activeTab === "saved" ? savedLoading : cvLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-gradient-to-br from-primary/10 via-background to-accent/5">
        <div className="container py-12 max-w-5xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                <HistoryIcon className="h-8 w-8 text-primary" />
                History & Activity
              </h1>
              <p className="mt-2 text-muted-foreground text-sm">
                Monitor your applications progress and view bookmarked opportunities.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/jobs">
                <Button variant="outline" size="sm">
                  Search Jobs
                </Button>
              </Link>
              <Link href="/upload-cv">
                <Button size="sm">Upload CV</Button>
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-border mt-10 gap-6">
            {(
              [
                { id: "applied", label: "Applications", count: appliedJobs?.length, icon: Briefcase },
                { id: "saved", label: "Saved Jobs", count: savedJobs?.length, icon: Bookmark },
                { id: "uploads", label: "Uploaded CVs", count: cvUploads?.length, icon: FileText },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-4 text-sm font-semibold transition-all relative ${
                    active
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {tab.count !== undefined && tab.count !== null && (
                    <Badge
                      variant={active ? "default" : "secondary"}
                      className="ml-1 text-[10px] px-1.5 py-0"
                    >
                      {tab.count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="container py-10 max-w-5xl">
        {isTabLoading ? (
          <div className="text-center py-20">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground text-sm">Loading activity data…</p>
          </div>
        ) : activeTab === "applied" ? (
          /* Applied Tab */
          appliedJobs && appliedJobs.length > 0 ? (
            <div className="space-y-4">
              {appliedJobs.map((app) => {
                const job = app.job;
                const statusStyles = getApplicationStatusStyles(app.status);
                const appDate = getApplicationDate(app.appliedAt);
                return (
                  <Link href={`/jobs/${job.id}`} key={app.id} className="block group">
                    <Card className="border border-border hover:shadow-md hover:border-primary/20 transition-all duration-300 overflow-hidden">
                      <CardContent className="pt-6 pb-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={`font-semibold text-[10px] tracking-wide uppercase px-2 py-0.5 border ${statusStyles.color}`}>
                                {statusStyles.label}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" /> Applied on {appDate}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mt-2">
                              {job.title}
                            </h3>
                            <p className="text-sm font-semibold text-muted-foreground">
                              {job.company}
                            </p>
                            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {job.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3.5 w-3.5 text-muted-foreground" /> {job.salary}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-0 pt-4 md:pt-0">
                            <span className="text-xs text-muted-foreground font-medium group-hover:text-primary transition-colors flex items-center gap-1">
                              View Details
                              <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <Card className="border border-border/80 bg-muted/10">
              <CardContent className="text-center py-16">
                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-1">No Applications Yet</h3>
                <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                  You haven't submitted any job applications yet. Go search the job listings to apply!
                </p>
                <Link href="/jobs">
                  <Button className="mt-6">Search Jobs</Button>
                </Link>
              </CardContent>
            </Card>
          )
        ) : activeTab === "saved" ? (
          /* Saved Tab */
          savedJobs && savedJobs.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {savedJobs.map((s) => {
                const job = s.job;
                return (
                  <Link href={`/jobs/${job.id}`} key={s.id} className="block group">
                    <Card className="border border-border hover:shadow-md hover:border-primary/20 transition-all duration-300 h-full flex flex-col justify-between">
                      <CardContent className="pt-6 flex flex-col justify-between h-full">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <Badge className="bg-primary/5 text-primary border-primary/10 font-semibold text-[10px] tracking-wide uppercase px-2 py-0.5 animate-none">
                              {job.type}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mt-1 -mr-1"
                              onClick={(e) => handleRemoveSaved(job.id, e)}
                              title="Remove from saved"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {job.title}
                          </h3>
                          <p className="text-sm font-semibold text-muted-foreground">{job.company}</p>
                          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mt-2">
                            {job.description}
                          </p>
                        </div>

                        <div className="border-t border-border/60 pt-4 mt-4 flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {job.location}
                          </span>
                          <span className="font-bold text-primary">{job.salary}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <Card className="border border-border/80 bg-muted/10">
              <CardContent className="text-center py-16">
                <Bookmark className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-1">No Saved Jobs</h3>
                <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                  You haven't bookmarked any jobs yet. Bookmark jobs that catch your eye to keep track of them here.
                </p>
                <Link href="/jobs">
                  <Button className="mt-6">Explore Jobs</Button>
                </Link>
              </CardContent>
            </Card>
          )
        ) : (
          /* Uploads Tab */
          cvUploads && cvUploads.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cvUploads.map((cv) => (
                <Card key={cv.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <FileText className="h-8 w-8 text-primary shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate" title={cv.fileName}>
                          {cv.fileName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Uploaded {new Date(cv.createdAt).toLocaleDateString()}
                        </p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {cv.mimeType}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                      <a href={cv.fileUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-3.5 w-3.5" /> View File
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-sm">
              <CardContent className="py-16 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <p className="mt-4 text-muted-foreground text-sm">
                  No CVs uploaded yet. Upload your first CV to get started with AI job matching.
                </p>
                <Link href="/upload-cv">
                  <Button className="mt-6">Upload CV</Button>
                </Link>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
}
