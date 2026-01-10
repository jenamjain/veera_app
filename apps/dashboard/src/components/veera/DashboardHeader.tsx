import { Shield, LogOut, User, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const DashboardHeader = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem('veera_session');
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    navigate('/');
  };

  // Get user email from mock session
  const session = localStorage.getItem('veera_session');
  const userEmail = session ? JSON.parse(session).email : 'operator@veera.gov.in';

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 group cursor-pointer">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-400 shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-105">
          <Shield className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-red-400 tracking-tight">VEERA</h1>
          <p className="text-[11px] text-red-300 -mt-0.5 font-medium">Safety Dashboard</p>
        </div>
      </div>

      {/* Center - Status indicator */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-risk-low/10 rounded-full border border-risk-low/20">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-risk-low opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-risk-low"></span>
          </span>
          <span className="text-xs font-semibold text-muted-foreground">System Active</span>
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors relative"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-risk-high rounded-full" />
        </Button>

        {/* Settings */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors hidden sm:flex"
        >
          <Settings className="h-5 w-5" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className={cn(
                "h-10 gap-2.5 px-2 ml-1 rounded-xl",
                "hover:bg-muted/80 transition-all duration-200",
                "focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
              )}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-sm">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="hidden sm:inline text-sm font-medium text-foreground max-w-[150px] truncate">
                {userEmail}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 animate-scale-in">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium">My Account</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout} 
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;
