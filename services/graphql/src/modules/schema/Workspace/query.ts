import { extendType, nonNull, stringArg } from "nexus";

export const WorkspaceQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("getMyWorkspaces", {
      type: "workspaces",
      resolve: async (_, _args, ctx) => {
        const memberships = await ctx.prisma.workspace_members.findMany({
          where: { user_id: ctx.user.userId },
          select: { workspace_id: true },
        });
        const ids = memberships.map((m: { workspace_id: string }) => m.workspace_id);
        return ctx.prisma.workspaces.findMany({
          where: { id: { in: ids } },
          orderBy: { created_at: "asc" },
        });
      },
    });

    t.field("getWorkspace", {
      type: "workspaces",
      args: { id: nonNull(stringArg()) },
      resolve: async (_, { id }, ctx) => {
        // Verify user is a member
        const membership = await ctx.prisma.workspace_members.findUnique({
          where: {
            workspace_id_user_id: {
              workspace_id: id,
              user_id: ctx.user.userId,
            },
          },
        });
        if (!membership) throw new Error("Not a member of this workspace");
        return ctx.prisma.workspaces.findUnique({ where: { id } });
      },
    });

    t.nonNull.list.nonNull.field("getWorkspaceMembers", {
      type: "workspace_members",
      args: { workspace_id: nonNull(stringArg()) },
      resolve: async (_, { workspace_id }, ctx) => {
        // Verify user is a member
        const membership = await ctx.prisma.workspace_members.findUnique({
          where: {
            workspace_id_user_id: {
              workspace_id,
              user_id: ctx.user.userId,
            },
          },
        });
        if (!membership) throw new Error("Not a member of this workspace");
        return ctx.prisma.workspace_members.findMany({
          where: { workspace_id },
          include: { user: true },
        });
      },
    });

    t.nonNull.list.nonNull.field("getWorkspaceInvitations", {
      type: "workspace_invitations",
      args: { workspace_id: nonNull(stringArg()) },
      resolve: async (_, { workspace_id }, ctx) => {
        // Only admins can see invitations
        const membership = await ctx.prisma.workspace_members.findUnique({
          where: {
            workspace_id_user_id: {
              workspace_id,
              user_id: ctx.user.userId,
            },
          },
        });
        if (!membership || membership.role !== "ADMIN")
          throw new Error("Only admins can view invitations");
        return ctx.prisma.workspace_invitations.findMany({
          where: { workspace_id, accepted: false },
          orderBy: { created_at: "desc" },
        });
      },
    });
  },
});
