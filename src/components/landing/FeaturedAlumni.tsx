import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Briefcase, Trophy, ArrowRight, Star, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const FeaturedAlumni: React.FC = () => {
  const { data: featured = [], isLoading } = useQuery({
    queryKey: ['featured-alumni-landing'],
    queryFn: async () => {
      // Fetch alumni_details (public via RLS) to find active alumni
      const { data: details, error } = await supabase
        .from('alumni_details')
        .select('user_id, job_title, current_company, skills, years_of_experience, is_mentor_available, mentorship_areas')
        .limit(50);

      if (error) throw error;
      if (!details || details.length === 0) return [];

      const userIds = details.map((d: any) => d.user_id);

      // Fetch public profiles
      const { data: profiles } = await supabase
        .from('profiles_public')
        .select('user_id, full_name, avatar_url, graduation_year, department')
        .in('user_id', userIds);

      const profilesMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

      return details
        .map((d: any) => {
          const p = profilesMap.get(d.user_id);
          if (!p) return null;
          let score = 0;
          score += (d.skills?.length || 0) * 2;
          score += (d.years_of_experience || 0) * 3;
          score += d.is_mentor_available ? 15 : 0;
          score += (d.mentorship_areas?.length || 0) * 3;
          score += d.job_title ? 5 : 0;
          score += d.current_company ? 5 : 0;
          if (p.avatar_url) score += 5;
          if (p.graduation_year) score += 3;

          return {
            id: p.user_id,
            name: p.full_name,
            avatar: p.avatar_url,
            batch: p.graduation_year,
            jobTitle: d.job_title || 'Alumni',
            company: d.current_company || '',
            skills: d.skills?.slice(0, 2) || [],
            score,
            mentorAvailable: d.is_mentor_available || false,
            yearsExp: d.years_of_experience || 0,
          };
        })
        .filter(Boolean)
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 4);
    },
  });

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30 border-y border-border">
        <div className="container flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (featured.length === 0) return null;

  return (
    <section className="py-16 bg-muted/30 border-y border-border">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent mb-3">
              <Star className="h-4 w-4" />
              Most Active Alumni
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Featured Contributors
            </h2>
            <p className="mt-2 text-muted-foreground">
              Meet our most engaged alumni who are actively giving back to the community
            </p>
          </div>
          <Button asChild variant="outline" className="hidden md:flex">
            <Link to="/auth?redirect=/leaderboard">
              View Leaderboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((alumni: any, index: number) => (
            <Card
              key={alumni.id}
              className="overflow-hidden transition-all hover:shadow-card hover:border-primary/30 group relative"
            >
              {index < 3 && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                    <Trophy className="h-3 w-3 mr-1" />
                    Top {index + 1}
                  </Badge>
                </div>
              )}
              <CardContent className="p-5">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 border-3 border-primary/20 mb-3">
                    <AvatarImage src={alumni.avatar} alt={alumni.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                      {getInitials(alumni.name)}
                    </AvatarFallback>
                  </Avatar>

                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {alumni.name}
                  </h3>

                  {alumni.jobTitle && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Briefcase className="h-3 w-3" />
                      {alumni.jobTitle}
                    </p>
                  )}

                  {alumni.company && (
                    <p className="text-sm text-primary flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {alumni.company}
                    </p>
                  )}

                  {alumni.batch && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      Batch of {alumni.batch}
                    </Badge>
                  )}

                  {alumni.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1 justify-center">
                      {alumni.skills.map((skill: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-1 justify-center">
                    {alumni.mentorAvailable && (
                      <Badge className="text-xs bg-accent/10 text-accent border-accent/30">
                        Mentor
                      </Badge>
                    )}
                    {alumni.yearsExp > 0 && (
                      <Badge className="text-xs bg-accent/10 text-accent border-accent/30">
                        {alumni.yearsExp}+ Yrs Exp
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 text-center md:hidden">
          <Button asChild variant="outline">
            <Link to="/auth?redirect=/leaderboard">
              View Full Leaderboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedAlumni;
