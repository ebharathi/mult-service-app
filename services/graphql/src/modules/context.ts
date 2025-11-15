// lib/graphql/context.ts
import { PrismaClient } from "@prisma/client"
import { AuthenticatedUser } from "../middlewares/auth";

export const prisma = new PrismaClient()

export async function createContext({ req, res }:any) {
  const user = req.user as AuthenticatedUser;
  console.log("REQUESTED USER: ",user.email, " [id: ",user.userId,"]")
  return { prisma, user }
}

export type Context = Awaited<ReturnType<typeof createContext>>
