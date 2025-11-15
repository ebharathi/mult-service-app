"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession, signOut } from "next-auth/react";
import { useQuery } from "@apollo/client";
import { GET_ME } from "@/constants/query.graphql";
import { Session } from "next-auth";

interface HomeProps {
  session: Session;
  handleSignOut: () => void;
}

export default function Home({ session, handleSignOut }: HomeProps) {


  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {/* Centered Card */}
      <Card className="w-full max-w-md shadow-lg border-border py-8">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">
            {session?.user ? `Hello, ${session.user.name}` : 'Welcome'}
          </CardTitle>
          <CardDescription className="text-base">
            {session?.user 
              ? 'You are successfully signed in to your account'
              : 'Sign in to access your account'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="flex flex-col gap-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

