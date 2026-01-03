import { useState } from 'react';
import { X, ChevronDown, ChevronUp, DollarSign, MapPin, Briefcase, Clock, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

export interface JobFiltersState {
  categories: string[];
  budgetRange: { min: number; max: number };
  experienceLevel: string[];
  projectLength: string[];
  location: string[];
  skills: string[];
  hourlyRate: { min: number; max: number };
  fixedPrice: { min: number; max: number };
  clientRating: number;
  paymentVerified: boolean;
  remote: boolean;
}

interface JobFiltersProps {
  filters: JobFiltersState;
  onFilterChange: (filters: JobFiltersState) => void;
  onClearAll: () => void;
}

export function JobFilters({ filters, onFilterChange, onClearAll }: JobFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    budget: true,
    experience: true,
    projectLength: false,
    location: false,
    skills: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const categories = [
    'Web Development',
    'Mobile Development',
    'Design & Creative',
    'Writing & Translation',
    'Marketing & Sales',
    'Data Science & Analytics',
    'Admin & Customer Support',
    'Engineering & Architecture',
  ];

  const experienceLevels = ['Entry Level', 'Intermediate', 'Expert'];
  const projectLengths = ['Less than 1 month', '1-3 months', '3-6 months', 'More than 6 months'];
  const locations = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'Remote Only'];
  const popularSkills = [
    'React', 'JavaScript', 'Python', 'Node.js', 'TypeScript', 'AWS',
    'UI/UX Design', 'Figma', 'SEO', 'Content Writing', 'SQL', 'MongoDB'
  ];

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onFilterChange({ ...filters, categories: newCategories });
  };

  const handleExperienceToggle = (level: string) => {
    const newLevels = filters.experienceLevel.includes(level)
      ? filters.experienceLevel.filter(l => l !== level)
      : [...filters.experienceLevel, level];
    onFilterChange({ ...filters, experienceLevel: newLevels });
  };

  const handleProjectLengthToggle = (length: string) => {
    const newLengths = filters.projectLength.includes(length)
      ? filters.projectLength.filter(l => l !== length)
      : [...filters.projectLength, length];
    onFilterChange({ ...filters, projectLength: newLengths });
  };

  const handleLocationToggle = (location: string) => {
    const newLocations = filters.location.includes(location)
      ? filters.location.filter(l => l !== location)
      : [...filters.location, location];
    onFilterChange({ ...filters, location: newLocations });
  };

  const handleSkillToggle = (skill: string) => {
    const newSkills = filters.skills.includes(skill)
      ? filters.skills.filter(s => s !== skill)
      : [...filters.skills, skill];
    onFilterChange({ ...filters, skills: newSkills });
  };

  const activeFilterCount = 
    filters.categories.length + 
    filters.experienceLevel.length + 
    filters.projectLength.length + 
    filters.location.length + 
    filters.skills.length +
    (filters.paymentVerified ? 1 : 0) +
    (filters.remote ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-destructive hover:text-destructive"
          >
            Clear All ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <FilterSection
        title="Category"
        icon={Briefcase}
        isExpanded={expandedSections.category}
        onToggle={() => toggleSection('category')}
        count={filters.categories.length}
      >
        <div className="space-y-2">
          {categories.map(category => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category}`}
                checked={filters.categories.includes(category)}
                onCheckedChange={() => handleCategoryToggle(category)}
              />
              <Label
                htmlFor={`category-${category}`}
                className="text-sm cursor-pointer flex-1"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Experience Level */}
      <FilterSection
        title="Experience Level"
        icon={Star}
        isExpanded={expandedSections.experience}
        onToggle={() => toggleSection('experience')}
        count={filters.experienceLevel.length}
      >
        <div className="space-y-2">
          {experienceLevels.map(level => (
            <div key={level} className="flex items-center space-x-2">
              <Checkbox
                id={`exp-${level}`}
                checked={filters.experienceLevel.includes(level)}
                onCheckedChange={() => handleExperienceToggle(level)}
              />
              <Label htmlFor={`exp-${level}`} className="text-sm cursor-pointer flex-1">
                {level}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Budget Range */}
      <FilterSection
        title="Budget Range"
        icon={DollarSign}
        isExpanded={expandedSections.budget}
        onToggle={() => toggleSection('budget')}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Fixed Price</label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.fixedPrice.min || ''}
                  onChange={(e) => onFilterChange({
                    ...filters,
                    fixedPrice: { ...filters.fixedPrice, min: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm"
                />
              </div>
              <span className="text-muted-foreground">to</span>
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.fixedPrice.max || ''}
                  onChange={(e) => onFilterChange({
                    ...filters,
                    fixedPrice: { ...filters.fixedPrice, max: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Hourly Rate</label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.hourlyRate.min || ''}
                  onChange={(e) => onFilterChange({
                    ...filters,
                    hourlyRate: { ...filters.hourlyRate, min: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm"
                />
              </div>
              <span className="text-muted-foreground">to</span>
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.hourlyRate.max || ''}
                  onChange={(e) => onFilterChange({
                    ...filters,
                    hourlyRate: { ...filters.hourlyRate, max: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Project Length */}
      <FilterSection
        title="Project Length"
        icon={Clock}
        isExpanded={expandedSections.projectLength}
        onToggle={() => toggleSection('projectLength')}
        count={filters.projectLength.length}
      >
        <div className="space-y-2">
          {projectLengths.map(length => (
            <div key={length} className="flex items-center space-x-2">
              <Checkbox
                id={`length-${length}`}
                checked={filters.projectLength.includes(length)}
                onCheckedChange={() => handleProjectLengthToggle(length)}
              />
              <Label htmlFor={`length-${length}`} className="text-sm cursor-pointer flex-1">
                {length}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Location */}
      <FilterSection
        title="Location"
        icon={MapPin}
        isExpanded={expandedSections.location}
        onToggle={() => toggleSection('location')}
        count={filters.location.length}
      >
        <div className="space-y-2">
          {locations.map(location => (
            <div key={location} className="flex items-center space-x-2">
              <Checkbox
                id={`location-${location}`}
                checked={filters.location.includes(location)}
                onCheckedChange={() => handleLocationToggle(location)}
              />
              <Label htmlFor={`location-${location}`} className="text-sm cursor-pointer flex-1">
                {location}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Skills */}
      <FilterSection
        title="Skills"
        icon={Star}
        isExpanded={expandedSections.skills}
        onToggle={() => toggleSection('skills')}
        count={filters.skills.length}
      >
        <div className="space-y-2">
          {popularSkills.map(skill => (
            <div key={skill} className="flex items-center space-x-2">
              <Checkbox
                id={`skill-${skill}`}
                checked={filters.skills.includes(skill)}
                onCheckedChange={() => handleSkillToggle(skill)}
              />
              <Label htmlFor={`skill-${skill}`} className="text-sm cursor-pointer flex-1">
                {skill}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Additional Filters */}
      <div className="pt-4 border-t border-border space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remote"
            checked={filters.remote}
            onCheckedChange={(checked) => onFilterChange({ ...filters, remote: checked as boolean })}
          />
          <Label htmlFor="remote" className="text-sm cursor-pointer">
            Remote Only
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="payment-verified"
            checked={filters.paymentVerified}
            onCheckedChange={(checked) => onFilterChange({ ...filters, paymentVerified: checked as boolean })}
          />
          <Label htmlFor="payment-verified" className="text-sm cursor-pointer">
            Payment Verified Clients
          </Label>
        </div>
      </div>
    </div>
  );
}

function FilterSection({
  title,
  icon: Icon,
  isExpanded,
  onToggle,
  children,
  count,
}: {
  title: string;
  icon: any;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <span className="font-medium">{title}</span>
          {count !== undefined && count > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {count}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isExpanded && (
        <div className="p-4 pt-0">
          {children}
        </div>
      )}
    </div>
  );
}
