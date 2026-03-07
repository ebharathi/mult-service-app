import { extendType, nonNull, stringArg, arg } from "nexus";
import { sendInvitationEmail } from "../../../utils/mailer";

export const WorkspaceMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("createWorkspace", {
      type: "workspaces",
      args: { name: nonNull(stringArg()) },
      resolve: async (_, { name }, ctx) => {
        const workspace = await ctx.prisma.workspaces.create({
          data: {
            name,
            created_by: ctx.user.userId,
            members: {
              create: {
                user_id: ctx.user.userId,
                role: "ADMIN",
              },
            },
          },
        });
        return workspace;
      },
    });

    t.nonNull.field("inviteToWorkspace", {
      type: "workspace_invitations",
      args: {
        workspace_id: nonNull(stringArg()),
        email: nonNull(stringArg()),
        role: arg({ type: "WorkspaceRole", default: "MEMBER" }),
      },
      resolve: async (_, { workspace_id, email, role }, ctx) => {
        // Verify caller is admin of workspace
        const membership = await ctx.prisma.workspace_members.findUnique({
          where: {
            workspace_id_user_id: {
              workspace_id,
              user_id: ctx.user.userId,
            },
          },
        });
        if (!membership || membership.role !== "ADMIN")
          throw new Error("Only admins can invite members");

        // Check if user is already a member
        const existingUser = await ctx.prisma.users.findUnique({
          where: { email },
        });
        if (existingUser) {
          const existingMember =
            await ctx.prisma.workspace_members.findUnique({
              where: {
                workspace_id_user_id: {
                  workspace_id,
                  user_id: existingUser.id,
                },
              },
            });
          if (existingMember)
            throw new Error("User is already a member of this workspace");
        }

        // Check for existing pending invitation
        const existingInvite =
          await ctx.prisma.workspace_invitations.findFirst({
            where: { workspace_id, email, accepted: false },
          });
        if (existingInvite)
          throw new Error("An invitation has already been sent to this email");

        const invitation = await ctx.prisma.workspace_invitations.create({
          data: {
            workspace_id,
            email,
            role: role || "MEMBER",
            invited_by: ctx.user.userId,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          },
        });

        // Send email
        try {
          const workspace = await ctx.prisma.workspaces.findUnique({
            where: { id: workspace_id },
          });
          await sendInvitationEmail(
            email,
            workspace!.name,
            ctx.user.name || ctx.user.email,
            invitation.token
          );
        } catch (err) {
          console.error("Failed to send invitation email:", err);
        }

        return invitation;
      },
    });

    t.nonNull.field("acceptInvitation", {
      type: "workspace_members",
      args: { token: nonNull(stringArg()) },
      resolve: async (_, { token }, ctx) => {
        const invitation =
          await ctx.prisma.workspace_invitations.findUnique({
            where: { token },
          });
        if (!invitation) throw new Error("Invalid invitation");
        if (invitation.accepted) throw new Error("Invitation already accepted");
        if (invitation.expires_at < new Date())
          throw new Error("Invitation has expired");
        if (invitation.email !== ctx.user.email)
          throw new Error("This invitation is for a different email address");

        // Create membership and mark invitation as accepted
        const [member] = await ctx.prisma.$transaction([
          ctx.prisma.workspace_members.create({
            data: {
              workspace_id: invitation.workspace_id,
              user_id: ctx.user.userId,
              role: invitation.role,
            },
          }),
          ctx.prisma.workspace_invitations.update({
            where: { id: invitation.id },
            data: { accepted: true },
          }),
        ]);

        return member;
      },
    });

    t.nonNull.field("removeMember", {
      type: "workspace_members",
      args: {
        workspace_id: nonNull(stringArg()),
        user_id: nonNull(stringArg()),
      },
      resolve: async (_, { workspace_id, user_id }, ctx) => {
        // Verify caller is admin
        const callerMembership =
          await ctx.prisma.workspace_members.findUnique({
            where: {
              workspace_id_user_id: {
                workspace_id,
                user_id: ctx.user.userId,
              },
            },
          });
        if (!callerMembership || callerMembership.role !== "ADMIN")
          throw new Error("Only admins can remove members");
        if (user_id === ctx.user.userId)
          throw new Error("Cannot remove yourself");

        return ctx.prisma.workspace_members.delete({
          where: {
            workspace_id_user_id: { workspace_id, user_id },
          },
        });
      },
    });

    t.nonNull.field("updateMemberRole", {
      type: "workspace_members",
      args: {
        workspace_id: nonNull(stringArg()),
        user_id: nonNull(stringArg()),
        role: nonNull(arg({ type: "WorkspaceRole" })),
      },
      resolve: async (_, { workspace_id, user_id, role }, ctx) => {
        // Verify caller is admin
        const callerMembership =
          await ctx.prisma.workspace_members.findUnique({
            where: {
              workspace_id_user_id: {
                workspace_id,
                user_id: ctx.user.userId,
              },
            },
          });
        if (!callerMembership || callerMembership.role !== "ADMIN")
          throw new Error("Only admins can change roles");
        if (user_id === ctx.user.userId)
          throw new Error("Cannot change your own role");

        return ctx.prisma.workspace_members.update({
          where: {
            workspace_id_user_id: { workspace_id, user_id },
          },
          data: { role },
        });
      },
    });
  },
});
