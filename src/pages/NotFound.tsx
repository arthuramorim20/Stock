
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md px-4">
        <Package className="h-16 w-16 mx-auto text-muted-foreground" />
        <h1 className="text-4xl font-bold">Página não encontrada</h1>
        <p className="text-xl text-muted-foreground">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <Button asChild size="lg">
          <Link to="/">Retornar ao Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
