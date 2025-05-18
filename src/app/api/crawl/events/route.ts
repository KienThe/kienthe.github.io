import { NextResponse } from "next/server"
import { getCrawlState } from "~/app/(Auth)/crawl/actions"

export async function GET() {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Gửi initial state
        const state = await getCrawlState()
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(state)}\n\n`))

        // Lưu controller
        global.crawlController = controller
      } catch (error) {
        console.error("Error in SSE stream:", error)
        controller.close()
      }
    },
    cancel() {
      global.crawlController = null
    }
  })

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    }
  })
}
