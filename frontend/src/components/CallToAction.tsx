import { Button } from "./ui/button";
import { useRouter } from "./Router";

export function CallToAction() {
  const { navigate } = useRouter();

  return (
    <section className="w-full py-20 bg-gradient-to-br from-primary/10 via-secondary/10 to-background">
      <div className="w-full px-4 md:px-8 lg:px-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-secondary p-12 md:p-16 text-center shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
          
          {/* Content */}
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white md:text-5xl">
              Ready to Get Started?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90 md:text-xl">
              Join SajiloKaam today and connect with opportunities that match your skills and goals.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90 shadow-lg"
                onClick={() => navigate('signup')}
              >
                Sign Up Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10"
                onClick={() => navigate('find-work')}
              >
                Browse Opportunities
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}