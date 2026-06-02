import { Link, useLocation } from "@/lib/wouter-compat";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Sun,
  Moon,
  User,
  LogOut,
  FileText,
  Upload,
  Bookmark,
  ChevronDown,
  History,
  LayoutDashboard,
  PlusSquare,
  ListChecks,
  Users2,
  ShieldCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mainNav = [
  { href: "/jobs", label: "Find Jobs" },
  { href: "/create-cv", label: "Create CV" },
  { href: "/upload-cv", label: "CV Manager" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
];

const hrNav = [
  { href: "/hr", label: "Dashboard", tab: undefined },
  { href: "/hr?tab=post-job", label: "Post a Job", tab: "post-job" },
  { href: "/hr?tab=manage-jobs", label: "Manage Listings", tab: "manage-jobs" },
  { href: "/jobs", label: "Browse Jobs", tab: undefined },
  { href: "/about", label: "About Us", tab: undefined },
  { href: "/contact", label: "Contact Us", tab: undefined },
];

const subNav = [
  { href: "/jobs", label: "Jobs You Might Like" },
  { href: "/history?tab=applied", label: "Applied Jobs" },
  { href: "/history?tab=saved", label: "Saved Jobs" },
  { href: "/upload-cv", label: "CV Manager" },
];

const hrSubNav = [
  { href: "/hr", label: "Dashboard Overview" },
  { href: "/hr?tab=post-job", label: "Post a New Job" },
  { href: "/hr?tab=manage-jobs", label: "Manage Active Jobs" },
];

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const nameParts = user?.name ? user.name.split(":::") : [];
  const displayName =
    nameParts[0] || user?.name || user?.email?.split("@")[0] || "";
  const avatarUrl = user?.profileImageUrl || nameParts[1] || "";

  const isHr = mounted && isAuthenticated && user?.role === "hr";
  const isAdmin = mounted && isAuthenticated && user?.role === "admin";
  const isUser = mounted && isAuthenticated && !isHr && !isAdmin;

  // Build top-level nav based on role
  const navItems = isHr
    ? hrNav
    : isAdmin
      ? [...mainNav, { href: "/admin", label: "Admin" }]
      : isUser
        ? [
            ...mainNav.filter(
              item => item.href !== "/about" && item.href !== "/contact"
            ),
            { href: "/profile", label: "Profile" },
            { href: "/about", label: "About Us" },
            { href: "/contact", label: "Contact Us" },
          ]
        : mainNav;

  const quickAccessNav = isHr ? hrSubNav : subNav;

  return (
    <header className="sticky top-0 z-50 bg-card text-card-foreground shadow-sm transition-colors border-b">
      {/* Main navigation row */}
      <div className="border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo.png" alt="JOB CV" className="h-10" />
          </Link>

          {/* Center nav links */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map(link => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))}
          </nav>

          {/* Right side: auth buttons & theme toggle */}
          <div className="hidden items-center gap-4 lg:flex">
            {/* Theme Toggle Button */}
            {toggleTheme && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full h-9 w-9 text-foreground/75 hover:text-primary hover:bg-muted"
                aria-label="Toggle theme"
              >
                {!mounted ? (
                  <span className="h-[1.2rem] w-[1.2rem]" />
                ) : theme === "dark" ? (
                  <Sun className="h-[1.2rem] w-[1.2rem]" />
                ) : (
                  <Moon className="h-[1.2rem] w-[1.2rem]" />
                )}
              </Button>
            )}

            {!mounted ? (
              <div className="h-9 w-20 bg-muted/20 animate-pulse rounded-full" />
            ) : isAuthenticated ? (
              <>
                {/* HR users get a shortcut to Dashboard; others get Edit Profile */}
                {isHr ? (
                  <Link href="/hr">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 font-semibold border-violet-500/30 text-violet-600 dark:text-violet-400 hover:bg-violet-500/5 rounded-full px-4"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      HR Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/profile">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 font-semibold border-primary/20 text-primary hover:bg-primary/5 rounded-full px-4"
                    >
                      <User className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  </Link>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-muted/40 border-border hover:bg-muted transition-all cursor-pointer max-w-[220px] select-none hover:shadow-sm">
                      <div className="h-6 w-6 rounded-full overflow-hidden bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-border">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={displayName}
                            className="h-full w-full object-cover"
                          />
                        ) : displayName ? (
                          displayName[0].toUpperCase()
                        ) : (
                          <User className="h-3 w-3" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span
                          className="text-sm font-medium text-foreground truncate max-w-[100px] block"
                          title={displayName}
                        >
                          {displayName}
                        </span>
                      </div>
                      {isHr && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-full px-1.5 py-0.5 shrink-0">
                          HR
                        </span>
                      )}
                      {isAdmin && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full px-1.5 py-0.5 shrink-0">
                          Admin
                        </span>
                      )}
                      <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                    </div>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    className="w-60 mt-1 border border-border bg-popover p-1.5 shadow-lg rounded-xl"
                  >
                    <DropdownMenuLabel className="px-2.5 py-2">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-foreground truncate leading-none">
                            {displayName}
                          </p>
                          {isHr && (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-full px-1.5 py-0.5 shrink-0">
                              HR
                            </span>
                          )}
                          {isAdmin && (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full px-1.5 py-0.5 shrink-0">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate font-normal leading-tight mt-0.5">
                          {user?.email || (isHr ? "HR Recruiter" : "Candidate")}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-1 bg-border/60" />

                    {/* ── HR-specific menu items ── */}
                    {isHr ? (
                      <DropdownMenuGroup>
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link
                            href="/hr"
                            className="flex w-full items-center gap-2 px-2 py-1.5 font-semibold text-violet-600 dark:text-violet-400"
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            <span>HR Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link
                            href="/hr?tab=post-job"
                            className="flex w-full items-center gap-2 px-2 py-1.5"
                          >
                            <PlusSquare className="h-4 w-4 text-muted-foreground" />
                            <span>Post a Job</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link
                            href="/hr?tab=manage-jobs"
                            className="flex w-full items-center gap-2 px-2 py-1.5"
                          >
                            <ListChecks className="h-4 w-4 text-muted-foreground" />
                            <span>Manage Listings</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link
                            href="/profile"
                            className="flex w-full items-center gap-2 px-2 py-1.5"
                          >
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>My Profile</span>
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    ) : (
                      /* ── Standard user menu items ── */
                      <DropdownMenuGroup>
                        {isAdmin && (
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link
                              href="/admin"
                              className="flex w-full items-center gap-2 px-2 py-1.5 font-semibold text-amber-600 dark:text-amber-400"
                            >
                              <ShieldCheck className="h-4 w-4" />
                              <span>Admin Panel</span>
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link
                            href="/profile"
                            className="flex w-full items-center gap-2 px-2 py-1.5"
                          >
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>My Profile</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link
                            href="/create-cv"
                            className="flex w-full items-center gap-2 px-2 py-1.5"
                          >
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>Create CV</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link
                            href="/upload-cv"
                            className="flex w-full items-center gap-2 px-2 py-1.5"
                          >
                            <Upload className="h-4 w-4 text-muted-foreground" />
                            <span>CV Manager</span>
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    )}

                    {/* ── Activity section (job seekers only) ── */}
                    {!isHr && (
                      <>
                        <DropdownMenuSeparator className="my-1 bg-border/60" />
                        <DropdownMenuGroup>
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link
                              href="/history?tab=applied"
                              className="flex w-full items-center gap-2 px-2 py-1.5"
                            >
                              <History className="h-4 w-4 text-muted-foreground" />
                              <span>Applied Jobs</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link
                              href="/history?tab=saved"
                              className="flex w-full items-center gap-2 px-2 py-1.5"
                            >
                              <Bookmark className="h-4 w-4 text-muted-foreground" />
                              <span>Saved Jobs</span>
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </>
                    )}

                    <DropdownMenuSeparator className="my-1 bg-border/60" />
                    <DropdownMenuItem
                      onClick={() => logout()}
                      className="flex w-full items-center gap-2 px-2 py-1.5 cursor-pointer text-destructive focus:bg-destructive/10 dark:focus:bg-destructive/20 focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4 text-destructive" />
                      <span>Log Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <span className="text-sm font-medium text-foreground/70 hover:text-primary cursor-pointer px-3 py-2">
                    Login
                  </span>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 font-semibold"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            {mounted && isAuthenticated && (
              <Link href={isHr ? "/hr" : "/profile"}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-9 w-9 p-0 bg-muted/40 border border-border relative"
                >
                  <div className="h-6 w-6 rounded-full overflow-hidden bg-primary/10 text-primary flex items-center justify-center font-bold text-xs ring-1 ring-border">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : displayName ? (
                      displayName[0].toUpperCase()
                    ) : (
                      <User className="h-3 w-3" />
                    )}
                  </div>
                  {isHr && (
                    <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-violet-500 border-2 border-card" />
                  )}
                </Button>
              </Link>
            )}
            <button className="p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-b border-border bg-card p-4 lg:hidden">
          <nav className="flex flex-col gap-2">
            {navItems.map(link => (
              <MobileNavLink
                key={link.href}
                href={link.href}
                label={link.label}
                onClose={() => setMobileOpen(false)}
              />
            ))}

            {/* Quick access sub-nav */}
            <div className="border-t border-border pt-3 mt-2">
              <p className="px-4 text-xs font-semibold uppercase text-muted-foreground mb-2">
                {isHr ? "Recruiter Tools" : "Quick Access"}
              </p>
              {quickAccessNav.map(link => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="block px-4 py-1.5 text-sm text-foreground/60 hover:text-foreground transition-colors">
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>

            <div className="border-t border-border pt-3 mt-2">
              <div className="flex items-center justify-between px-4 mb-4">
                <span className="text-sm text-muted-foreground">Theme</span>
                {toggleTheme && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleTheme}
                    className="gap-2"
                  >
                    {!mounted ? (
                      <>
                        <span className="h-4 w-4" />
                        <span>Theme Mode</span>
                      </>
                    ) : (
                      <>
                        {theme === "dark" ? (
                          <Sun className="h-4 w-4" />
                        ) : (
                          <Moon className="h-4 w-4" />
                        )}
                        {theme === "dark" ? "Light" : "Dark"} Mode
                      </>
                    )}
                  </Button>
                )}
              </div>

              {isAuthenticated ? (
                <div className="space-y-3 border-t border-border pt-3 mt-2">
                  {/* User info strip */}
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 ring-2 ring-border">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : displayName ? (
                        displayName[0].toUpperCase()
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground truncate leading-none">
                          {displayName}
                        </p>
                        {isHr && (
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-full px-1.5 py-0.5 shrink-0">
                            HR
                          </span>
                        )}
                        {isAdmin && (
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full px-1.5 py-0.5 shrink-0">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate leading-tight mt-1">
                        {user?.email || (isHr ? "HR Recruiter" : "Candidate")}
                      </p>
                    </div>
                  </div>

                  {/* Role-specific quick actions grid */}
                  <div className="grid grid-cols-2 gap-2 px-2">
                    {(isHr
                      ? [
                          {
                            href: "/hr",
                            label: "Dashboard",
                            icon: LayoutDashboard,
                          },
                          {
                            href: "/hr?tab=post-job",
                            label: "Post a Job",
                            icon: PlusSquare,
                          },
                          {
                            href: "/hr?tab=manage-jobs",
                            label: "Manage Jobs",
                            icon: ListChecks,
                          },
                          { href: "/profile", label: "My Profile", icon: User },
                        ]
                      : [
                          ...(isAdmin
                            ? [
                                {
                                  href: "/admin",
                                  label: "Admin Panel",
                                  icon: ShieldCheck,
                                },
                              ]
                            : []),
                          { href: "/profile", label: "My Profile", icon: User },
                          {
                            href: "/create-cv",
                            label: "Create CV",
                            icon: FileText,
                          },
                          {
                            href: "/upload-cv",
                            label: "CV Manager",
                            icon: Upload,
                          },
                          {
                            href: "/history?tab=applied",
                            label: "Applied Jobs",
                            icon: History,
                          },
                          {
                            href: "/history?tab=saved",
                            label: "Saved Jobs",
                            icon: Bookmark,
                          },
                        ]
                    ).map(item => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/30 border-border/50 hover:bg-muted/80 transition-colors"
                        >
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs font-semibold text-foreground">
                            {item.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="px-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-center gap-2 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive rounded-lg h-10"
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1"
                  >
                    <Button size="sm" className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

/* ── Desktop nav link with ?tab= aware active state ── */
function NavLink({ href, label }: { href: string; label: string }) {
  const isActive = useIsActive(href);
  return (
    <Link href={href}>
      <span
        className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${
          isActive
            ? "text-primary font-semibold bg-primary/5"
            : "text-foreground/70 hover:text-primary"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

/* ── Mobile nav link with ?tab= aware active state ── */
function MobileNavLink({
  href,
  label,
  onClose,
}: {
  href: string;
  label: string;
  onClose: () => void;
}) {
  const isActive = useIsActive(href);
  return (
    <Link href={href} onClick={onClose}>
      <span
        className={`block px-4 py-2 text-sm font-medium rounded-md ${
          isActive ? "bg-primary/10 text-primary" : "text-foreground/70"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

/** Returns true when the current window URL matches href, including ?tab= param. */
function useIsActive(href: string): boolean {
  const [location] = useLocation();
  if (typeof window === "undefined") return location === href;

  const fullUrl = window.location.pathname + window.location.search;
  const [hrefPath, hrefQuery] = href.split("?");
  const [currentPath, currentQuery] = fullUrl.split("?");

  if (hrefPath !== currentPath) return false;
  if (!hrefQuery) return !currentQuery;

  const hrefParams = new URLSearchParams(hrefQuery);
  const currentParams = new URLSearchParams(currentQuery || "");
  for (const [k, v] of hrefParams) {
    if (currentParams.get(k) !== v) return false;
  }
  return true;
}
