import { Link, useLocation } from "@/lib/wouter-compat";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const mainNav = [
  { href: "/jobs", label: "Find Jobs" },
  { href: "/create-cv", label: "Create CV" },
  { href: "/upload-cv", label: "Upload CV" },
  { href: "/my-cvs", label: "My CVs" },
];

const subNav = [
  { href: "/jobs", label: "Jobs You Might Like" },
  { href: "/jobs?filter=applied", label: "Applied Jobs" },
  { href: "/jobs?filter=favorite", label: "My Favorite Jobs" },
  { href: "/upload-cv", label: "AI-Matching Jobs" },
];

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Main navigation row */}
      <div className="border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src="/manus-storage/jobcv-logo_f2b0a0df.png" alt="JOB CV" className="h-10" />
          </Link>

          {/* Center nav links */}
          <nav className="hidden items-center gap-1 lg:flex">
            {mainNav.map((link) => (
              <Link key={link.href} href={link.href}>
                <span className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${location === link.href ? "text-primary font-semibold" : "text-foreground/70 hover:text-primary"}`}>
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Right side: auth buttons */}
          <div className="hidden items-center gap-3 lg:flex">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{user?.name || user?.email}</span>
                <Button variant="ghost" size="sm" onClick={() => logout()} className="text-sm font-medium text-foreground/70 hover:text-primary">
                  Logout
                </Button>
              </div>
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
          <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Sub-navigation row */}
      <div className="border-b border-border bg-white hidden lg:block">
        <div className="container flex h-10 items-center gap-6">
          {subNav.map((link) => (
            <Link key={link.label} href={link.href}>
              <span className="text-sm text-foreground/60 hover:text-primary transition-colors cursor-pointer">
                {link.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-b border-border bg-white p-4 lg:hidden">
          <nav className="flex flex-col gap-2">
            {mainNav.map((link) => (
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
              {isAuthenticated ? (
                <Button variant="outline" size="sm" className="w-full" onClick={() => { logout(); setMobileOpen(false); }}>Logout</Button>
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
