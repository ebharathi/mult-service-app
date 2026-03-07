"use client";

import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-muted-foreground">
      <Settings className="size-16 stroke-1" />
      <h2 className="text-xl font-semibold text-foreground">Settings</h2>
      <p>Workspace settings coming soon.</p>
    </div>
  );
}
