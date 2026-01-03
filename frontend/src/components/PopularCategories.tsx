import { 
  Code, 
  Palette, 
  PenTool, 
  Megaphone, 
  Camera, 
  Music, 
  BarChart, 
  Smartphone 
} from "lucide-react";
import { useRouter } from "./Router";

const categories = [
  {
    name: "Web Development",
    icon: Code,
    description: "Custom websites & web apps",
    projects: "12,847"
  },
  {
    name: "Graphic Design",
    icon: Palette,
    description: "Logos, branding & print design",
    projects: "8,952"
  },
  {
    name: "Writing & Content",
    icon: PenTool,
    description: "Articles, blogs & copywriting",
    projects: "6,234"
  },
  {
    name: "Digital Marketing",
    icon: Megaphone,
    description: "SEO, social media & advertising",
    projects: "4,567"
  },
  {
    name: "Photography",
    icon: Camera,
    description: "Product, portrait & event photos",
    projects: "3,829"
  },
  {
    name: "Music & Audio",
    icon: Music,
    description: "Voice-over, mixing & composition",
    projects: "2,156"
  },
  {
    name: "Data Analytics",
    icon: BarChart,
    description: "Data science & visualization",
    projects: "1,943"
  },
  {
    name: "Mobile Apps",
    icon: Smartphone,
    description: "iOS & Android development",
    projects: "2,847"
  }
];

export function PopularCategories() {
  const { navigate } = useRouter();

  return (
    <section className="w-full py-20 bg-muted/30">
      <div className="w-full px-4 md:px-8 lg:px-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Popular Categories
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Explore opportunities in trending fields
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.name}
                className="group relative overflow-hidden rounded-xl border-2 border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/50 hover:bg-primary/5 text-left"
                onClick={() => navigate('find-freelancers')}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary group-hover:from-primary group-hover:to-secondary group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
                    <IconComponent className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">{category.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
                    <p className="mt-3 text-xs font-medium text-primary">{category.projects} projects</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}