import { useState, useCallback } from "react";
import LatexEditor from "@/components/LatexEditor";
import OutputViewer from "@/components/OutputViewer";
import ControlButtons from "@/components/ControlButtons";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export default function Editor() {
  const [inputCode, setInputCode] = useState(
    `\\documentclass[10pt,letterpaper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{geometry}
\\geometry{left=0.75in,top=0.6in,right=0.75in,bottom=0.6in}
\\usepackage{titlesec}
\\usepackage{enumitem}

\\titleformat{\\section}{\\large\\bfseries}{}{0em}{}[\\titlerule]
\\titlespacing{\\section}{0pt}{10pt}{5pt}

\\begin{document}
\\begin{center}
    {\\huge \\bfseries YOUR NAME} \\\\
    Email: name@example.com | Phone: (123) 456-7890 | LinkedIn: linkedin.com/in/name
\\end{center}

\\section*{Summary}
Detail-oriented Software Engineer with experience in developing scalable web applications. Expert in React, Node.js, and LaTeX.

\\section*{Skills}
\\begin{itemize}[noitemsep,topsep=0pt]
    \\item \\textbf{Languages:} JavaScript, TypeScript, Python, C++
    \\item \\textbf{Frameworks:} React, Express, Tailwalled
    \\item \\textbf{Tools:} Git, Docker, LaTeX
\\end{itemize}

\\section*{Experience}
\\textbf{Software Engineer} \\hfill Jan 2022 -- Present \\\\
Tech Solutions Inc. \\hfill City, State
\\begin{itemize}[noitemsep,topsep=0pt]
    \\item Developed and maintained features for a high-traffic e-commerce platform.
    \\item Optimized frontend performance, reducing load times by 30\\%.
\\end{itemize}

\\section*{Education}
\\textbf{Bachelor of Science in Computer Science} \\hfill 2018 -- 2022 \\\\
University of Excellence \\hfill City, State

\\end{document}`
  );
  const [outputCode, setOutputCode] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isContinuing, setIsContinuing] = useState(false);
  const [modificationPrompt, setModificationPrompt] = useState("");
  const [conversationHistory, setConversationHistory] = useState<
    ConversationMessage[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!inputCode.trim()) {
      toast.error("Please enter LaTeX code");
      return;
    }

    setIsLoading(true);
    setIsContinuing(false);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latex_code: inputCode,
          conversation_history: conversationHistory,
          job_description: jobDescription,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate output");
      }

      const data = await response.json();
      setOutputCode(data.output || "");

      // Update conversation history
      setConversationHistory([
        ...conversationHistory,
        { role: "user", content: inputCode },
        { role: "assistant", content: data.output || "" },
      ]);

      toast.success("LaTeX code generated successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to generate LaTeX code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [inputCode, conversationHistory, jobDescription]);

  const handleRetry = useCallback(async () => {
    if (!inputCode.trim()) {
      toast.error("Please enter LaTeX code");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latex_code: inputCode,
          conversation_history: conversationHistory,
          retry: true,
          job_description: jobDescription,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to retry generation");
      }

      const data = await response.json();
      setOutputCode(data.output || "");

      // Update conversation history with retry
      setConversationHistory([
        ...conversationHistory,
        { role: "assistant", content: data.output || "" },
      ]);

      toast.success("New variation generated!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to retry. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [inputCode, conversationHistory, jobDescription]);

  const handleContinue = useCallback(async () => {
    if (!outputCode.trim()) {
      toast.error("No output to continue from");
      return;
    }

    // Toggle input field visibility
    if (!isContinuing) {
      setIsContinuing(true);
      return;
    }

    if (!modificationPrompt.trim()) {
      toast.error("Please specify what changes you want");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latex_code: outputCode,
          conversation_history: conversationHistory,
          continue: true,
          job_description: jobDescription,
          modification_prompt: modificationPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to continue generation");
      }

      const data = await response.json();
      setOutputCode(data.output || "");
      setModificationPrompt("");
      setIsContinuing(false);

      // Update conversation history
      setConversationHistory([
        ...conversationHistory,
        { role: "user", content: `Modification requested: ${modificationPrompt}` },
        { role: "assistant", content: data.output || "" },
      ]);

      toast.success("Modifications applied successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to apply modifications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [outputCode, conversationHistory, jobDescription, isContinuing, modificationPrompt]);

  const handleCopyOutput = useCallback(async () => {
    if (!outputCode.trim()) {
      toast.error("No output to copy");
      return;
    }

    try {
      // Modern API
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(outputCode);
        toast.success("Output copied to clipboard!");
        return;
      }

      // Fallback for non-secure contexts
      const textArea = document.createElement("textarea");
      textArea.value = outputCode;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success("Output copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy output");
      }
      document.body.removeChild(textArea);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to copy output");
    }
  }, [outputCode]);

  return (
    <div className="min-h-screen flex flex-col bg-background/50 relative overflow-hidden">
      <div className="mesh-bg" />
      <div className="noise-overlay" />

      <main className="flex-1 container pt-12 pb-24 relative z-10">
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-5xl lg:text-6xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            LaTeX Editor AI
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Precision engineering for your professional LaTeX documents.
            Refine, format, and perfect with AI-driven intelligence.
          </p>
        </div>

        {/* Editor Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8" style={{ minHeight: "750px" }}>
          {/* Left: Input Editor & Job Description */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col glass p-6 rounded-2xl shadow-xl shadow-black/5">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Job Description
              </h2>
              <textarea
                className="w-full p-4 rounded-xl border border-border/50 bg-background/40 text-foreground focus:ring-2 focus:ring-primary/40 outline-none transition-all resize-none font-sans min-h-[160px]"
                placeholder="Paste the job description here to tailor your resume..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <div className="flex flex-col flex-1 min-h-0 glass p-6 rounded-2xl shadow-xl shadow-black/5">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" />
                LaTeX Source
              </h2>
              <div className="flex-1 rounded-xl overflow-hidden border border-border/50">
                <LatexEditor value={inputCode} onChange={setInputCode} />
              </div>
            </div>
          </div>

          {/* Right: Output Viewer */}
          <div className="flex flex-col h-full glass p-6 rounded-2xl shadow-xl shadow-black/5">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Optimized Output
              </div>
              {isLoading && (
                <div className="text-xs font-medium text-primary animate-pulse uppercase tracking-widest">
                  Processing...
                </div>
              )}
            </h2>
            <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-border/50">
              <OutputViewer content={outputCode} isLoading={isLoading} />
            </div>
          </div>
        </div>

        {/* Control Buttons Area */}
        <div className="glass border border-border/50 rounded-2xl p-8 shadow-2xl shadow-black/5 mb-12">
          <ControlButtons
            onGenerate={handleGenerate}
            onRetry={handleRetry}
            onContinue={handleContinue}
            onCopyOutput={handleCopyOutput}
            isLoading={isLoading}
            hasOutput={!!outputCode}
            hasHistory={conversationHistory.length > 0}
            isContinuing={isContinuing}
          />

          {isContinuing && (
            <div className="flex flex-col gap-4 p-4 border border-primary/20 rounded-md bg-primary/5 animate-in fade-in slide-in-from-top-2 duration-300">
              <h3 className="text-sm font-medium text-foreground">
                What modifications would you like to make?
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 px-4 py-2 rounded-md border border-border bg-input text-foreground focus:ring-2 focus:ring-primary outline-none"
                  placeholder="e.g., 'Make the education section more concise' or 'Add a new skill: React Native'"
                  value={modificationPrompt}
                  onChange={(e) => setModificationPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleContinue();
                  }}
                  autoFocus
                />
                <Button onClick={() => setIsContinuing(false)} variant="ghost">
                  Cancel
                </Button>
                <Button onClick={handleContinue} disabled={isLoading || !modificationPrompt.trim()}>
                  {isLoading ? "Applying..." : "Submit"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
