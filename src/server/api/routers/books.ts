import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "../trpc"

const API_URL = "https://backend.metruyencv.com/api"

export const booksRouter = createTRPCRouter({
  getBooks: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10)
      })
    )
    .query(async ({ input }) => {
      try {
        const url = `${API_URL}/books?limit=${input.limit}&page=${input.page}&sort=id|asc`
        const response = await fetch(url, {
          headers: {
            Accept: "application/json"
          }
        })

        const data = await response.json()

        if (data.status === 200) {
          return {
            success: true,
            data: data.data,
            meta: data.meta
          }
        }

        return {
          success: false,
          error: data.message || "Failed to fetch books"
        }
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Unknown error occurred"
        }
      }
    })
})
