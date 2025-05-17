/* eslint-disable */
"use server"

import { revalidatePath } from "next/cache"
import redis from "~/lib/redis"

const API_URL = "https://backend.metruyencv.com/api"
const STATE_KEY = "crawl:state"

// Common API endpoints to try
const COMMON_ENDPOINTS = [
  "/books", // List books
  "/books/{id}", // Show book
  "/chapters", // List chapters
  "/chapters/{id}" // Show chapter
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

async function getState(): Promise<CrawlState> {
  const state = await redis.get(STATE_KEY)
  if (state) {
    return JSON.parse(state)
  }
  return {
    logs: [],
    isAuthenticated: false,
    token: null,
    networkRequests: [],
    discoveredEndpoints: []
  }
}

async function saveState(state: CrawlState) {
  await redis.set(STATE_KEY, JSON.stringify(state))
}

// Thêm type declaration cho global
declare global {
  var crawlController: ReadableStreamDefaultController | null
}

async function broadcastState() {
  try {
    if (global.crawlController) {
      const state = await getState()
      const encoder = new TextEncoder()
      global.crawlController.enqueue(
        encoder.encode(`data: ${JSON.stringify(state)}\n\n`)
      )
    }
  } catch (error) {
    console.error("Error broadcasting state:", error)
  }
}

async function addLog(type: CrawlLog["type"], message: string, data?: unknown) {
  const state = await getState()
  const log: CrawlLog = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    type,
    message,
    data
  }
  state.logs = [...state.logs, log]
  await saveState(state)
  await broadcastState()
}

async function addNetworkRequest(
  request: Omit<NetworkRequest, "id" | "timestamp">
) {
  const state = await getState()
  const networkRequest: NetworkRequest = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    ...request
  }
  state.networkRequests = [...state.networkRequests, networkRequest]
  await saveState(state)
  await broadcastState()
}

export async function login(email: string, password: string) {
  try {
    await addLog("info", "Đang đăng nhập...")

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        email,
        password,
        remember: 1,
        device_name:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36"
      })
    })

    const data = await response.json()

    await addNetworkRequest({
      method: "POST",
      url: `${API_URL}/auth/login`,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: { email, password },
      response: data
    })

    if (data.status === 200 && data.success) {
      const state = await getState()
      state.token = data.data.token
      state.isAuthenticated = true
      await saveState(state)
      await addLog("success", "Đăng nhập thành công!", data)
      return data.data.token
    }

    await addLog(
      "error",
      "Đăng nhập thất bại: " + (data.message || "Không xác định")
    )
    return null
  } catch (error) {
    await addLog(
      "error",
      "Lỗi khi đăng nhập: " +
        (error instanceof Error ? error.message : "Không xác định")
    )
    return null
  }
}

