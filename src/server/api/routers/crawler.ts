import { observable } from "@trpc/server/observable"
import axios from "axios"
import { EventEmitter } from "events"
import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"

// Event emitter để quản lý các sự kiện crawl
const crawlEvents = new EventEmitter()
crawlEvents.setMaxListeners(100) // Tăng số lượng listeners

// API endpoints
const API_ENDPOINTS = {
  listBooks: "https://backend.metruyencv.com/api/books",
  showBook: "https://backend.metruyencv.com/api/books/:id",
  listChapters: "https://backend.metruyencv.com/api/chapters",
  showChapter: "https://backend.metruyencv.com/api/chapters/:id"
}

export const crawlerRouter = createTRPCRouter({
  // Endpoint để bắt đầu quá trình crawl
  startCrawl: publicProcedure
    .input(
      z.object({
        type: z.enum(["books", "book", "chapters", "chapter"]),
        id: z.string().optional(),
        limit: z.number().int().min(1).max(100).optional().default(10),
        page: z.number().int().min(1).optional().default(1),
        options: z.record(z.unknown()).optional()
      })
    )
    .mutation(async ({ input }) => {
      const { type, id, limit, page, options } = input
      const crawlId = `crawl-${Date.now()}`

      // Bắt đầu quá trình crawl bất đồng bộ
      crawlData(crawlId, type, id, limit, page, options).catch((err) => {
        crawlEvents.emit(`${crawlId}-log`, {
          type: "error",
          message: `Crawl error: ${err.message}`,
          timestamp: new Date().toISOString()
        })
        crawlEvents.emit(`${crawlId}-done`, {
          success: false,
          error: err.message
        })
      })

      // Trả về ID của quá trình crawl để client có thể dùng để subscribe
      return { crawlId }
    }),

  // Endpoint để subscribe nhận logs từ quá trình crawl
  onCrawlProgress: publicProcedure
    .input(
      z.object({
        crawlId: z.string()
      })
    )
    .subscription(({ input }) => {
      const { crawlId } = input

      // Tạo observable để stream dữ liệu về client
      return observable<{
        type: "log" | "progress" | "data" | "complete"
        message?: string
        data?: unknown
        progress?: number
        timestamp: string
      }>((emit) => {
        // Handler cho log events
        const logHandler = (log: any) => {
          emit.next(log)
        }

        // Handler cho progress events
        const progressHandler = (progress: any) => {
          emit.next({
            type: "progress",
            progress: progress.percent,
            message: progress.message,
            timestamp: new Date().toISOString()
          })
        }

        // Handler cho data events
        const dataHandler = (data: any) => {
          emit.next({
            type: "data",
            data,
            timestamp: new Date().toISOString()
          })
        }

        // Handler khi crawl hoàn tất
        const doneHandler = (result: any) => {
          emit.next({
            type: "complete",
            data: result,
            message: "Crawl completed",
            timestamp: new Date().toISOString()
          })
          emit.complete()
        }

        // Đăng ký listeners
        crawlEvents.on(`${crawlId}-log`, logHandler)
        crawlEvents.on(`${crawlId}-progress`, progressHandler)
        crawlEvents.on(`${crawlId}-data`, dataHandler)
        crawlEvents.on(`${crawlId}-done`, doneHandler)

        // Cleanup function khi client ngắt kết nối
        return () => {
          crawlEvents.off(`${crawlId}-log`, logHandler)
          crawlEvents.off(`${crawlId}-progress`, progressHandler)
          crawlEvents.off(`${crawlId}-data`, dataHandler)
          crawlEvents.off(`${crawlId}-done`, doneHandler)
        }
      })
    })
})

