import { NextResponse } from "next/server"
import puppeteer from "puppeteer"

interface DiscoveredEndpoint {
  url: string
  method: string
  headers?: Record<string, string>
  response?: any
  error?: string
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json()
    
    // Launch browser
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    })
    
    const page = await browser.newPage()
    
    // Enable request interception
    await page.setRequestInterception(true)
    
    const discoveredEndpoints: DiscoveredEndpoint[] = []
    
    // Listen for requests
    page.on("request", (request) => {
      const url = request.url()
      const method = request.method()
      const headers = request.headers()
      
      // Only track API endpoints
      if (url.includes("/api/") || url.includes("/v1/")) {
        discoveredEndpoints.push({
          url,
          method,
          headers
        })
      }
      
      request.continue()
    })
    
    // Listen for responses
    page.on("response", async (response) => {
      const url = response.url()
      const method = response.request().method()
      
      // Only track API endpoints
      if (url.includes("/api/") || url.includes("/v1/")) {
        try {
          const responseData = await response.json()
          const index = discoveredEndpoints.findIndex(
            (e) => e.url === url && e.method === method
          )
          if (index !== -1) {
            discoveredEndpoints[index].response = responseData
          }
        } catch (error) {
          const index = discoveredEndpoints.findIndex(
            (e) => e.url === url && e.method === method
          )
          if (index !== -1) {
            discoveredEndpoints[index].error = "Failed to parse response"
          }
        }
      }
    })
    
    // Navigate to the URL
    await page.goto(url, { waitUntil: "networkidle0" })
    
    // Test some common API endpoints
    const testEndpoints = [
      "/api/novels",
      "/api/novels/1",
      "/api/chapters",
      "/api/chapters/1"
    ]
    
    for (const endpoint of testEndpoints) {
      try {
        const response = await page.evaluate(async (url) => {
          const res = await fetch(url)
          return await res.json()
        }, endpoint)
        discoveredEndpoints.push({
          url: endpoint,
          method: "GET",
          response
        })
      } catch (error) {
        discoveredEndpoints.push({
          url: endpoint,
          method: "GET",
          error: "Failed to fetch"
        })
      }
    }
    
    await browser.close()
    
    return NextResponse.json({ discoveredEndpoints })
  } catch (error) {
    console.error("Error in crawl API:", error)
    return NextResponse.json(
      { error: "Failed to start crawling" },
      { status: 500 }
    )
  }
} 