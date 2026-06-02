import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "@/lib/wouter-compat";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl border border-border bg-card text-card-foreground">
        <CardContent className="pt-10 pb-10 text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-destructive/10 rounded-full scale-110 animate-ping" />
              <div className="relative h-16 w-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                <AlertCircle className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight">404</h1>
            <h2 className="text-xl font-bold text-foreground">
              Page Not Found
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
              Sorry, the page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <Button
              onClick={handleGoHome}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
