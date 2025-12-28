import { Link } from "react-router-dom";
import { 
  Target, 
  Users, 
  Award, 
  Globe, 
  Heart,
  Lightbulb,
  Shield,
  TrendingUp,
  CheckCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const values = [
  {
    icon: Heart,
    title: "Community First",
    description: "We believe in building a strong community where freelancers and clients can thrive together."
  },
  {
    icon: Shield,
    title: "Trust & Security",
    description: "Every transaction is secure, and we verify all users to ensure a safe working environment."
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We continuously improve our platform with AI-powered features and modern tools."
  },
  {
    icon: Globe,
    title: "Made for Nepal",
    description: "Designed specifically for Nepal's unique market needs and payment systems."
  }
];

const team = [
  { name: "Aarav Shrestha", role: "CEO & Founder", image: "A" },
  { name: "Sanjay Basnet", role: "CTO", image: "S" },
  { name: "Priya Maharjan", role: "Head of Operations", image: "P" },
  { name: "Bikash Tamang", role: "Lead Developer", image: "B" }
];

const milestones = [
  { year: "2021", title: "Founded", description: "Sajilo Kaam was born with a vision to transform Nepal's freelance industry." },
  { year: "2022", title: "1,000 Users", description: "Reached our first thousand freelancers and clients milestone." },
  { year: "2023", title: "NPR 10M Processed", description: "Crossed ten million rupees in successful project payments." },
  { year: "2024", title: "5,000+ Community", description: "Grew to over 5,000 active users across Nepal." }
];

export default function About() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              About Us
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Building Nepal's Digital
              <span className="text-primary"> Future Together</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Sajilo Kaam is on a mission to empower Nepal's workforce by connecting talented 
              freelancers with amazing opportunities. We believe in fair work, secure payments, 
              and building lasting professional relationships.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-2 bg-gradient-primary" />
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To create a thriving freelance ecosystem in Nepal where skilled professionals 
                  can find meaningful work, earn fairly, and grow their careers while helping 
                  businesses access the talent they need to succeed.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-2 bg-gradient-secondary" />
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To become Nepal's leading platform for freelance work, recognized for 
                  excellence, innovation, and our commitment to building a fair and 
                  transparent marketplace for all participants.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Our Values</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">
              What Drives Us Forward
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} hover className="border-0 shadow-sm text-center">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Our Journey</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">
              Milestones We're Proud Of
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex gap-6 mb-8 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold shadow-lg">
                    {milestone.year}
                  </div>
                  {index < milestones.length - 1 && (
                    <div className="w-0.5 h-full bg-border mt-4" />
                  )}
                </div>
                <div className="pt-3 pb-8">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{milestone.title}</h3>
                  <p className="text-muted-foreground">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Our Team</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">
              Meet the People Behind Sajilo Kaam
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <Card key={index} hover className="border-0 shadow-sm text-center">
                <CardContent className="p-6">
                  <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 text-2xl text-primary-foreground font-bold">
                    {member.image}
                  </div>
                  <h3 className="font-semibold text-foreground">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Join Our Community?
            </h2>
            <p className="text-muted-foreground mb-8">
              Whether you're a freelancer looking for opportunities or a client seeking talent, 
              we're here to help you succeed.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="hero" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
