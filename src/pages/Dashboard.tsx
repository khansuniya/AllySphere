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
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  TrendingUp,
  ArrowRight,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { AlumniWithProfile, Event, Announcement } from '@/types/database';

const Dashboard: React.FC = () => {
  const { user, profile, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [recommendedAlumni, setRecommendedAlumni] = useState<AlumniWithProfile[]>([]);
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
      // Fetch recommended alumni (mentors) - use profiles_public to avoid exposing PII
      const { data: alumniData } = await supabase
        .from('alumni_details')
        .select('*, profiles:profiles_public(*)')
        .eq('is_mentor_available', true)
        .limit(3);

      if (alumniData) {
        setRecommendedAlumni(alumniData as unknown as AlumniWithProfile[]);
      }

      // Fetch upcoming events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('is_published', true)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
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

  return (
    <Layout>
      <div className="container py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Welcome back, {profile?.full_name?.split(' ')[0]}!
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here's what's happening in your network today.
          </p>
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
            {/* AI Recommendations */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  <CardTitle>Recommended Mentors</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/mentorship')}>
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {recommendedAlumni.length > 0 ? (
                  <div className="space-y-4">
                    {recommendedAlumni.map((alumni) => (
                      <div
                        key={alumni.id}
                        className="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50 cursor-pointer"
                        onClick={() => navigate(`/alumni/${alumni.user_id}`)}
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={alumni.profiles?.avatar_url} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {alumni.profiles?.full_name ? getInitials(alumni.profiles.full_name) : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{alumni.profiles?.full_name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {alumni.job_title} at {alumni.current_company}
                          </p>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          Mentor
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-muted-foreground">No mentors available yet.</p>
                    <Button variant="outline" className="mt-4" onClick={() => navigate('/alumni')}>
                      Browse Alumni
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Upcoming Events</CardTitle>
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
                    <p className="mt-4 text-muted-foreground">No upcoming events.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Birthday Feed */}
            <BirthdayFeed />

            {/* Quick Actions */}
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
                  Request Mentorship
                </Button>
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
