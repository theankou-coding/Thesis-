import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type CvForm = {
  fullName: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string;
  languages: string;
  experience: string;
  education: string;
  links: string;
};

const initial: CvForm = {
  fullName: "",
  role: "",
  email: "",
  phone: "",
  location: "",
  summary: "",
  skills: "",
  languages: "",
  experience: "",
  education: "",
  links: "",
};

export default function CreateCV() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [form, setForm] = useState<CvForm>(initial);
  const [isGenerating, setIsGenerating] = useState(false);

  const update = (field: keyof CvForm, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const skills = useMemo(
    () =>
      form.skills
        .split(",")
        .map(s => s.trim())
        .filter(Boolean),
    [form.skills]
  );

  const languages = useMemo(
    () =>
      form.languages
        .split(",")
        .map(language => language.trim())
        .filter(Boolean),
    [form.languages]
  );

  useEffect(() => {
    if (loading || isAuthenticated) return;
    router.replace(getLoginUrl());
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (!user) return;

    const [storedName] = (user.name ?? "").split(":::");
    const profileName = storedName || user.email?.split("@")[0] || "";

    setForm(prev => ({
      ...prev,
      fullName: prev.fullName || profileName,
      email: prev.email || user.email || "",
    }));
  }, [user]);

  const downloadCV = async () => {
    if (!form.fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    setIsGenerating(true);

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const sidebarWidth = 188;
      const margin = 34;
      const mainX = sidebarWidth + 34;
      const mainWidth = pageWidth - mainX - margin;
      const sidebarX = 24;
      const sidebarTextWidth = sidebarWidth - 48;
      let mainY = 58;
      let sidebarY = 64;

      const paintSidebar = () => {
        doc.setFillColor(26, 39, 68);
        doc.rect(0, 0, sidebarWidth, pageHeight, "F");
      };

      paintSidebar();

      const ensureMainSpace = (height: number) => {
        if (mainY + height <= pageHeight - margin) return;
        doc.addPage();
        paintSidebar();
        mainY = 58;
        sidebarY = 64;
      };

      const writeWrapped = (
        text: string,
        x: number,
        y: number,
        width: number,
        size = 10.5,
        lineHeight = 16,
        color: [number, number, number] = [74, 85, 104]
      ) => {
        const lines = doc.splitTextToSize(text, width) as string[];
        lines.forEach(line => {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(size);
          doc.setTextColor(...color);
          doc.text(line, x, y);
          y += lineHeight;
        });
        return y;
      };

      const addSidebarSection = (title: string, text: string) => {
        if (!text.trim()) return;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(200, 168, 75);
        doc.text(title.toUpperCase(), sidebarX, sidebarY);
        sidebarY += 16;

        text.split("\n").forEach(line => {
          sidebarY = writeWrapped(
            line || " ",
            sidebarX,
            sidebarY,
            sidebarTextWidth,
            9.2,
            13,
            [235, 240, 248]
          );
        });

        sidebarY += 16;
      };

      const addSection = (title: string, text: string) => {
        if (!text.trim()) return;
        ensureMainSpace(46);
        mainY += 8;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(26, 39, 68);
        doc.text(title.toUpperCase(), mainX, mainY);
        mainY += 8;
        doc.setDrawColor(200, 168, 75);
        doc.setLineWidth(1.5);
        doc.line(mainX, mainY, pageWidth - margin, mainY);
        mainY += 18;

        text.split("\n").forEach(line => {
          ensureMainSpace(18);
          mainY = writeWrapped(line || " ", mainX, mainY, mainWidth, 10.5, 16);
        });
      };

      doc.setFont("helvetica", "bold");
      doc.setFontSize(28);
      doc.setTextColor(26, 39, 68);
      doc.text(form.fullName.trim(), mainX, mainY);
      mainY += 26;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(200, 168, 75);
      doc.text((form.role || "Target Role").toUpperCase(), mainX, mainY);
      mainY += 22;

      const contact = [form.email, form.phone, form.location]
        .map(value => value.trim())
        .filter(Boolean)
        .join("\n");

      addSidebarSection("Contact", contact);
      addSidebarSection("Skills", skills.join("\n"));
      addSidebarSection("Languages", languages.join("\n"));
      addSidebarSection("Education", form.education);
      addSidebarSection("Links", form.links);

      addSection("Professional Summary", form.summary);
      addSection("Experience", form.experience);

      const safeName = form.fullName
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase();

      doc.save(`${safeName || "cv"}-cv.pdf`);
      toast.success("CV downloaded as PDF");
    } catch (error) {
      console.error("[CreateCV] Failed to generate PDF:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="container flex min-h-[50vh] items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Create Your CV</h1>
        <p className="mt-2 text-muted-foreground">
          Fill in your details and preview your professional CV in real time.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={form.fullName}
                  onChange={e => update("fullName", e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label>Target Role</Label>
                <Input
                  value={form.role}
                  onChange={e => update("role", e.target.value)}
                  placeholder="Frontend Developer"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={e => update("email", e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={e => update("phone", e.target.value)}
                  placeholder="+1 555 0148"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={form.location}
                onChange={e => update("location", e.target.value)}
                placeholder="Remote / New York"
              />
            </div>
            <div className="space-y-2">
              <Label>Professional Summary</Label>
              <Textarea
                rows={4}
                value={form.summary}
                onChange={e => update("summary", e.target.value)}
                placeholder="Brief overview of your experience and goals..."
              />
            </div>
            <div className="space-y-2">
              <Label>Skills (comma-separated)</Label>
              <Textarea
                rows={2}
                value={form.skills}
                onChange={e => update("skills", e.target.value)}
                placeholder="React, TypeScript, Node.js, SQL"
              />
            </div>
            <div className="space-y-2">
              <Label>Languages (comma-separated)</Label>
              <Input
                value={form.languages}
                onChange={e => update("languages", e.target.value)}
                placeholder="English, Khmer"
              />
            </div>
            <div className="space-y-2">
              <Label>Experience</Label>
              <Textarea
                rows={6}
                value={form.experience}
                onChange={e => update("experience", e.target.value)}
                placeholder="Role - Company - Dates&#10;- Achievement or responsibility"
              />
            </div>
            <div className="space-y-2">
              <Label>Education</Label>
              <Textarea
                rows={3}
                value={form.education}
                onChange={e => update("education", e.target.value)}
                placeholder="Degree - Institution - Year"
              />
            </div>
            <div className="space-y-2">
              <Label>Links</Label>
              <Textarea
                rows={2}
                value={form.links}
                onChange={e => update("links", e.target.value)}
                placeholder="Portfolio, LinkedIn, GitHub URLs"
              />
            </div>
          </CardContent>
        </Card>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <Card className="overflow-hidden shadow-lg border-primary/20">
            <div className="grid min-h-[620px] md:grid-cols-[190px_1fr]">
              <aside className="bg-[hsl(220,60%,12%)] p-5 text-white">
                <p className="mb-7 text-xs font-semibold uppercase tracking-[0.22em] text-[hsl(42,78%,70%)]">
                  Jack Template
                </p>

                {(form.email || form.phone || form.location) && (
                  <div className="mb-7">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[hsl(42,78%,70%)]">
                      Contact
                    </h4>
                    <div className="space-y-1 text-xs text-white/80">
                      {form.email && (
                        <p className="break-words">{form.email}</p>
                      )}
                      {form.phone && <p>{form.phone}</p>}
                      {form.location && <p>{form.location}</p>}
                    </div>
                  </div>
                )}

                {skills.length > 0 && (
                  <div className="mb-7">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[hsl(42,78%,70%)]">
                      Skills
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map(s => (
                        <Badge
                          key={s}
                          variant="secondary"
                          className="max-w-full truncate text-xs"
                        >
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {languages.length > 0 && (
                  <div className="mb-7">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[hsl(42,78%,70%)]">
                      Languages
                    </h4>
                    <div className="space-y-1 text-xs text-white/80">
                      {languages.map(language => (
                        <p key={language}>{language}</p>
                      ))}
                    </div>
                  </div>
                )}

                {form.education && (
                  <div className="mb-7">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[hsl(42,78%,70%)]">
                      Education
                    </h4>
                    <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-white/80">
                      {form.education}
                    </pre>
                  </div>
                )}

                {form.links && (
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[hsl(42,78%,70%)]">
                      Links
                    </h4>
                    <pre className="whitespace-pre-wrap break-words font-sans text-xs leading-relaxed text-white/80">
                      {form.links}
                    </pre>
                  </div>
                )}
              </aside>

              <div>
                <CardHeader className="border-b bg-card">
                  <CardTitle className="text-3xl text-[hsl(220,60%,12%)] dark:text-primary">
                    {form.fullName || "Your Name"}
                  </CardTitle>
                  <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-[hsl(42,78%,52%)]">
                    {form.role || "Target Role"}
                  </p>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {form.summary && (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                        Summary
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {form.summary}
                      </p>
                    </div>
                  )}
                  {form.experience && (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                        Experience
                      </h4>
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted-foreground">
                        {form.experience}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </div>
            </div>
          </Card>
          <Button
            onClick={downloadCV}
            disabled={isGenerating}
            className="mt-4 w-full"
            size="lg"
          >
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
