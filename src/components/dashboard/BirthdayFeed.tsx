import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cake, PartyPopper, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, isToday, parseISO } from 'date-fns';

interface BirthdayAlumni {
  user_id: string;
  full_name: string;
  avatar_url?: string;
  department?: string;
  date_of_birth: string;
}

const BirthdayFeed: React.FC = () => {
  const navigate = useNavigate();
  const [birthdayAlumni, setBirthdayAlumni] = useState<BirthdayAlumni[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBirthdays();
  }, []);

  const fetchBirthdays = async () => {
    try {
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();

      // Fetch profiles with today's birthday using the profiles_public view
      const { data, error } = await supabase
        .from('profiles_public')
        .select('user_id, full_name, avatar_url, department, date_of_birth')
        .not('date_of_birth', 'is', null);

      if (error) throw error;

      if (data) {
        // Filter for today's birthdays
        const todayBirthdays = data.filter((profile) => {
          if (!profile.date_of_birth) return false;
          const dob = parseISO(profile.date_of_birth);
          return dob.getMonth() + 1 === month && dob.getDate() === day;
        }) as BirthdayAlumni[];

        setBirthdayAlumni(todayBirthdays);
      }
    } catch (error) {
      console.error('Error fetching birthdays:', error);
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

  if (loading || birthdayAlumni.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-accent/10 p-2">
            <Cake className="h-5 w-5 text-accent" />
          </div>
          <CardTitle className="text-lg">🎉 Today's Birthdays</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {birthdayAlumni.map((alumni) => (
            <div
              key={alumni.user_id}
              className="flex items-center gap-3 rounded-lg border border-accent/20 bg-background/80 p-3 transition-all hover:bg-accent/10 cursor-pointer"
              onClick={() => navigate(`/alumni/${alumni.user_id}`)}
            >
              <div className="relative">
                <Avatar className="h-10 w-10 ring-2 ring-accent ring-offset-2">
                  <AvatarImage src={alumni.avatar_url} />
                  <AvatarFallback className="bg-accent/10 text-accent">
                    {getInitials(alumni.full_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -top-1 -right-1 text-lg">🎂</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {alumni.full_name}
                </p>
                {alumni.department && (
                  <p className="text-xs text-muted-foreground truncate">
                    {alumni.department}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 gap-1 text-xs border-accent/30 hover:bg-accent/10"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/messages?to=${alumni.user_id}&birthday=true`);
                }}
              >
                <Gift className="h-3 w-3" />
                Wish
              </Button>
            </div>
          ))}
        </div>
        {birthdayAlumni.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3 text-accent"
            onClick={() => navigate('/alumni?birthday=today')}
          >
            <PartyPopper className="mr-1 h-4 w-4" />
            View All {birthdayAlumni.length} Birthdays
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default BirthdayFeed;
