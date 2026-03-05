import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import BirthdayFeed from '@/components/dashboard/BirthdayFeed';
import RecommendedMentors from '@/components/dashboard/RecommendedMentors';
import RecommendedBatchMates from '@/components/dashboard/RecommendedBatchMates';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  TrendingUp,
  ArrowRight,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { Event, Announcement } from '@/types/database';

const Dashboard: React.FC = () => {
  const { user, profile, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [stats, setStats] = useState({ alumni: 0, mentorships: 0, events: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {

      // Fetch recent events (past events, most recent first)
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('is_published', true)
        .lte('event_date', new Date().toISOString())
        .order('event_date', { ascending: false })
        .limit(3);

      if (eventsData) {
        setUpcomingEvents(eventsData as Event[]);
      }

      // Fetch announcements
      const { data: announcementsData } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(2);

      if (announcementsData) {
        setAnnouncements(announcementsData as Announcement[]);
      }

      // Fetch stats
      const { count: alumniCount } = await supabase
        .from('alumni_details')
        .select('*', { count: 'exact', head: true });

      const { count: mentorshipCount } = await supabase
        .from('mentorship_requests')
        .select('*', { count: 'exact', head: true })
        .or(`student_id.eq.${user?.id},alumni_id.eq.${user?.id}`);

      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      setStats({
        alumni: alumniCount || 0,
        mentorships: mentorshipCount || 0,
        events: eventsCount || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const getRoleBadge = () => {
    const labels: Record<string, { label: string; className: string }> = {
      student: { label: '🎓 Student', className: 'bg-blue-500/10 text-blue-700' },
      alumni: { label: '🏛️ Alumni', className: 'bg-emerald-500/10 text-emerald-700' },
      faculty: { label: '📋 Faculty / Admin', className: 'bg-amber-500/10 text-amber-700' },
      admin: { label: '📋 Admin', className: 'bg-amber-500/10 text-amber-700' },
    };
    const role = labels[userRole || 'student'];
    return <Badge className={role.className}>{role.label}</Badge>;
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-3xl font-bold text-foreground">
                Welcome back, {profile?.full_name?.split(' ')[0]}!
              </h1>
              {getRoleBadge()}
            </div>
            <p className="mt-1 text-muted-foreground">
              {userRole === 'student' && 'Explore mentorship opportunities and connect with alumni.'}
              {userRole === 'alumni' && 'Give back to your community — mentor, donate, and network.'}
              {(userRole === 'faculty' || userRole === 'admin') && 'Manage and oversee the alumni network.'}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.alumni}</p>
                <p className="text-sm text-muted-foreground">Alumni in Network</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <GraduationCap className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.mentorships}</p>
                <p className="text-sm text-muted-foreground">Mentorship Requests</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <Calendar className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.events}</p>
                <p className="text-sm text-muted-foreground">Upcoming Events</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* AI Recommendations - Students only */}
            {userRole === 'student' && <RecommendedMentors />}

            {/* AI Batch Mates - Non-students */}
            {userRole !== 'student' && <RecommendedBatchMates />}

            {/* Recent Events */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Events</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/events')}>
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-4 rounded-lg border border-border p-4"
                      >
                        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary text-primary-foreground">
                          <span className="text-xs font-medium">
                            {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-lg font-bold">
                            {new Date(event.event_date).getDate()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{event.title}</p>
                          <p className="text-sm text-muted-foreground">{event.location}</p>
                        </div>
                        <Badge variant="outline">{event.event_type}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-muted-foreground">No recent events.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Birthday Feed */}
            <BirthdayFeed />

            {/* Quick Actions - Role specific */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Button variant="outline" className="justify-start" onClick={() => navigate('/alumni')}>
                  <Users className="mr-2 h-4 w-4" />
                  Find Alumni
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => navigate('/mentorship')}>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  {userRole === 'student' ? 'Request Mentorship' : 'Mentorship'}
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => navigate('/jobs')}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  {userRole === 'alumni' ? 'Post a Job' : 'Browse Jobs'}
                </Button>
                {(userRole === 'alumni' || userRole === 'faculty' || userRole === 'admin') && (
                  <Button variant="outline" className="justify-start" onClick={() => navigate('/fundraising')}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {userRole === 'alumni' ? 'Donate' : 'View Donations'}
                  </Button>
                )}
                <Button variant="outline" className="justify-start" onClick={() => navigate('/messages')}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Messages
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => navigate('/profile')}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Update Profile
                </Button>
              </CardContent>
            </Card>

            {/* Announcements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Announcements</CardTitle>
              </CardHeader>
              <CardContent>
                {announcements.length > 0 ? (
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                        <p className="font-medium text-foreground">{announcement.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {announcement.content}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {new Date(announcement.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No announcements yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
