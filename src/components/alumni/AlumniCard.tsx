import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlumniWithProfile } from '@/types/database';
import { Building2, Briefcase, MapPin, MessageSquare, UserPlus } from 'lucide-react';

interface AlumniCardProps {
  alumni: AlumniWithProfile;
  onConnect?: () => void;
  onMessage?: () => void;
  onViewProfile?: () => void;
}

const AlumniCard: React.FC<AlumniCardProps> = ({
  alumni,
  onConnect,
  onMessage,
  onViewProfile,
}) => {
  const profile = alumni.profiles;
  const fullName = profile?.full_name || 'Unknown Alumni';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-card cursor-pointer group" onClick={onViewProfile}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-border">
            <AvatarImage src={profile?.avatar_url || undefined} alt={fullName} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {fullName}
                </h3>
                {alumni.job_title && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Briefcase className="h-3.5 w-3.5" />
                    {alumni.job_title}
                  </p>
                )}
              </div>
              {alumni.is_mentor_available && (
                <Badge variant="secondary" className="bg-accent/10 text-accent shrink-0">
                  Available for Mentorship
                </Badge>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {alumni.current_company && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {alumni.current_company}
                </span>
              )}
              {alumni.industry && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {alumni.industry}
                </span>
              )}
            </div>

            {alumni.skills && alumni.skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {alumni.skills.slice(0, 4).map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {alumni.skills.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{alumni.skills.length - 4}
                  </Badge>
                )}
              </div>
            )}

            <div className="mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Button size="sm" variant="outline" onClick={onConnect}>
                <UserPlus className="h-4 w-4 mr-1" />
                Connect
              </Button>
              <Button size="sm" variant="ghost" onClick={onMessage}>
                <MessageSquare className="h-4 w-4 mr-1" />
                Message
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlumniCard;
