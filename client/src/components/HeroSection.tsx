import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-6 inline-block">
            <span className="px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium border border-accent/20">
              ✨ Powered by Gemini AI
            </span>
          </div>

          <h1 className="mb-6 text-foreground leading-tight">
            AI-Powered Resume Tailoring
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            Instantly tailor your LaTeX resume for any job description. Transform your Overleaf code with AI-driven suggestions to highlight the right skills and land your dream job.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/editor">
              <Button size="lg" className="rounded-lg gap-2 group">
                Try the Editor
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="rounded-lg">
              Learn More
            </Button>
          </div>
        </div>

        <div className="mt-16 md:mt-24 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
          {/* Removed skeleton placeholder */}
        </div>
      </div>
    </section>
  );
}
