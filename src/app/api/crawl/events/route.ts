import { NextResponse } from "next/server"
import { getCrawlState } from "~/app/(Auth)/crawl/actions"

export async function GET() {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        let counter = 0

        const sendUpdate = async () => {
          const state = await getCrawlState() // Hoặc mock data
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(state)}\n\n`)
          )

          counter++
          if (counter >= 10) {
            controller.close()
            return
          }

          setTimeout(() => void sendUpdate(), 1000) // 1s/lần
        }

        sendUpdate() // bắt đầu
      } catch (error) {
        console.error("Error in SSE stream:", error)
        controller.close()
      }
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
