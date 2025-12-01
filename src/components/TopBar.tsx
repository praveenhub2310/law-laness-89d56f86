import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Bell, Calendar, User, ArrowLeft, LogOut, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, signOut } = useAuth();
  
  const showBackButton = location.pathname !== '/dashboard';
  const showTopBarTitle = location.pathname !== '/cause-list';

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const getDisplayName = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`;
    }
    return userProfile?.email || 'User';
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      'super_admin': 'Super Admin',
      'advocate': 'Lawyer/Advocate', 
      'company': 'Law Firm',
      'client': 'Client'
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-6">
      <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        )}
        
        {showTopBarTitle && (
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              {location.pathname === '/dashboard' ? 'Dashboard' : 
               location.pathname.split('/').pop()?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 hidden md:block">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/dashboard/messages')}
          className="relative flex-shrink-0"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-[10px] sm:text-xs">
            3
          </Badge>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/dashboard/court-calendar')}
          className="hidden sm:flex flex-shrink-0"
        >
          <Calendar className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center space-x-2 pl-2 sm:pl-4 border-l border-gray-200">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="text-sm hidden sm:block min-w-0 max-w-[150px] md:max-w-none">
            <p className="font-medium text-gray-900 truncate">{getDisplayName()}</p>
            <p className="text-gray-500 text-xs truncate">{getRoleDisplayName(userProfile?.role || 'client')}</p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="ml-0 sm:ml-2 flex-shrink-0">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/dashboard/profile')}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default TopBar;