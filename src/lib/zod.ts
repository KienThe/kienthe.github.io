import { type TypeOf, z } from "zod"

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8)
})

export const PaginationSchema = z.object({
  page: z.number().int().default(1),
  limit: z.number().int().default(10)
})

export const PaginationOutput = z.object({
  current: z.number().int(),
  next: z.number().int().nullable(),
  prev: z.number().int().nullable(),
  last: z.number().int(),
  limit: z.number().int(),
  total: z.number().int()
})

export const MetaSchema = z.object({
  data: z.array(z.unknown()),
  pagination: PaginationOutput,
  success: z.boolean(),
  status: z.number(),
  message: z.string().nullable(),
  extra: z.array(z.unknown())
})

export type PaginationMeta = TypeOf<typeof PaginationOutput>
export type PaginationInput = TypeOf<typeof PaginationSchema>
