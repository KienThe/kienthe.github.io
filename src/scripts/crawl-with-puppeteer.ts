import fs from "fs"
import path from "path"
import puppeteer from "puppeteer"

interface NetworkRequest {
  url: string
  method: string
  headers: Record<string, string>
  postData?: string
  response?: {
    status: number
    headers: Record<string, string>
    body?: string
  }
}

async function crawlWithPuppeteer() {
  // Launch browser with specific flags to bypass anti-debug
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--disable-blink-features=AutomationControlled",
      "--disable-features=IsolateOrigins,site-per-process",
      "--disable-site-isolation-trials"
    ]
  })

  const page = await browser.newPage()

  // Set user agent
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36"
  )

  // Store all network requests
  const requests: NetworkRequest[] = []

  // Intercept all requests
  await page.setRequestInterception(true)
  page.on("request", (request) => {
    const requestData: NetworkRequest = {
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
      postData: request.postData()
    }
    requests.push(requestData)
    request.continue()
  })

  // Intercept all responses
  page.on("response", async (response) => {
    const request = response.request()
    const requestData = requests.find((r) => r.url === request.url())
    if (requestData) {
      try {
        const responseBody = await response.text()
        requestData.response = {
          status: response.status(),
          headers: response.headers(),
          body: responseBody
        }
      } catch (error) {
        console.error(
          `Error getting response body for ${request.url()}:`,
          error
        )
      }
    }
  })

  // Disable JavaScript that might interfere with crawling
  await page.evaluateOnNewDocument(() => {
    // Override debugger
    const originalDebugger = (window as any).debugger
    ;(window as any).debugger = function () {
      console.log("Debugger called")
    }

    // Override console.debug
    const originalConsoleDebug = console.debug
    console.debug = function () {
      console.log("Debug called:", ...arguments)
    }

    // Override setInterval
    const originalSetInterval = window.setInterval
    window.setInterval = function (
      handler: TimerHandler,
      timeout?: number,
      ...args: any[]
    ): number {
      if (typeof handler === 'function' && handler.toString().includes("debugger")) {
        console.log("Blocked debugger interval")
        return 0
      }
      return originalSetInterval(handler, timeout, ...args)
    } as typeof setInterval
  })

  try {
    // Navigate to the website
    console.log("Navigating to website...")
    await page.goto("https://metruyencv.com", {
      waitUntil: "networkidle0",
      timeout: 30000
    })

    // Login
    console.log("Logging in...")
    await page.type('input[type="email"]', "godnaruto6519@gmail.com")
    await page.type('input[type="password"]', "kien89928")
    await page.click('button[type="submit"]')

    // Wait for login to complete
    await page.waitForNavigation({ waitUntil: "networkidle0" })

    // Navigate through some pages to capture more API calls
    console.log("Navigating through pages...")
    const pagesToVisit = [
      "/truyen",
      "/truyen/hoan-thanh",
      "/truyen/dang-ra",
      "/truyen/yeu-thich"
    ]

    for (const pagePath of pagesToVisit) {
      console.log(`Visiting ${pagePath}...`)
      await page.goto(`https://metruyencv.com${pagePath}`, {
        waitUntil: "networkidle0"
      })
      // Wait a bit between requests
      await page.waitForTimeout(2000)
    }

    // Save results
    const outputDir = path.join(process.cwd(), "crawl-results")
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir)
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const outputFile = path.join(
      outputDir,
      `network-requests-${timestamp}.json`
    )

    // Filter and format API requests
    const apiRequests = requests
      .filter((req) => req.url.includes("backend.metruyencv.com/api"))
      .map((req) => ({
        ...req,
        endpoint: req.url.replace("https://backend.metruyencv.com/api", ""),
        timestamp: new Date().toISOString()
      }))

    fs.writeFileSync(outputFile, JSON.stringify(apiRequests, null, 2))

    console.log(`\nCrawl completed!`)
    console.log(`Found ${apiRequests.length} API requests`)
    console.log(`Results saved to ${outputFile}`)

    // Print unique endpoints
    const uniqueEndpoints = [...new Set(apiRequests.map((req) => req.endpoint))]
    console.log("\nUnique API Endpoints:")
    uniqueEndpoints.forEach((endpoint) => console.log(endpoint))
  } catch (error) {
    console.error("Error during crawl:", error)
  } finally {
    await browser.close()
  }
}

crawlWithPuppeteer().catch(console.error)
