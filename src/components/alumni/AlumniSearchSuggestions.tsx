import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Search, User, Building2, GraduationCap, Briefcase, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Suggestion {
  type: 'name' | 'company' | 'department' | 'batch' | 'skill';
  value: string;
  label: string;
  icon: React.ReactNode;
}

interface AlumniSearchSuggestionsProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: (query: string, type?: string) => void;
  onSuggestionSelect: (suggestion: Suggestion) => void;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  name: <User className="h-4 w-4 text-primary" />,
  company: <Building2 className="h-4 w-4 text-accent" />,
  department: <GraduationCap className="h-4 w-4 text-primary" />,
  batch: <GraduationCap className="h-4 w-4 text-muted-foreground" />,
  skill: <Sparkles className="h-4 w-4 text-accent" />,
};

const TYPE_LABELS: Record<string, string> = {
  name: 'Alumni',
  company: 'Company',
  department: 'Department',
  batch: 'Batch',
  skill: 'Skill',
};

const AlumniSearchSuggestions: React.FC<AlumniSearchSuggestionsProps> = ({
  query,
  onQueryChange,
  onSearch,
  onSuggestionSelect,
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query.trim());
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (q: string) => {
    setLoading(true);
    try {
      const lower = q.toLowerCase();
      const results: Suggestion[] = [];

      // Fetch names from profiles_public
      const { data: profiles } = await supabase
        .from('profiles_public')
        .select('full_name, department, graduation_year')
        .ilike('full_name', `%${q}%`)
        .limit(5);

      if (profiles) {
        profiles.forEach((p) => {
          if (p.full_name) {
            results.push({
              type: 'name',
              value: p.full_name,
              label: p.full_name,
              icon: TYPE_ICONS.name,
            });
          }
        });
      }

      // Fetch companies from alumni_details
      const { data: companies } = await supabase
        .from('alumni_details')
        .select('current_company')
        .ilike('current_company', `%${q}%`)
        .limit(10);

      if (companies) {
        const unique = [...new Set(companies.map((c) => c.current_company).filter(Boolean))];
        unique.slice(0, 4).forEach((company) => {
          results.push({
            type: 'company',
            value: company!,
            label: company!,
            icon: TYPE_ICONS.company,
          });
        });
      }

      // Fetch departments from profiles_public
      const { data: depts } = await supabase
        .from('profiles_public')
        .select('department')
        .ilike('department', `%${q}%`)
        .limit(10);

      if (depts) {
        const unique = [...new Set(depts.map((d) => d.department).filter(Boolean))];
        unique.slice(0, 3).forEach((dept) => {
          results.push({
            type: 'department',
            value: dept!,
            label: dept!,
            icon: TYPE_ICONS.department,
          });
        });
      }

      // Batch year suggestions
      const yearMatch = q.match(/^\d{4}$/);
      if (yearMatch) {
        results.push({
          type: 'batch',
          value: q,
          label: `Class of ${q}`,
          icon: TYPE_ICONS.batch,
        });
      }

      // Fetch skills from alumni_details  
      const { data: alumniSkills } = await supabase
        .from('alumni_details')
        .select('skills')
        .limit(50);

      if (alumniSkills) {
        const allSkills = alumniSkills.flatMap((a) => a.skills || []);
        const uniqueSkills = [...new Set(allSkills)];
        const matchingSkills = uniqueSkills
          .filter((s) => s.toLowerCase().includes(lower))
          .slice(0, 4);
        matchingSkills.forEach((skill) => {
          results.push({
            type: 'skill',
            value: skill,
            label: skill,
            icon: TYPE_ICONS.skill,
          });
        });
      }

      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSearch(query);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          onSuggestionSelect(suggestions[selectedIndex]);
          setShowSuggestions(false);
        } else {
          onSearch(query);
          setShowSuggestions(false);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  // Group suggestions by type
  const grouped = suggestions.reduce<Record<string, Suggestion[]>>((acc, s) => {
    if (!acc[s.type]) acc[s.type] = [];
    acc[s.type].push(s);
    return acc;
  }, {});

  let flatIndex = -1;

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0 && query.length >= 2) setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search alumni by name, company, skill, department..."
          className="w-full pl-12 pr-4 h-14 text-lg rounded-xl border-2 border-primary/20 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-card shadow-sm transition-all"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}
      </div>

      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-card border-2 border-border rounded-xl shadow-lg overflow-hidden max-h-[400px] overflow-y-auto">
          {Object.entries(grouped).map(([type, items]) => (
            <div key={type}>
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50">
                {TYPE_LABELS[type]}
              </div>
              {items.map((suggestion) => {
                flatIndex++;
                const idx = flatIndex;
                return (
                  <button
                    key={`${suggestion.type}-${suggestion.value}`}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-accent/10 transition-colors',
                      idx === selectedIndex && 'bg-accent/10'
                    )}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onSuggestionSelect(suggestion);
                      setShowSuggestions(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    {suggestion.icon}
                    <span className="text-sm text-foreground">{suggestion.label}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{TYPE_LABELS[suggestion.type]}</span>
                  </button>
                );
              })}
            </div>
          ))}
          <button
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-primary/10 transition-colors border-t border-border"
            onMouseDown={(e) => {
              e.preventDefault();
              onSearch(query);
              setShowSuggestions(false);
            }}
          >
            <Search className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Search all for "{query}"
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AlumniSearchSuggestions;
