import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent">
              <span className="text-sm font-bold text-primary-foreground">Λ</span>
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:inline">LaTeX Editor AI</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/editor">
            <Button variant="default" className="rounded-lg">
              Try Editor
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
