import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Users, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';

interface BatchMateRecommendation {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  department: string | null;
  graduation_year: number | null;
  job_title: string | null;
  current_company: string | null;
  industry: string | null;
  skills: string[];
  connect_reason: string;
  common_ground: string[];
}

const RecommendedBatchMates: React.FC = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<BatchMateRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecommendations = async (isRefresh = false) => {
    if (!user || !session) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-batch-mates', {
        body: {},
      });

      if (error) throw error;
      setRecommendations(data?.recommendations || []);
    } catch (error: any) {
      console.error('Error fetching batch mate recommendations:', error);
      toast({
        title: 'Could not load suggestions',
        description: error?.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [user, session]);

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <CardTitle>Batch Mates</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchRecommendations(true)}
            disabled={refreshing}
            className="h-8 w-8"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate('/alumni')}>
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border border-border p-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((mate) => (
              <div
                key={mate.user_id}
                className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50 cursor-pointer"
                onClick={() => navigate(`/alumni/${mate.user_id}`)}
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={mate.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(mate.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{mate.full_name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {mate.job_title
                        ? `${mate.job_title} at ${mate.current_company}`
                        : mate.department || 'Alumni'}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    Batch {mate.graduation_year}
                  </Badge>
                </div>
                {mate.connect_reason && (
                  <p className="mt-2 text-sm text-muted-foreground italic">
                    💡 {mate.connect_reason}
                  </p>
                )}
                {mate.common_ground && mate.common_ground.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {mate.common_ground.map((item, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No batch mates found yet.</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/alumni')}>
              Browse Alumni
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendedBatchMates;
