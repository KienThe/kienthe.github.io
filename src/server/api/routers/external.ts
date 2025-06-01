import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "../trpc"

const fetchSchema = z.object({
  url: z.string().url(),
  method: z.enum(["GET", "POST", "PUT", "DELETE"]).default("GET"),
  body: z.any().optional(),
  headers: z.record(z.string()).optional()
})

export const externalRouter = createTRPCRouter({
  fetch: publicProcedure.input(fetchSchema).query(async ({ input }) => {
    try {
      const response = await fetch(decodeURIComponent(input.url), {
        method: input.method,
        headers: {
          "Content-Type": "application/json",
          ...input.headers
        },
        body: input.body ? JSON.stringify(input.body) : undefined
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }
    }
  })
})
