"use client";

import { Brain } from "lucide-react";

export default function MemoryPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-muted-foreground">
      <Brain className="size-16 stroke-1" />
      <h2 className="text-xl font-semibold text-foreground">Memory Graph</h2>
      <p>The React Flow memory graph will be built here.</p>
    </div>
  );
}
