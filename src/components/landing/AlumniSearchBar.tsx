import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, Building2, GraduationCap, Sparkles } from 'lucide-react';

const AlumniSearchBar: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [batchYear, setBatchYear] = useState('all');

  const currentYear = new Date().getFullYear();
  const batchYears = Array.from({ length: 20 }, (_, i) => currentYear - i);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to auth page for non-logged in users, or alumni directory for logged in
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (searchType !== 'all') params.set('type', searchType);
    if (batchYear !== 'all') params.set('batch', batchYear);
    navigate(`/auth?redirect=/alumni&${params.toString()}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className="flex flex-col gap-3">
        {/* Main Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search alumni by name, skill, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 text-lg rounded-xl border-2 border-primary/20 focus:border-primary bg-card shadow-sm"
          />
          <Button 
            type="submit" 
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 justify-center">
          <Select value={searchType} onValueChange={setSearchType}>
            <SelectTrigger className="w-auto min-w-[140px] h-9 rounded-full border-primary/20 bg-card">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <SelectValue placeholder="Search by" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="name">Alumni Name</SelectItem>
              <SelectItem value="skill">Skills</SelectItem>
              <SelectItem value="company">Company</SelectItem>
              <SelectItem value="industry">Industry</SelectItem>
            </SelectContent>
          </Select>

          <Select value={batchYear} onValueChange={setBatchYear}>
            <SelectTrigger className="w-auto min-w-[140px] h-9 rounded-full border-primary/20 bg-card">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                <SelectValue placeholder="Batch Year" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              {batchYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            className="rounded-full border-accent/30 text-accent hover:bg-accent/10"
            onClick={() => navigate('/auth?redirect=/mentorship')}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Find Mentors
          </Button>

          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            className="rounded-full border-primary/30 hover:bg-primary/10"
            onClick={() => navigate('/auth?redirect=/jobs')}
          >
            <Building2 className="h-4 w-4 mr-1" />
            Browse Jobs
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AlumniSearchBar;
