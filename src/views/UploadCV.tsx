import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, Brain, FileText, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/lib/wouter-compat";

export default function UploadCV() {
  const { isAuthenticated } = useAuth();
  const [cvText, setCvText] = useState("");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<{ fileName: string; fileContent: string; mimeType: string } | null>(null);

  const recommend = trpc.cv.recommend.useMutation();
  const analyzeLLM = trpc.cv.analyzeLLM.useMutation();
  const uploadMutation = trpc.cv.upload.useMutation();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const ext = file.name.split(".").pop()?.toLowerCase();

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setUploadedFile({
        fileName: file.name,
        fileContent: base64,
        mimeType: file.type || "application/octet-stream",
      });

      if (ext && ["txt", "md", "csv"].includes(ext)) {
        file.text().then((text) => {
          setCvText(text);
          toast.success("Text content loaded from file");
        });
      } else {
        setCvText(`[File loaded for analysis: ${file.name}]`);
        toast.success("File uploaded successfully. Ready to Match Jobs!");
      }

      // Upload to storage if authenticated
      if (isAuthenticated) {
        uploadMutation.mutate({
          fileName: file.name,
          fileContent: base64,
          mimeType: file.type || "application/octet-stream",
          fileSize: file.size,
        }, {
          onSuccess: () => toast.success("CV saved to your account"),
          onError: () => toast.error("Failed to save CV"),
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = () => {
    if (uploadedFile) {
      recommend.mutate({ file: uploadedFile });
    } else {
      if (cvText.trim().length < 10) { toast.error("Please enter at least 10 characters of CV text"); return; }
      recommend.mutate({ cvText });
    }
  };

  const handleLLMAnalysis = () => {
    // If user has a file, but LLM only accepts text, use cvText which contains file status or text content
    if (cvText.trim().length < 10 || cvText.startsWith("[File loaded")) {
      toast.error("Please paste your CV text content below for AI Career Analysis");
      return;
    }
    analyzeLLM.mutate({ cvText });
  };

  return (
    <div className="container py-10 bg-background text-foreground min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Upload & Analyze Your CV</h1>
        <p className="mt-2 text-muted-foreground">Upload a file or paste your CV text to receive intelligent job recommendations and AI career analysis.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Input panel */}
        <div className="space-y-6">
          <Card className="shadow-sm bg-card text-card-foreground border-border">
            <CardContent className="pt-6">
              <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-8 text-center">
                <input ref={fileRef} type="file" accept=".txt,.md,.csv,.pdf,.doc,.docx" onChange={handleFile} className="hidden" />
                <Upload className="mx-auto h-10 w-10 text-primary/60" />
                <p className="mt-3 text-sm font-medium text-foreground">Drop your CV file here or click to browse</p>
                <p className="mt-1 text-xs text-muted-foreground">Supports TXT, MD, PDF, DOCX</p>
                <Button variant="outline" size="sm" className="mt-4 bg-background text-foreground hover:bg-muted" onClick={() => fileRef.current?.click()}>
                  Choose File
                </Button>
                {fileName && <p className="mt-3 text-sm font-medium text-primary">{fileName}</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm bg-card text-card-foreground border-border">
            <CardHeader><CardTitle className="text-base text-foreground">CV Text for Analysis</CardTitle></CardHeader>
            <CardContent>
              <Textarea
                rows={12}
                value={cvText}
                onChange={e => setCvText(e.target.value)}
                placeholder="Paste your CV content here for matching and analysis..."
                className="text-sm bg-background text-foreground border-border"
              />
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button onClick={handleAnalyze} disabled={recommend.isPending} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/95">
                  {recommend.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                  Match Jobs
                </Button>
                <Button onClick={handleLLMAnalysis} disabled={analyzeLLM.isPending} variant="secondary" className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/95 border border-border">
                  {analyzeLLM.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
                  AI Career Analysis
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Detected skills */}
          {recommend.data?.detectedSkills && recommend.data.detectedSkills.length > 0 && (
            <Card className="shadow-sm bg-card text-card-foreground border-border">
              <CardHeader><CardTitle className="text-base text-foreground">Detected Skills</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {recommend.data.detectedSkills.map(s => <Badge key={s} variant="secondary" className="bg-muted text-foreground border-border">{s}</Badge>)}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results panel */}
        <div className="space-y-6">
          {/* LLM Analysis */}
          {analyzeLLM.data && (
            <Card className="shadow-lg border-[hsl(42,78%,52%)]/30 bg-card text-card-foreground">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-[hsl(42,78%,52%)]/10 rounded-t-lg">
                <CardTitle className="text-lg flex items-center gap-2 text-foreground"><Brain className="h-5 w-5 text-[hsl(42,78%,52%)]" /> AI Career Analysis</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                {analyzeLLM.data.skillSummary && (
                  <div>
                    <h4 className="text-sm font-semibold text-primary mb-2">Skill Summary</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">{analyzeLLM.data.skillSummary}</p>
                  </div>
                )}
                {analyzeLLM.data.careerProfile && (
                  <div>
                    <h4 className="text-sm font-semibold text-primary mb-2">Career Profile</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">{analyzeLLM.data.careerProfile}</p>
                  </div>
                )}
                {analyzeLLM.data.recommendations?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-primary mb-3">Personalized Rationale</h4>
                    <div className="space-y-3">
                      {analyzeLLM.data.recommendations.map((rec: any, i: number) => (
                        <div key={i} className="rounded-lg border p-3 border-border bg-background">
                          <p className="text-sm font-semibold text-foreground">{rec.jobTitle} — {rec.company}</p>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{rec.rationale}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {analyzeLLM.isPending && (
            <Card className="shadow-sm bg-card border-border">
              <CardContent className="py-12 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-sm text-muted-foreground">Generating AI career analysis...</p>
              </CardContent>
            </Card>
          )}

          {/* Job Recommendations */}
          {recommend.data?.recommendations && recommend.data.recommendations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Job Recommendations</h3>
              {recommend.data.recommendations.map((job, idx) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="group block">
                  <Card className="shadow-sm hover:shadow-md transition-all hover:border-primary/30 border bg-card text-card-foreground">
                    <CardContent className="pt-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <Badge variant="outline" className="mb-2 text-xs">#{idx + 1}</Badge>
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
                            {job.matchedSkills.map(s => <Badge key={s} className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30">{s}</Badge>)}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-foreground mb-1">To Develop</p>
                          <div className="flex flex-wrap gap-1">
                            {job.missingSkills.map(s => <Badge key={s} variant="outline" className="text-xs text-amber-700 border-amber-200 dark:text-amber-400 dark:border-amber-900/30">{s}</Badge>)}
                          </div>
                        </div>
                      </div>
                      {job.mismatchReasons && job.mismatchReasons.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-dashed border-border/60">
                          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">Mismatch Analysis:</p>
                          <ul className="list-disc pl-4 space-y-0.5">
                            {job.mismatchReasons.map((reason, i) => (
                              <li key={i} className="text-xs text-muted-foreground">{reason}</li>
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
          )}

          {!recommend.data && !analyzeLLM.data && !recommend.isPending && !analyzeLLM.isPending && (
            <Card className="shadow-sm bg-card border-border">
              <CardContent className="py-16 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <p className="mt-4 text-muted-foreground">Upload or paste your CV text, then click \"Match Jobs\" or \"AI Career Analysis\" to see results.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
