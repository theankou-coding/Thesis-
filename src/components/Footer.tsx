import { Link } from "@/lib/wouter-compat";

export function Footer() {
  return (
    <footer className="border-t border-border bg-[hsl(220,60%,12%)] text-white mt-auto">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <img src="/manus-storage/jobcv-logo-white_03021615.png" alt="JOB CV" className="h-10 mb-4" />
            <p className="text-sm leading-relaxed text-gray-300">
              A professional career platform that helps candidates create compelling CVs, receive intelligent job recommendations, and connect with opportunities aligned to their skills.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[hsl(42,78%,52%)] mb-4">Platform</h4>
            <div className="flex flex-col gap-2 text-sm text-gray-300">
              <Link href="/jobs"><span className="hover:text-white transition-colors">Browse Jobs</span></Link>
              <Link href="/create-cv"><span className="hover:text-white transition-colors">Create CV</span></Link>
              <Link href="/upload-cv"><span className="hover:text-white transition-colors">Upload CV</span></Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[hsl(42,78%,52%)] mb-4">Account</h4>
            <div className="flex flex-col gap-2 text-sm text-gray-300">
              <Link href="/login"><span className="hover:text-white transition-colors">Sign In</span></Link>
              <Link href="/register"><span className="hover:text-white transition-colors">Register</span></Link>
              <Link href="/my-cvs"><span className="hover:text-white transition-colors">My Uploads</span></Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} JOB CV. Professional Career Platform.
        </div>
      </div>
    </footer>
  );
}
