import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Event } from '@/types/database';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';

const EventsPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_published', true)
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data as Event[]);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      full: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    };
  };

  const isUpcoming = (dateStr: string) => new Date(dateStr) >= new Date();

  const upcomingEvents = events.filter((e) => isUpcoming(e.event_date));
  const pastEvents = events.filter((e) => !isUpcoming(e.event_date));

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Events</h1>
          <p className="mt-1 text-muted-foreground">
            Stay connected through networking events, webinars, and reunions
          </p>
        </div>

        {/* Upcoming Events */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4">Upcoming Events</h2>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.map((event) => {
                const date = formatDate(event.event_date);
                return (
                  <Card key={event.id} className="overflow-hidden hover:shadow-card transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex">
                        <div className="flex h-auto w-24 flex-col items-center justify-center bg-primary text-primary-foreground p-4">
                          <span className="text-2xl font-bold">{date.day}</span>
                          <span className="text-sm font-medium">{date.month}</span>
                        </div>
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg text-foreground">{event.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                            </div>
                            <Badge variant="secondary">{event.event_type}</Badge>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {date.time}
                            </span>
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {event.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center border border-dashed border-border rounded-lg">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-semibold text-foreground">No upcoming events</h3>
              <p className="mt-2 text-muted-foreground">Check back later for new events.</p>
            </div>
          )}
        </section>

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Past Events</h2>
            <div className="space-y-4">
              {pastEvents.map((event) => {
                const date = formatDate(event.event_date);
                return (
                  <Card key={event.id} className="opacity-70">
                    <CardContent className="p-0">
                      <div className="flex">
                        <div className="flex h-auto w-24 flex-col items-center justify-center bg-muted text-muted-foreground p-4">
                          <span className="text-2xl font-bold">{date.day}</span>
                          <span className="text-sm font-medium">{date.month}</span>
                        </div>
                        <div className="flex-1 p-6">
                          <h3 className="font-semibold text-foreground">{event.title}</h3>
                          <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {event.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default EventsPage;
