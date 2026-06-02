import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLoginUrl } from "@/const";
import { Link } from "@/lib/wouter-compat";
import { UserPlus } from "lucide-react";
import { useState } from "react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Full name is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Invalid email format";
    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters";
    if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-[hsl(42,78%,52%)]">
        <CardHeader className="text-center pb-2">
          <img src="/manus-storage/jobcv-logo_f2b0a0df.png" alt="JOB CV" className="h-10 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold text-primary">Create Account</CardTitle>
          <CardDescription className="text-muted-foreground">Join the platform and start your career journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="h-11" />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-email">Email Address</Label>
              <Input id="reg-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="h-11" />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password">Password</Label>
              <Input id="reg-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="h-11" />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="h-11" />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
            </div>
            <Button type="submit" className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
              Create Account
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
          </div>

          <Button asChild variant="outline" className="w-full h-11">
            <a href={getLoginUrl()}>
              <UserPlus className="mr-2 h-4 w-4" />
              Sign Up with OAuth
            </a>
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login"><span className="font-semibold text-primary hover:underline cursor-pointer">Sign In</span></Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
