import { Link } from "@/lib/wouter-compat";
import { Github, Linkedin, Twitter, Mail, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-[hsl(220,60%,12%)] text-white mt-auto">
      <div className="container py-12">
<<<<<<< HEAD
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-4">
            <img src="/logo.png" alt="JOB CV" className="h-10 mb-2 brightness-0 invert" />
=======
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <img src="logo.png" alt="JOB CV" className="h-10 mb-4" />
>>>>>>> d468b1cd210411139bf111209d11bdbd4d3525ec
            <p className="text-sm leading-relaxed text-gray-300">
              A professional career platform that helps candidates create compelling CVs, receive intelligent job recommendations, and connect with opportunities aligned to their skills.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4 pt-2">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[hsl(42,78%,52%)] transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[hsl(42,78%,52%)] transition-colors" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[hsl(42,78%,52%)] transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[hsl(42,78%,52%)] mb-4">Platform</h4>
            <div className="flex flex-col gap-2.5 text-sm text-gray-300">
              <Link href="/jobs"><span className="hover:text-white transition-colors cursor-pointer">Browse Jobs</span></Link>
              <Link href="/create-cv"><span className="hover:text-white transition-colors cursor-pointer">Create CV</span></Link>
              <Link href="/upload-cv"><span className="hover:text-white transition-colors cursor-pointer">Upload CV</span></Link>
              <Link href="/about"><span className="hover:text-white transition-colors cursor-pointer">About Us</span></Link>
              <Link href="/contact"><span className="hover:text-white transition-colors cursor-pointer">Contact Us</span></Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[hsl(42,78%,52%)] mb-4">Account</h4>
            <div className="flex flex-col gap-2.5 text-sm text-gray-300">
              <Link href="/login"><span className="hover:text-white transition-colors cursor-pointer">Sign In</span></Link>
              <Link href="/register"><span className="hover:text-white transition-colors cursor-pointer">Register</span></Link>
              <Link href="/profile"><span className="hover:text-white transition-colors cursor-pointer">My Profile</span></Link>
              <Link href="/history"><span className="hover:text-white transition-colors cursor-pointer">Activity History</span></Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[hsl(42,78%,52%)] mb-4">Support & Legal</h4>
            <div className="flex flex-col gap-2.5 text-sm text-gray-300">
              <Link href="/contact"><span className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Support Inquiry</span></Link>
              <span className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Help Center</span>
              <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} JOB CV. Professional Career Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
