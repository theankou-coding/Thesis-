import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Clock, Search, ArrowRight, X, SlidersHorizontal, Check, Bookmark, FileCheck } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getJobImage, getCompanyDetails } from "@/lib/job-images";

export default function Jobs() {
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [currentFilter, setCurrentFilter] = useState<string | null>(null);

  const [localSavedIds, setLocalSavedIds] = useState<number[]>([]);
  const [localAppliedIds, setLocalAppliedIds] = useState<number[]>([]);

  const { data: user } = trpc.auth.me.useQuery();
  const { data: dbSavedJobs } = trpc.saved.mySaved.useQuery(undefined, { enabled: !!user });
  const { data: dbAppliedJobs } = trpc.applications.myApplications.useQuery(undefined, { enabled: !!user });

  // Sync URL parameters on mount and when location changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleParams = () => {
        const params = new URLSearchParams(window.location.search);
        const q = params.get("search");
        const f = params.get("filter");
        if (q) setSearch(q);
        setCurrentFilter(f);
      };

      handleParams();

      // Read saved / applied job IDs from localStorage
      try {
        const saved = localStorage.getItem("saved-jobs");
        if (saved) setLocalSavedIds(JSON.parse(saved));

        const applied = localStorage.getItem("applied-jobs");
        if (applied) setLocalAppliedIds(JSON.parse(applied));
      } catch (e) {
        console.error("Failed to read from localStorage", e);
      }

      // Listen for pushState/replaceState URL changes (common in Single Page Apps)
      window.addEventListener("popstate", handleParams);
      return () => window.removeEventListener("popstate", handleParams);
    }
  }, []);

  const { data, isLoading } = trpc.jobs.list.useQuery({ search });

  const savedIds = useMemo(() => {
    if (user) {
      return dbSavedJobs?.map(s => s.jobId) ?? [];
    }
    return localSavedIds;
  }, [user, dbSavedJobs, localSavedIds]);

  const appliedIds = useMemo(() => {
    if (user) {
      return dbAppliedJobs?.map(a => a.jobId) ?? [];
    }
    return localAppliedIds;
  }, [user, dbAppliedJobs, localAppliedIds]);

  // Get dynamic unique locations, levels, types from data for the filters
  const filterOptions = useMemo(() => {
    if (!data?.jobs) return { locations: [], levels: [], types: [] };
    const locations = Array.from(new Set(data.jobs.map(j => j.location).filter(Boolean)));
    const levels = Array.from(new Set(data.jobs.map(j => j.level).filter(Boolean)));
    const types = Array.from(new Set(data.jobs.map(j => j.type).filter(Boolean)));
    return { locations, levels, types };
  }, [data]);

  // Client-side filtering based on active selections + URL filter states (applied/favorite)
  const filteredJobs = useMemo(() => {
    if (!data?.jobs) return [];
    return data.jobs.filter(job => {
      // 1. URL Sub-Nav Filters
      if (currentFilter === "favorite" && !savedIds.includes(job.id)) return false;
      if (currentFilter === "applied" && !appliedIds.includes(job.id)) return false;

      // 2. Sidebar Filters
      const matchType = selectedTypes.length === 0 || selectedTypes.includes(job.type);
      const matchLevel = selectedLevels.length === 0 || selectedLevels.includes(job.level);
      const matchLocation = selectedLocations.length === 0 || selectedLocations.includes(job.location);

      return matchType && matchLevel && matchLocation;
    });
  }, [data, selectedTypes, selectedLevels, selectedLocations, currentFilter, savedIds, appliedIds]);

  const toggleFilter = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const clearAllFilters = () => {
    setSelectedTypes([]);
    setSelectedLevels([]);
    setSelectedLocations([]);
    setSearch("");
    if (currentFilter) {
      // Clear URL filter param
      if (typeof window !== "undefined") {
        window.history.pushState({}, "", "/jobs");
        setCurrentFilter(null);
      }
    }
  };

  const getPageHeading = () => {
    if (currentFilter === "favorite") return "Saved Jobs";
    if (currentFilter === "applied") return "Applied Positions";
    return "Available Positions";
  };

  const getPageSubheading = () => {
    if (currentFilter === "favorite") return "Your bookmarked career opportunities.";
    if (currentFilter === "applied") return "Positions you have applied for on this platform.";
    return "Discover roles that match your capabilities and aspirations.";
  };

  return (
    <div className="container py-10">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">{getPageHeading()}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{getPageSubheading()}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Filter Sidebar */}
        <aside className="space-y-6">
          <Card className="border border-border shadow-sm sticky top-24">
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" /> Filters
                </h2>
                {(selectedTypes.length > 0 || selectedLevels.length > 0 || selectedLocations.length > 0 || search || currentFilter) && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs h-8 text-primary hover:text-primary/80 px-2">
                    Clear All
                  </Button>
                )}
              </div>

              {/* Search Bar inside Sidebar */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-[10px]">Keyword Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search titles, skills..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-10 text-sm"
                  />
                </div>
              </div>

              {/* Job Type Filter */}
              {filterOptions.types.length > 0 && (
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-[10px]">Job Type</label>
                  <div className="space-y-1.5">
                    {filterOptions.types.map(type => {
                      const active = selectedTypes.includes(type);
                      return (
                        <button
                          key={type}
                          onClick={() => toggleFilter(selectedTypes, setSelectedTypes, type)}
                          className="flex items-center justify-between w-full text-left text-sm py-1.5 px-2 rounded-md hover:bg-muted transition-colors text-foreground"
                        >
                          <span className={active ? "font-semibold text-primary" : "text-muted-foreground"}>{type}</span>
                          <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${active ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"}`}>
                            {active && <Check className="h-2.5 w-2.5" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Experience Level Filter */}
              {filterOptions.levels.length > 0 && (
                <div className="space-y-3 border-t pt-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-[10px]">Experience Level</label>
                  <div className="space-y-1.5">
                    {filterOptions.levels.map(level => {
                      const active = selectedLevels.includes(level);
                      return (
                        <button
                          key={level}
                          onClick={() => toggleFilter(selectedLevels, setSelectedLevels, level)}
                          className="flex items-center justify-between w-full text-left text-sm py-1.5 px-2 rounded-md hover:bg-muted transition-colors text-foreground"
                        >
                          <span className={active ? "font-semibold text-primary" : "text-muted-foreground"}>{level}</span>
                          <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${active ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"}`}>
                            {active && <Check className="h-2.5 w-2.5" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Location Filter */}
              {filterOptions.locations.length > 0 && (
                <div className="space-y-3 border-t pt-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-[10px]">Location</label>
                  <div className="space-y-1.5">
                    {filterOptions.locations.map(loc => {
                      const active = selectedLocations.includes(loc);
                      return (
                        <button
                          key={loc}
                          onClick={() => toggleFilter(selectedLocations, setSelectedLocations, loc)}
                          className="flex items-center justify-between w-full text-left text-sm py-1.5 px-2 rounded-md hover:bg-muted transition-colors text-foreground"
                        >
                          <span className={active ? "font-semibold text-primary" : "text-muted-foreground"}>{loc}</span>
                          <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${active ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"}`}>
                            {active && <Check className="h-2.5 w-2.5" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>

        {/* Jobs Listing Column */}
        <div className="space-y-6">
          {/* Active Tags Summary */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-bold text-foreground">{filteredJobs.length}</span> position{filteredJobs.length !== 1 ? "s" : ""}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {currentFilter && (
                <Badge variant="default" className="gap-1 pl-2.5 pr-1.5 h-7 bg-primary text-primary-foreground">
                  Filtered: {currentFilter === "favorite" ? "Saved" : "Applied"}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => {
                    if (typeof window !== "undefined") {
                      window.history.pushState({}, "", "/jobs");
                      setCurrentFilter(null);
                    }
                  }} />
                </Badge>
              )}
              {selectedTypes.map(t => (
                <Badge key={t} variant="secondary" className="gap-1 pl-2.5 pr-1.5 h-7">
                  {t} <X className="h-3 w-3 cursor-pointer" onClick={() => toggleFilter(selectedTypes, setSelectedTypes, t)} />
                </Badge>
              ))}
              {selectedLevels.map(l => (
                <Badge key={l} variant="secondary" className="gap-1 pl-2.5 pr-1.5 h-7">
                  {l} <X className="h-3 w-3 cursor-pointer" onClick={() => toggleFilter(selectedLevels, setSelectedLevels, l)} />
                </Badge>
              ))}
              {selectedLocations.map(loc => (
                <Badge key={loc} variant="secondary" className="gap-1 pl-2.5 pr-1.5 h-7">
                  {loc} <X className="h-3 w-3 cursor-pointer" onClick={() => toggleFilter(selectedLocations, setSelectedLocations, loc)} />
                </Badge>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="animate-pulse overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="h-40 md:h-auto md:w-44 bg-muted shrink-0" />
                    <CardContent className="pt-6 space-y-4 flex-1">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 w-2/3">
                          <div className="h-6 rounded bg-muted w-3/4" />
                          <div className="h-4 rounded bg-muted w-1/2" />
                        </div>
                        <div className="h-6 rounded bg-muted w-20" />
                      </div>
                      <div className="h-16 rounded bg-muted w-full" />
                      <div className="flex gap-2 pt-2">
                        <div className="h-5 rounded bg-muted w-16" />
                        <div className="h-5 rounded bg-muted w-20" />
                        <div className="h-5 rounded bg-muted w-24" />
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="space-y-4">
              {filteredJobs.map((job) => {
                const dbCover = (job as any).coverImage;
                const jobImage = dbCover || getJobImage(job.id, job.company, job.title);
                const companyInfo = getCompanyDetails(job.company);
                return (
                  <Card key={job.id} className="border border-border hover:shadow-md hover:border-primary/30 transition-all duration-300 overflow-hidden relative group">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-primary transition-all z-10" />
                    <div className="flex flex-col md:flex-row">
                      {/* Job image thumbnail */}
                      <Link href={`/jobs/${job.id}`} className="block shrink-0">
                        <div className="relative h-40 md:h-full md:w-44 overflow-hidden">
                          <img
                            src={jobImage}
                            alt={job.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent md:bg-gradient-to-l" />
                        </div>
                      </Link>
 
                      <CardContent className="pt-5 pb-5 flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className="bg-primary/5 text-primary border-primary/10 font-medium text-[10px] tracking-wide uppercase px-2 py-0.5 animate-none">
                                {job.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {job.level}
                              </span>
                              {savedIds.includes(job.id) && (
                                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-medium text-[10px] px-1.5 py-0">
                                  Saved
                                </Badge>
                              )}
                              {appliedIds.includes(job.id) && (
                                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 font-medium text-[10px] px-1.5 py-0">
                                  Applied
                                </Badge>
                              )}
                            </div>
                            <Link href={`/jobs/${job.id}`}>
                              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors truncate cursor-pointer">
                                {job.title}
                              </h3>
                            </Link>
                            <Link
                              href={`/companies/${encodeURIComponent(job.company)}`}
                              onClick={(e: React.MouseEvent) => e.stopPropagation()}
                              className="inline-flex items-center gap-2 group/company w-fit"
                            >
                              <img
                                src={companyInfo.logoUrl}
                                alt={companyInfo.name}
                                className="h-5 w-5 rounded-full object-cover border border-border"
                              />
                              <span className="text-sm font-semibold text-muted-foreground group-hover/company:text-primary transition-colors">
                                {job.company}
                              </span>
                            </Link>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-2 max-w-3xl leading-relaxed">
                              {job.description}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-1.5">
                              {job.skills.split(",").slice(0, 5).map(skill => (
                                <Badge key={skill} variant="outline" className="text-xs bg-muted/20 border-border text-foreground/80 font-normal">
                                  {skill.trim()}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-4 md:pt-0 shrink-0 gap-2 border-border/40">
                            <p className="text-lg font-bold text-primary">{job.salary}</p>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {job.location}
                            </span>
                            <Link href={`/jobs/${job.id}`} className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-primary mt-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                              View Details <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border border-border/80 bg-muted/10">
              <CardContent className="text-center py-16">
                {currentFilter === "favorite" ? (
                  <>
                    <Bookmark className="mx-auto h-14 w-14 text-amber-500/40 mb-4" />
                    <h3 className="text-lg font-bold text-foreground mb-1">No Saved Jobs</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                      You haven't bookmarked any jobs yet. Explore available jobs and click the bookmark button to save them.
                    </p>
                  </>
                ) : currentFilter === "applied" ? (
                  <>
                    <FileCheck className="mx-auto h-14 w-14 text-green-500/40 mb-4" />
                    <h3 className="text-lg font-bold text-foreground mb-1">No Applications Yet</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                      You haven't applied for any roles yet. Upload a CV or builder form to begin your applications.
                    </p>
                  </>
                ) : (
                  <>
                    <Briefcase className="mx-auto h-14 w-14 text-muted-foreground/45 mb-4" />
                    <h3 className="text-lg font-bold text-foreground mb-1">No Matches Found</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                      We couldn't find any jobs matching your active filter criteria. Try relaxing your filters or modifying your search.
                    </p>
                  </>
                )}
                <Button variant="outline" onClick={clearAllFilters} className="mt-6">
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
