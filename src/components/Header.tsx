import { Database, User, LogIn, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {useAuth} from "../hooks/useAuth";
import {useNavigate} from "react-router-dom";
import logo from "@/assets/logo.png"

export function Header() {
  const {accessToken, logout} = useAuth();
  const navigate = useNavigate();
  return (
    <header className="border-b sticky top-0 bg-background z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-8 w-8 object-contain" />
            <h1 className="text-2xl font-semibold">SmartTraffic Admin</h1>
          </div>

          <div className="flex items-center gap-4">
              <ThemeToggle />
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {accessToken ? (
                    <DropdownMenuItem
                      onClick={() => {
                        logout()
                        navigate("/login")
                      }}
                      className="flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => navigate("/login")}
                      className="flex items-center gap-2"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Login</span>
                    </DropdownMenuItem>
                  )}
              </DropdownMenuContent>
              </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
