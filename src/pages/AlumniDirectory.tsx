import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import AlumniCard from '@/components/alumni/AlumniCard';
import AlumniFilters from '@/components/alumni/AlumniFilters';
import { AlumniWithProfile } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { Filter } from 'lucide-react';

const AlumniDirectory: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [alumni, setAlumni] = useState<AlumniWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [mentorFilter, setMentorFilter] = useState<string>('all');
  const [batchFilter, setBatchFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [experienceFilter, setExperienceFilter] = useState<string>('all');
  
  const [industries, setIndustries] = useState<string[]>([]);
  const [batches, setBatches] = useState<number[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);

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
      // Fetch alumni details and profiles separately since profiles_public is a view
      const { data: alumniData, error: alumniError } = await supabase
        .from('alumni_details')
        .select('*');

      if (alumniError) throw alumniError;

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles_public')
        .select('*');

      if (profilesError) throw profilesError;

      // Join alumni with their profiles
      if (alumniData && profilesData) {
        const profilesMap = new Map(profilesData.map(p => [p.user_id, p]));
        const combinedData = alumniData.map(alumni => ({
          ...alumni,
          profiles: profilesMap.get(alumni.user_id) || null
        })) as AlumniWithProfile[];
        
        setAlumni(combinedData);
        
        // Extract unique filter options from combined data
        const uniqueIndustries = [...new Set(combinedData.map(a => a.industry).filter(Boolean))] as string[];
        const uniqueBatches = [...new Set(combinedData.map(a => a.profiles?.graduation_year).filter(Boolean))] as number[];
        const uniqueCompanies = [...new Set(combinedData.map(a => a.current_company).filter(Boolean))] as string[];
        const allSkills = combinedData.flatMap(a => a.skills || []);
        const uniqueSkills = [...new Set(allSkills)] as string[];
        const uniqueDepartments = [...new Set(combinedData.map(a => a.profiles?.department).filter(Boolean))] as string[];
        
        setIndustries(uniqueIndustries.sort());
        setBatches(uniqueBatches.sort((a, b) => b - a));
        setCompanies(uniqueCompanies.sort());
        setSkills(uniqueSkills.sort());
        setDepartments(uniqueDepartments.sort());
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
      const matchesBatch = batchFilter === 'all' || alum.profiles?.graduation_year?.toString() === batchFilter;
      const matchesCompany = companyFilter === 'all' || alum.current_company === companyFilter;
      const matchesSkill = skillFilter === 'all' || alum.skills?.includes(skillFilter);
      const matchesDepartment = departmentFilter === 'all' || alum.profiles?.department === departmentFilter;
      
      const matchesExperience = experienceFilter === 'all' || (() => {
        const exp = alum.years_of_experience || 0;
        switch (experienceFilter) {
          case '0-5': return exp >= 0 && exp <= 5;
          case '5-10': return exp > 5 && exp <= 10;
          case '10-15': return exp > 10 && exp <= 15;
          case '15+': return exp > 15;
          default: return true;
        }
      })();

      return matchesSearch && matchesIndustry && matchesMentor && matchesBatch && matchesCompany && matchesSkill && matchesDepartment && matchesExperience;
    });
  }, [alumni, searchQuery, industryFilter, mentorFilter, batchFilter, companyFilter, skillFilter, departmentFilter, experienceFilter]);

  const activeFilterCount = [
    industryFilter !== 'all',
    mentorFilter !== 'all',
    batchFilter !== 'all',
    companyFilter !== 'all',
    skillFilter !== 'all',
    departmentFilter !== 'all',
    experienceFilter !== 'all',
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSearchQuery('');
    setIndustryFilter('all');
    setMentorFilter('all');
    setBatchFilter('all');
    setCompanyFilter('all');
    setSkillFilter('all');
    setDepartmentFilter('all');
    setExperienceFilter('all');
  };

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
        <div className="mb-8">
          <AlumniFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            industryFilter={industryFilter}
            onIndustryChange={setIndustryFilter}
            industries={industries}
            mentorFilter={mentorFilter}
            onMentorChange={setMentorFilter}
            batchFilter={batchFilter}
            onBatchChange={setBatchFilter}
            batches={batches}
            companyFilter={companyFilter}
            onCompanyChange={setCompanyFilter}
            companies={companies}
            skillFilter={skillFilter}
            onSkillChange={setSkillFilter}
            skills={skills}
            departmentFilter={departmentFilter}
            onDepartmentChange={setDepartmentFilter}
            departments={departments}
            experienceFilter={experienceFilter}
            onExperienceChange={setExperienceFilter}
            onClearFilters={clearAllFilters}
            activeFilterCount={activeFilterCount}
          />
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
              onClick={clearAllFilters}
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
