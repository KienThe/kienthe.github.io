import { eq } from "drizzle-orm"
import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"
import { users } from "~/server/db/schema"
import { type NewUser } from "~/server/db/types"

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
  id: z.number(),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["guest", "user", "creator", "author", "admin"])
})

export const userRouter = createTRPCRouter({
  create: publicProcedure
    .input(createUserSchema)
    .mutation(async ({ ctx, input }) => {
      const newUser: NewUser = {
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
  getUser: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(users)
  }),
  updateUser: publicProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.update(users).set(input).where(eq(users.id, input.id))
    }),
  deleteUser: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.delete(users).where(eq(users.id, input.id))
    })
})
