import { Button } from "@/components/ui/button";
import { Zap, RotateCcw, ChevronRight, Copy } from "lucide-react";

interface ControlButtonsProps {
  onGenerate: () => void;
  onRetry: () => void;
  onContinue: () => void;
  onCopyOutput: () => void;
  isLoading?: boolean;
  hasOutput?: boolean;
  hasHistory?: boolean;
  isContinuing?: boolean;
}

export default function ControlButtons({
  onGenerate,
  onRetry,
  onContinue,
  onCopyOutput,
  isLoading = false,
  hasOutput = false,
  hasHistory = false,
  isContinuing = false,
}: ControlButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
      <Button
        onClick={onGenerate}
        disabled={isLoading}
        className="gap-2 rounded-lg flex-1 sm:flex-none"
      >
        <Zap className="w-4 h-4" />
        {isLoading ? "Generating..." : "Generate"}
      </Button>

      <Button
        onClick={onRetry}
        disabled={!hasOutput || isLoading}
        variant="outline"
        className="gap-2 rounded-lg flex-1 sm:flex-none"
      >
        <RotateCcw className="w-4 h-4" />
        Retry
      </Button>

      <Button
        onClick={onContinue}
        disabled={!hasOutput || isLoading}
        variant={isContinuing ? "default" : "outline"}
        className="gap-2 rounded-lg flex-1 sm:flex-none"
      >
        <ChevronRight className="w-4 h-4" />
        {isContinuing ? "Specify Changes" : "Continue"}
      </Button>

      <Button
        onClick={onCopyOutput}
        disabled={!hasOutput}
        variant="outline"
        className="gap-2 rounded-lg flex-1 sm:flex-none"
      >
        <Copy className="w-4 h-4" />
        Copy Output
      </Button>
    </div>
  );
}
