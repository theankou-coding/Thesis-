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
  Briefcase,
  Bookmark,
  ChevronDown,
  History,
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
  { href: "/upload-cv", label: "Upload CV" },
  { href: "/my-cvs", label: "My CVs" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
];

const subNav = [
  { href: "/jobs", label: "Jobs You Might Like" },
  { href: "/history?tab=applied", label: "Applied Jobs" },
  { href: "/history?tab=saved", label: "Saved Jobs" },
  { href: "/upload-cv", label: "AI-Matching Jobs" },
];

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
<<<<<<< HEAD
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const nameParts = user?.name ? user.name.split(":::") : [];
  const displayName = nameParts[0] || user?.name || user?.email?.split("@")[0] || "";
  const avatarUrl = nameParts[1] || "";
=======
  const navItems = user?.role === "admin" ? [...mainNav, { href: "/admin", label: "Admin" }] : mainNav;
>>>>>>> d468b1cd210411139bf111209d11bdbd4d3525ec

  return (
    <header className="sticky top-0 z-50 bg-card text-card-foreground shadow-sm transition-colors border-b">
      {/* Main navigation row */}
      <div className="border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
<<<<<<< HEAD
            <img src="/logo.png" alt="JOB CV" className="h-10" />
=======
            <img src="logo.png" alt="JOB CV" className="h-10" />
>>>>>>> d468b1cd210411139bf111209d11bdbd4d3525ec
          </Link>

          {/* Center nav links */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((link) => (
              <Link key={link.href} href={link.href}>
                <span className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${location === link.href ? "text-primary font-semibold" : "text-foreground/70 hover:text-primary"}`}>
                  {link.label}
                </span>
              </Link>
            ))}
            {mounted && isAuthenticated && user?.role === "hr" && (
              <Link href="/hr">
                <span className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${location === "/hr" ? "text-primary font-semibold" : "text-foreground/70 hover:text-primary"}`}>
                  HR Portal
                </span>
              </Link>
            )}
            {mounted && isAuthenticated && (
              <Link href="/profile">
                <span className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${location === "/profile" ? "text-primary font-semibold" : "text-foreground/70 hover:text-primary"}`}>
                  Profile
                </span>
              </Link>
            )}
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
                <Link href="/profile">
                  <Button variant="outline" size="sm" className="gap-1.5 font-semibold border-primary/20 text-primary hover:bg-primary/5 rounded-full px-4">
                    <User className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-muted/40 border-border hover:bg-muted transition-all cursor-pointer max-w-[200px] select-none hover:shadow-sm">
                      <div className="h-6 w-6 rounded-full overflow-hidden bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-border">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                        ) : (
                          displayName ? displayName[0].toUpperCase() : <User className="h-3 w-3" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-foreground truncate max-w-[100px]" title={displayName}>
                        {displayName}
                      </span>
                      <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-1 border border-border bg-popover p-1.5 shadow-lg rounded-xl">
                    <DropdownMenuLabel className="px-2.5 py-2">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-bold text-foreground truncate leading-none">{displayName}</p>
                        <p className="text-xs text-muted-foreground truncate font-normal leading-tight mt-0.5">{user?.email || "Candidate"}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-1 bg-border/60" />
                    <DropdownMenuGroup>
                      {user?.role === "hr" && (
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link href="/hr" className="flex w-full items-center gap-2 px-2 py-1.5 font-semibold text-primary">
                            <Briefcase className="h-4 w-4 text-primary" />
                            <span>HR Portal</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/profile" className="flex w-full items-center gap-2 px-2 py-1.5">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>My Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/create-cv" className="flex w-full items-center gap-2 px-2 py-1.5">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>Create CV</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/upload-cv" className="flex w-full items-center gap-2 px-2 py-1.5">
                          <Upload className="h-4 w-4 text-muted-foreground" />
                          <span>Upload CV</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/my-cvs" className="flex w-full items-center gap-2 px-2 py-1.5">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span>My CVs</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="my-1 bg-border/60" />
                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/history?tab=applied" className="flex w-full items-center gap-2 px-2 py-1.5">
                          <History className="h-4 w-4 text-muted-foreground" />
                          <span>Applied Jobs</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/history?tab=saved" className="flex w-full items-center gap-2 px-2 py-1.5">
                          <Bookmark className="h-4 w-4 text-muted-foreground" />
                          <span>Saved Jobs</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="my-1 bg-border/60" />
                    <DropdownMenuItem onClick={() => logout()} className="flex w-full items-center gap-2 px-2 py-1.5 cursor-pointer text-destructive focus:bg-destructive/10 dark:focus:bg-destructive/20 focus:text-destructive">
                      <LogOut className="h-4 w-4 text-destructive" />
                      <span>Log Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <span className="text-sm font-medium text-foreground/70 hover:text-primary cursor-pointer px-3 py-2">Login</span>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 font-semibold">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            {mounted && isAuthenticated && (
              <Link href="/profile">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 p-0 bg-muted/40 border border-border">
                  <div className="h-6 w-6 rounded-full overflow-hidden bg-primary/10 text-primary flex items-center justify-center font-bold text-xs ring-1 ring-border">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                    ) : (
                      displayName ? displayName[0].toUpperCase() : <User className="h-3 w-3" />
                    )}
                  </div>
                </Button>
              </Link>
            )}
            <button className="p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-b border-border bg-card p-4 lg:hidden">
          <nav className="flex flex-col gap-2">
            {navItems.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                <span className={`block px-4 py-2 text-sm font-medium rounded-md ${location === link.href ? "bg-primary/10 text-primary" : "text-foreground/70"}`}>
                  {link.label}
                </span>
              </Link>
            ))}
            <div className="border-t border-border pt-3 mt-2">
              <p className="px-4 text-xs font-semibold uppercase text-muted-foreground mb-2">Quick Access</p>
              {subNav.map((link) => (
                <Link key={link.label} href={link.href} onClick={() => setMobileOpen(false)}>
                  <span className="block px-4 py-1.5 text-sm text-foreground/60">{link.label}</span>
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
                        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        {theme === "dark" ? "Light" : "Dark"} Mode
                      </>
                    )}
                  </Button>
                )}
              </div>
              {isAuthenticated ? (
                <div className="space-y-3 border-t border-border pt-3 mt-2">
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 ring-2 ring-border">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                      ) : (
                        displayName ? displayName[0].toUpperCase() : <User className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-foreground truncate leading-none">{displayName}</p>
                      <p className="text-xs text-muted-foreground truncate leading-tight mt-1">{user?.email || "Candidate"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 px-2">
                    {[
                      ...(user?.role === "hr" ? [{ href: "/hr", label: "HR Portal", icon: Briefcase }] : []),
                      { href: "/profile", label: "My Profile", icon: User },
                      { href: "/create-cv", label: "Create CV", icon: FileText },
                      { href: "/upload-cv", label: "Upload CV", icon: Upload },
                      { href: "/my-cvs", label: "My CVs", icon: Briefcase },
                      { href: "/history?tab=applied", label: "Applied Jobs", icon: History },
                      { href: "/history?tab=saved", label: "Saved Jobs", icon: Bookmark },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/30 border-border/50 hover:bg-muted/80 transition-colors"
                        >
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs font-semibold text-foreground">{item.label}</span>
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
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">Login</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1">
                    <Button size="sm" className="w-full">Sign Up</Button>
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
