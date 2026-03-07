import { enumType, objectType } from "nexus";
import * as np from "nexus-prisma";

export const WorkspaceRoleType = enumType(np.WorkspaceRole);

export const WorkspaceType = objectType({
  name: np.workspaces.$name,
  definition(t) {
    t.field(np.workspaces.id);
    t.field(np.workspaces.name);
    t.field(np.workspaces.created_by);
    t.field(np.workspaces.created_at);
    t.field(np.workspaces.updated_at);
    t.list.field("members", {
      type: "workspace_members",
      resolve: (parent, _, ctx) =>
        ctx.prisma.workspace_members.findMany({
          where: { workspace_id: parent.id },
          include: { user: true },
        }),
    });
  },
});

export const WorkspaceMemberType = objectType({
  name: np.workspace_members.$name,
  definition(t) {
    t.field(np.workspace_members.id);
    t.field(np.workspace_members.workspace_id);
    t.field(np.workspace_members.user_id);
    t.field(np.workspace_members.role);
    t.field(np.workspace_members.created_at);
    t.field("user", {
      type: "users",
      resolve: (parent, _, ctx) =>
        ctx.prisma.users.findUnique({ where: { id: parent.user_id } }),
    });
  },
});

export const WorkspaceInvitationType = objectType({
  name: np.workspace_invitations.$name,
  definition(t) {
    t.field(np.workspace_invitations.id);
    t.field(np.workspace_invitations.workspace_id);
    t.field(np.workspace_invitations.email);
    t.field(np.workspace_invitations.role);
    t.field(np.workspace_invitations.token);
    t.field(np.workspace_invitations.invited_by);
    t.field(np.workspace_invitations.accepted);
    t.field(np.workspace_invitations.created_at);
    t.field(np.workspace_invitations.expires_at);
  },
});
