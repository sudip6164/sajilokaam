import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { Button } from './ui/button';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Startup Founder',
    company: 'TechVenture Inc.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    content: 'SajiloKaam helped me find the perfect developer for my startup. The quality of talent is exceptional, and the platform is incredibly easy to use.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Freelance Designer',
    company: 'Independent',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    content: 'I\'ve been freelancing for 5 years, and SajiloKaam is by far the best platform. Great clients, fair rates, and seamless payment processing.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Marketing Director',
    company: 'GrowthCo',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    content: 'The talent pool on SajiloKaam is amazing. We\'ve hired multiple freelancers for various projects, and each experience has been outstanding.',
    rating: 5,
  },
  {
    name: 'David Kim',
    role: 'Full-Stack Developer',
    company: 'Independent',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    content: 'As a developer, I appreciate how SajiloKaam connects me with quality clients. The project management tools make collaboration effortless.',
    rating: 5,
  },
  {
    name: 'Jessica Taylor',
    role: 'Product Manager',
    company: 'InnovateLabs',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop',
    content: 'Finding skilled freelancers has never been easier. The verification process ensures we work with top professionals every time.',
    rating: 5,
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="w-full py-20 bg-background">
      <div className="w-full px-4 md:px-8 lg:px-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            What Our Users Say
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of satisfied freelancers and clients
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl border border-border p-8 md:p-12 shadow-xl relative">
            {/* Quote Icon */}
            <Quote className="absolute top-6 right-6 h-16 w-16 text-primary/10" />

            {/* Rating */}
            <div className="flex gap-1 mb-6">
              {Array.from({ length: testimonials[currentIndex].rating }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-warning text-warning" />
              ))}
            </div>

            {/* Content */}
            <p className="text-xl text-foreground mb-8 leading-relaxed italic">
              "{testimonials[currentIndex].content}"
            </p>

            {/* Author */}
            <div className="flex items-center gap-4">
              <img
                src={testimonials[currentIndex].avatar}
                alt={testimonials[currentIndex].name}
                className="w-16 h-16 rounded-full object-cover border-2 border-primary"
              />
              <div>
                <h4 className="font-semibold text-lg">{testimonials[currentIndex].name}</h4>
                <p className="text-muted-foreground">
                  {testimonials[currentIndex].role} • {testimonials[currentIndex].company}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-8 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={prevTestimonial}
                className="rounded-full w-10 h-10 p-0"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              {/* Dots */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'w-8 bg-gradient-to-r from-primary to-secondary'
                        : 'w-2 bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={nextTestimonial}
                className="rounded-full w-10 h-10 p-0"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}