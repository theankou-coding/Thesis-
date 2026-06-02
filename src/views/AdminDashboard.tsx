"use client";

import {
  useMemo,
  useState,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useAuth } from "@/_core/hooks/useAuth";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  AlertCircle,
  Briefcase,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Moon,
  Pencil,
  RefreshCw,
  ShieldCheck,
  Sun,
  Trash2,
  Upload,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { AdminDashboardSnapshot } from "../../server/db";

type AdminDashboardData = AdminDashboardSnapshot;
type AdminUser = AdminDashboardData["recentUsers"][number];
type AdminJob = AdminDashboardData["recentJobs"][number];
type AdminUpload = AdminDashboardData["recentUploads"][number];

type Metric = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
};

type UserEditForm = {
  id: number;
  name: string;
  email: string;
  role: "user" | "hr" | "admin";
  profileImageUrl: string;
};

type JobEditForm = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  level: string;
  description: string;
  skills: string;
  salary: string;
  imageUrls: string;
};

type DeleteTarget =
  | { type: "user"; id: number; label: string }
  | { type: "job"; id: number; label: string };

type AdminTab = "overview" | "users" | "jobs" | "uploads";

const ADMIN_NAV_ITEMS: Array<{
  value: AdminTab;
  label: string;
  icon: LucideIcon;
}> = [
  { value: "overview", label: "Overview", icon: LayoutDashboard },
  { value: "users", label: "Users", icon: Users },
  { value: "jobs", label: "Posts", icon: Briefcase },
  { value: "uploads", label: "Uploads", icon: FileText },
];

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

function getDisplayName(user: AdminUser) {
  const [name] = (user.name ?? "").split(":::");
  return name || user.email?.split("@")[0] || "Unnamed user";
}

function getUserImage(user: AdminUser) {
  const [, embeddedImage] = (user.name ?? "").split(":::");
  return user.profileImageUrl || embeddedImage || "";
}

function getImageUrls(value: string) {
  return value
    .split(/[\n,]+/)
    .map(url => url.trim())
    .filter(Boolean);
}

function EmptyTableRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className="h-24 text-center text-sm text-muted-foreground"
      >
        {label}
      </TableCell>
    </TableRow>
  );
}

