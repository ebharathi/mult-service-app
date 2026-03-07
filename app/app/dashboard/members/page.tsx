"use client";

import { useSession } from "next-auth/react";
import { useMutation } from "@apollo/client";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { REMOVE_MEMBER, UPDATE_MEMBER_ROLE } from "@/constants/query.graphql";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InviteMemberDialog } from "@/components/workspace/InviteMemberDialog";
import { UserPlus, Trash2 } from "lucide-react";
import { useState } from "react";

export default function MembersPage() {
  const { data: session } = useSession();
  const { currentWorkspace, refetch } = useWorkspace();
  const [showInvite, setShowInvite] = useState(false);
  const [removeMember] = useMutation(REMOVE_MEMBER);
  const [updateRole] = useMutation(UPDATE_MEMBER_ROLE);

  if (!currentWorkspace) return null;

  const currentUserMembership = currentWorkspace.members?.find(
    (m) => m.user_id === session?.user?.id
  );
  const isAdmin = currentUserMembership?.role === "ADMIN";

  const handleRemove = async (userId: string) => {
    await removeMember({
      variables: { workspace_id: currentWorkspace.id, user_id: userId },
    });
    refetch();
  };

  const handleRoleChange = async (userId: string, role: string) => {
    await updateRole({
      variables: { workspace_id: currentWorkspace.id, user_id: userId, role },
    });
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Members</h2>
          <p className="text-muted-foreground">
            Manage workspace members and invitations
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowInvite(true)}>
            <UserPlus className="mr-2 size-4" />
            Invite
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {currentWorkspace.members?.length || 0} Members
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentWorkspace.members?.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarImage src={member.user.image} />
                  <AvatarFallback>
                    {member.user.name?.charAt(0)?.toUpperCase() ||
                      member.user.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none">
                    {member.user.name || member.user.email}
                    {member.user_id === session?.user?.id && (
                      <span className="text-muted-foreground ml-1">(you)</span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {member.user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isAdmin && member.user_id !== session?.user?.id ? (
                  <>
                    <Select
                      value={member.role}
                      onValueChange={(v) =>
                        handleRoleChange(member.user_id, v)
                      }
                    >
                      <SelectTrigger className="w-28 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="MEMBER">Member</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive"
                      onClick={() => handleRemove(member.user_id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </>
                ) : (
                  <Badge
                    variant={member.role === "ADMIN" ? "default" : "secondary"}
                  >
                    {member.role}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <InviteMemberDialog open={showInvite} onOpenChange={setShowInvite} />
    </div>
  );
}
