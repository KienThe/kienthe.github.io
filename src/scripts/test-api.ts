import axios from "axios"
import type { AxiosError } from "axios"
import fs from "fs"
import path from "path"

const API_URL = "https://backend.metruyencv.com/api"

interface ApiResponse<T> {
  status: number
  success: boolean
  message?: string
  data: T
}

interface TestResult {
  endpoint: string
  method: string
  status: number
  success: boolean
  response?: unknown
  error?: string
}

async function testEndpoint(
  endpoint: string,
  method: string,
  token: string,
  params?: Record<string, unknown>
): Promise<TestResult> {
  try {
    const url = `${API_URL}${endpoint}`
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36"
    }

    let response
    if (method === "GET") {
      response = await axios.get(url, { headers, params })
    } else if (method === "POST") {
      response = await axios.post(url, params, { headers })
    } else if (method === "PUT") {
      response = await axios.put(url, params, { headers })
    } else if (method === "DELETE") {
      response = await axios.delete(url, { headers, data: params })
    }

    const result = {
      endpoint,
      method,
      status: response?.status ?? 0,
      success: response?.status ? response.status >= 200 && response.status < 300 : false,
      response: response?.data
    }

    return result
  } catch (error: any) {
    return {
      endpoint,
      method,
      status: error?.response?.status || 0,
      success: false,
      error: error?.message || 'Unknown error'
    }
  }
}

async function login(email: string, password: string): Promise<string | null> {
  try {
    const response = await axios.post(
      `${API_URL}/auth/login`,
      {
        email,
        password,
        remember: 1,
        device_name:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36"
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36"
        }
      }
    )

    if (response.data.status === 200 && response.data.success) {
      return response.data.data.token
    }
    return null
  } catch (error: any) {
    console.error("Login error:", error?.message || 'Unknown error')
    return null
  }
}

async function testAllEndpoints(token: string) {
  const endpoints = [
    // Novel endpoints
    { path: "/novels", method: "GET" },
    { path: "/novels/popular", method: "GET" },
    { path: "/novels/latest", method: "GET" },
    { path: "/novels/completed", method: "GET" },
    { path: "/novels/ongoing", method: "GET" },
    { path: "/novels/featured", method: "GET" },
    { path: "/novels/recommended", method: "GET" },
    { path: "/novels/search", method: "GET", params: { q: "test" } },
    { path: "/novels/categories", method: "GET" },
    { path: "/novels/authors", method: "GET" },
    { path: "/novels/status", method: "GET" },
    { path: "/novels/rankings", method: "GET" },
    { path: "/novels/chapters", method: "GET" },
    { path: "/novels/comments", method: "GET" },
    { path: "/novels/ratings", method: "GET" },
    { path: "/novels/bookmarks", method: "GET" },
    { path: "/novels/history", method: "GET" },
    { path: "/novels/reading", method: "GET" },
    { path: "/novels/following", method: "GET" },

    // User endpoints
    { path: "/user/profile", method: "GET" },
    { path: "/user/settings", method: "GET" },
    { path: "/user/notifications", method: "GET" },
    { path: "/user/messages", method: "GET" },
    { path: "/user/following", method: "GET" },
    { path: "/user/followers", method: "GET" },
    { path: "/user/bookmarks", method: "GET" },
    { path: "/user/history", method: "GET" },
    { path: "/user/comments", method: "GET" },
    { path: "/user/ratings", method: "GET" }
  ]

  const results: TestResult[] = []
  const successfulEndpoints: string[] = []

  for (const endpoint of endpoints) {
    console.log(`Testing ${endpoint.method} ${endpoint.path}...`)
    const result = await testEndpoint(
      endpoint.path,
      endpoint.method,
      token,
      endpoint.params
    )
    results.push(result)

    if (result.success) {
      successfulEndpoints.push(endpoint.path)
      console.log(`✅ ${endpoint.path} - Success`)
    } else {
      console.log(
        `❌ ${endpoint.path} - Failed: ${result.error || "Unknown error"}`
      )
    }

    // Add delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  // Save results to file
  const outputDir = path.join(process.cwd(), "api-test-results")
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir)
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  fs.writeFileSync(
    path.join(outputDir, `results-${timestamp}.json`),
    JSON.stringify(results, null, 2)
  )

  fs.writeFileSync(
    path.join(outputDir, `successful-endpoints-${timestamp}.json`),
    JSON.stringify(successfulEndpoints, null, 2)
  )

  console.log("\nTest completed!")
  console.log(`Found ${successfulEndpoints.length} successful endpoints`)
  console.log(`Results saved to ${outputDir}`)
}

async function main() {
  const email = "godnaruto6519@gmail.com"
  const password = "kien89928"

  console.log("Logging in...")
  const token = await login(email, password)

  if (!token) {
    console.error("Login failed!")
    process.exit(1)
  }

  console.log("Login successful!")
  console.log("Starting API tests...")
  await testAllEndpoints(token)
}

main().catch(console.error)
