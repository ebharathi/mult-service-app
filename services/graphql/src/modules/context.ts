// lib/graphql/context.ts
import { PrismaClient } from "@prisma/client"
import { AuthenticatedUser } from "../middlewares/auth";

export const prisma = new PrismaClient()

export async function createContext({ req, res }:any) {
  const user = req.user as AuthenticatedUser;
  const workspaceId = req.headers["x-workspace-id"] as string | undefined;
  console.log("REQUESTED USER: ",user.email, " [id: ",user.userId,"] workspace:",workspaceId || "none")
  return { prisma, user, workspaceId }
}

export type Context = Awaited<ReturnType<typeof createContext>>
