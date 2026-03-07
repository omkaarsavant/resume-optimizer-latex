import { ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Paste Your Resume LaTeX",
    description: "Copy and paste your current Overleaf or LaTeX resume into the editor. We'll help you optimize it for your next role.",
  },
  {
    number: "02",
    title: "Add a Job Description",
    description: "Provide the target job description. Our AI analyzes the requirements to help you highlight the most relevant experiences.",
  },
  {
    number: "03",
    title: "Get a Tailored Resume",
    description: "Receive the optimized LaTeX code instantly. Iterate with AI to fine-tune every bullet point for perfect alignment with the role.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="mb-4 text-foreground">How It Works</h2>
          <p className="text-lg text-muted-foreground">
            Three simple steps to transform your LaTeX documents with AI.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-8">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-xl mb-4">
                    {step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-1 h-24 bg-gradient-to-b from-accent to-transparent" />
                  )}
                </div>

                <div className="flex-1 pt-2">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
