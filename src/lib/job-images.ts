/**
 * job-images.ts - Maps jobs and companies to high quality photos and metadata.
 */

export interface CompanyDetails {
  name: string;
  logoUrl: string;
  bannerUrl: string;
  industry: string;
  size: string;
  founded: string;
  hq: string;
  website: string;
  bio: string;
}

const companyDetailsMap: Record<string, CompanyDetails> = {
  "techloop": {
    name: "TechLoop",
    logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&h=200&auto=format&fit=crop", // Abstract Tech shape
    bannerUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&h=400&auto=format&fit=crop", // Clean dark code workspace
    industry: "Software & Technology",
    size: "100 - 250 employees",
    founded: "2018",
    hq: "San Francisco, CA",
    website: "techloop.io",
    bio: "TechLoop is a leading developer relations and tooling platform, helping engineering teams streamline their workflows and build better software. We provide advanced collaboration environments and CI/CD enhancements for modern tech companies.",
  },
  "cloudsaas": {
    name: "CloudSaaS",
    logoUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=200&h=200&auto=format&fit=crop", // Cloud shape / wireframe
    bannerUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&h=400&auto=format&fit=crop", // Futuristic network / cloud space
    industry: "Cloud Computing & SaaS",
    size: "50 - 100 employees",
    founded: "2020",
    hq: "Seattle, WA",
    website: "cloudsaas.com",
    bio: "CloudSaaS provides enterprise-grade automation and business analytics tools for modern startups, enabling collaborative workflow efficiency at scale. Our cloud integration services power critical business analytics across major international enterprises.",
  },
  "creative studio": {
    name: "Creative Studio",
    logoUrl: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=200&h=200&auto=format&fit=crop", // Colorful creative pattern
    bannerUrl: "https://images.unsplash.com/photo-1541462608143-67571c6738dd?q=80&w=1200&h=400&auto=format&fit=crop", // Design / UI mockup desk
    industry: "Design & Creative Services",
    size: "10 - 50 employees",
    founded: "2015",
    hq: "New York, NY",
    website: "creativestudio.design",
    bio: "Creative Studio is a full-service brand and UI/UX design agency. We partner with forward-thinking tech companies to deliver exceptional digital products that delight users and drive real business growth.",
  },
  "datastream": {
    name: "DataStream",
    logoUrl: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=200&h=200&auto=format&fit=crop", // Data chart / gear
    bannerUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&h=400&auto=format&fit=crop", // Chart / data meeting
    industry: "Financial Technology & Analytics",
    size: "500 - 1000 employees",
    founded: "2012",
    hq: "Chicago, IL",
    website: "datastreamanalytics.com",
    bio: "DataStream Analytics is a market-leading financial intelligence company, processing billions of data points daily to provide actionable insights for global investors. We construct custom high-frequency data piping and analytical modeling.",
  }
};

const jobImagesMap: Record<number, string> = {
  1: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop", // Senior Frontend
  3: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=600&auto=format&fit=crop", // Full Stack
  4: "https://images.unsplash.com/photo-1541462608143-67571c6738dd?q=80&w=600&auto=format&fit=crop", // Junior UI
  2: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600&auto=format&fit=crop", // finan (finance/accounting)
};

export function getJobImage(jobId: number, companyName: string, jobTitle: string): string {
  // If specific job ID exists
  if (jobImagesMap[jobId]) {
    return jobImagesMap[jobId];
  }

  // Fallback by keyword in title
  const title = jobTitle.toLowerCase();
  if (title.includes("frontend") || title.includes("react") || title.includes("ui") || title.includes("designer")) {
    return "https://images.unsplash.com/photo-1541462608143-67571c6738dd?q=80&w=600&auto=format&fit=crop";
  }
  if (title.includes("backend") || title.includes("developer") || title.includes("stack") || title.includes("software")) {
    return "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=600&auto=format&fit=crop";
  }
  if (title.includes("finan") || title.includes("account") || title.includes("data") || title.includes("analyst")) {
    return "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600&auto=format&fit=crop";
  }

  // General fallback
  return "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=600&auto=format&fit=crop";
}

export function getCompanyDetails(companyName: string): CompanyDetails {
  const key = companyName.toLowerCase().trim();
  if (companyDetailsMap[key]) {
    return companyDetailsMap[key];
  }

  // Dynamic fallback for any newly added company
  return {
    name: companyName,
    logoUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=200&h=200&auto=format&fit=crop", // Modern glass office building avatar
    bannerUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&h=400&auto=format&fit=crop", // Modern glass office building banner
    industry: "Professional Services",
    size: "50 - 100 employees",
    founded: "2021",
    hq: "Ho Chi Minh City, Vietnam",
    website: `${key.replace(/[^a-z0-9]/g, "")}.com`,
    bio: `${companyName} is a fast-growing company dedicated to delivering industry-leading solutions and professional excellence. We nurture dynamic talent and offer great growth opportunities for passionate professionals.`,
  };
}
