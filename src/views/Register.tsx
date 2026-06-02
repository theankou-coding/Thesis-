import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/lib/wouter-compat";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Eye, EyeOff, Mail } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Profile image upload states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [base64Content, setBase64Content] = useState<string | null>(null);

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      toast.success("Account created successfully!");
      if (data?.needsConfirmation) {
        setRegisteredEmail(data.email);
      } else {
        // Redirect using a full page load to ensure cookies are read correctly
        window.location.href = "/";
      }
    },
    onError: (error) => {
      const msg = error.message || "";
      if (msg.toLowerCase().includes("rate limit") || msg.toLowerCase().includes("too many requests")) {
        toast.error("Email rate limit exceeded. Supabase limits sign-ups for security. Please try again in 5 minutes, or use a different email.");
      } else {
        toast.error(msg || "Failed to create account. Please try again.");
      }
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setImageError("Profile image must be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setImageError("Please upload an image file");
      return;
    }

    setImageError(null);
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      const base64 = (reader.result as string).split(",")[1];
      setBase64Content(base64);
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Full name is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Invalid email format";
    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters";
    if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match";
    
    if (!base64Content) {
      setImageError("Profile image is required");
      errs.profileImage = "Profile image is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !base64Content || !imageFile) return;
    registerMutation.mutate({
      name,
      email,
      password,
      profileImageContent: base64Content,
      profileImageName: imageFile.name,
      profileImageMime: imageFile.type,
    });
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
<<<<<<< HEAD
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-[hsl(42,78%,52%)] bg-card text-card-foreground">
        {registeredEmail ? (
          <CardContent className="pt-10 pb-10 text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full scale-110 animate-ping" />
                <div className="relative h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Mail className="h-8 w-8" />
                </div>
              </div>
=======
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-[hsl(42,78%,52%)]">
        <CardHeader className="text-center pb-2">
          <img src="logo.png" alt="JOB CV" className="h-10 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold text-primary">Create Account</CardTitle>
          <CardDescription className="text-muted-foreground">Join the platform and start your career journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="h-11" />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
>>>>>>> d468b1cd210411139bf111209d11bdbd4d3525ec
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-foreground">Confirm Your Email</CardTitle>
              <CardDescription className="text-muted-foreground text-sm max-w-xs mx-auto">
                We've sent a verification link to <strong className="text-foreground">{registeredEmail}</strong>.
                Please check your inbox and click the link to confirm your account.
              </CardDescription>
            </div>
            <div className="pt-4 flex flex-col gap-3">
              <Button asChild className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/95 font-semibold rounded-xl">
                <Link href="/login">Go to Login</Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                Didn't receive the email? Check your spam folder.
              </p>
            </div>
          </CardContent>
        ) : (
          <>
            <CardHeader className="text-center pb-2">
              <img src="/logo.png" alt="JOB CV" className="h-10 mx-auto mb-4" />
              <CardTitle className="text-2xl font-bold text-primary">Create Account</CardTitle>
              <CardDescription className="text-muted-foreground">Join the platform and start your career journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Profile Photo Upload */}
                <div className="flex flex-col items-center space-y-3 mb-6">
                  <Label className="text-sm font-semibold text-foreground">Profile Picture <span className="text-destructive">*</span></Label>
                  <div className="relative group">
                    <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-primary/20 bg-muted flex items-center justify-center relative group-hover:border-primary/50 transition-colors">
                      {imagePreview ? (
                        <img src={imagePreview} className="h-full w-full object-cover" alt="Profile preview" />
                      ) : (
                        <div className="text-center p-3 flex flex-col items-center">
                          <span className="text-[10px] text-muted-foreground font-semibold">Select Photo</span>
                        </div>
                      )}
                    </div>
                    <label
                      htmlFor="profile-upload"
                      className="absolute inset-0 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-semibold"
                    >
                      {imagePreview ? "Change Photo" : "Upload Photo"}
                    </label>
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={registerMutation.isPending}
                    />
                  </div>
                  {imageError && <p className="text-xs text-destructive">{imageError}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="John Doe"
                    className="h-11 bg-background text-foreground"
                    disabled={registerMutation.isPending}
                    required
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email Address</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-11 bg-background text-foreground"
                    disabled={registerMutation.isPending}
                    required
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-11 pr-10 bg-background text-foreground"
                      disabled={registerMutation.isPending}
                      required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 pr-10 bg-background text-foreground"
                  disabled={registerMutation.isPending}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login">
              <span className="font-semibold text-primary hover:underline cursor-pointer">Sign In</span>
            </Link>
          </p>
        </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
