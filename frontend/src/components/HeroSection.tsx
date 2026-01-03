import { Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useRouter } from "./Router";

export function HeroSection() {
  const { navigate } = useRouter();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20 md:py-32">
      <div className="relative z-10 w-full px-4 md:px-8 lg:px-12">
        <div className="mx-auto w-full text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Hire Experts or Get Hired for Your Skills
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Connect with top freelancers worldwide or showcase your skills to land your dream projects. 
            Join thousands of professionals building their careers on SajiloKaam.
          </p>

          {/* Search Bar */}
          <div className="mx-auto mt-10 max-w-2xl">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="What service are you looking for?"
                  className="h-14 pl-12 pr-4 border-2 border-border focus:border-primary rounded-lg shadow-sm"
                />
              </div>
              <Button 
                size="lg" 
                className="h-14 px-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-md"
                onClick={() => navigate('find-freelancers')}
              >
                Search
              </Button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('post-job')}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-lg"
            >
              Post a Job
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('find-work')}
              className="border-2 hover:bg-muted"
            >
              Browse Jobs
            </Button>
          </div>

          {/* Popular Searches */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground font-medium">Popular:</span>
            {["Logo Design", "WordPress", "React Development", "Content Writing", "Mobile Apps"].map((term) => (
              <Button 
                key={term} 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs rounded-full hover:border-primary hover:text-primary"
                onClick={() => navigate('find-freelancers')}
              >
                {term}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Background Illustration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 blur-3xl"></div>
        <div className="absolute left-0 top-1/4 h-64 w-64 rounded-full bg-gradient-to-br from-secondary/10 to-primary/10 blur-3xl"></div>
      </div>
    </section>
  );
}