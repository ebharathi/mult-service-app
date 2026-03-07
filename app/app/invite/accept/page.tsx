"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@apollo/client";
import { useSession } from "next-auth/react";
import { ACCEPT_INVITATION } from "@/constants/query.graphql";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { setWorkspaceId } from "@/lib/workspace";

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { status } = useSession();
  const [acceptInvitation] = useMutation(ACCEPT_INVITATION);
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token || status !== "authenticated") return;

    acceptInvitation({ variables: { token } })
      .then(({ data }) => {
        if (data?.acceptInvitation?.workspace_id) {
          setWorkspaceId(data.acceptInvitation.workspace_id);
        }
        setState("success");
      })
      .catch((err) => {
        setErrorMsg(err.message || "Failed to accept invitation");
        setState("error");
      });
  }, [token, status]);

  if (status === "loading" || state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 pt-8 pb-8">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
            <p>Accepting invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              You need to sign in to accept this invitation.
            </p>
            <Button asChild className="w-full">
              <Link href={`/auth/signin?callbackUrl=/invite/accept?token=${token}`}>
                Sign In
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 pt-8 pb-8">
          {state === "success" ? (
            <>
              <CheckCircle className="size-12 text-green-500" />
              <p className="text-lg font-medium">Invitation accepted!</p>
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </>
          ) : (
            <>
              <XCircle className="size-12 text-destructive" />
              <p className="text-lg font-medium">Failed to accept</p>
              <p className="text-sm text-muted-foreground">{errorMsg}</p>
              <Button asChild variant="outline">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
