import { Zap, FileText, RefreshCw, BookOpen } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "AI Resume Tailoring",
    description: "Leverage Gemini AI to intelligently modify your resume based on specific job descriptions and requirements.",
  },
  {
    icon: FileText,
    title: "Skill Highlighting",
    description: "Automatically emphasize relevant skills and experiences that match the target role while maintaining professional formatting.",
  },
  {
    icon: RefreshCw,
    title: "Interactive Refinement",
    description: "Iteratively improve your resume by specifying exact changes you want to see in the generated LaTeX code.",
  },
  {
    icon: BookOpen,
    title: "Industry Standard Formatting",
    description: "Generate professional, clean LaTeX code that follows modern industry standards for resumes and CVs.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="mb-4 text-foreground">Powerful Features</h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to create professional LaTeX documents with AI assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative rounded-xl border border-border bg-card p-8 hover:shadow-lg hover:border-accent/50 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity pointer-events-none" />

                <div className="relative z-10">
                  <div className="mb-4 inline-flex p-3 rounded-lg bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
