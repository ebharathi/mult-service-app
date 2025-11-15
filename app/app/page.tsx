"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import Home from "@/components/Home";
import { Loader2 } from "lucide-react";

export default function Page() {
  const { data: session, status } = useSession();
  
  const handleSignOut = () => {
    signOut({ redirect: false }).then(() => {
      window.location.href = '/'
    })
  }
  // Show loader while checking authentication
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is logged in, render Home component
  if (status === "authenticated" && session?.user) {
    return <Home session={session} handleSignOut={handleSignOut} />;
  }

  // If user is not logged in, show welcome card
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-border py-8">
        <CardHeader className="space-y-1 text-center pb-6">
          <CardTitle className="text-3xl font-bold">Welcome</CardTitle>
          <CardDescription className="text-base">
            Sign in to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <Button className="w-full" asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
