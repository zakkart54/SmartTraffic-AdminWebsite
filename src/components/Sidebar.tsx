import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Database, 
  ChevronLeft,
  ChevronRight,
  Home,
  BarChart3,
  Settings,
  Users,
  FileStack,
  FileText,
  ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Home,
    path: "/",
  },
  {
    id: "data-management",
    label: "Data Management",
    icon: Database,
    path: "/data",
  },
  {
    id: "report-management",
    label: "Report Management",
    icon: ClipboardList,
    path: "/report",
  },
//   {
//     id: "analytics",
//     label: "Analytics",
//     icon: BarChart3,
//     path: "/analytics",
//   },
//   {
//     id: "submissions",
//     label: "Submissions",
//     icon: FileStack,
//     path: "/submissions",
//   },
//   {
//     id: "users",
//     label: "Users",
//     icon: Users,
//     path: "/users",
//   },
//   {
//     id: "settings",
//     label: "Settings",
//     icon: Settings,
//     path: "/settings",
//   }
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <aside
      className={cn(
        "bg-card border-r transition-all duration-300 ease-in-out flex flex-col h-screen sticky top-0",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="border-b p-2 bg-background">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "w-full",
            isCollapsed && "justify-center"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 ">
        <ul className="space-y-1 px-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigate(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
                    isCollapsed && "justify-center"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium text-sm">{item.label}</span>
                  )}
                  {!isCollapsed && isActive && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-primary-foreground" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}