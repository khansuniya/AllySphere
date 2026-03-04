import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { AlumniWithProfile, MentorshipRequest, ProfilePublic } from '@/types/database';
import { 
  GraduationCap, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Loader2,
  MessageSquare
} from 'lucide-react';

interface MentorshipWithProfiles extends MentorshipRequest {
  student_profile?: ProfilePublic;
  alumni_profile?: ProfilePublic;
}

const MentorshipPage: React.FC = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [mentors, setMentors] = useState<AlumniWithProfile[]>([]);
  const [myRequests, setMyRequests] = useState<MentorshipWithProfiles[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<MentorshipWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState<AlumniWithProfile | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showAllMentors, setShowAllMentors] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch available mentors - use profiles_public to avoid exposing PII
      const { data: mentorData } = await supabase
        .from('alumni_details')
        .select('*, profiles:profiles_public(*)')
        .eq('is_mentor_available', true);

      if (mentorData) {
        setMentors(mentorData as unknown as AlumniWithProfile[]);
      }

      // Fetch my mentorship requests (as student)
      const { data: myRequestsData } = await supabase
        .from('mentorship_requests')
        .select('*')
        .eq('student_id', user?.id)
        .order('created_at', { ascending: false });

      if (myRequestsData) {
        // Fetch profiles for alumni - use profiles_public
        const alumniIds = myRequestsData.map(r => r.alumni_id);
        const { data: alumniProfiles } = await supabase
          .from('profiles_public')
          .select('*')
          .in('user_id', alumniIds);

        const requestsWithProfiles = myRequestsData.map(request => ({
          ...request,
          alumni_profile: alumniProfiles?.find(p => p.user_id === request.alumni_id),
        }));

        setMyRequests(requestsWithProfiles as MentorshipWithProfiles[]);
      }

      // Fetch incoming requests (as alumni)
      const { data: incomingData } = await supabase
        .from('mentorship_requests')
        .select('*')
        .eq('alumni_id', user?.id)
        .order('created_at', { ascending: false });

      if (incomingData) {
        // Fetch profiles for students - use profiles_public
        const studentIds = incomingData.map(r => r.student_id);
        const { data: studentProfiles } = await supabase
          .from('profiles_public')
          .select('*')
          .in('user_id', studentIds);

        const requestsWithProfiles = incomingData.map(request => ({
          ...request,
          student_profile: studentProfiles?.find(p => p.user_id === request.student_id),
        }));

        setIncomingRequests(requestsWithProfiles as MentorshipWithProfiles[]);
      }
    } catch (error) {
      console.error('Error fetching mentorship data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestMentorship = async () => {
    if (!selectedMentor || !user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('mentorship_requests').insert({
        student_id: user.id,
        alumni_id: selectedMentor.user_id,
        message: requestMessage,
        status: 'pending',
      });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Request exists',
            description: 'You have already sent a mentorship request to this mentor.',
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: 'Request sent!',
          description: 'Your mentorship request has been sent successfully.',
        });
        setDialogOpen(false);
        setRequestMessage('');
        setSelectedMentor(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error sending request:', error);
      toast({
        title: 'Error',
        description: 'Failed to send mentorship request.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRequest = async (requestId: string, status: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase
        .from('mentorship_requests')
        .update({ status })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: status === 'accepted' ? 'Request accepted' : 'Request declined',
        description: status === 'accepted' 
          ? 'You have accepted this mentorship request.'
          : 'You have declined this mentorship request.',
      });

      fetchData();
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: 'Error',
        description: 'Failed to update request.',
        variant: 'destructive',
      });
    }
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case 'accepted':
        return <Badge className="bg-success text-success-foreground"><CheckCircle2 className="mr-1 h-3 w-3" />Accepted</Badge>;
      case 'declined':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
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
          <h1 className="font-display text-3xl font-bold text-foreground">Mentorship Hub</h1>
          <p className="mt-1 text-muted-foreground">
            Connect with experienced alumni for career guidance
          </p>
        </div>

        <Tabs defaultValue="mentors" className="space-y-6">
          <TabsList>
            <TabsTrigger value="mentors" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Find Mentors
            </TabsTrigger>
            <TabsTrigger value="my-requests" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              My Requests
              {myRequests.length > 0 && (
                <Badge variant="secondary" className="ml-1">{myRequests.length}</Badge>
              )}
            </TabsTrigger>
            {userRole === 'alumni' && (
              <TabsTrigger value="incoming" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Incoming Requests
                {incomingRequests.filter(r => r.status === 'pending').length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {incomingRequests.filter(r => r.status === 'pending').length}
                  </Badge>
                )}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="mentors">
            {mentors.length > 0 ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {(showAllMentors ? mentors : mentors.slice(0, 1)).map((mentor) => (
                    <Card key={mentor.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-14 w-14">
                            <AvatarImage src={mentor.profiles?.avatar_url} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(mentor.profiles?.full_name || '')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground">
                              {mentor.profiles?.full_name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {mentor.job_title} at {mentor.current_company}
                            </p>
                          </div>
                        </div>

                        {mentor.mentorship_areas && mentor.mentorship_areas.length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Can help with:</p>
                            <div className="flex flex-wrap gap-1">
                              {mentor.mentorship_areas.slice(0, 3).map((area, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <Dialog open={dialogOpen && selectedMentor?.id === mentor.id} onOpenChange={(open) => {
                          setDialogOpen(open);
                          if (!open) setSelectedMentor(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              className="w-full mt-4" 
                              onClick={() => setSelectedMentor(mentor)}
                            >
                              Request Mentorship
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Request Mentorship</DialogTitle>
                              <DialogDescription>
                                Send a mentorship request to {mentor.profiles?.full_name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Textarea
                                placeholder="Introduce yourself and explain what kind of guidance you're looking for..."
                                value={requestMessage}
                                onChange={(e) => setRequestMessage(e.target.value)}
                                rows={4}
                              />
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleRequestMentorship} disabled={submitting}>
                                {submitting ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                  </>
                                ) : (
                                  'Send Request'
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {!showAllMentors && mentors.length > 1 && (
                  <div className="mt-4 text-center">
                    <Button variant="outline" onClick={() => setShowAllMentors(true)}>
                      View More ({mentors.length - 1} more)
                    </Button>
                  </div>
                )}
                {showAllMentors && mentors.length > 1 && (
                  <div className="mt-4 text-center">
                    <Button variant="outline" onClick={() => setShowAllMentors(false)}>
                      Show Less
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-16 text-center">
                <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 font-semibold text-foreground">No mentors available</h3>
                <p className="mt-2 text-muted-foreground">
                  Check back later for available mentors.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-requests">
            {myRequests.length > 0 ? (
              <div className="space-y-4">
                {myRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.alumni_profile?.avatar_url} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(request.alumni_profile?.full_name || '')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">
                            {request.alumni_profile?.full_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Requested on {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(request.status)}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 font-semibold text-foreground">No requests yet</h3>
                <p className="mt-2 text-muted-foreground">
                  Start by finding a mentor to request guidance from.
                </p>
              </div>
            )}
          </TabsContent>

          {userRole === 'alumni' && (
            <TabsContent value="incoming">
              {incomingRequests.length > 0 ? (
                <div className="space-y-4">
                  {incomingRequests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={request.student_profile?.avatar_url} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {getInitials(request.student_profile?.full_name || '')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">
                                {request.student_profile?.full_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(request.created_at).toLocaleDateString()}
                              </p>
                              {request.message && (
                                <p className="mt-2 text-sm text-foreground">
                                  "{request.message}"
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {request.status === 'pending' ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateRequest(request.id, 'declined')}
                                >
                                  Decline
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateRequest(request.id, 'accepted')}
                                >
                                  Accept
                                </Button>
                              </>
                            ) : (
                              getStatusBadge(request.status)
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 font-semibold text-foreground">No incoming requests</h3>
                  <p className="mt-2 text-muted-foreground">
                    Students will appear here when they request your mentorship.
                  </p>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default MentorshipPage;
