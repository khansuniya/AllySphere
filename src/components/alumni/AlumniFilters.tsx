import React from 'react';
import { SearchInput } from '@/components/ui/search-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Filter, RotateCcw } from 'lucide-react';

interface AlumniFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  industryFilter: string;
  onIndustryChange: (value: string) => void;
  industries: string[];
  mentorFilter: string;
  onMentorChange: (value: string) => void;
  batchFilter: string;
  onBatchChange: (value: string) => void;
  batches: number[];
  companyFilter: string;
  onCompanyChange: (value: string) => void;
  companies: string[];
  skillFilter: string;
  onSkillChange: (value: string) => void;
  skills: string[];
  departmentFilter: string;
  onDepartmentChange: (value: string) => void;
  departments: string[];
  experienceFilter: string;
  onExperienceChange: (value: string) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

const AlumniFilters: React.FC<AlumniFiltersProps> = ({
  searchQuery,
  onSearchChange,
  industryFilter,
  onIndustryChange,
  industries,
  mentorFilter,
  onMentorChange,
  batchFilter,
  onBatchChange,
  batches,
  companyFilter,
  onCompanyChange,
  companies,
  skillFilter,
  onSkillChange,
  skills,
  departmentFilter,
  onDepartmentChange,
  departments,
  experienceFilter,
  onExperienceChange,
  onClearFilters,
  activeFilterCount,
}) => {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <SearchInput
          placeholder="Search by name, role, company, or skill..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          containerClassName="flex-1"
        />
        {activeFilterCount > 0 && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Clear Filters
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          </Button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap gap-3">
        {/* Industry Filter */}
        <Select value={industryFilter} onValueChange={onIndustryChange}>
          <SelectTrigger className="w-[180px]">
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

        {/* Batch/Year Filter */}
        <Select value={batchFilter} onValueChange={onBatchChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Batch Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Batches</SelectItem>
            {batches.map((batch) => (
              <SelectItem key={batch} value={batch.toString()}>
                Class of {batch}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Company Filter */}
        <Select value={companyFilter} onValueChange={onCompanyChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Company" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Companies</SelectItem>
            {companies.map((company) => (
              <SelectItem key={company} value={company}>
                {company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Skills Filter */}
        <Select value={skillFilter} onValueChange={onSkillChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Skills" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Skills</SelectItem>
            {skills.map((skill) => (
              <SelectItem key={skill} value={skill}>
                {skill}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Department Filter */}
        <Select value={departmentFilter} onValueChange={onDepartmentChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Experience Filter */}
        <Select value={experienceFilter} onValueChange={onExperienceChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Experience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Experience</SelectItem>
            <SelectItem value="0-5">0-5 years</SelectItem>
            <SelectItem value="5-10">5-10 years</SelectItem>
            <SelectItem value="10-15">10-15 years</SelectItem>
            <SelectItem value="15+">15+ years</SelectItem>
          </SelectContent>
        </Select>

        {/* Mentorship Filter */}
        <Select value={mentorFilter} onValueChange={onMentorChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Mentorship" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Alumni</SelectItem>
            <SelectItem value="available">Mentors Available</SelectItem>
            <SelectItem value="unavailable">Not Mentoring</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Filter className="h-4 w-4" />
            Active filters:
          </span>
          {industryFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {industryFilter}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => onIndustryChange('all')}
              />
            </Badge>
          )}
          {batchFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Class of {batchFilter}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => onBatchChange('all')}
              />
            </Badge>
          )}
          {companyFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {companyFilter}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => onCompanyChange('all')}
              />
            </Badge>
          )}
          {skillFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {skillFilter}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => onSkillChange('all')}
              />
            </Badge>
          )}
          {departmentFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {departmentFilter}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => onDepartmentChange('all')}
              />
            </Badge>
          )}
          {experienceFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {experienceFilter} years
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => onExperienceChange('all')}
              />
            </Badge>
          )}
          {mentorFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {mentorFilter === 'available' ? 'Mentors' : 'Not Mentoring'}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => onMentorChange('all')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default AlumniFilters;
