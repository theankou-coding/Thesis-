"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import {
  Briefcase,
  Building2,
  Calendar,
  FileText,
  Loader2,
  Plus,
  Trash2,
  MapPin,
  DollarSign,
  User,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Eye,
} from "lucide-react";
import Link from "next/link";

type TabType = "overview" | "post-job" | "manage-jobs";

interface ImageUploadPreview {
  content: string; // base64
  name: string;
  mime: string;
  isPrimary: boolean;
  previewUrl: string;
}

export default function HrDashboard() {
  const { user, isAuthenticated, loading, refresh } = useAuth();
  const utils = trpc.useUtils();

  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Registration states
  const [regCompany, setRegCompany] = useState("");
  const [regJobTitle, setRegJobTitle] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Post job states
  const [jobTitle, setJobTitle] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobType, setJobType] = useState("Full-time");
  const [jobLevel, setJobLevel] = useState("Mid-level");
  const [jobSalary, setJobSalary] = useState("");
  const [jobSkills, setJobSkills] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [uploadedImages, setUploadedImages] = useState<ImageUploadPreview[]>([]);

  // Queries
  const { data: hrProfile, isLoading: hrLoading } = trpc.hr.me.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "hr",
  });

  const { data: myJobs, isLoading: jobsLoading } = trpc.hr.myJobs.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "hr",
  });

  // Mutations
  const registerMutation = trpc.hr.register.useMutation({
    onSuccess: async () => {
      toast.success("Successfully registered as HR Partner!");
      await refresh();
      utils.hr.me.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Registration failed");
    },
  });

  const postJobMutation = trpc.hr.postJob.useMutation({
    onSuccess: () => {
      toast.success("Job posted successfully!");
      // Reset form
      setJobTitle("");
      setJobLocation("");
      setJobSalary("");
      setJobSkills("");
      setJobDescription("");
      setUploadedImages([]);
      setActiveTab("manage-jobs");
      utils.hr.myJobs.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to post job");
    },
  });

  const deleteJobMutation = trpc.hr.deleteJob.useMutation({
    onSuccess: () => {
      toast.success("Job deleted successfully");
      utils.hr.myJobs.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete job");
    },
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regCompany.trim()) {
      toast.error("Company name is required");
      return;
    }
    setIsRegistering(true);
    try {
      await registerMutation.mutateAsync({
        company: regCompany,
        jobTitle: regJobTitle || undefined,
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !jobLocation.trim() || !jobSalary.trim() || !jobSkills.trim() || !jobDescription.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const payload = {
      title: jobTitle,
      location: jobLocation,
      type: jobType,
      level: jobLevel,
      salary: jobSalary,
      skills: jobSkills,
      description: jobDescription,
      images: uploadedImages.length > 0 
        ? uploadedImages.map(({ content, name, mime, isPrimary }) => ({ content, name, mime, isPrimary }))
        : undefined,
    };

    postJobMutation.mutate(payload);
  };

  const handleDeleteJob = async (jobId: number) => {
    if (confirm("Are you sure you want to delete this job posting? This action cannot be undone.")) {
      try {
        await deleteJobMutation.mutateAsync({ id: jobId });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (uploadedImages.length + files.length > 5) {
      toast.error("You can upload a maximum of 5 images");
      return;
    }

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 2MB limit`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const previewUrl = URL.createObjectURL(file);
        const base64 = (reader.result as string).split(",")[1];
        setUploadedImages((prev) => [
          ...prev,
          {
            content: base64,
            name: file.name,
            mime: file.type,
            isPrimary: prev.length === 0, // Set first image as primary by default
            previewUrl,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // If we deleted the primary image, make the first remaining image primary
      if (prev[index]?.isPrimary && updated.length > 0) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  const setPrimaryImage = (index: number) => {
    setUploadedImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  if (loading) {
    return (
      <div className="container py-20 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-muted-foreground text-sm">Loading HR portal…</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container py-24 text-center max-w-md mx-auto">
        <div className="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
          <Building2 className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Sign in to access HR Portal</h1>
        <p className="text-muted-foreground mb-6">
          You must be logged in to manage job listings, review applicant matches, and post positions.
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

  // Not registered as HR Partner screen
  if (user.role !== "hr") {
    return (
      <div className="container py-12 max-w-2xl">
        <Card className="border border-border shadow-lg">
          <CardHeader className="text-center pt-8">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-extrabold">Register as HR Partner</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-2">
              Post job opportunities, manage applications, and find candidates using AI matching tools.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8 px-8">
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="company-name" className="font-semibold text-foreground">Company Name <span className="text-destructive">*</span></Label>
                <Input
                  id="company-name"
                  placeholder="e.g. Acme Tech Solutions"
                  value={regCompany}
                  onChange={(e) => setRegCompany(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hr-title" className="font-semibold text-foreground">Your Role / Job Title</Label>
                <Input
                  id="hr-title"
                  placeholder="e.g. Recruiting Manager"
                  value={regJobTitle}
                  onChange={(e) => setRegJobTitle(e.target.value)}
                  className="h-11"
                />
              </div>

              <Button type="submit" className="w-full h-11 font-semibold" disabled={isRegistering}>
                {isRegistering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Create Recruiter Account"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Info */}
      <div className="border-b border-border bg-gradient-to-br from-primary/10 via-background to-accent/5">
        <div className="container py-10 max-w-5xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-md border">
                {hrProfile?.company ? hrProfile.company[0].toUpperCase() : <Building2 className="h-6 w-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground">{hrProfile?.company || "HR Partner"}</h1>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-medium">
                    Verified Recruiter
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Logged in as <span className="font-semibold">{user.name?.split(":::")[0]}</span> ({hrProfile?.jobTitle || "Recruiter"})
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button onClick={() => setActiveTab("post-job")} variant={activeTab === "post-job" ? "default" : "outline"} size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Post a Job
              </Button>
              <Button onClick={() => setActiveTab("manage-jobs")} variant={activeTab === "manage-jobs" ? "default" : "outline"} size="sm" className="gap-2">
                <Briefcase className="h-4 w-4" /> Manage Jobs
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-border mt-10 gap-6">
            {[
              { id: "overview", label: "Dashboard Overview" },
              { id: "manage-jobs", label: "Manage Listings" },
              { id: "post-job", label: "Post new job" },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`pb-4 text-sm font-semibold transition-all relative ${
                    active
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="container py-8 max-w-5xl">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid sm:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground font-medium">Active Postings</span>
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold tracking-tight">
                      {jobsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : myJobs?.length ?? 0}
                    </span>
                    <span className="text-xs text-muted-foreground">positions</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground font-medium">Company Account</span>
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="mt-2">
                    <span className="text-xl font-bold truncate block max-w-xs">{hrProfile?.company}</span>
                    <span className="text-xs text-muted-foreground">Joined {hrProfile?.createdAt ? new Date(hrProfile.createdAt).toLocaleDateString() : "N/A"}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground font-medium">Recruiter Verification</span>
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-xl font-bold text-emerald-600">Active</span>
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/5 text-[10px] px-1.5 py-0.5">Verified</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Overview Description */}
            <Card className="border border-border/80">
              <CardHeader>
                <CardTitle className="text-lg">Recruiting Dashboard</CardTitle>
                <CardDescription>Use this panel to handle recruitment workflows for your company.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Welcome to your HR Portal! You are authorized to post, edit and remove job opportunities on behalf of <span className="font-semibold text-foreground">{hrProfile?.company}</span>. 
                  All postings will immediately display to job seekers in the primary job listings, and users can upload their CVs which will be matched using AI capabilities.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button size="sm" className="font-medium" onClick={() => setActiveTab("post-job")}>Post first position</Button>
                  <Button size="sm" variant="outline" className="font-medium" onClick={() => setActiveTab("manage-jobs")}>Manage posted listings</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "manage-jobs" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Your Job Postings</h2>
              <p className="text-sm text-muted-foreground">
                Total posted: <span className="font-semibold">{myJobs?.length ?? 0}</span>
              </p>
            </div>

            {jobsLoading ? (
              <div className="text-center py-20">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-muted-foreground text-sm">Fetching job listings…</p>
              </div>
            ) : myJobs && myJobs.length > 0 ? (
              <div className="grid gap-4">
                {myJobs.map((job) => (
                  <Card key={job.id} className="border border-border hover:shadow-sm transition-all overflow-hidden relative group">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center p-5 gap-4">
                      {/* Job Cover Thumbnail */}
                      <div className="h-16 w-16 rounded-xl bg-muted overflow-hidden shrink-0 border border-border flex items-center justify-center">
                        {job.coverImage ? (
                          <img src={job.coverImage} className="h-full w-full object-cover" alt="Job Cover" />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-[10px] uppercase font-medium">{job.type}</Badge>
                          <Badge variant="secondary" className="text-[10px] font-medium">{job.level}</Badge>
                        </div>
                        <h3 className="text-lg font-bold text-foreground mt-1 truncate">{job.title}</h3>
                        
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
                          <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> {job.salary}</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "N/A"}</span>
                        </div>
                      </div>

                      {/* Manage Actions */}
                      <div className="flex gap-2 w-full sm:w-auto justify-end border-t sm:border-0 pt-3 sm:pt-0">
                        <Button variant="outline" size="sm" asChild className="gap-1.5 h-9">
                          <a href={`/jobs/${job.id}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" /> View Public
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 h-9"
                          onClick={() => handleDeleteJob(job.id)}
                          disabled={deleteJobMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border border-border bg-muted/10">
                <CardContent className="text-center py-16">
                  <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/35 mb-4" />
                  <h3 className="text-lg font-bold text-foreground">No Jobs Posted</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                    You haven't listed any positions for {hrProfile?.company} yet. Start posting jobs now.
                  </p>
                  <Button onClick={() => setActiveTab("post-job")} className="mt-6">Post a New Job</Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "post-job" && (
          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Post a New Job Opening</CardTitle>
              <CardDescription>Fill out the fields to publish a job posting to the applicant feed.</CardDescription>
            </CardHeader>
            <CardContent className="pb-8">
              <form onSubmit={handlePostJob} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="job-title" className="font-semibold text-foreground">Job Title <span className="text-destructive">*</span></Label>
                    <Input
                      id="job-title"
                      placeholder="e.g. Senior Software Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="job-location" className="font-semibold text-foreground">Location <span className="text-destructive">*</span></Label>
                    <Input
                      id="job-location"
                      placeholder="e.g. Remote / Bangkok, Thailand"
                      value={jobLocation}
                      onChange={(e) => setJobLocation(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="job-type" className="font-semibold text-foreground">Job Type</Label>
                    <select
                      id="job-type"
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="job-level" className="font-semibold text-foreground">Experience Level</Label>
                    <select
                      id="job-level"
                      value={jobLevel}
                      onChange={(e) => setJobLevel(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="Junior">Junior</option>
                      <option value="Mid-level">Mid-level</option>
                      <option value="Senior">Senior</option>
                      <option value="Lead">Lead</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="job-salary" className="font-semibold text-foreground">Salary Range <span className="text-destructive">*</span></Label>
                    <Input
                      id="job-salary"
                      placeholder="e.g. $4,000 - $6,000 / mo"
                      value={jobSalary}
                      onChange={(e) => setJobSalary(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job-skills" className="font-semibold text-foreground">Required Skills <span className="text-destructive">*</span></Label>
                  <Input
                    id="job-skills"
                    placeholder="e.g. React, TypeScript, Node.js (comma-separated)"
                    value={jobSkills}
                    onChange={(e) => setJobSkills(e.target.value)}
                    required
                  />
                  <p className="text-[10px] text-muted-foreground">Separate skills with commas so our AI matching engine indexes them correctly.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job-desc" className="font-semibold text-foreground">Job Description <span className="text-destructive">*</span></Label>
                  <Textarea
                    id="job-desc"
                    placeholder="Provide a comprehensive job description, responsibilities, and qualifications..."
                    className="min-h-[160px] bg-background"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    required
                  />
                </div>

                {/* Job cover image uploader */}
                <div className="space-y-3 border-t pt-4">
                  <Label className="font-semibold text-foreground">Job Cover & Office Images (Optional)</Label>
                  <div className="flex items-center gap-4">
                    <Label htmlFor="image-upload" className="cursor-pointer flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-lg border border-dashed border-border/80 font-medium text-xs transition-colors">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" /> Upload Image
                    </Label>
                    <input
                      id="image-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadedImages.length >= 5}
                    />
                    <span className="text-xs text-muted-foreground">Up to 5 images, under 2MB each. JPG, PNG supported.</span>
                  </div>

                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3">
                      {uploadedImages.map((img, idx) => (
                        <div key={idx} className={`relative border rounded-xl overflow-hidden group/img transition-all ${img.isPrimary ? "ring-2 ring-primary border-primary" : "border-border"}`}>
                          <img src={img.previewUrl} className="h-20 w-full object-cover" alt="Preview" />
                          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                            {!img.isPrimary && (
                              <button
                                type="button"
                                className="text-[10px] font-bold text-white bg-primary px-1.5 py-0.5 rounded hover:bg-primary/90"
                                onClick={() => setPrimaryImage(idx)}
                              >
                                Cover
                              </button>
                            )}
                            <button
                              type="button"
                              className="text-white hover:text-rose-500"
                              onClick={() => removeUploadedImage(idx)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          {img.isPrimary && (
                            <div className="absolute top-1 left-1 bg-primary text-[8px] text-primary-foreground px-1 py-0.5 rounded font-bold uppercase tracking-wider">
                              Cover
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full h-11 font-semibold mt-4" disabled={postJobMutation.isPending}>
                  {postJobMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting Position...
                    </>
                  ) : (
                    "Publish Job Posting"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