function PageLoader({ label }: { label: string }) {
  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function AccessCard({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-16">
      <Card className="w-full max-w-md rounded-lg shadow-sm">
        <CardContent className="p-8 text-center">
          <Icon className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-5 text-xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          {action}
        </CardContent>
      </Card>
    </div>
  );
}

function AdminLoginForm({
  email,
  password,
  loginError,
  isSigningIn,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: {
  email: string;
  password: string;
  loginError: string;
  isSigningIn: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(210,24%,97%)] px-4 py-16">
      <Card className="w-full max-w-md rounded-lg shadow-sm">
        <CardContent className="p-8">
          <div className="text-center">
            <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-5 text-xl font-semibold">
              Admin sign in required
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Please sign in with an admin account to access this dashboard.
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email Address</Label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={event => onEmailChange(event.target.value)}
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
                onChange={event => onPasswordChange(event.target.value)}
                placeholder="Enter password"
                className="h-11"
              />
            </div>

            {loginError && (
              <p className="text-sm text-destructive">{loginError}</p>
            )}

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

function Thumbnail({
  src,
  label,
  fallbackIcon: Icon,
}: {
  src?: string | null;
  label: string;
  fallbackIcon: LucideIcon;
}) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
      {src ? (
        <img src={src} alt={label} className="h-full w-full object-cover" />
      ) : (
        <Icon className="h-5 w-5 text-muted-foreground" />
      )}
    </div>
  );
}

function DetailImage({
  src,
  label,
  fallbackIcon,
}: {
  src?: string | null;
  label: string;
  fallbackIcon: LucideIcon;
}) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-md border bg-muted">
      {src ? (
        <img src={src} alt={label} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center">
          {fallbackIcon === UserRound ? (
            <UserRound className="h-10 w-10 text-muted-foreground" />
          ) : (
            <ImageIcon className="h-10 w-10 text-muted-foreground" />
          )}
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 border-b py-3 last:border-0 sm:grid-cols-[140px_1fr]">
      <dt className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </dt>
      <dd className="min-w-0 break-words text-sm text-foreground">
        {value || "Not set"}
      </dd>
    </div>
  );
}

function DashboardHeader({
  refreshedAt,
  isFetching,
  onRefresh,
  theme,
  canToggleTheme,
  onToggleTheme,
}: {
  refreshedAt: string;
  isFetching: boolean;
  onRefresh: () => void;
  theme: "light" | "dark";
  canToggleTheme: boolean;
  onToggleTheme?: () => void;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="min-w-0">
        <h1 className="mt-3 truncate text-3xl font-semibold tracking-tight text-foreground">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live users, CV uploads, and job data from the database.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onRefresh} disabled={isFetching}>
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Sync
        </Button>
        {canToggleTheme && (
          <Button
            size="icon"
            variant="outline"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  const Icon = metric.icon;

  return (
    <Card className="rounded-lg shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm text-muted-foreground">
              {metric.label}
            </p>
            <p className="mt-2 truncate text-2xl font-semibold tracking-tight">
              {metric.value}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        <p className="mt-4 truncate text-xs font-medium text-muted-foreground">
          {metric.detail}
        </p>
      </CardContent>
    </Card>
  );
}

function MetricsGrid({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
      {metrics.map(metric => (
        <MetricCard key={metric.label} metric={metric} />
      ))}
    </div>
  );
}

function UsersTable({
  users,
  onView,
  onEdit,
  onDelete,
}: {
  users: AdminUser[];
  onView: (user: AdminUser) => void;
  onEdit: (user: AdminUser, event: MouseEvent<HTMLButtonElement>) => void;
  onDelete: (user: AdminUser, event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <Table className="w-full table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[72px]">Image</TableHead>
            <TableHead className="w-[280px]">User</TableHead>
            <TableHead className="w-[80px]">CVs</TableHead>
            <TableHead className="w-[170px]">Last Signed In</TableHead>
            <TableHead className="w-[116px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <EmptyTableRow colSpan={5} label="No users found." />
          ) : (
            users.map(user => (
              <TableRow
                key={user.id}
                className="cursor-pointer"
                onClick={() => onView(user)}
              >
                <TableCell>
                  <Thumbnail
                    src={getUserImage(user)}
                    label={getDisplayName(user)}
                    fallbackIcon={UserRound}
                  />
                </TableCell>
                <TableCell>
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {getDisplayName(user)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email ?? user.openId}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{user.cvUploads}</TableCell>
                <TableCell className="truncate text-muted-foreground">
                  {formatDateTime(user.lastSignedIn)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={event => onEdit(user, event)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit user</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={event => onDelete(user, event)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete user</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function JobsTable({
  jobs,
  onView,
  onEdit,
  onDelete,
}: {
  jobs: AdminJob[];
  onView: (job: AdminJob) => void;
  onEdit: (job: AdminJob, event: MouseEvent<HTMLButtonElement>) => void;
  onDelete: (job: AdminJob, event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <Table className="w-full table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[72px]">Image</TableHead>
            <TableHead className="w-[260px]">Post</TableHead>
            <TableHead className="w-[180px]">Company</TableHead>
            <TableHead className="w-[130px]">Type</TableHead>
            <TableHead className="w-[130px]">Level</TableHead>
            <TableHead className="w-[170px]">Created</TableHead>
            <TableHead className="w-[116px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.length === 0 ? (
            <EmptyTableRow colSpan={7} label="No posts found." />
          ) : (
            jobs.map(job => (
              <TableRow
                key={job.id}
                className="cursor-pointer"
                onClick={() => onView(job)}
              >
                <TableCell>
                  <Thumbnail
                    src={job.coverImage}
                    label={job.title}
                    fallbackIcon={ImageIcon}
                  />
                </TableCell>
                <TableCell>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{job.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {job.location}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="truncate">{job.company}</TableCell>
                <TableCell className="truncate">{job.type}</TableCell>
                <TableCell className="truncate">{job.level}</TableCell>
                <TableCell className="truncate text-muted-foreground">
                  {formatDateTime(job.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={event => onEdit(job, event)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit post</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={event => onDelete(job, event)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete post</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function UploadsTable({ uploads }: { uploads: AdminUpload[] }) {
  return (
    <div className="overflow-x-auto">
      <Table className="w-full table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[320px]">File</TableHead>
            <TableHead className="w-[260px]">User</TableHead>
            <TableHead className="w-[120px]">Size</TableHead>
            <TableHead className="w-[170px]">Uploaded</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {uploads.length === 0 ? (
            <EmptyTableRow colSpan={4} label="No CV uploads found." />
          ) : (
            uploads.map(upload => (
              <TableRow key={upload.id}>
                <TableCell>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{upload.fileName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {upload.mimeType}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {upload.userName ?? "Unknown user"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {upload.userEmail ?? `User #${upload.userId}`}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="truncate">
                  {formatFileSize(upload.fileSize)}
                </TableCell>
                <TableCell className="truncate text-muted-foreground">
                  {formatDateTime(upload.createdAt)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function UserViewDialog({
  user,
  onOpenChange,
}: {
  user: AdminUser | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={!!user} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            Read-only user data. Use the pencil button in the table to edit.
          </DialogDescription>
        </DialogHeader>
        {user && (
          <div className="space-y-5">
            <DetailImage
              src={getUserImage(user)}
              label={getDisplayName(user)}
              fallbackIcon={UserRound}
            />
            <dl>
              <DetailRow label="ID" value={user.id} />
              <DetailRow label="Open ID" value={user.openId} />
              <DetailRow label="Name" value={getDisplayName(user)} />
              <DetailRow label="Email" value={user.email} />
              <DetailRow label="Login Method" value={user.loginMethod} />
              <DetailRow label="CV Uploads" value={user.cvUploads} />
              <DetailRow label="Image URL" value={getUserImage(user)} />
              <DetailRow
                label="Last Signed In"
                value={formatDateTime(user.lastSignedIn)}
              />
              <DetailRow
                label="Created"
                value={formatDateTime(user.createdAt)}
              />
              <DetailRow
                label="Updated"
                value={formatDateTime(user.updatedAt)}
              />
            </dl>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function JobViewDialog({
  job,
  onOpenChange,
}: {
  job: AdminJob | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={!!job} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Post Details</DialogTitle>
          <DialogDescription>
            Read-only post data. Use the pencil button in the table to edit.
          </DialogDescription>
        </DialogHeader>
        {job && (
          <div className="space-y-5">
            <DetailImage
              src={job.coverImage}
              label={job.title}
              fallbackIcon={ImageIcon}
            />
            {job.images.length > 1 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {job.images.map(image => (
                  <div
                    key={image.id}
                    className="aspect-video overflow-hidden rounded-md border bg-muted"
                  >
                    <img
                      src={image.imageUrl}
                      alt={job.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
            <dl>
              <DetailRow label="ID" value={job.id} />
              <DetailRow label="Title" value={job.title} />
              <DetailRow label="Company" value={job.company} />
              <DetailRow label="Location" value={job.location} />
              <DetailRow label="Type" value={job.type} />
              <DetailRow label="Level" value={job.level} />
              <DetailRow label="Salary" value={job.salary} />
              <DetailRow label="Skills" value={job.skills} />
              <DetailRow label="Description" value={job.description} />
              <DetailRow
                label="Image URLs"
                value={
                  job.images.length > 0
                    ? job.images.map(image => image.imageUrl).join(", ")
                    : null
                }
              />
              <DetailRow
                label="Created"
                value={formatDateTime(job.createdAt)}
              />
            </dl>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function UserEditDialog({
  form,
  isSaving,
  onChange,
  onClose,
  onSubmit,
}: {
  form: UserEditForm | null;
  isSaving: boolean;
  onChange: (form: UserEditForm) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Dialog open={!!form} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user fields and the profile image URL.
          </DialogDescription>
        </DialogHeader>
        {form && (
          <form onSubmit={onSubmit} className="space-y-5">
            <DetailImage
              src={form.profileImageUrl}
              label={form.name}
              fallbackIcon={UserRound}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-user-name">Name</Label>
                <Input
                  id="edit-user-name"
                  value={form.name}
                  onChange={event =>
                    onChange({ ...form, name: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-user-email">Email</Label>
                <Input
                  id="edit-user-email"
                  type="email"
                  value={form.email}
                  onChange={event =>
                    onChange({ ...form, email: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-user-image">Profile Image URL</Label>
                <Input
                  id="edit-user-image"
                  value={form.profileImageUrl}
                  onChange={event =>
                    onChange({
                      ...form,
                      profileImageUrl: event.target.value,
                    })
                  }
                  placeholder="https://..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save User
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function JobEditDialog({
  form,
  isSaving,
  onChange,
  onClose,
  onSubmit,
}: {
  form: JobEditForm | null;
  isSaving: boolean;
  onChange: (form: JobEditForm) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const imageUrls = useMemo(() => getImageUrls(form?.imageUrls ?? ""), [form]);

  return (
    <Dialog open={!!form} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
          <DialogDescription>
            Update post fields and image URLs. The first image is used as the
            cover.
          </DialogDescription>
        </DialogHeader>
        {form && (
          <form onSubmit={onSubmit} className="space-y-5">
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {imageUrls.map(url => (
                  <div
                    key={url}
                    className="aspect-video overflow-hidden rounded-md border bg-muted"
                  >
                    <img
                      src={url}
                      alt={form.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-job-title">Title</Label>
                <Input
                  id="edit-job-title"
                  value={form.title}
                  onChange={event =>
                    onChange({ ...form, title: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-job-company">Company</Label>
                <Input
                  id="edit-job-company"
                  value={form.company}
                  onChange={event =>
                    onChange({ ...form, company: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-job-location">Location</Label>
                <Input
                  id="edit-job-location"
                  value={form.location}
                  onChange={event =>
                    onChange({ ...form, location: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-job-type">Type</Label>
                <Input
                  id="edit-job-type"
                  value={form.type}
                  onChange={event =>
                    onChange({ ...form, type: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-job-level">Level</Label>
                <Input
                  id="edit-job-level"
                  value={form.level}
                  onChange={event =>
                    onChange({ ...form, level: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-job-salary">Salary</Label>
                <Input
                  id="edit-job-salary"
                  value={form.salary}
                  onChange={event =>
                    onChange({ ...form, salary: event.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-job-skills">Skills</Label>
              <Input
                id="edit-job-skills"
                value={form.skills}
                onChange={event =>
                  onChange({ ...form, skills: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-job-images">Image URLs</Label>
              <Textarea
                id="edit-job-images"
                value={form.imageUrls}
                onChange={event =>
                  onChange({ ...form, imageUrls: event.target.value })
                }
                placeholder="One image URL per line"
                className="min-h-24"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-job-description">Description</Label>
              <Textarea
                id="edit-job-description"
                value={form.description}
                onChange={event =>
                  onChange({ ...form, description: event.target.value })
                }
                className="min-h-32"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Post
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AdminNavList({
  isLoggingOut,
  onLogout,
  onSelect,
}: {
  isLoggingOut: boolean;
  onLogout: () => void;
  onSelect?: () => void;
}) {
  return (
    <div className="space-y-2">
      <TabsList className="grid h-auto w-full grid-cols-1 gap-1 bg-transparent p-0">
        {ADMIN_NAV_ITEMS.map(item => {
          const Icon = item.icon;

          return (
            <TabsTrigger
              key={item.value}
              value={item.value}
              onClick={onSelect}
              className="justify-start gap-2 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=active]:bg-sidebar-primary data-[state=active]:text-sidebar-primary-foreground dark:text-sidebar-primary-foreground/80 dark:hover:bg-sidebar-primary-foreground/10 dark:data-[state=active]:bg-sidebar-primary-foreground dark:data-[state=active]:text-sidebar-primary"
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{item.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
      <Button
        variant="ghost"
        className="w-full justify-start gap-2 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:text-sidebar-primary-foreground/80 dark:hover:bg-sidebar-primary-foreground/10 dark:hover:text-sidebar-primary-foreground"
        onClick={onLogout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
        <span className="truncate">Logout</span>
      </Button>
    </div>
  );
}

function DashboardTabs({
  dashboard,
  onViewUser,
  onEditUser,
  onDeleteUser,
  onViewJob,
  onEditJob,
  onDeleteJob,
}: {
  dashboard: AdminDashboardData;
  onViewUser: (user: AdminUser) => void;
  onEditUser: (user: AdminUser, event: MouseEvent<HTMLButtonElement>) => void;
  onDeleteUser: (user: AdminUser, event: MouseEvent<HTMLButtonElement>) => void;
  onViewJob: (job: AdminJob) => void;
  onEditJob: (job: AdminJob, event: MouseEvent<HTMLButtonElement>) => void;
  onDeleteJob: (job: AdminJob, event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <>
      <TabsContent value="overview" className="mt-0 min-w-0">
        <MetricsGrid metrics={getMetrics(dashboard)} />
        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="rounded-lg shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="truncate text-base">Recent Users</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              {dashboard.recentUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No users found.</p>
              ) : (
                dashboard.recentUsers.slice(0, 4).map(user => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => onViewUser(user)}
                    className="flex w-full min-w-0 items-center gap-3 rounded-md border p-3 text-left hover:bg-muted"
                  >
                    <Thumbnail
                      src={getUserImage(user)}
                      label={getDisplayName(user)}
                      fallbackIcon={UserRound}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {getDisplayName(user)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email ?? user.openId}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="rounded-lg shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="truncate text-base">Recent Posts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              {dashboard.recentJobs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No posts found.</p>
              ) : (
                dashboard.recentJobs.slice(0, 4).map(job => (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => onViewJob(job)}
                    className="flex w-full min-w-0 items-center gap-3 rounded-md border p-3 text-left hover:bg-muted"
                  >
                    <Thumbnail
                      src={job.coverImage}
                      label={job.title}
                      fallbackIcon={ImageIcon}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {job.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {job.company}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="users" className="mt-0 min-w-0">
        <Card className="rounded-lg shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="truncate text-base">Users</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <UsersTable
              users={dashboard.recentUsers}
              onView={onViewUser}
              onEdit={onEditUser}
              onDelete={onDeleteUser}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="jobs" className="mt-0 min-w-0">
        <Card className="rounded-lg shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="truncate text-base">Posts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <JobsTable
              jobs={dashboard.recentJobs}
              onView={onViewJob}
              onEdit={onEditJob}
              onDelete={onDeleteJob}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="uploads" className="mt-0 min-w-0">
        <Card className="rounded-lg shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="flex min-w-0 items-center gap-2 text-base">
              <Activity className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate">Recent CV Uploads</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <UploadsTable uploads={dashboard.recentUploads} />
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
}

function getMetrics(dashboard: AdminDashboardData): Metric[] {
  return [
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
      label: "All posts",
      value: formatNumber(dashboard.totalJobs),
      detail: "Posts in database",
      icon: Briefcase,
    },
  ];
}

function toUserEditForm(user: AdminUser): UserEditForm {
  return {
    id: user.id,
    name: getDisplayName(user),
    email: user.email ?? "",
    role:
      user.role === "admin" || user.role === "hr" || user.role === "user"
        ? user.role
        : "user",
    profileImageUrl: getUserImage(user),
  };
}

function toJobEditForm(job: AdminJob): JobEditForm {
  return {
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    type: job.type,
    level: job.level,
    description: job.description,
    skills: job.skills,
    salary: job.salary,
    imageUrls: job.images.map(image => image.imageUrl).join("\n"),
  };
}

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth({ refreshOnMount: true });
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [viewUser, setViewUser] = useState<AdminUser | null>(null);
  const [viewJob, setViewJob] = useState<AdminJob | null>(null);
  const [editUser, setEditUser] = useState<UserEditForm | null>(null);
  const [editJob, setEditJob] = useState<JobEditForm | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const isAdmin = user?.role === "admin";

  const dashboardQuery = trpc.admin.dashboard.useQuery(undefined, {
    enabled: isAdmin,
    retry: false,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });

  const updateUserMutation = trpc.admin.updateUser.useMutation({
    onSuccess: async () => {
      toast.success("User updated.");
      setEditUser(null);
      await dashboardQuery.refetch();
    },
    onError: error => toast.error(error.message || "Failed to update user."),
  });

  const updateJobMutation = trpc.admin.updateJob.useMutation({
    onSuccess: async () => {
      toast.success("Post updated.");
      setEditJob(null);
      await dashboardQuery.refetch();
    },
    onError: error => toast.error(error.message || "Failed to update post."),
  });

  const deleteUserMutation = trpc.admin.deleteUser.useMutation({
    onSuccess: async () => {
      toast.success("User deleted.");
      setDeleteTarget(null);
      await dashboardQuery.refetch();
    },
    onError: error => toast.error(error.message || "Failed to delete user."),
  });

  const deleteJobMutation = trpc.admin.deleteJob.useMutation({
    onSuccess: async () => {
      toast.success("Post deleted.");
      setDeleteTarget(null);
      await dashboardQuery.refetch();
    },
    onError: error => toast.error(error.message || "Failed to delete post."),
  });

  const handleAdminSignIn = async (event: FormEvent<HTMLFormElement>) => {
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

  const handleEditUser = (
    selectedUser: AdminUser,
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    setEditUser(toUserEditForm(selectedUser));
  };

  const handleDeleteUser = (
    selectedUser: AdminUser,
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    setDeleteTarget({
      type: "user",
      id: selectedUser.id,
      label: getDisplayName(selectedUser),
    });
  };

  const handleEditJob = (
    selectedJob: AdminJob,
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    setEditJob(toJobEditForm(selectedJob));
  };

  const handleDeleteJob = (
    selectedJob: AdminJob,
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    setDeleteTarget({
      type: "job",
      id: selectedJob.id,
      label: selectedJob.title,
    });
  };

  const handleUserSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editUser) return;

    updateUserMutation.mutate({
      id: editUser.id,
      name: editUser.name.trim() || null,
      email: editUser.email.trim() || null,
      role: editUser.role,
      profileImageUrl: editUser.profileImageUrl.trim() || null,
    });
  };

  const handleJobSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editJob) return;

    updateJobMutation.mutate({
      id: editJob.id,
      title: editJob.title,
      company: editJob.company,
      location: editJob.location,
      type: editJob.type,
      level: editJob.level,
      description: editJob.description,
      skills: editJob.skills,
      salary: editJob.salary,
      imageUrls: getImageUrls(editJob.imageUrls),
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "user") {
      deleteUserMutation.mutate({ id: deleteTarget.id });
      return;
    }

    deleteJobMutation.mutate({ id: deleteTarget.id });
  };

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    setIsLoggingOut(true);

    try {
      await logout();
      window.location.href = "/admin";
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return <PageLoader label="Checking admin access..." />;
  }

  if (!user) {
    return (
      <AdminLoginForm
        email={email}
        password={password}
        loginError={loginError}
        isSigningIn={isSigningIn}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleAdminSignIn}
      />
    );
  }

  if (!isAdmin) {
    return (
      <AccessCard
        icon={AlertCircle}
        title="Access denied"
        description="Your account does not have permission to view the admin dashboard."
        action={
          <Button
            variant="outline"
            className="mt-6 w-full"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Back to Home
          </Button>
        }
      />
    );
  }

  if (dashboardQuery.isLoading) {
    return <PageLoader label="Refreshing admin data..." />;
  }

  if (dashboardQuery.error || !dashboardQuery.data) {
    return (
      <AccessCard
        icon={AlertCircle}
        title="Could not load admin data"
        description="Refresh the dashboard after checking the database connection."
        action={
          <Button
            variant="outline"
            className="mt-6 w-full"
            onClick={() => void dashboardQuery.refetch()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        }
      />
    );
  }

  const dashboard = dashboardQuery.data as AdminDashboardData;
  const isDeleting =
    deleteUserMutation.isPending || deleteJobMutation.isPending;

  return (
    <div className="min-h-screen bg-[hsl(210,24%,97%)] dark:bg-background">
      <Tabs
        value={activeTab}
        onValueChange={value => {
          setActiveTab(value as AdminTab);
          setIsMobileMenuOpen(false);
        }}
        className="grid min-h-screen grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)]"
      >
        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-sidebar-background px-4 py-3 text-sidebar-foreground dark:bg-sidebar-primary dark:text-sidebar-primary-foreground lg:hidden">
          <div className="flex min-w-0 items-center gap-2">
            <ShieldCheck className="h-5 w-5 shrink-0" />
            <span className="truncate font-semibold">Admin</span>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="text-current hover:bg-white/10 hover:text-current"
            onClick={() => setIsMobileMenuOpen(open => !open)}
            aria-label="Toggle admin menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </header>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-20 lg:hidden">
            <button
              type="button"
              aria-label="Close admin menu"
              className="absolute inset-0 bg-black/40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="absolute left-3 right-3 top-16 rounded-lg border border-sidebar-border bg-sidebar-background p-3 text-sidebar-foreground shadow-lg dark:border-sidebar-primary/40 dark:bg-sidebar-primary dark:text-sidebar-primary-foreground">
              <AdminNavList
                isLoggingOut={isLoggingOut}
                onLogout={() => void handleLogout()}
                onSelect={() => setIsMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}

        <aside className="hidden border-sidebar-border bg-sidebar-background px-4 py-4 text-sidebar-foreground dark:border-sidebar-primary/40 dark:bg-sidebar-primary dark:text-sidebar-primary-foreground lg:sticky lg:top-0 lg:block lg:h-screen lg:overflow-y-auto lg:border-r">
          <div className="mb-4 flex items-center gap-2 px-2">
            <img src="/logo.png" alt="Logo" className="h-5 w-auto text-sidebar-primary dark:text-sidebar-primary-foreground" />
            <span className="truncate font-semibold">Admin Dashboard</span>
          </div>
          <AdminNavList
            isLoggingOut={isLoggingOut}
            onLogout={() => void handleLogout()}
          />
        </aside>

        <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
          <DashboardHeader
            refreshedAt={dashboard.refreshedAt}
            isFetching={dashboardQuery.isFetching}
            onRefresh={() => void dashboardQuery.refetch()}
            theme={theme}
            canToggleTheme={Boolean(toggleTheme)}
            onToggleTheme={toggleTheme}
          />
          <DashboardTabs
            dashboard={dashboard}
            onViewUser={setViewUser}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            onViewJob={setViewJob}
            onEditJob={handleEditJob}
            onDeleteJob={handleDeleteJob}
          />
        </main>
      </Tabs>

      <UserViewDialog
        user={viewUser}
        onOpenChange={open => !open && setViewUser(null)}
      />
      <JobViewDialog
        job={viewJob}
        onOpenChange={open => !open && setViewJob(null)}
      />
      <UserEditDialog
        form={editUser}
        isSaving={updateUserMutation.isPending}
        onChange={setEditUser}
        onClose={() => setEditUser(null)}
        onSubmit={handleUserSubmit}
      />
      <JobEditDialog
        form={editJob}
        isSaving={updateJobMutation.isPending}
        onChange={setEditJob}
        onClose={() => setEditJob(null)}
        onSubmit={handleJobSubmit}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteTarget?.type === "user" ? "user" : "post"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.label}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
