"use client";

import { useParams } from "next/navigation";
import CompanyProfile from "@/views/CompanyProfile";

export default function Page() {
  const params = useParams();
  const companyName = params?.companyName as string;

  return <CompanyProfile companyName={companyName} />;
}
