"use client";

import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "@/lib/wouter-compat";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  ArrowRight,
  ExternalLink,
  FileText,
  Loader2,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";

type PendingFile = {
  fileName: string;
  fileContent: string;
  mimeType: string;
  fileSize: number;
};

export default function UploadCV() {
  const { isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedCvId, setSelectedCvId] = useState<number | null>(null);
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null);
  const [cvToDelete, setCvToDelete] = useState<{ id: number; fileName: string } | null>(null);

  const { data: cvUploads, isLoading: cvLoading } = trpc.cv.myUploads.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const uploadMutation = trpc.cv.upload.useMutation({
    onSuccess: data => {
      toast.success("CV uploaded successfully");
      setPendingFile(null);
      setSelectedCvId(data.cv.id);
      utils.cv.myUploads.invalidate();
    },
    onError: err => {
      toast.error(err.message || "Failed to upload CV");
    },
  });
  const deleteMutation = trpc.cv.deleteUpload.useMutation({
    onSuccess: () => {
      toast.success("CV removed");
      setCvToDelete(null);
      setSelectedCvId(null);
      utils.cv.myUploads.invalidate();
    },
    onError: err => {
      toast.error(err.message || "Failed to remove CV");
    },
  });
  const recommend = trpc.cv.recommend.useMutation();
  const recommendUpload = trpc.cv.recommendUpload.useMutation();

  const selectedCv = cvUploads?.find(cv => cv.id === selectedCvId) ?? cvUploads?.[0] ?? null;
  const matchData = recommendUpload.data ?? recommend.data;
  const isMatching = recommend.isPending || recommendUpload.isPending;

  useEffect(() => {
    if (!selectedCvId && cvUploads && cvUploads.length > 0) {
      setSelectedCvId(cvUploads[0].id);
    }
  }, [cvUploads, selectedCvId]);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      const nextFile = {
        fileName: file.name,
        fileContent: base64,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
      };
      setPendingFile(nextFile);
      uploadMutation.mutate(nextFile);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleMatch = () => {
    recommend.reset();
    recommendUpload.reset();

    if (pendingFile) {
      recommend.mutate({ file: pendingFile });
      return;
    }

    if (selectedCv) {
      recommendUpload.mutate({ cvUploadId: selectedCv.id });
      return;
    }

    toast.error("Please upload a CV first");
  };

  const confirmDelete = () => {
    if (!cvToDelete) return;
    deleteMutation.mutate({ cvUploadId: cvToDelete.id });
  };

  if (loading) {
    return (
      <div className="container py-20 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-24 text-center max-w-md mx-auto">
        <FileText className="mx-auto h-16 w-16 text-muted-foreground/40" />
        <h1 className="mt-4 text-2xl font-bold text-foreground">Sign in to manage your CVs</h1>
        <p className="mt-2 text-muted-foreground">
          Upload, choose, remove, and match your CVs with available jobs.
        </p>
        <Button asChild className="mt-6">
          <a href={getLoginUrl()}>Sign In</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10 bg-background text-foreground min-h-screen">
      <AlertDialog open={!!cvToDelete} onOpenChange={open => !open && setCvToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete CV?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <span className="font-semibold text-foreground">{cvToDelete?.fileName}</span> from your uploaded CVs. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">CV Manager</h1>
        <p className="mt-2 text-muted-foreground">
          Choose an uploaded CV or add a new one, then run job matching from the selected file.
        </p>
      </div>

      <div className="space-y-8">
        <Card className="shadow-sm bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="text-lg">CV Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {cvLoading ? (
              <div className="py-12 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-sm text-muted-foreground">Loading CVs...</p>
              </div>
            ) : cvUploads && cvUploads.length > 0 ? (
              <>
                <div className="grid gap-3 md:grid-cols-2">
                  {cvUploads.map(cv => {
                    const active = selectedCv?.id === cv.id && !pendingFile;
                    return (
                      <button
                        key={cv.id}
                        type="button"
                        onClick={() => {
                          setPendingFile(null);
                          setSelectedCvId(cv.id);
                        }}
                        className={`rounded-lg border p-4 text-left transition-colors ${
                          active
                            ? "border-primary bg-primary/5"
                            : "border-border bg-background hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <FileText className="mt-0.5 h-7 w-7 shrink-0 text-primary" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground" title={cv.fileName}>
                              {cv.fileName}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Uploaded {new Date(cv.createdAt).toLocaleDateString()}
                            </p>
                            <Badge variant="outline" className="mt-2 text-xs">
                              {cv.mimeType}
                            </Badge>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedCv && !pendingFile && (
                  <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">Selected CV</p>
                      <p className="truncate text-sm text-muted-foreground">{selectedCv.fileName}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={selectedCv.fileUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-3.5 w-3.5" />
                          View CV
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setCvToDelete({ id: selectedCv.id, fileName: selectedCv.fileName })}
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-8 text-center">
                <Upload className="mx-auto h-10 w-10 text-primary/60" />
                <p className="mt-3 text-sm font-medium text-foreground">No CV uploaded yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Choose your first CV file to begin matching jobs.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 bg-background text-foreground hover:bg-muted"
                  onClick={() => fileRef.current?.click()}
                >
                  Choose File
                </Button>
              </div>
            )}

            {cvUploads && cvUploads.length > 0 && (
              <div className="rounded-lg border border-dashed border-border p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Upload New CV</p>
                    <p className="text-xs text-muted-foreground">Add another CV and use it for matching.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New CV
                  </Button>
                </div>
              </div>
            )}

            {pendingFile && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-semibold text-foreground">New CV selected</p>
                <p className="text-sm text-muted-foreground">{pendingFile.fileName}</p>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md,.csv,.pdf,.doc,.docx"
              onChange={handleFile}
              className="hidden"
            />
          </CardContent>
        </Card>

        <section className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">AI Job Matching</h2>
              <p className="text-sm text-muted-foreground">
                Powered by FAISS HNSW + Sentence-Transformers · Upload your CV to get AI-ranked job recommendations.
              </p>
            </div>
            <Button onClick={handleMatch} disabled={isMatching || (!selectedCv && !pendingFile)}>
              {isMatching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Match with AI
            </Button>
          </div>

          {matchData && (
            <div className="flex items-center gap-2">
              {(matchData as any).fallback ? (
                <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Keyword fallback — AI engine unavailable
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800">
                  <Sparkles className="mr-1 h-3 w-3" />
                  AI Engine · FAISS HNSW + Cross-Encoder
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                Analyzed {matchData.analyzedAt ? new Date(matchData.analyzedAt).toLocaleTimeString() : ""}
              </span>
            </div>
          )}

          {matchData?.detectedSkills && matchData.detectedSkills.length > 0 && (
            <Card className="shadow-sm bg-card text-card-foreground border-border">
              <CardHeader>
                <CardTitle className="text-base text-foreground">Detected Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {matchData.detectedSkills.map(skill => (
                    <Badge key={skill} variant="secondary" className="bg-muted text-foreground border-border">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {isMatching ? (
            <Card className="shadow-sm bg-card border-border">
              <CardContent className="py-16 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-sm text-muted-foreground">Matching jobs with your CV...</p>
              </CardContent>
            </Card>
          ) : matchData?.recommendations && matchData.recommendations.length > 0 ? (
            <div className="space-y-4">
              {matchData.recommendations.map((job, index) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="group block">
                  <Card className="shadow-sm hover:shadow-md transition-all hover:border-primary/30 border bg-card text-card-foreground">
                    <CardContent className="pt-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <Badge variant="outline" className="mb-2 text-xs">#{index + 1}</Badge>
                          <h4 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">{job.title}</h4>
                          <p className="text-sm text-muted-foreground truncate">{job.company} · {job.location} · {job.type}</p>
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                        </div>
                        <div className="text-center min-w-[70px] shrink-0">
                          <p className="text-2xl font-bold text-primary">{job.score}%</p>
                          <p className="text-xs text-muted-foreground">Match</p>
                        </div>
                      </div>
                      <Progress value={job.score} className="mt-3 h-2" />
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-medium text-foreground mb-1">Matched</p>
                          <div className="flex flex-wrap gap-1">
                            {job.matchedSkills.map(skill => (
                              <Badge key={skill} className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-foreground mb-1">To Develop</p>
                          <div className="flex flex-wrap gap-1">
                            {job.missingSkills.map(skill => (
                              <Badge key={skill} variant="outline" className="text-xs text-amber-700 border-amber-200 dark:text-amber-400 dark:border-amber-900/30">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {(job as any).mismatchReasons && (job as any).mismatchReasons.length > 0 && (
                        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-950/10 p-3">
                          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1.5 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Why the score isn&apos;t higher
                          </p>
                          <ul className="space-y-0.5">
                            {(job as any).mismatchReasons.map((reason: string, i: number) => (
                              <li key={i} className="text-xs text-amber-700 dark:text-amber-400">• {reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between border-t pt-2 border-border/60">
                        <p className="text-sm font-medium text-primary">{job.salary} · {job.level}</p>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          View details <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="shadow-sm bg-card border-border">
              <CardContent className="py-16 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <p className="mt-4 text-muted-foreground">
                  Select or upload a CV, then click Match Jobs to see recommendations.
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
