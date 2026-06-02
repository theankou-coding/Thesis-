import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, Clock, Search } from "lucide-react";
import { useState } from "react";

export default function Jobs() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = trpc.jobs.list.useQuery({ search });

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Job Opportunities</h1>
        <p className="mt-2 text-muted-foreground">Browse available positions and find your ideal role.</p>
      </div>

      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by title, skill, company, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6 space-y-3">
                <div className="h-5 w-3/4 rounded bg-muted" />
                <div className="h-4 w-1/2 rounded bg-muted" />
                <div className="h-16 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">{data?.total ?? 0} position{(data?.total ?? 0) !== 1 ? "s" : ""} found</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data?.jobs.map((job) => (
              <Card key={job.id} className="border hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <Badge variant="secondary" className="mb-3 text-xs">{job.type}</Badge>
                  <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{job.company}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">{job.description}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {job.skills.split(",").slice(0, 5).map(skill => (
                      <Badge key={skill} variant="outline" className="text-xs">{skill.trim()}</Badge>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground border-t pt-3">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{job.level}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-primary">{job.salary}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          {data?.jobs.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No jobs match your search criteria.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
