import { Star, Quote } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const testimonials = [
  {
    id: 1,
    name: "Jessica Miller",
    role: "Startup Founder",
    company: "TechFlow",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    content: "FreelanceHub helped me find an amazing developer who built our MVP in just 6 weeks. The quality was outstanding and the communication was seamless throughout the project."
  },
  {
    id: 2,
    name: "Robert Chen",
    role: "Marketing Director",
    company: "GrowthCorp",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    content: "As a client, I've hired over 20 freelancers through this platform. The talent quality is consistently high, and the project management tools make collaboration effortless."
  },
  {
    id: 3,
    name: "Maria Rodriguez",
    role: "Freelance Designer",
    company: "Independent",
    avatar: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    content: "I've been freelancing for 5 years, and this platform has transformed my business. I've connected with amazing clients and built long-term relationships that keep me booked solid."
  },
  {
    id: 4,
    name: "Alex Thompson",
    role: "E-commerce Owner",
    company: "ShopSmart",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    content: "The freelancers I've worked with have been professional, skilled, and delivered exactly what we needed. Our website redesign increased conversions by 40%."
  }
];

export function Testimonials() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="w-full px-4 md:px-8 lg:px-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            What Our Community Says
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Trusted by thousands of clients and freelancers worldwide
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="relative rounded-lg border border-border bg-card p-8 shadow-sm"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/20" />
              
              {/* Rating */}
              <div className="flex space-x-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <p className="mt-4 text-card-foreground leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="mt-6 flex items-center space-x-4">
                <ImageWithFallback
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-card-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}