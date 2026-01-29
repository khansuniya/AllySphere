import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SearchInput } from '@/components/ui/search-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import AlumniCard from '@/components/alumni/AlumniCard';
import { AlumniWithProfile } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { Filter, Loader2 } from 'lucide-react';

const AlumniDirectory: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [alumni, setAlumni] = useState<AlumniWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [mentorFilter, setMentorFilter] = useState<string>('all');
  const [industries, setIndustries] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAlumni();
    }
  }, [user]);

  const fetchAlumni = async () => {
    try {
      // Use profiles_public to avoid exposing sensitive PII (email, phone)
      const { data, error } = await supabase
        .from('alumni_details')
        .select('*, profiles:profiles_public(*)');

      if (error) throw error;

      if (data) {
        const alumniData = data as unknown as AlumniWithProfile[];
        setAlumni(alumniData);
        
        // Extract unique industries
        const uniqueIndustries = [...new Set(alumniData.map(a => a.industry).filter(Boolean))] as string[];
        setIndustries(uniqueIndustries);
      }
    } catch (error) {
      console.error('Error fetching alumni:', error);
      toast({
        title: 'Error',
        description: 'Failed to load alumni directory.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAlumni = useMemo(() => {
    return alumni.filter((alum) => {
      const matchesSearch = searchQuery === '' || 
        alum.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alum.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alum.current_company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alum.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesIndustry = industryFilter === 'all' || alum.industry === industryFilter;
      const matchesMentor = mentorFilter === 'all' || 
        (mentorFilter === 'available' && alum.is_mentor_available) ||
        (mentorFilter === 'unavailable' && !alum.is_mentor_available);

      return matchesSearch && matchesIndustry && matchesMentor;
    });
  }, [alumni, searchQuery, industryFilter, mentorFilter]);

  const handleConnect = async (alumniUserId: string) => {
    try {
      const { error } = await supabase.from('connections').insert({
        requester_id: user?.id,
        receiver_id: alumniUserId,
        status: 'pending',
      });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Already connected',
            description: 'You have already sent a connection request.',
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: 'Connection request sent',
          description: 'Your connection request has been sent.',
        });
      }
    } catch (error) {
      console.error('Error sending connection:', error);
      toast({
        title: 'Error',
        description: 'Failed to send connection request.',
        variant: 'destructive',
      });
    }
  };

  const handleMessage = (alumniUserId: string) => {
    navigate(`/messages?to=${alumniUserId}`);
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
          <h1 className="font-display text-3xl font-bold text-foreground">Alumni Directory</h1>
          <p className="mt-1 text-muted-foreground">
            Discover and connect with alumni from your college
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <SearchInput
            placeholder="Search by name, role, company, or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            containerClassName="flex-1 max-w-md"
          />
          <div className="flex gap-2">
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={mentorFilter} onValueChange={setMentorFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Mentorship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Alumni</SelectItem>
                <SelectItem value="available">Mentors Available</SelectItem>
                <SelectItem value="unavailable">Not Mentoring</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {filteredAlumni.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAlumni.map((alum) => (
              <AlumniCard
                key={alum.id}
                alumni={alum}
                onConnect={() => handleConnect(alum.user_id)}
                onMessage={() => handleMessage(alum.user_id)}
                onViewProfile={() => navigate(`/alumni/${alum.user_id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <Filter className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-semibold text-foreground">No alumni found</h3>
            <p className="mt-2 text-muted-foreground">
              Try adjusting your search or filters.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setIndustryFilter('all');
                setMentorFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AlumniDirectory;