// Hàm thực hiện crawl data từ các API endpoint
async function crawlData(
  crawlId: string,
  type: "books" | "book" | "chapters" | "chapter",
  id?: string,
  limit = 10,
  page = 1,
  options?: Record<string, unknown>
) {
  // Log bắt đầu
  crawlEvents.emit(`${crawlId}-log`, {
    type: "info",
    message: `Starting crawl for ${type}${id ? ` with id: ${id}` : ""}`,
    timestamp: new Date().toISOString()
  })

  try {
    crawlEvents.emit(`${crawlId}-progress`, {
      percent: 10,
      message: "Initializing crawler"
    })

    let url = ""
    let params = {}

    // Xác định URL và params dựa vào loại crawl
    switch (type) {
      case "books":
        url = API_ENDPOINTS.listBooks
        params = {
          limit,
          page,
          sort: options?.sort || "id|asc"
        }
        break
      case "book":
        if (!id) throw new Error("Book ID is required")
        url = API_ENDPOINTS.showBook.replace(":id", id)
        break
      case "chapters":
        url = API_ENDPOINTS.listChapters
        params = {
          limit,
          page,
          bookId: id // Nếu có bookId thì lấy chapter của book đó
        }
        break
      case "chapter":
        if (!id) throw new Error("Chapter ID is required")
        url = API_ENDPOINTS.showChapter.replace(":id", id)
        break
      default:
        throw new Error(`Invalid crawl type: ${type as string}`)
    }

    crawlEvents.emit(`${crawlId}-log`, {
      type: "info",
      message: `Calling API: ${url}`,
      timestamp: new Date().toISOString()
    })

    crawlEvents.emit(`${crawlId}-progress`, {
      percent: 30,
      message: "Sending request to API"
    })

    // Gọi API
    const response = await axios.get(url, { params })

    crawlEvents.emit(`${crawlId}-progress`, {
      percent: 70,
      message: "Processing response data"
    })

    // Log thông tin về response
    crawlEvents.emit(`${crawlId}-log`, {
      type: "info",
      message: `Received data with status: ${response.status}`,
      timestamp: new Date().toISOString()
    })

    // Emit data nhận được từ API
    crawlEvents.emit(`${crawlId}-data`, response.data)

    // Nếu đang crawl danh sách (books hoặc chapters) và có nhiều trang
    if ((type === "books" || type === "chapters") && response.data.data) {
      const { data, metadata } = response.data

      if (metadata) {
        crawlEvents.emit(`${crawlId}-log`, {
          type: "info",
          message: `Found ${metadata.totalItems || "unknown"} items across ${metadata.totalPages || "unknown"} pages`,
          timestamp: new Date().toISOString()
        })
      }

      // Thực hiện crawl chi tiết cho mỗi book hoặc chapter nếu được yêu cầu
      if (options?.fetchDetails && Array.isArray(data) && data.length > 0) {
        crawlEvents.emit(`${crawlId}-log`, {
          type: "info",
          message: `Fetching details for ${data.length} items`,
          timestamp: new Date().toISOString()
        })

        let processedItems = 0

        for (const item of data) {
          const itemId = item.id
          const detailType = type === "books" ? "book" : "chapter"

          crawlEvents.emit(`${crawlId}-log`, {
            type: "info",
            message: `Fetching details for ${detailType} ${itemId}`,
            timestamp: new Date().toISOString()
          })

          try {
            const detailKey = detailType === "book" ? "showBook" : "showChapter"
            const detailUrl = API_ENDPOINTS[detailKey].replace(":id", itemId)

            const detailResponse = await axios.get(detailUrl)

            crawlEvents.emit(`${crawlId}-data`, {
              type: `${detailType}Detail`,
              id: itemId,
              data: detailResponse.data
            })

            processedItems++

            crawlEvents.emit(`${crawlId}-progress`, {
              percent: 70 + Math.floor((processedItems / data.length) * 25),
              message: `Processed ${processedItems}/${data.length} items`
            })

            // Thêm độ trễ nhỏ để không bombard API server
            await new Promise((resolve) => setTimeout(resolve, 500))
          } catch (error) {
            crawlEvents.emit(`${crawlId}-log`, {
              type: "error",
              message: `Error fetching details for ${detailType} ${itemId}: ${error instanceof Error ? error.message : String(error)}`,
              timestamp: new Date().toISOString()
            })
          }
        }
      }
    }

    // Complete the crawl
    crawlEvents.emit(`${crawlId}-progress`, {
      percent: 100,
      message: "Crawl completed"
    })
    crawlEvents.emit(`${crawlId}-log`, {
      type: "success",
      message: "Crawl completed successfully",
      timestamp: new Date().toISOString()
    })

    // Signal completion
    crawlEvents.emit(`${crawlId}-done`, {
      success: true,
      type,
      id,
      limit,
      page
    })
  } catch (error) {
    console.error("Crawl error:", error)
    crawlEvents.emit(`${crawlId}-log`, {
      type: "error",
      message: `Crawl failed: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: new Date().toISOString()
    })
    crawlEvents.emit(`${crawlId}-done`, {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    })
  }
}
