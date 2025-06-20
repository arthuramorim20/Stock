
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

type AuthMode = "signin" | "signup";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<AuthMode>("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        toast({
          title: "Bem vindo!",
          description: "Login realizado com sucesso."
        });
        
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        
        toast({
          title: "Conta criada",
          description: "Por favor verifique seu email e siga as instruções."
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if user is already logged in
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  
  useState(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
  });

  if (isLoggedIn === true) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Package className="h-10 w-10 text-primary" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">StockManager</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to your account" : "Create a new account"}
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form className="space-y-6 mt-8" onSubmit={handleAuth}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Senha
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Processing..." : mode === "signin" ? "Entrar" : "Cadastrar"}
          </Button>

          <div className="text-center text-sm">
            {mode === "signin" ? (
              <p>
                Não tem uma conta?{" "}
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => setMode("signup")}
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Já tem uma conta?{" "}
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => setMode("signin")}
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
