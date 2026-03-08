import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import AlumniCard from '@/components/alumni/AlumniCard';
import AlumniSearchSuggestions from '@/components/alumni/AlumniSearchSuggestions';
import { AlumniWithProfile } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { Search, Users, Loader2 } from 'lucide-react';

const PAGE_SIZE = 12;

const AlumniDirectory: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [alumni, setAlumni] = useState<AlumniWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Active filter from suggestion selection
  const [activeFilter, setActiveFilter] = useState<{ type: string; value: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Auto-search if URL has query params
  useEffect(() => {
    const q = searchParams.get('q');
    const type = searchParams.get('type');
    const batch = searchParams.get('batch');
    if (q) {
      setSearchQuery(q);
      if (type && type !== 'all') {
        setActiveFilter({ type, value: q });
      } else if (batch && batch !== 'all') {
        setActiveFilter({ type: 'batch', value: batch });
      }
      executeSearch(q, type && type !== 'all' ? { type, value: q } : batch && batch !== 'all' ? { type: 'batch', value: batch } : null, 0);
    }
  }, []);

  const executeSearch = useCallback(async (
    query: string,
    filter: { type: string; value: string } | null,
    pageNum: number,
    append = false
  ) => {
    if (!user) return;
    setLoading(true);
    setHasSearched(true);

    try {
      const from = pageNum * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Build alumni query
      let alumniQuery = supabase.from('alumni_details').select('*');

      // Apply filter based on type
      if (filter) {
        switch (filter.type) {
          case 'company':
            alumniQuery = alumniQuery.ilike('current_company', `%${filter.value}%`);
            break;
          case 'skill':
            alumniQuery = alumniQuery.contains('skills', [filter.value]);
            break;
          case 'name':
          case 'department':
          case 'batch':
            // These filter on profiles, we'll filter after join
            break;
        }
      } else if (query) {
        // General search on alumni fields
        alumniQuery = alumniQuery.or(
          `current_company.ilike.%${query}%,job_title.ilike.%${query}%,industry.ilike.%${query}%`
        );
      }

      const { data: alumniData, error: alumniError } = await alumniQuery;
      if (alumniError) throw alumniError;

      // Fetch profiles
      let profilesQuery = supabase.from('profiles_public').select('*');
      if (filter?.type === 'name') {
        profilesQuery = profilesQuery.ilike('full_name', `%${filter.value}%`);
      } else if (filter?.type === 'department') {
        profilesQuery = profilesQuery.ilike('department', `%${filter.value}%`);
      } else if (filter?.type === 'batch') {
        profilesQuery = profilesQuery.eq('graduation_year', parseInt(filter.value));
      }

      const { data: profilesData, error: profilesError } = await profilesQuery;
      if (profilesError) throw profilesError;

      if (alumniData && profilesData) {
        const profilesMap = new Map(profilesData.map((p) => [p.user_id, p]));
        const alumniMap = new Map(alumniData.map((a) => [a.user_id, a]));

        let combined: AlumniWithProfile[];

        if (filter?.type === 'name' || filter?.type === 'department' || filter?.type === 'batch') {
          // Filter by profile matches that also have alumni details
          combined = profilesData
            .filter((p) => p.user_id && alumniMap.has(p.user_id))
            .map((p) => ({
              ...alumniMap.get(p.user_id!)!,
              profiles: p,
            })) as AlumniWithProfile[];
        } else if (!filter && query) {
          // General search: also check profile names/departments
          const alumniCombined = alumniData
            .filter((a) => profilesMap.has(a.user_id))
            .map((a) => ({
              ...a,
              profiles: profilesMap.get(a.user_id)!,
            })) as AlumniWithProfile[];

          // Also find by name/department in profiles
          const profileMatches = profilesData
            .filter((p) => {
              const q = query.toLowerCase();
              return (
                (p.full_name?.toLowerCase().includes(q) ||
                  p.department?.toLowerCase().includes(q)) &&
                p.user_id &&
                alumniMap.has(p.user_id)
              );
            })
            .map((p) => ({
              ...alumniMap.get(p.user_id!)!,
              profiles: p,
            })) as AlumniWithProfile[];

          // Also check skills
          const skillMatches = alumniData
            .filter((a) => a.skills?.some((s: string) => s.toLowerCase().includes(query.toLowerCase())) && profilesMap.has(a.user_id))
            .map((a) => ({
              ...a,
              profiles: profilesMap.get(a.user_id)!,
            })) as AlumniWithProfile[];

          // Merge and deduplicate
          const allResults = [...alumniCombined, ...profileMatches, ...skillMatches];
          const seen = new Set<string>();
          combined = allResults.filter((a) => {
            if (seen.has(a.user_id)) return false;
            seen.add(a.user_id);
            return true;
          });
        } else {
          combined = alumniData
            .filter((a) => profilesMap.has(a.user_id))
            .map((a) => ({
              ...a,
              profiles: profilesMap.get(a.user_id)!,
            })) as AlumniWithProfile[];
        }

        // Progressive loading: slice results
        const total = combined.length;
        const paged = combined.slice(from, to + 1);

        setTotalCount(total);
        setHasMore(to + 1 < total);
        setAlumni((prev) => (append ? [...prev, ...paged] : paged));
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error searching alumni:', error);
      toast({
        title: 'Error',
        description: 'Failed to search alumni.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const handleSearch = (query: string) => {
    setActiveFilter(null);
    setSearchParams(query ? { q: query } : {});
    if (query.trim()) {
      executeSearch(query, null, 0);
    } else {
      setAlumni([]);
      setHasSearched(false);
    }
  };

  const handleSuggestionSelect = (suggestion: { type: string; value: string }) => {
    setSearchQuery(suggestion.value);
    setActiveFilter(suggestion);
    setSearchParams({ q: suggestion.value, type: suggestion.type });
    executeSearch(suggestion.value, suggestion, 0);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    executeSearch(searchQuery, activeFilter, nextPage, true);
  };

  const handleConnect = async (alumniUserId: string) => {
    try {
      const { error } = await supabase.from('mentorship_requests').insert({
        student_id: user?.id,
        alumni_id: alumniUserId,
        message: 'Connection request from Alumni Directory',
        status: 'pending',
      });

      if (error) {
        if (error.code === '23505') {
          toast({ title: 'Already connected', description: 'You have already sent a request to this alumni.' });
        } else {
          throw error;
        }
      } else {
        toast({ title: 'Request sent!', description: 'Your request has been sent. Check Mentorship Hub for updates.' });
      }
    } catch (error) {
      console.error('Error sending request:', error);
      toast({ title: 'Error', description: 'Failed to send request.', variant: 'destructive' });
    }
  };

  const handleMessage = (alumniUserId: string) => {
    navigate(`/messages?to=${alumniUserId}`);
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-10 w-64 mb-8" />
          <Skeleton className="h-14 w-full mb-8" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground">Alumni Directory</h1>
          <p className="mt-1 text-muted-foreground">
            Search and discover alumni from your college network
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <AlumniSearchSuggestions
            query={searchQuery}
            onQueryChange={setSearchQuery}
            onSearch={handleSearch}
            onSuggestionSelect={handleSuggestionSelect}
          />
          {activeFilter && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filtering by:</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {activeFilter.type === 'batch' ? `Class of ${activeFilter.value}` : activeFilter.value}
                <button
                  onClick={() => {
                    setActiveFilter(null);
                    handleSearch(searchQuery);
                  }}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Results */}
        {!hasSearched ? (
          <div className="py-24 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Users className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Find Alumni</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Start typing to search alumni by name, company, skills, department, or batch year. Results appear as you type.
            </p>
          </div>
        ) : loading && alumni.length === 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : alumni.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Showing {alumni.length} of {totalCount} results
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {alumni.map((alum) => (
                <AlumniCard
                  key={alum.id}
                  alumni={alum}
                  onConnect={() => handleConnect(alum.user_id)}
                  onMessage={() => handleMessage(alum.user_id)}
                  onViewProfile={() => navigate(`/alumni/${alum.user_id}`)}
                />
              ))}
            </div>
            {hasMore && (
              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={loading}
                  className="min-w-[200px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="py-16 text-center">
            <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-semibold text-foreground">No alumni found</h3>
            <p className="mt-2 text-muted-foreground">
              Try a different search term or check your spelling.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AlumniDirectory;
