"use client";

import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  AlertCircle,
  Briefcase,
  FileText,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Upload,
  Users,
} from "lucide-react";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDateTime(value: string | null) {
  if (!value) return "Never";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatFileSize(bytes: number) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function RoleBadge({ role }: { role: string }) {
  if (role === "admin") {
    return <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Admin</Badge>;
  }

  return <Badge variant="outline">User</Badge>;
}

function EmptyTableRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-24 text-center text-sm text-muted-foreground">
        {label}
      </TableCell>
    </TableRow>
  );
}

export default function AdminDashboard() {
  const { user, loading } = useAuth({ refreshOnMount: true });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const isAdmin = user?.role === "admin";

  const dashboardQuery = trpc.admin.dashboard.useQuery(undefined, {
    enabled: isAdmin,
    retry: false,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });

  const handleAdminSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginError("");
    setIsSigningIn(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setLoginError("Invalid admin email or password.");
        return;
      }

      window.location.href = "/admin";
    } catch {
      setLoginError("Could not sign in. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[hsl(210,24%,97%)] px-4 py-16">
        <Card className="w-full max-w-md rounded-lg shadow-sm">
          <CardContent className="p-8">
            <div className="text-center">
              <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
              <h1 className="mt-5 text-xl font-semibold">Admin sign in required</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Please sign in with an admin account to access this dashboard.
              </p>
            </div>
            <form onSubmit={handleAdminSignIn} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email Address</Label>
                <Input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@example.com"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  className="h-11"
                />
              </div>
              {loginError && <p className="text-sm text-destructive">{loginError}</p>}
              <Button type="submit" disabled={isSigningIn} className="w-full">
                {isSigningIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-16">
        <Card className="w-full max-w-md rounded-lg shadow-sm">
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="mt-5 text-xl font-semibold">Access denied</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your account does not have permission to view the admin dashboard.
            </p>
            <Button variant="outline" className="mt-6 w-full" onClick={() => { window.location.href = "/"; }}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (dashboardQuery.isLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Refreshing admin data...</p>
        </div>
      </div>
    );
  }

  if (dashboardQuery.error || !dashboardQuery.data) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-16">
        <Card className="w-full max-w-md rounded-lg shadow-sm">
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="mt-5 text-xl font-semibold">Could not load admin data</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Refresh the dashboard after checking the database connection.
            </p>
            <Button variant="outline" className="mt-6 w-full" onClick={() => dashboardQuery.refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dashboard = dashboardQuery.data;
  const metrics = [
    {
      label: "Total users",
      value: formatNumber(dashboard.totalUsers),
      detail: `${formatNumber(dashboard.activeUsers)} active in 30 days`,
      icon: Users,
    },
    {
      label: "CV uploads",
      value: formatNumber(dashboard.totalCvUploads),
      detail: "Uploaded resumes",
      icon: Upload,
    },
    {
      label: "Open jobs",
      value: formatNumber(dashboard.totalJobs),
      detail: "Jobs in database",
      icon: Briefcase,
    },
    {
      label: "Admins",
      value: formatNumber(dashboard.totalAdmins),
      detail: "Admin accounts",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-[hsl(210,24%,97%)]">
      <div className="container py-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="bg-white">
                <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                Admin
              </Badge>
              <Badge variant="secondary">Updated {formatDateTime(dashboard.refreshedAt)}</Badge>
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Live users, CV uploads, and job data from the database.</p>
          </div>

          <Button size="sm" onClick={() => dashboardQuery.refetch()} disabled={dashboardQuery.isFetching}>
            <RefreshCw className={`mr-2 h-4 w-4 ${dashboardQuery.isFetching ? "animate-spin" : ""}`} />
            Sync
          </Button>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.label} className="rounded-lg shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight">{metric.value}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                    <metric.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="mt-4 text-xs font-medium text-muted-foreground">{metric.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="users" className="gap-4">
          <TabsList>
            <TabsTrigger value="users">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="jobs">
              <Briefcase className="h-4 w-4" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="uploads">
              <FileText className="h-4 w-4" />
              Uploads
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="rounded-lg shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-base">Recent Users</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>CVs</TableHead>
                      <TableHead>Last Signed In</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboard.recentUsers.length === 0 ? (
                      <EmptyTableRow colSpan={4} label="No users found." />
                    ) : (
                      dashboard.recentUsers.map((recentUser) => (
                        <TableRow key={recentUser.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{recentUser.name ?? "Unnamed user"}</p>
                              <p className="text-xs text-muted-foreground">{recentUser.email ?? recentUser.openId}</p>
                            </div>
                          </TableCell>
                          <TableCell><RoleBadge role={recentUser.role} /></TableCell>
                          <TableCell>{recentUser.cvUploads}</TableCell>
                          <TableCell className="text-muted-foreground">{formatDateTime(recentUser.lastSignedIn)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs">
            <Card className="rounded-lg shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-base">Recent Jobs</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboard.recentJobs.length === 0 ? (
                      <EmptyTableRow colSpan={4} label="No jobs found." />
                    ) : (
                      dashboard.recentJobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{job.title}</p>
                              <p className="text-xs text-muted-foreground">{job.company}</p>
                            </div>
                          </TableCell>
                          <TableCell>{job.type}</TableCell>
                          <TableCell>{job.level}</TableCell>
                          <TableCell className="text-muted-foreground">{formatDateTime(job.createdAt)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="uploads">
            <Card className="rounded-lg shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4 text-primary" />
                  Recent CV Uploads
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboard.recentUploads.length === 0 ? (
                      <EmptyTableRow colSpan={4} label="No CV uploads found." />
                    ) : (
                      dashboard.recentUploads.map((upload) => (
                        <TableRow key={upload.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{upload.fileName}</p>
                              <p className="text-xs text-muted-foreground">{upload.mimeType}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{upload.userName ?? "Unknown user"}</p>
                              <p className="text-xs text-muted-foreground">{upload.userEmail ?? `User #${upload.userId}`}</p>
                            </div>
                          </TableCell>
                          <TableCell>{formatFileSize(upload.fileSize)}</TableCell>
                          <TableCell className="text-muted-foreground">{formatDateTime(upload.createdAt)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
