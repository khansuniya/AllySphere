import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Briefcase, Trophy, ArrowRight, Star } from 'lucide-react';

interface FeaturedAlumniMember {
  id: string;
  name: string;
  avatar?: string;
  jobTitle: string;
  company: string;
  batch: number;
  skills: string[];
  achievements: string[];
  isTopContributor?: boolean;
}

const FeaturedAlumni: React.FC = () => {
  // Mock data for featured alumni - will be replaced with real data after auth
  const featuredAlumni: FeaturedAlumniMember[] = [
    {
      id: '1',
      name: 'Dr. Priya Sharma',
      jobTitle: 'Senior Data Scientist',
      company: 'Google',
      batch: 2015,
      skills: ['Machine Learning', 'Python', 'AI'],
      achievements: ['Mentor Champion', 'Top Referrer'],
      isTopContributor: true,
    },
    {
      id: '2',
      name: 'Rahul Deshmukh',
      jobTitle: 'Engineering Manager',
      company: 'Microsoft',
      batch: 2012,
      skills: ['Cloud', 'DevOps', 'Leadership'],
      achievements: ['10+ Mentorships'],
      isTopContributor: true,
    },
    {
      id: '3',
      name: 'Sneha Kulkarni',
      jobTitle: 'Product Lead',
      company: 'Amazon',
      batch: 2016,
      skills: ['Product Management', 'Strategy'],
      achievements: ['Top Donor'],
    },
    {
      id: '4',
      name: 'Amit Joshi',
      jobTitle: 'CTO & Co-founder',
      company: 'TechStartup Inc.',
      batch: 2010,
      skills: ['Entrepreneurship', 'Full Stack'],
      achievements: ['Event Host', '5+ Jobs Posted'],
      isTopContributor: true,
    },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
          {featuredAlumni.map((alumni, index) => (
            <Card 
              key={alumni.id} 
              className="overflow-hidden transition-all hover:shadow-card hover:border-primary/30 group relative"
            >
              {alumni.isTopContributor && (
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
                  
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Briefcase className="h-3 w-3" />
                    {alumni.jobTitle}
                  </p>
                  
                  <p className="text-sm text-primary flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {alumni.company}
                  </p>
                  
                  <Badge variant="outline" className="mt-2 text-xs">
                    Batch of {alumni.batch}
                  </Badge>

                  <div className="mt-3 flex flex-wrap gap-1 justify-center">
                    {alumni.skills.slice(0, 2).map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1 justify-center">
                    {alumni.achievements.map((achievement, i) => (
                      <Badge key={i} className="text-xs bg-accent/10 text-accent border-accent/30">
                        {achievement}
                      </Badge>
                    ))}
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
