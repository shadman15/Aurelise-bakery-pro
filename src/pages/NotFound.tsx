import { useLocation, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
      <div className="container mx-auto px-4 lg:px-8 text-center space-y-8">
        <div className="space-y-4">
          <div className="w-24 h-24 bg-destructive rounded-full flex items-center justify-center mx-auto">
            <span className="text-4xl text-destructive-foreground font-bold">404</span>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-heading font-bold text-foreground">
            Oops! Page Not Found
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            It seems like the page you're looking for has been misplaced, just like a cake recipe! 
            Let's get you back to something delicious.
          </p>
          
          <p className="text-sm text-muted-foreground">
            Attempted to access: <code className="bg-secondary px-2 py-1 rounded">{location.pathname}</code>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button className="btn-hero group">
              <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Button>
          </Link>
          <Link to="/menu">
            <Button className="btn-secondary">
              Browse Our Cakes
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
