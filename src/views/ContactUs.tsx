"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  User,
  CheckCircle2,
} from "lucide-react";

const contactMethods = [
  {
    icon: User,
    title: "Founder",
    description: "Thesis project contact.",
    contact: "Loem Theankou",
    link: "#",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Mail,
    title: "Email",
    description: "Send a message anytime.",
    contact: "loemtheankou168@gmail.com",
    link: "mailto:loemtheankou168@gmail.com",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Phone,
    title: "Phone",
    description: "Call for thesis project inquiries.",
    contact: "087459323",
    link: "tel:087459323",
    color: "from-rose-500 to-pink-500",
  },
  {
    icon: MapPin,
    title: "Location",
    description: "Based in Cambodia.",
    contact: "Phnom Penh, Cambodia",
    link: "https://maps.google.com",
    color: "from-emerald-500 to-teal-500",
  },
];

const faqs = [
  {
    q: "How does the AI matching work?",
    a: "The AI reads CV text, extracts skills and experience, then compares those details with job requirements to suggest relevant opportunities.",
  },
  {
    q: "Is my CV data private?",
    a: "CV content and candidate information are handled carefully for the thesis project and are used to support the matching workflow.",
  },
  {
    q: "Can I use JOB CV for free?",
    a: "Yes. JOB CV is a thesis project, so the main features are designed for demonstration, learning, and academic evaluation.",
  },
  {
    q: "How do I report a job scam or suspicious listing?",
    a: "Use the contact form or email loemtheankou168@gmail.com with the job details so the issue can be reviewed.",
  },
];

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export default function ContactUs() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success("Message sent! Your message has been submitted.");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/5 py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-1/4 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-10 left-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
        </div>
        <div className="container relative text-center max-w-2xl mx-auto">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary px-4 py-1 text-sm font-medium">
            Get in Touch
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight mb-5">
            Contact{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              JOB CV
            </span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Have a question, feedback, or thesis project inquiry? Contact Loem Theankou directly using the details
            below.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 border-b border-border">
        <div className="container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {contactMethods.map(({ icon: Icon, title, description, contact, link, color }) => (
              <a
                key={title}
                href={link}
                target={link.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="block group"
              >
                <Card className="border-border bg-card shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-full overflow-hidden">
                  <div className={`h-1 bg-gradient-to-r ${color}`} />
                  <CardContent className="pt-5 pb-5 text-center">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${color} text-white flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{description}</p>
                    <p className="text-xs font-medium text-primary">{contact}</p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content: Form + Info */}
      <section className="py-20 container">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <Badge variant="outline" className="mb-3 border-primary/30 text-primary text-xs font-semibold uppercase tracking-wider">
                Send a message
              </Badge>
              <h2 className="text-2xl font-bold text-foreground">How can we help?</h2>
              <p className="mt-2 text-muted-foreground text-sm">
                Fill out the form or contact Loem Theankou directly for JOB CV thesis project questions.
              </p>
            </div>

            {submitted ? (
              <Card className="border-border shadow-sm">
                <CardContent className="py-16 text-center">
                  <div className="h-16 w-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    Thanks for reaching out, <strong>{form.name}</strong>. A reply can be sent to{" "}
                    <strong>{form.email}</strong>.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                  >
                    Send Another Message
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border shadow-sm">
                <CardContent className="pt-6 pb-6">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact-name">Full Name <span className="text-destructive">*</span></Label>
                        <Input
                          id="contact-name"
                          name="name"
                          placeholder="Loem Theankou"
                          className="h-11 bg-background"
                          value={form.name}
                          onChange={handleChange}
                          disabled={loading}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-email">Email Address <span className="text-destructive">*</span></Label>
                        <Input
                          id="contact-email"
                          name="email"
                          type="email"
                          placeholder="loemtheankou168@gmail.com"
                          className="h-11 bg-background"
                          value={form.email}
                          onChange={handleChange}
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-subject">Subject</Label>
                      <select
                        id="contact-subject"
                        name="subject"
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground"
                        value={form.subject}
                        onChange={handleChange}
                        disabled={loading}
                      >
                        <option value="">Select a topic...</option>
                        <option value="general">General Inquiry</option>
                        <option value="technical">Technical Question</option>
                        <option value="thesis">Thesis Project</option>
                        <option value="feedback">Feedback</option>
                        <option value="report">Report a Problem</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-message">Message <span className="text-destructive">*</span></Label>
                      <Textarea
                        id="contact-message"
                        name="message"
                        placeholder="Tell us what's on your mind..."
                        className="min-h-[140px] bg-background resize-none"
                        value={form.message}
                        onChange={handleChange}
                        disabled={loading}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 font-semibold gap-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Info */}
          <aside className="lg:col-span-2 space-y-6">
            {/* Office Hours */}
            <Card className="border-border bg-card shadow-sm">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Clock className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold text-foreground">Contact Hours</h3>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {[
                    { day: "Monday - Friday", hours: "8:00 AM - 5:30 PM" },
                    { day: "Saturday", hours: "9:00 AM - 12:00 PM" },
                    { day: "Sunday", hours: "Closed" },
                  ].map(({ day, hours }) => (
                    <div key={day} className="flex justify-between">
                      <span>{day}</span>
                      <span className="font-medium text-foreground">{hours}</span>
                    </div>
                  ))}
                  <p className="text-xs pt-2 text-muted-foreground/70">All times in Indochina Time (ICT, UTC+7)</p>
                </div>
              </CardContent>
            </Card>

            {/* Direct contact */}
            <Card className="border-border bg-card shadow-sm">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-9 w-9 rounded-lg bg-accent/10 text-accent-foreground flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold text-foreground">Direct Contact</h3>
                </div>
                <div className="space-y-3 text-sm">
                  {[
                    { label: "Name", value: "Loem Theankou" },
                    { label: "Email", value: "loemtheankou168@gmail.com" },
                    { label: "Phone", value: "087459323" },
                    { label: "Location", value: "Phnom Penh, Cambodia" },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-3 rounded-lg bg-muted/50">
                      <p className="font-medium text-foreground text-xs">{label}</p>
                      <p className="text-primary text-xs mt-0.5 break-words">{value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Project note */}
            <Card className="border-border bg-card shadow-sm">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-9 w-9 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold text-foreground">Project Note</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  JOB CV is a thesis web application focused on AI-assisted CV matching and recruitment workflows.
                </p>
                <Badge variant="outline" className="text-xs">
                  Phnom Penh, Cambodia
                </Badge>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/20 border-t border-border">
        <div className="container max-w-3xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3 border-primary/30 text-primary text-xs font-semibold uppercase tracking-wider">
              FAQ
            </Badge>
            <h2 className="text-3xl font-bold text-foreground">Frequently Asked Questions</h2>
            <p className="mt-3 text-muted-foreground">
              Can't find an answer? Reach out to Loem Theankou using the contact details above.
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <Card key={q} className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-5 pb-5">
                  <h3 className="font-semibold text-foreground mb-2 flex items-start gap-2">
                    <span className="shrink-0 h-5 w-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold mt-0.5">?</span>
                    {q}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-7">{a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
