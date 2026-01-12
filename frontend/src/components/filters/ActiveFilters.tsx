import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { JobFiltersState } from './JobFilters';
import { jobCategoriesApi } from '@/lib/api';

interface ActiveFiltersProps {
  filters: JobFiltersState;
  onRemoveFilter: (type: string, value?: string) => void;
}

export function ActiveFilters({ filters, onRemoveFilter }: ActiveFiltersProps) {
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch categories to map IDs to names
    const fetchCategories = async () => {
      try {
        const categories = await jobCategoriesApi.list();
        const map: Record<string, string> = {};
        categories.forEach((cat: any) => {
          map[cat.id.toString()] = cat.name;
        });
        setCategoryMap(map);
      } catch (err) {
        console.error('Error fetching categories for active filters:', err);
      }
    };
    fetchCategories();
  }, []);

  const chips: { type: string; label: string; value?: string }[] = [];

  // Add category chips (convert ID to name)
  filters.categories.forEach(catId => {
    const categoryName = categoryMap[catId] || `Category ${catId}`;
    chips.push({ type: 'category', label: categoryName, value: catId });
  });

  // Add experience level chips
  filters.experienceLevel.forEach(exp => {
    chips.push({ type: 'experience', label: exp, value: exp });
  });

  // Add project length chips
  filters.projectLength.forEach(length => {
    chips.push({ type: 'projectLength', label: length, value: length });
  });

  // Add location chips
  filters.location.forEach(loc => {
    chips.push({ type: 'location', label: loc, value: loc });
  });

  // Add skill chips
  filters.skills.forEach(skill => {
    chips.push({ type: 'skill', label: skill, value: skill });
  });

  // Add budget chips
  if (filters.fixedPrice.min || filters.fixedPrice.max) {
    const min = filters.fixedPrice.min || 0;
    const max = filters.fixedPrice.max || '∞';
    chips.push({ type: 'fixedPrice', label: `Fixed: $${min} - $${max}` });
  }

  if (filters.hourlyRate.min || filters.hourlyRate.max) {
    const min = filters.hourlyRate.min || 0;
    const max = filters.hourlyRate.max || '∞';
    chips.push({ type: 'hourlyRate', label: `Hourly: $${min} - $${max}` });
  }

  // Add other filters
  if (filters.remote) {
    chips.push({ type: 'remote', label: 'Remote Only' });
  }

  if (filters.paymentVerified) {
    chips.push({ type: 'paymentVerified', label: 'Payment Verified' });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip, index) => (
        <button
          key={`${chip.type}-${chip.value || index}`}
          onClick={() => onRemoveFilter(chip.type, chip.value)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
        >
          <span>{chip.label}</span>
          <X className="h-3 w-3" />
        </button>
      ))}
    </div>
  );
}