export async function checkAuth() {
  const state = await getState()
  if (!state.token) {
    state.isAuthenticated = false
    await saveState(state)
    return false
  }

  try {
    const response = await fetch(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${state.token}`,
        Accept: "application/json"
      }
    })

    const data = await response.json()
    state.isAuthenticated = data.status === 200
    await saveState(state)
    return state.isAuthenticated
  } catch (error) {
    state.isAuthenticated = false
    await saveState(state)
    return false
  }
}

export async function getBooks(page = 1, limit = 10) {
  try {
    await addLog("info", `Đang lấy danh sách truyện (trang ${page})...`)

    const url = `${API_URL}/books?limit=${limit}&page=${page}&sort=id|asc`
    const response = await fetch(url, {
      headers: {
        Accept: "application/json"
      }
    })

    const data = await response.json()

    await addNetworkRequest({
      method: "GET",
      url,
      headers: {
        Accept: "application/json"
      },
      response: data
    })

    if (data.status === 200) {
      await addLog("success", `Đã lấy được ${data.data.length} truyện`)
      return data
    }

    await addLog(
      "error",
      "Lỗi khi lấy danh sách truyện: " + (data.message || "Không xác định")
    )
    return null
  } catch (error) {
    await addLog(
      "error",
      "Lỗi khi lấy danh sách truyện: " +
        (error instanceof Error ? error.message : "Không xác định")
    )
    return null
  }
}

export async function getBookDetails(bookId: number) {
  try {
    await addLog("info", `Đang lấy thông tin truyện ID: ${bookId}...`)

    const url = `${API_URL}/books/${bookId}`
    const response = await fetch(url, {
      headers: {
        Accept: "application/json"
      }
    })

    const data = await response.json()

    await addNetworkRequest({
      method: "GET",
      url,
      headers: {
        Accept: "application/json"
      },
      response: data
    })

    if (data.status === 200) {
      await addLog("success", `Đã lấy thông tin truyện: ${data.data.name}`)
      return data
    }

    await addLog(
      "error",
      "Lỗi khi lấy thông tin truyện: " + (data.message || "Không xác định")
    )
    return null
  } catch (error) {
    await addLog(
      "error",
      "Lỗi khi lấy thông tin truyện: " +
        (error instanceof Error ? error.message : "Không xác định")
    )
    return null
  }
}

export async function getChapters(bookId: number, page = 1, limit = 10) {
  const state = await getState()
  if (!state.token) {
    await addLog("error", "Bạn cần đăng nhập để thực hiện yêu cầu này")
    return null
  }

  try {
    await addLog(
      "info",
      `Đang lấy danh sách chương của truyện ID: ${bookId} (trang ${page})...`
    )

    const url = `${API_URL}/chapters?limit=${limit}&page=${page}&filter[book_id]=${bookId}`
    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${state.token}`
    }

    const response = await fetch(url, {
      method: "GET",
      headers
    })

    const data = await response.json()

    await addNetworkRequest({
      method: "GET",
      url,
      headers,
      response: data
    })

    if (data.status === 200) {
      await addLog(
        "success",
        `Đã lấy được ${data.data.length} chương của truyện ID: ${bookId}`
      )
      return data
    }

    await addLog(
      "error",
      "Lỗi khi lấy danh sách chương: " + (data.message || "Không xác định")
    )
    return null
  } catch (error) {
    await addLog(
      "error",
      "Lỗi khi lấy danh sách chương: " +
        (error instanceof Error ? error.message : "Không xác định")
    )
    return null
  }
}

export async function getChapterContent(chapterId: number) {
  try {
    await addLog("info", `Đang lấy nội dung chương ID: ${chapterId}...`)

    const url = `${API_URL}/chapters/${chapterId}`
    const response = await fetch(url, {
      headers: {
        Accept: "application/json"
      }
    })

    const data = await response.json()

    await addNetworkRequest({
      method: "GET",
      url,
      headers: {
        Accept: "application/json"
      },
      response: data
    })

    if (data.status === 200) {
      await addLog("success", `Đã lấy nội dung chương: ${data.data.title}`)
      return data
    }

    await addLog(
      "error",
      "Lỗi khi lấy nội dung chương: " + (data.message || "Không xác định")
    )
    return null
  } catch (error) {
    await addLog(
      "error",
      "Lỗi khi lấy nội dung chương: " +
        (error instanceof Error ? error.message : "Không xác định")
    )
    return null
  }
}

export async function getCrawlState(): Promise<CrawlState> {
  return getState()
}

export async function clearLogs() {
  const state = await getState()
  state.logs = []
  await saveState(state)
  await broadcastState()
}

export async function clearNetworkRequests() {
  const state = await getState()
  state.networkRequests = []
  await saveState(state)
  await broadcastState()
}

export async function discoverEndpoints() {
  await addLog("info", "Bắt đầu dò tìm API endpoints...")
  const discovered: string[] = []

  for (const endpoint of COMMON_ENDPOINTS) {
    try {
      const url = `${API_URL}${endpoint}`
      await addLog("info", `Đang thử endpoint: ${endpoint}`)

      const response = await fetch(url, {
        headers: {
          Accept: "application/json"
        }
      })

      const data = await response.json()

      await addNetworkRequest({
        method: "GET",
        url,
        headers: {
          Accept: "application/json"
        },
        response: data
      })

      if (response.ok) {
        discovered.push(endpoint)
        await addLog("success", `Tìm thấy endpoint hợp lệ: ${endpoint}`, data)
      } else {
        await addLog("error", `Endpoint không hợp lệ: ${endpoint}`, data)
      }

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      await addLog(
        "error",
        `Lỗi khi thử endpoint ${endpoint}: ${
          error instanceof Error ? error.message : "Không xác định"
        }`
      )
    }
  }

  const state = await getState()
  state.discoveredEndpoints = discovered
  await saveState(state)
  await broadcastState()
  await addLog(
    "success",
    `Đã tìm thấy ${discovered.length} endpoints hợp lệ`,
    discovered
  )
  return true
}

export async function clearDiscoveredEndpoints() {
  const state = await getState()
  state.discoveredEndpoints = []
  await saveState(state)
  await broadcastState()
}
