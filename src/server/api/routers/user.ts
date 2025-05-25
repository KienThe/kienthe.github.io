import { eq } from "drizzle-orm"
import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"
import { users } from "~/server/db/schema"

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z
    .enum(["guest", "user", "creator", "author", "admin"])
    .default("guest"),
  avatar: z.array(z.string()).optional()
})

const updateUserSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["guest", "user", "creator", "author", "admin"])
})

export const userRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createUserSchema)
    .mutation(async ({ ctx, input }) => {
      const newUser = {
        name: input.name,
        email: input.email,
        password: input.password,
        role: input.role,
        avatar: input.avatar,
        level: 1,
        exp: 0
      }
      return ctx.db.insert(users).values(newUser)
    }),
  getUser: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(users)
  }),
  updateUser: protectedProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.update(users).set(input).where(eq(users.id, input.id))
    }),
  deleteUser: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.delete(users).where(eq(users.id, input.id))
    })
})
