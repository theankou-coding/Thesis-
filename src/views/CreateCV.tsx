import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

type CvForm = {
  fullName: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string;
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
  experience: "",
  education: "",
  links: "",
};

export default function CreateCV() {
  const [form, setForm] = useState<CvForm>(initial);
  const [isGenerating, setIsGenerating] = useState(false);

  const update = (field: keyof CvForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const skills = useMemo(
    () => form.skills.split(",").map((s) => s.trim()).filter(Boolean),
    [form.skills],
  );

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
      const margin = 52;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const ensureSpace = (height: number) => {
        if (y + height <= pageHeight - margin) return;
        doc.addPage();
        y = margin;
      };

      const writeWrapped = (
        text: string,
        size = 10.5,
        lineHeight = 16,
        color: [number, number, number] = [74, 85, 104],
      ) => {
        const lines = doc.splitTextToSize(text, contentWidth) as string[];
        lines.forEach((line) => {
          ensureSpace(lineHeight);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(size);
          doc.setTextColor(...color);
          doc.text(line, margin, y);
          y += lineHeight;
        });
      };

      const writeMultiline = (text: string) => {
        text.split("\n").forEach((line) => {
          writeWrapped(line || " ", 10.5, 16);
        });
      };

      const addSection = (title: string, text: string) => {
        if (!text.trim()) return;
        ensureSpace(44);
        y += 14;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(26, 39, 68);
        doc.text(title.toUpperCase(), margin, y);
        y += 8;
        doc.setDrawColor(200, 168, 75);
        doc.setLineWidth(1.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 18;
        writeMultiline(text);
      };

      doc.setFont("helvetica", "bold");
      doc.setFontSize(26);
      doc.setTextColor(26, 39, 68);
      doc.text(form.fullName.trim(), margin, y);
      y += 24;

      const contact = [form.role, form.email, form.phone, form.location]
        .map((value) => value.trim())
        .filter(Boolean)
        .join(" | ");

      if (contact) {
        writeWrapped(contact, 10.5, 16, [90, 106, 122]);
      }

      addSection("Professional Summary", form.summary);

      if (skills.length > 0) {
        ensureSpace(44);
        y += 14;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(26, 39, 68);
        doc.text("SKILLS", margin, y);
        y += 8;
        doc.setDrawColor(200, 168, 75);
        doc.setLineWidth(1.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 18;
        writeWrapped(skills.join(" | "), 10.5, 16);
      }

      addSection("Experience", form.experience);
      addSection("Education", form.education);
      addSection("Links", form.links);

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

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Create Your CV</h1>
        <p className="mt-2 text-muted-foreground">Fill in your details and preview your professional CV in real time.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <Card className="shadow-sm">
          <CardHeader><CardTitle className="text-lg">Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Full Name</Label><Input value={form.fullName} onChange={e => update("fullName", e.target.value)} placeholder="John Doe" /></div>
              <div className="space-y-2"><Label>Target Role</Label><Input value={form.role} onChange={e => update("role", e.target.value)} placeholder="Frontend Developer" /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="john@example.com" /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+1 555 0148" /></div>
            </div>
            <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={e => update("location", e.target.value)} placeholder="Remote / New York" /></div>
            <div className="space-y-2"><Label>Professional Summary</Label><Textarea rows={4} value={form.summary} onChange={e => update("summary", e.target.value)} placeholder="Brief overview of your experience and goals..." /></div>
            <div className="space-y-2"><Label>Skills (comma-separated)</Label><Textarea rows={2} value={form.skills} onChange={e => update("skills", e.target.value)} placeholder="React, TypeScript, Node.js, SQL" /></div>
            <div className="space-y-2"><Label>Experience</Label><Textarea rows={6} value={form.experience} onChange={e => update("experience", e.target.value)} placeholder="Role - Company - Dates&#10;- Achievement or responsibility" /></div>
            <div className="space-y-2"><Label>Education</Label><Textarea rows={3} value={form.education} onChange={e => update("education", e.target.value)} placeholder="Degree - Institution - Year" /></div>
            <div className="space-y-2"><Label>Links</Label><Textarea rows={2} value={form.links} onChange={e => update("links", e.target.value)} placeholder="Portfolio, LinkedIn, GitHub URLs" /></div>
          </CardContent>
        </Card>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <Card className="shadow-lg border-primary/20">
            <CardHeader className="bg-[hsl(220,60%,12%)] text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{form.fullName || "Your Name"}</CardTitle>
                  <p className="mt-1 text-sm text-[hsl(42,78%,70%)]">{form.role || "Target Role"}</p>
                </div>
                <div className="text-right text-xs text-gray-300 space-y-0.5">
                  {form.email && <p>{form.email}</p>}
                  {form.phone && <p>{form.phone}</p>}
                  {form.location && <p>{form.location}</p>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              {form.summary && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Summary</h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">{form.summary}</p>
                </div>
              )}
              {skills.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                  </div>
                </div>
              )}
              {form.experience && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Experience</h4>
                  <pre className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap font-sans">{form.experience}</pre>
                </div>
              )}
              {form.education && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Education</h4>
                  <pre className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap font-sans">{form.education}</pre>
                </div>
              )}
              {form.links && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Links</h4>
                  <pre className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap font-sans">{form.links}</pre>
                </div>
              )}
            </CardContent>
          </Card>
          <Button onClick={downloadCV} disabled={isGenerating} className="mt-4 w-full" size="lg">
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
