import { useState } from 'react';
import { ChevronDown, ChevronUp, DollarSign, MapPin, Star, Award, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

export interface FreelancerFiltersState {
  categories: string[];
  hourlyRate: { min: number; max: number };
  rating: number;
  location: string[];
  skills: string[];
  availability: string[];
  experienceLevel: string[];
  languages: string[];
  verified: boolean;
  topRated: boolean;
  risingTalent: boolean;
}

interface FreelancerFiltersProps {
  filters: FreelancerFiltersState;
  onFilterChange: (filters: FreelancerFiltersState) => void;
  onClearAll: () => void;
}

export function FreelancerFilters({ filters, onFilterChange, onClearAll }: FreelancerFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    rate: true,
    rating: false,
    experience: false,
    location: false,
    skills: false,
    availability: false,
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
  const availabilities = ['Available Now', 'Available in 1 week', 'Available in 2+ weeks'];
  const locations = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'India', 'Remote'];
  const popularSkills = [
    'React', 'JavaScript', 'Python', 'Node.js', 'TypeScript', 'AWS',
    'UI/UX Design', 'Figma', 'SEO', 'Content Writing', 'SQL', 'MongoDB'
  ];
  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'];

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

  const handleAvailabilityToggle = (avail: string) => {
    const newAvail = filters.availability.includes(avail)
      ? filters.availability.filter(a => a !== avail)
      : [...filters.availability, avail];
    onFilterChange({ ...filters, availability: newAvail });
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

  const handleLanguageToggle = (language: string) => {
    const newLanguages = filters.languages.includes(language)
      ? filters.languages.filter(l => l !== language)
      : [...filters.languages, language];
    onFilterChange({ ...filters, languages: newLanguages });
  };

  const activeFilterCount = 
    filters.categories.length + 
    filters.experienceLevel.length + 
    filters.availability.length + 
    filters.location.length + 
    filters.skills.length +
    filters.languages.length +
    (filters.verified ? 1 : 0) +
    (filters.topRated ? 1 : 0) +
    (filters.risingTalent ? 1 : 0);

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
        icon={Award}
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

      {/* Hourly Rate */}
      <FilterSection
        title="Hourly Rate"
        icon={DollarSign}
        isExpanded={expandedSections.rate}
        onToggle={() => toggleSection('rate')}
      >
        <div className="space-y-3">
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
      </FilterSection>

      {/* Minimum Rating */}
      <FilterSection
        title="Minimum Rating"
        icon={Star}
        isExpanded={expandedSections.rating}
        onToggle={() => toggleSection('rating')}
      >
        <div className="space-y-2">
          {[5, 4, 3, 2].map(rating => (
            <button
              key={rating}
              onClick={() => onFilterChange({ ...filters, rating })}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                filters.rating === rating
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex">
                {[...Array(rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm font-medium">& up</span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Experience Level */}
      <FilterSection
        title="Experience Level"
        icon={Award}
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

      {/* Availability */}
      <FilterSection
        title="Availability"
        icon={Clock}
        isExpanded={expandedSections.availability}
        onToggle={() => toggleSection('availability')}
        count={filters.availability.length}
      >
        <div className="space-y-2">
          {availabilities.map(avail => (
            <div key={avail} className="flex items-center space-x-2">
              <Checkbox
                id={`avail-${avail}`}
                checked={filters.availability.includes(avail)}
                onCheckedChange={() => handleAvailabilityToggle(avail)}
              />
              <Label htmlFor={`avail-${avail}`} className="text-sm cursor-pointer flex-1">
                {avail}
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
            id="verified"
            checked={filters.verified}
            onCheckedChange={(checked) => onFilterChange({ ...filters, verified: checked as boolean })}
          />
          <Label htmlFor="verified" className="text-sm cursor-pointer">
            Verified Only
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="top-rated"
            checked={filters.topRated}
            onCheckedChange={(checked) => onFilterChange({ ...filters, topRated: checked as boolean })}
          />
          <Label htmlFor="top-rated" className="text-sm cursor-pointer">
            Top Rated
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="rising-talent"
            checked={filters.risingTalent}
            onCheckedChange={(checked) => onFilterChange({ ...filters, risingTalent: checked as boolean })}
          />
          <Label htmlFor="rising-talent" className="text-sm cursor-pointer">
            Rising Talent
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
