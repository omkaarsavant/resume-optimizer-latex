import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import LatexEditor from "./LatexEditor";

interface OutputViewerProps {
  content: string;
  isLoading?: boolean;
}

export default function OutputViewer({
  content,
  isLoading = false,
}: OutputViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!content) return;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }

      const textArea = document.createElement("textarea");
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      document.body.removeChild(textArea);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="h-full w-full flex flex-col rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <h3 className="font-semibold text-foreground">AI Output</h3>
        {content && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </Button>
        )}
      </div>

      <div className="flex-1 relative min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full bg-background/50 backdrop-blur-sm absolute inset-0 z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-muted border-t-accent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">
                Processing your LaTeX code...
              </p>
            </div>
          </div>
        ) : null}

        <div className="h-full w-full">
          {content ? (
            <LatexEditor value={content} onChange={() => { }} readOnly={true} />
          ) : !isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground text-center">
                Your AI-generated LaTeX output will appear here
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

