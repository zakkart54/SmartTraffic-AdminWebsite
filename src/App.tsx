import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import  LoginPage  from "./pages/LoginPage";
import  ReportManagement  from "./pages/ReportManagement";
import DataManagement from "./pages/DataManagement";
import NotFound from "./pages/not-found";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "./hooks/use-toast";

function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-muted-foreground">Welcome to the dashboard</p>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  if (!isAuthenticated()) {
    toast({
      title: "Authentication Required",
      description: "Please log in to access this page.",
      variant: "destructive",
    });
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client ={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/data" element={<DataManagement />} />
            <Route path="/report" element={<ReportManagement />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    <Toaster />
    </QueryClientProvider>
  );
}

export default App;