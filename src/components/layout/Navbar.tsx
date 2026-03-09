import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Home, 
  Users, 
  Calendar, 
  MessageSquare, 
  Bell, 
  Settings, 
  LogOut,
  Menu,
  X,
  GraduationCap,
  Search,
  Briefcase,
  Heart,
  Trophy,
  Newspaper,
  MoreVertical,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import acetLogo from '@/assets/acet-logo.jpeg';
import NotificationBell from '@/components/notifications/NotificationBell';

const Navbar: React.FC = () => {
  const { user, profile, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const allNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home, roles: ['student', 'alumni', 'faculty', 'admin'] },
  ];

  const navItems = allNavItems.filter(item => 
    !userRole || item.roles.includes(userRole)
  );

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-3">
          <img 
            src={acetLogo} 
            alt="ACET Logo" 
            className="h-10 w-10 object-contain rounded-full border border-primary/20"
          />
          <div className="hidden sm:block">
            <span className="font-display text-lg font-bold text-foreground">
              AllySphere
            </span>
            <p className="text-xs text-muted-foreground">ACET Network</p>
          </div>
        </Link>

        {user && (
          <>
            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* Dashboard Button */}
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}

              {/* Quick Actions 3-dot menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-52" align="end">
                  <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/alumni')}>
                    <Users className="mr-2 h-4 w-4" />
                    Find Alumni
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/mentorship')}>
                    <GraduationCap className="mr-2 h-4 w-4" />
                    {userRole === 'student' ? 'Request Mentorship' : 'Mentorship'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/jobs')}>
                    <Briefcase className="mr-2 h-4 w-4" />
                    {userRole === 'alumni' ? 'Post a Job' : 'Browse Jobs'}
                  </DropdownMenuItem>
                  {(userRole === 'alumni' || userRole === 'faculty' || userRole === 'admin') && (
                    <DropdownMenuItem onClick={() => navigate('/fundraising')}>
                      <Heart className="mr-2 h-4 w-4" />
                      {userRole === 'alumni' ? 'Donate' : 'View Donations'}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate('/events')}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Events
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/forums')}>
                    <Newspaper className="mr-2 h-4 w-4" />
                    Forums
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/messages')}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/leaderboard')}>
                    <Trophy className="mr-2 h-4 w-4" />
                    Leaderboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Update Profile
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notifications */}
              <NotificationBell />

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{profile?.full_name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Profile Settings
                  </DropdownMenuItem>
                  {userRole === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </>
        )}

        {!user && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
            <Button onClick={() => navigate('/auth?mode=signup')} className="bg-primary hover:bg-primary/90">
              Get Started
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {user && mobileMenuOpen && (
        <div className="border-t border-border bg-card lg:hidden">
          <div className="container py-4">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
