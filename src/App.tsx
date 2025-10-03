import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import  LoginPage  from "./pages/LoginPage";
import  ReportManagement  from "./pages/ReportManagement";
import NotFound from "./pages/not-found";
import { AuthProvider } from "./hooks/useAuth";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster"

function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-muted-foreground">Welcome to the dashboard</p>
    </div>
  );
}

function DataManagement() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Data Management</h1>
      <p className="text-muted-foreground">Manage your data here</p>
    </div>
  );
}

function Analytics() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Analytics</h1>
      <p className="text-muted-foreground">View analytics and reports</p>
    </div>
  );
}

function Submissions() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Submissions</h1>
      <p className="text-muted-foreground">View all submissions</p>
    </div>
  );
}

function Users() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Users</h1>
      <p className="text-muted-foreground">Manage users</p>
    </div>
  );
}

function Settings() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Settings</h1>
      <p className="text-muted-foreground">Configure your settings</p>
    </div>
  );
}

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // const { isAuthenticated } = useAuth();
  
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }
  
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
            {/* <Route path="/analytics" element={<Analytics />} />
            <Route path="/submissions" element={<Submissions />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} /> */}
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