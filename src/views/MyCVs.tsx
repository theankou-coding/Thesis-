import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, Loader2 } from "lucide-react";
import { Link } from "@/lib/wouter-compat";
import { getLoginUrl } from "@/const";

export default function MyCVs() {
  const { isAuthenticated, loading } = useAuth();
  const { data, isLoading } = trpc.cv.myUploads.useQuery(undefined, { enabled: isAuthenticated });

  if (loading) return <div className="container py-20 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /></div>;

  if (!isAuthenticated) {
    return (
      <div className="container py-20 text-center">
        <FileText className="mx-auto h-16 w-16 text-muted-foreground/40" />
        <h2 className="mt-4 text-xl font-semibold text-foreground">Sign in to view your CVs</h2>
        <p className="mt-2 text-muted-foreground">You need to be logged in to access your uploaded CVs.</p>
        <Button asChild className="mt-6"><a href={getLoginUrl()}>Sign In</a></Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Uploaded CVs</h1>
          <p className="mt-2 text-muted-foreground">View and manage your previously uploaded CV files.</p>
        </div>
        <Link href="/upload-cv"><Button>Upload New CV</Button></Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /></div>
      ) : data && data.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map(cv => (
            <Card key={cv.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <FileText className="h-8 w-8 text-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">{cv.fileName}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(cv.createdAt).toLocaleDateString()}</p>
                    <Badge variant="outline" className="mt-2 text-xs">{cv.mimeType}</Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                  <a href={cv.fileUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-3 w-3" /> View File
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-sm">
          <CardContent className="py-16 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-muted-foreground">No CVs uploaded yet. Upload your first CV to get started.</p>
            <Link href="/upload-cv"><Button className="mt-4">Upload CV</Button></Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
