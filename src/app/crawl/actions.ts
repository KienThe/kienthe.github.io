"use server"

import { revalidatePath } from "next/cache"

const API_URL = "https://backend.metruyencv.com/api"

// Common API endpoints to try
const COMMON_ENDPOINTS = [
  "/novels",
  "/novels/popular",
  "/novels/latest",
  "/novels/completed",
  "/novels/ongoing",
  "/novels/featured",
  "/novels/recommended",
  "/novels/search",
  "/novels/categories",
  "/novels/authors",
  "/novels/status",
  "/novels/rankings",
  "/novels/chapters",
  "/novels/comments",
  "/novels/ratings",
  "/novels/bookmarks",
  "/novels/history",
  "/novels/reading",
  "/novels/following",
  "/user/profile",
  "/user/settings",
  "/user/notifications",
  "/user/messages",
  "/user/following",
  "/user/followers",
  "/user/bookmarks",
  "/user/history",
  "/user/comments",
  "/user/ratings"
]

export interface NetworkRequest {
  id: string
  timestamp: string
  method: string
  url: string
  headers: Record<string, string>
  body?: unknown
  response?: unknown
}

export interface CrawlLog {
  id: string
  timestamp: string
  type: "info" | "success" | "error"
  message: string
  data?: unknown
}

export interface CrawlState {
  logs: CrawlLog[]
  isAuthenticated: boolean
  token: string | null
  lastResponse?: unknown
  networkRequests: NetworkRequest[]
  discoveredEndpoints: string[]
}

const crawlState: CrawlState = {
  logs: [],
  isAuthenticated: false,
  token: null,
  networkRequests: [],
  discoveredEndpoints: []
}

function addLog(type: CrawlLog["type"], message: string, data?: unknown) {
  const log: CrawlLog = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    type,
    message,
    data
  }
  crawlState.logs = [...crawlState.logs, log]
  revalidatePath("/crawl")
}

function addNetworkRequest(request: Omit<NetworkRequest, "id" | "timestamp">) {
  const networkRequest: NetworkRequest = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    ...request
  }
  crawlState.networkRequests = [...crawlState.networkRequests, networkRequest]
  revalidatePath("/crawl")
}

export async function login(email: string, password: string) {
  try {
    addLog("info", "Đang thực hiện đăng nhập...")

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36"
    }

    const body = {
      email,
      password,
      remember: 1,
      device_name:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36"
    }

    addNetworkRequest({
      method: "POST",
      url: `${API_URL}/auth/login`,
      headers,
      body
    })

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    })

    const data = await response.json()
    crawlState.lastResponse = data

    addNetworkRequest({
      method: "POST",
      url: `${API_URL}/auth/login`,
      headers,
      body,
      response: data
    })

    if (data.status === 200 && data.success) {
      crawlState.token = data.data.token
      crawlState.isAuthenticated = true
      addLog("success", "Đăng nhập thành công!", data)
      return true
    }

    addLog(
      "error",
      "Đăng nhập thất bại: " + (data.message || "Không xác định"),
      data
    )
    return false
  } catch (error) {
    addLog(
      "error",
      "Lỗi đăng nhập: " +
        (error instanceof Error ? error.message : "Không xác định")
    )
    return false
  }
}

export async function getNovels(page = 1, perPage = 20) {
  if (!crawlState.isAuthenticated) {
    addLog("error", "Vui lòng đăng nhập trước!")
    return null
  }

  try {
    addLog("info", `Đang lấy danh sách truyện (trang ${page})...`)

    const response = await fetch(
      `${API_URL}/novels?page=${page}&per_page=${perPage}`,
      {
        headers: {
          Authorization: `Bearer ${crawlState.token}`,
          Accept: "application/json"
        }
      }
    )

    const data = await response.json()

    if (data.status === 200) {
      addLog("success", `Đã lấy được ${data.data.length} truyện`)
      return data
    }

    addLog(
      "error",
      "Lỗi khi lấy danh sách truyện: " + (data.message || "Không xác định")
    )
    return null
  } catch (error) {
    addLog(
      "error",
      "Lỗi khi lấy danh sách truyện: " +
        (error instanceof Error ? error.message : "Không xác định")
    )
    return null
  }
}

export async function getNovelDetails(novelId: number) {
  if (!crawlState.isAuthenticated) {
    addLog("error", "Vui lòng đăng nhập trước!")
    return null
  }

  try {
    addLog("info", `Đang lấy thông tin truyện ID: ${novelId}...`)

    const response = await fetch(`${API_URL}/novels/${novelId}`, {
      headers: {
        Authorization: `Bearer ${crawlState.token}`,
        Accept: "application/json"
      }
    })

    const data = await response.json()

    if (data.status === 200) {
      addLog("success", `Đã lấy thông tin truyện: ${data.data.title}`)
      return data
    }

    addLog(
      "error",
      "Lỗi khi lấy thông tin truyện: " + (data.message || "Không xác định")
    )
    return null
  } catch (error) {
    addLog(
      "error",
      "Lỗi khi lấy thông tin truyện: " +
        (error instanceof Error ? error.message : "Không xác định")
    )
    return null
  }
}

export async function getCrawlState() {
  return crawlState
}

export async function clearLogs() {
  crawlState.logs = []
  revalidatePath("/crawl")
}

export async function clearNetworkRequests() {
  crawlState.networkRequests = []
  revalidatePath("/crawl")
}

export async function discoverEndpoints() {
  if (!crawlState.isAuthenticated) {
    addLog("error", "Vui lòng đăng nhập trước!")
    return false
  }

  addLog("info", "Bắt đầu dò tìm API endpoints...")
  const discovered: string[] = []

  for (const endpoint of COMMON_ENDPOINTS) {
    try {
      const url = `${API_URL}${endpoint}`
      addLog("info", `Đang thử endpoint: ${endpoint}`)

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${crawlState.token}`,
          Accept: "application/json"
        }
      })

      const data = await response.json()

      addNetworkRequest({
        method: "GET",
        url,
        headers: {
          Authorization: `Bearer ${crawlState.token}`,
          Accept: "application/json"
        },
        response: data
      })

      if (response.ok) {
        discovered.push(endpoint)
        addLog("success", `Tìm thấy endpoint hợp lệ: ${endpoint}`, data)
      } else {
        addLog("error", `Endpoint không hợp lệ: ${endpoint}`, data)
      }

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      addLog(
        "error",
        `Lỗi khi thử endpoint ${endpoint}: ${
          error instanceof Error ? error.message : "Không xác định"
        }`
      )
    }
  }

  crawlState.discoveredEndpoints = discovered
  addLog(
    "success",
    `Đã tìm thấy ${discovered.length} endpoints hợp lệ`,
    discovered
  )
  return true
}

export async function clearDiscoveredEndpoints() {
  crawlState.discoveredEndpoints = []
  revalidatePath("/crawl")
}
