import Editor from "@monaco-editor/react";
import { useRef, useEffect, useCallback } from "react";

interface LatexEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export default function LatexEditor({
  value,
  onChange,
  readOnly = false,
}: LatexEditorProps) {
  const editorRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleEditorDidMount = useCallback((editor: any) => {
    editorRef.current = editor;
    // Define LaTeX language for syntax highlighting
    if (window.monaco) {
      try {
        window.monaco.languages.register({ id: "latex" });
        window.monaco.languages.setMonarchTokensProvider("latex", {
          tokenizer: {
            root: [
              [/\\[a-zA-Z]+/, "keyword"],
              [/[{}]/, "delimiter"],
              [/%.*/, "comment"],
              [/\$.*?\$/, "string"],
            ],
          },
        });
      } catch (e) {
        // Language might already be registered
        console.debug("Language registration info:", e);
      }
    }
  }, []);

  useEffect(() => {
    // Suppress ResizeObserver errors - these are non-critical warnings from Monaco Editor
    const resizeObserverErrorHandler = (e: ErrorEvent) => {
      if (e.message.includes("ResizeObserver loop completed")) {
        e.preventDefault();
      }
    };

    window.addEventListener("error", resizeObserverErrorHandler);
    return () => {
      window.removeEventListener("error", resizeObserverErrorHandler);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full w-full rounded-lg border border-border overflow-hidden bg-background"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <Editor
        height="100%"
        defaultLanguage="latex"
        value={value}
        onChange={(val) => onChange(val || "")}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
          lineHeight: 1.6,
          wordWrap: "on",
          automaticLayout: true,
          readOnly: readOnly,
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          tabSize: 2,
          insertSpaces: true,
          formatOnPaste: true,
          formatOnType: true,
          bracketPairColorization: {
            enabled: true,
          },
        } as any}
        theme="light"
      />
    </div>
  );
}

// Extend window type for Monaco
declare global {
  interface Window {
    monaco?: any;
  }
}
