"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import HrDashboard from "@/views/HrDashboard";

function HrFallback() {
  return (
    <div className="container py-20 text-center">
      <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
      <p className="mt-3 text-muted-foreground text-sm">Loading HR portal…</p>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<HrFallback />}>
      <HrDashboard />
    </Suspense>
  );
}
