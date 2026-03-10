import { useAuth } from "@/hooks/useAuth";
import LoginPage from "@/components/LoginPage";
import AppLayout from "@/components/AppLayout";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return <AppLayout />;
};

export default Index;
