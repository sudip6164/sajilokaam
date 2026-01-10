import { useState } from 'react';
import { Search, Bell, Trash2, Edit2, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface SavedSearch {
  id: number;
  name: string;
  query: string;
  filters: {
    categories: string[];
    budgetRange?: string;
    experienceLevel?: string[];
  };
  alertsEnabled: boolean;
  newResults: number;
  createdAt: string;
}

export function SavedSearches() {
  const [searches, setSearches] = useState<SavedSearch[]>([
    {
      id: 1,
      name: 'React Developer Jobs',
      query: 'React developer',
      filters: {
        categories: ['Web Development'],
        budgetRange: 'Rs. 50-100/hr',
        experienceLevel: ['Expert'],
      },
      alertsEnabled: true,
      newResults: 12,
      createdAt: '2 days ago',
    },
    {
      id: 2,
      name: 'UI/UX Design Projects',
      query: 'UI UX design',
      filters: {
        categories: ['Design & Creative'],
        experienceLevel: ['Intermediate', 'Expert'],
      },
      alertsEnabled: false,
      newResults: 8,
      createdAt: '1 week ago',
    },
    {
      id: 3,
      name: 'Mobile App Development',
      query: 'mobile app',
      filters: {
        categories: ['Mobile Development'],
        budgetRange: 'Rs. 5000+',
      },
      alertsEnabled: true,
      newResults: 5,
      createdAt: '3 days ago',
    },
  ]);

  const [isOpen, setIsOpen] = useState(false);

  const handleToggleAlert = (id: number) => {
    setSearches(searches.map(search => 
      search.id === id ? { ...search, alertsEnabled: !search.alertsEnabled } : search
    ));
  };

  const handleDelete = (id: number) => {
    setSearches(searches.filter(search => search.id !== id));
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="relative"
      >
        <Search className="h-4 w-4 mr-2" />
        Saved Searches
        {searches.reduce((sum, s) => sum + s.newResults, 0) > 0 && (
          <Badge className="ml-2 bg-gradient-to-r from-primary to-secondary">
            {searches.reduce((sum, s) => sum + s.newResults, 0)}
          </Badge>
        )}
      </Button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-xl border border-border max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-2xl font-bold">Saved Searches</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your saved job searches and alerts
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {searches.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No saved searches yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Save your searches to quickly access them later
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {searches.map(search => (
                    <div
                      key={search.id}
                      className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{search.name}</h3>
                            {search.newResults > 0 && (
                              <Badge variant="secondary" className="bg-primary/10 text-primary">
                                {search.newResults} new
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            "{search.query}"
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleAlert(search.id)}
                            className={`p-2 rounded-lg border transition-all ${
                              search.alertsEnabled
                                ? 'bg-primary/10 border-primary text-primary'
                                : 'border-border text-muted-foreground hover:border-primary'
                            }`}
                            title={search.alertsEnabled ? 'Alerts enabled' : 'Enable alerts'}
                          >
                            <Bell className={`h-4 w-4 ${search.alertsEnabled ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            className="p-2 rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary transition-all"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(search.id)}
                            className="p-2 rounded-lg border border-border text-muted-foreground hover:border-destructive hover:text-destructive transition-all"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Filters */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {search.filters.categories.map(cat => (
                          <span
                            key={cat}
                            className="px-2 py-1 rounded bg-muted text-xs font-medium"
                          >
                            {cat}
                          </span>
                        ))}
                        {search.filters.budgetRange && (
                          <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium">
                            {search.filters.budgetRange}
                          </span>
                        )}
                        {search.filters.experienceLevel?.map(level => (
                          <span
                            key={level}
                            className="px-2 py-1 rounded bg-secondary/10 text-secondary text-xs font-medium"
                          >
                            {level}
                          </span>
                        ))}
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Saved {search.createdAt}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                {searches.length} saved {searches.length === 1 ? 'search' : 'searches'}
              </p>
              <Button onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
