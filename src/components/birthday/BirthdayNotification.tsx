import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProfilePublic } from '@/types/database';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cake, PartyPopper, MessageSquare, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

interface BirthdayPerson extends ProfilePublic {
  alumni_details?: {
    job_title?: string;
    current_company?: string;
  };
}

const BirthdayNotification: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [birthdayPeople, setBirthdayPeople] = useState<BirthdayPerson[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasCheckedToday, setHasCheckedToday] = useState(false);

  useEffect(() => {
    if (user && !hasCheckedToday) {
      checkBirthdays();
    }
  }, [user, hasCheckedToday]);

  const checkBirthdays = async () => {
    // Check if we've already shown the notification today
    const lastCheck = localStorage.getItem('birthday_check_date');
    const today = new Date().toDateString();
    
    if (lastCheck === today) {
      setHasCheckedToday(true);
      return;
    }

    try {
      const todayDate = new Date();
      const month = todayDate.getMonth() + 1;
      const day = todayDate.getDate();

      // Fetch all profiles with birthdays today (excluding current user)
      const { data: profiles } = await supabase
        .from('profiles_public')
        .select('*')
        .neq('user_id', user?.id);

      if (!profiles) return;

      // Filter for today's birthdays
      const todayBirthdays = profiles.filter(profile => {
        if (!profile.date_of_birth) return false;
        const dob = new Date(profile.date_of_birth);
        return dob.getMonth() + 1 === month && dob.getDate() === day;
      });

      if (todayBirthdays.length > 0) {
        // Fetch alumni details for birthday people
        const userIds = todayBirthdays.map(p => p.user_id);
        const { data: alumniDetails } = await supabase
          .from('alumni_details')
          .select('user_id, job_title, current_company')
          .in('user_id', userIds);

        const enrichedProfiles = todayBirthdays.map(profile => ({
          ...profile,
          alumni_details: alumniDetails?.find(a => a.user_id === profile.user_id),
        })) as BirthdayPerson[];

        setBirthdayPeople(enrichedProfiles);
        setIsOpen(true);
        
        // Trigger confetti
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'],
          });
        }, 300);
      }

      localStorage.setItem('birthday_check_date', today);
      setHasCheckedToday(true);
    } catch (error) {
      console.error('Error checking birthdays:', error);
    }
  };

  const handleWish = (userId: string) => {
    setIsOpen(false);
    navigate(`/messages?to=${userId}`);
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  if (birthdayPeople.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Cake className="h-6 w-6 text-pink-500" />
            Birthday Celebration!
            <PartyPopper className="h-6 w-6 text-yellow-500" />
          </DialogTitle>
          <DialogDescription>
            {birthdayPeople.length === 1 
              ? "Someone special has a birthday today!" 
              : `${birthdayPeople.length} people have birthdays today!`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {birthdayPeople.map((person) => (
            <div 
              key={person.user_id} 
              className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-pink-50 to-yellow-50 dark:from-pink-950/30 dark:to-yellow-950/30 border border-pink-200 dark:border-pink-800"
            >
              <Avatar className="h-14 w-14 border-2 border-pink-300">
                <AvatarImage src={person.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-pink-400 to-yellow-400 text-white font-semibold">
                  {getInitials(person.full_name || '')}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">
                    {person.full_name}
                  </h3>
                  <Badge className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white text-xs">
                    🎂 Today
                  </Badge>
                </div>
                {person.alumni_details?.job_title && (
                  <p className="text-sm text-muted-foreground truncate">
                    {person.alumni_details.job_title}
                    {person.alumni_details.current_company && ` at ${person.alumni_details.current_company}`}
                  </p>
                )}
                {person.department && (
                  <p className="text-xs text-muted-foreground">
                    {person.department} • Class of {person.graduation_year}
                  </p>
                )}
              </div>

              <Button
                size="sm"
                onClick={() => handleWish(person.user_id!)}
                className="bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 text-white"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Wish
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4 mr-1" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BirthdayNotification;
