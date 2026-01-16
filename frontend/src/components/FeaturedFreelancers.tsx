import { useState, useEffect } from "react";
import { Star, MapPin, Clock, Award } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useRouter } from "./Router";
import { freelancersApi } from "@/lib/api";

export function FeaturedFreelancers() {
  const { navigate } = useRouter();
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedFreelancers = async () => {
      try {
        setLoading(true);
        const response = await freelancersApi.list(0, 100);
        const data = response?.content || response || [];
        setFreelancers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching featured freelancers:', error);
        setFreelancers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedFreelancers();
  }, []);

  if (loading) {
    return (
      <section className="w-full py-20 bg-muted/30">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Featured Freelancers
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Hire top-rated professionals for your next project
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-6 animate-pulse">
                <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4"></div>
                <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (freelancers.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-20 bg-muted/30">
      <div className="w-full px-4 md:px-8 lg:px-12">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Featured Freelancers
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Hire top-rated professionals for your next project
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('find-freelancers')}
            className="hidden md:inline-flex"
          >
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {freelancers.map((freelancer) => (
            <div
              key={freelancer.id}
              className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Avatar and Basic Info */}
              <div className="text-center">
                <Avatar className="mx-auto h-16 w-16 rounded-full object-cover">
                  <AvatarImage src={freelancer.profilePictureUrl} alt={freelancer.fullName || 'Freelancer'} />
                  <AvatarFallback className="bg-gray-500 text-white">
                    {(freelancer.fullName || 'U')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="mt-4 font-semibold text-card-foreground">{freelancer.fullName || 'Freelancer'}</h3>
                <p className="text-sm text-muted-foreground">{freelancer.headline || 'Professional'}</p>
                
                {/* Location */}
                {(freelancer.locationCity || freelancer.locationCountry) && (
                  <div className="mt-2 flex items-center justify-center text-xs text-muted-foreground">
                    <MapPin className="mr-1 h-3 w-3" />
                    {[freelancer.locationCity, freelancer.locationCountry].filter(Boolean).join(', ')}
                  </div>
                )}

                {/* Rating */}
                {(freelancer.rating || freelancer.averageRating) && (
                  <div className="mt-2 flex items-center justify-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{freelancer.rating || freelancer.averageRating || 0}</span>
                    {freelancer.reviewCount && (
                      <span className="text-xs text-muted-foreground">({freelancer.reviewCount} reviews)</span>
                    )}
                  </div>
                )}
              </div>

              {/* Skills */}
              {(() => {
                const skills = [];
                if (freelancer.primarySkills) {
                  skills.push(...freelancer.primarySkills.split(',').map((s: string) => s.trim()).slice(0, 3));
                }
                if (freelancer.secondarySkills && skills.length < 3) {
                  skills.push(...freelancer.secondarySkills.split(',').map((s: string) => s.trim()).slice(0, 3 - skills.length));
                }
                return skills.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-1">
                    {skills.map((skill: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : null;
              })()}

              {/* Description */}
              {(freelancer.overview || freelancer.description) && (
                <p className="mt-3 text-xs text-muted-foreground line-clamp-2">
                  {freelancer.overview || freelancer.description}
                </p>
              )}

              {/* Stats */}
              <div className="mt-4 grid grid-cols-2 gap-4 text-center text-xs">
                {freelancer.experienceYears !== undefined && (
                  <div>
                    <p className="font-medium text-card-foreground">{freelancer.experienceYears || 0}+</p>
                    <p className="text-muted-foreground">Years</p>
                  </div>
                )}
                {freelancer.experienceLevel && (
                  <div>
                    <p className="font-medium text-card-foreground">{freelancer.experienceLevel}</p>
                    <p className="text-muted-foreground">Level</p>
                  </div>
                )}
              </div>

              {/* Hourly Rate and CTA */}
              <div className="mt-4 space-y-3">
                {(freelancer.hourlyRate || freelancer.hourlyRateMin) && (
                  <div className="text-center">
                    <span className="text-lg font-bold text-primary">
                      Rs. {freelancer.hourlyRate || freelancer.hourlyRateMin}
                      {freelancer.hourlyRateMax && freelancer.hourlyRateMax !== freelancer.hourlyRateMin && ` - ${freelancer.hourlyRateMax}`}
                    </span>
                    <span className="text-sm text-muted-foreground">/hour</span>
                  </div>
                )}
                <Button 
                  className="w-full bg-primary hover:bg-primary/90" 
                  size="sm"
                  onClick={() => navigate('view-freelancer', { freelancerId: freelancer.id })}
                >
                  View Profile
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}