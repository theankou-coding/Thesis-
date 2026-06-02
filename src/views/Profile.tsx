"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/lib/wouter-compat";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import {
  User,
  Mail,
  Shield,
  Calendar,
  FileText,
  Briefcase,
  Loader2,
  Settings,
  LogOut,
  ChevronRight,
  Clock,
  Star,
} from "lucide-react";

export default function Profile() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { data: cvUploads, isLoading: cvLoading } = trpc.cv.myUploads.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: dbSavedJobs } = trpc.saved.mySaved.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: dbAppliedJobs } = trpc.applications.myApplications.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Extract display name and avatar URL
  const nameParts = user?.name ? user.name.split(":::") : [];
  const parsedName = nameParts[0] || user?.name || user?.email?.split("@")[0] || "";
  const avatarUrl = user?.profileImageUrl || nameParts[1] || "";

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(parsedName);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(avatarUrl);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editBase64, setEditBase64] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  // Sync state with user profile metadata when toggled
  useEffect(() => {
    if (user) {
      const parts = user.name ? user.name.split(":::") : [];
      const n = parts[0] || user.name || user.email?.split("@")[0] || "";
      const av = user.profileImageUrl || parts[1] || "";
      setEditName(n);
      setEditImagePreview(av);
      setEditImageFile(null);
      setEditBase64(null);
      setEditError(null);
    }
  }, [isEditing, user]);

  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      window.location.reload();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update profile");
    },
  });

  if (loading) {
    return (
      <div className="container py-20 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-muted-foreground text-sm">Loading your profile…</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container py-24 text-center max-w-md mx-auto">
        <div className="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
          <User className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Sign in to view your profile</h1>
        <p className="text-muted-foreground mb-6">
          Access your account details, uploaded CVs, and application history.
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

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "Recently";

  const lastSeen = user.lastSignedIn
    ? new Date(user.lastSignedIn).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "N/A";

  const initials = parsedName
    ? parsedName.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase()
    : (user.email?.[0] ?? "U").toUpperCase();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setEditError("Profile image must be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setEditError("Please upload an image file");
      return;
    }

    setEditError(null);
    setEditImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditImagePreview(reader.result as string);
      const base64 = (reader.result as string).split(",")[1];
      setEditBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    updateProfileMutation.mutate({
      name: editName,
      profileImageContent: editBase64 || undefined,
      profileImageName: editImageFile?.name || undefined,
      profileImageMime: editImageFile?.type || undefined,
    });
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const quickLinks = [
    { href: "/my-cvs", icon: FileText, label: "My Uploaded CVs", count: cvLoading ? "…" : String(cvUploads?.length ?? 0) },
    { href: "/history", icon: Briefcase, label: "Application History", count: null },
    { href: "/upload-cv", icon: Star, label: "AI Job Matching", count: null },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Profile Hero */}
      <div className="border-b border-border bg-gradient-to-br from-primary/10 via-background to-accent/5">
        <div className="container py-12 max-w-4xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="h-24 w-24 rounded-3xl overflow-hidden bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-3xl flex items-center justify-center shadow-lg shrink-0 border border-border/20">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={parsedName} className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-2 border-background" title="Online" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-foreground">{parsedName}</h1>
                <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                  {user.role === "admin" ? "Admin" : "Member"}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {user.email}
              </p>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined {joinDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Last active {lastSeen}
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" />
                  {user.loginMethod === "email" ? "Email account" : "OAuth account"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsEditing(!isEditing)}>
                <Settings className="h-4 w-4" />
                Edit Profile
              </Button>
              <Button variant="ghost" size="sm" className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container py-10 max-w-4xl">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: Edit form + Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Edit Form */}
            {isEditing && (
              <Card className="border-border shadow-sm">
                <CardContent className="pt-6 pb-6">
                  <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Settings className="h-4 w-4 text-primary" />
                    Edit Profile
                  </h2>
                  <div className="space-y-4">
                    {/* Picture edit */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="h-16 w-16 rounded-full overflow-hidden border bg-muted flex items-center justify-center">
                        {editImagePreview ? (
                          <img src={editImagePreview} className="h-full w-full object-cover" alt="Preview" />
                        ) : (
                          <span className="text-xs text-muted-foreground font-semibold">No Image</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="edit-avatar" className="cursor-pointer text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded hover:bg-primary/95 font-medium transition-colors">
                          Change Avatar
                        </Label>
                        <input
                          id="edit-avatar"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <p className="text-[10px] text-muted-foreground">JPG, PNG under 5MB</p>
                        {editError && <p className="text-xs text-destructive mt-1">{editError}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profile-name">Display Name</Label>
                      <Input
                        id="profile-name"
                        placeholder="Enter your name"
                        className="h-11 bg-background"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input
                        value={user.email || ""}
                        className="h-11 bg-muted text-muted-foreground"
                        disabled
                      />
                      <p className="text-xs text-muted-foreground">Email cannot be changed here. Contact support if needed.</p>
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handleSaveProfile} size="sm" className="font-medium" disabled={updateProfileMutation.isPending}>
                        {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Account Details Card */}
            <Card className="border-border shadow-sm">
              <CardContent className="pt-6 pb-5">
                <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Account Information
                </h2>
                <div className="space-y-4">
                  {[
                    { label: "Full Name", value: parsedName || "Not set" },
                    { label: "Email Address", value: user.email || "Not set" },
                    { label: "Account Role", value: user.role || "user" },
                    { label: "Login Method", value: user.loginMethod || "email" },
                    { label: "Member Since", value: joinDate },
                    { label: "Last Sign-In", value: lastSeen },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start justify-between py-2 border-b border-border last:border-0">
                      <span className="text-sm text-muted-foreground w-36 shrink-0">{label}</span>
                      <span className="text-sm font-medium text-foreground text-right capitalize">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="border-border shadow-sm">
              <CardContent className="pt-6 pb-5">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Security
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium text-foreground">Password</p>
                      <p className="text-xs text-muted-foreground">Last changed: Unknown</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.info("Password reset link sent to your email (simulated).")}
                    >
                      Change Password
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                      <p className="text-xs text-muted-foreground">Not enabled</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.info("2FA setup coming soon!")}
                    >
                      Enable 2FA
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Quick links + Stats */}
          <aside className="space-y-5">
            {/* Stats */}
            <Card className="border-border shadow-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary/60" />
              <CardContent className="pt-5 pb-5">
                <h3 className="font-semibold text-foreground mb-4 text-sm">Your Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">CVs Uploaded</span>
                    <span className="text-sm font-bold text-foreground">
                      {cvLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : cvUploads?.length ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Jobs Applied</span>
                    <span className="text-sm font-bold text-foreground">
                      {dbAppliedJobs?.length ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Saved Jobs</span>
                    <span className="text-sm font-bold text-foreground">
                      {dbSavedJobs?.length ?? 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="border-border shadow-sm">
              <CardContent className="pt-5 pb-2">
                <h3 className="font-semibold text-foreground mb-3 text-sm">Quick Links</h3>
                <div className="space-y-1">
                  {quickLinks.map(({ href, icon: Icon, label, count }) => (
                    <Link key={href} href={href}>
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer group">
                        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-sm text-foreground flex-1">{label}</span>
                        {count !== null && (
                          <Badge variant="secondary" className="text-xs">{count}</Badge>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/30 shadow-sm">
              <CardContent className="pt-5 pb-5">
                <h3 className="font-semibold text-destructive mb-2 text-sm">Danger Zone</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive"
                  onClick={() => toast.error("Account deletion is disabled in this demo.")}
                >
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
