import bcrypt from "bcrypt"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"
import { users } from "~/server/db/schema"
import { type NewUser } from "~/server/db/types"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8)
})

export const authRouter = createTRPCRouter({
  login: publicProcedure.input(loginSchema).mutation(async ({ ctx, input }) => {
    const [user] = await ctx.db
      .select()
      .from(users)
      .where(eq(users.email, input.email))

    if (!user) {
      throw new Error("User not found")
    }

    const isValid = await bcrypt.compare(input.password, user.password ?? "")
    if (!isValid) {
      throw new Error("Invalid password")
    }

    return user
  }),

  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      const hashedPassword = await bcrypt.hash(input.password, 10)
      const newUser: NewUser = {
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: "user",
        level: 1,
        exp: 0
      }

      const [user] = await ctx.db.insert(users).values(newUser).returning()
      return user
    })
})
