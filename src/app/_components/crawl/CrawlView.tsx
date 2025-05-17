/* eslint-disable */
"use client"

import { useCallback, useEffect, useState } from "react"
import {
  clearLogs,
  clearNetworkRequests,
  CrawlState,
  getBookDetails,
  getBooks,
  getChapterContent,
  getChapters,
  getCrawlState,
  login,
  type CrawlLog,
  type NetworkRequest
} from "~/app/crawl/actions"

interface Book {
  id: number
  name: string
  slug: string
  description?: string
  cover_url?: string
}

interface Chapter {
  id: number
  name: string
  slug: string
  book_id: number
  index: number
  content?: string
}

interface ApiResponse<T> {
  status: number
  success: boolean
  message?: string
  data: T
}

interface TypedCrawlLog extends Omit<CrawlLog, "data"> {
  data?: Record<string, unknown>
}

interface TypedNetworkRequest
  extends Omit<NetworkRequest, "body" | "response"> {
  body?: Record<string, unknown>
  response?: Record<string, unknown>
}

const STORAGE_KEY = "metruyencv_credentials"

interface StoredCredentials {
  email: string
  password: string
  token?: string
}

export function CrawlView() {
  const [email, setEmail] = useState("godnaruto6519@gmail.com")
  const [password, setPassword] = useState("kien89928")
  const [logs, setLogs] = useState<TypedCrawlLog[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [networkRequests, setNetworkRequests] = useState<TypedNetworkRequest[]>(
    []
  )
  const [showNetworkRequests, setShowNetworkRequests] = useState(false)
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null)
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(
    null
  )
  const [chapterContent, setChapterContent] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Thay thế useEffect với interval bằng SSE
  useEffect(() => {
    const eventSource = new EventSource("/api/crawl/events")

    eventSource.onmessage = (event) => {
      const state = JSON.parse(event.data) as CrawlState
      setLogs(state.logs as TypedCrawlLog[])
      setNetworkRequests(state.networkRequests as TypedNetworkRequest[])
      setIsAuthenticated(state.isAuthenticated)
    }

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error)
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [])

  // Thêm useEffect để kiểm tra authentication khi component mount
  useEffect(() => {
    const checkAuth = async () => {
      const state = await getCrawlState()
      if (state.isAuthenticated) {
        setIsAuthenticated(true)
        return
      }

      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const credentials: StoredCredentials = JSON.parse(stored)
          setEmail(credentials.email)
          setPassword(credentials.password)
          // Chỉ auto login nếu chưa đăng nhập
          // if (!state.isAuthenticated) {
          //   await handleAutoLogin(
          //     credentials.email,
          //     credentials.password,
          //     credentials.token
          //   )
          // }
        }
      } catch (error) {
        console.error("Error loading stored credentials:", error)
      }
    }
    checkAuth()
  }, [])

  const handleAutoLogin = async (
    storedEmail: string,
    storedPassword: string,
    storedToken?: string
  ) => {
    if (isLoggingIn) return // Prevent multiple login attempts

    setIsLoggingIn(true)
    setIsLoading(true)
    try {
      if (storedToken) {
        // Nếu có token, thử sử dụng token cũ
        const state = await getCrawlState()
        if (state.token === storedToken) {
          setIsAuthenticated(true)
          return
        }
      }
      // Nếu không có token hoặc token không hợp lệ, đăng nhập lại
      const result = await login(storedEmail, storedPassword)
      if (result) {
        // Lưu token mới
        const credentials: StoredCredentials = {
          email: storedEmail,
          password: storedPassword,
          token: result
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials))
      }
    } finally {
      setIsLoading(false)
      setIsLoggingIn(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoggingIn) return // Prevent multiple login attempts

    setIsLoggingIn(true)
    setIsLoading(true)
    try {
      const token = await login(email, password)
      if (token) {
        const credentials: StoredCredentials = {
          email,
          password,
          token
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials))
      }
    } finally {
      setIsLoading(false)
      setIsLoggingIn(false)
    }
  }

  const handleLogout = () => {
    // Clear stored credentials and token
    localStorage.removeItem(STORAGE_KEY)
    setEmail("")
    setPassword("")
    setIsAuthenticated(false)
    setLogs((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: "info",
        message: "Đã đăng xuất"
      }
    ])
  }

  const handleGetBooks = async () => {
    setIsLoading(true)
    try {
      const result = await getBooks(currentPage)
      if (result && "data" in result) {
        const response = result as ApiResponse<Book[]>
        setBooks(response.data)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetBookDetails = async (bookId: number) => {
    setIsLoading(true)
    try {
      const result = await getBookDetails(bookId)
      if (result && "data" in result) {
        setSelectedBookId(bookId)
        // Có thể thêm logic để hiển thị chi tiết sách ở đây
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetChapters = async (bookId: number) => {
    // Kiểm tra lại authentication trước khi thực hiện
    const state = await getCrawlState()
    console.log(state)
    if (!state.isAuthenticated) {
      setLogs((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          type: "error",
          message: "Bạn cần đăng nhập để xem danh sách chương"
        }
      ])
      return
    }

    setIsLoading(true)
    try {
      const result = await getChapters(bookId, currentPage)
      if (result && "data" in result) {
        const response = result as ApiResponse<Chapter[]>
        setChapters(response.data)
        setSelectedBookId(bookId)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetChapterContent = async (chapterId: number) => {
    setIsLoading(true)
    try {
      const result = await getChapterContent(chapterId)
      if (result && "data" in result) {
        const response = result as ApiResponse<Chapter>
        setChapterContent(response.data.content || "Không có nội dung")
        setSelectedChapterId(chapterId)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearLogs = async () => {
    setIsLoading(true)
    try {
      await clearLogs()
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearNetworkRequests = async () => {
    setIsLoading(true)
    try {
      await clearNetworkRequests()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left column - Actions */}
      <div className="space-y-6">
        {/* Login Form - Only show when not authenticated */}
        {!isAuthenticated ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Đăng nhập</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? "Đang xử lý..." : "Đăng nhập"}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Đã đăng nhập</h2>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-900"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        )}

        {/* Crawl Actions - Only show when authenticated */}
        {isAuthenticated && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Crawl Actions</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Trang
                </label>
                <input
                  type="number"
                  value={currentPage}
                  onChange={(e) => setCurrentPage(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  min="1"
                />
              </div>
              <button
                onClick={handleGetBooks}
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isLoading ? "Đang xử lý..." : "Lấy danh sách truyện"}
              </button>
            </div>
          </div>
        )}

        {books.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Danh sách truyện</h2>
            <div className="space-y-2">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                >
                  <span className="truncate">{book.name}</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleGetBookDetails(book.id)}
                      disabled={isLoading}
                      className="px-2 py-1 text-xs text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                    >
                      Chi tiết
                    </button>
                    <button
                      onClick={() => handleGetChapters(book.id)}
                      disabled={isLoading}
                      className="px-2 py-1 text-xs text-green-600 hover:text-green-900 disabled:opacity-50"
                    >
                      Chương
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!!chapters.length && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Danh sách chương</h2>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                >
                  <span className="truncate">
                    {chapter.index}: {chapter.name}
                  </span>
                  <button
                    onClick={() => handleGetChapterContent(chapter.id)}
                    disabled={isLoading}
                    className="px-2 py-1 text-xs text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                  >
                    Xem
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {chapterContent && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Nội dung chương</h2>
            <pre className="whitespace-pre-wrap">{chapterContent}</pre>
          </div>
        )}
      </div>

      {/* Right column - Logs and Network Requests */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Logs</h2>
            <div className="space-x-2">
              <button
                onClick={() => setShowNetworkRequests(!showNetworkRequests)}
                className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-900"
              >
                {showNetworkRequests ? "Ẩn Network" : "Hiện Network"}
              </button>
              <button
                onClick={handleClearLogs}
                disabled={isLoading}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-900 disabled:opacity-50"
              >
                Xóa logs
              </button>
            </div>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`p-2 rounded text-sm ${
                  log.type === "error"
                    ? "bg-red-50 text-red-700"
                    : log.type === "success"
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-50 text-gray-700"
                }`}
              >
                <div className="flex justify-between">
                  <span>{log.message}</span>
                  <span className="text-xs opacity-75">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {log.data && (
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>

        {showNetworkRequests && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Network Requests</h2>
              <button
                onClick={handleClearNetworkRequests}
                disabled={isLoading}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-900 disabled:opacity-50"
              >
                Xóa requests
              </button>
            </div>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {networkRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 border rounded-lg space-y-2"
                >
                  {/* Request Info */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                            request.method === "GET"
                              ? "bg-blue-100 text-blue-800"
                              : request.method === "POST"
                                ? "bg-green-100 text-green-800"
                                : request.method === "PUT"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : request.method === "DELETE"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {request.method}
                        </span>
                        <span className="text-sm font-medium break-all">
                          {request.url}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(request.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Headers */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 mb-1">
                      Headers:
                    </h4>
                    <pre className="p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                      {JSON.stringify(request.headers, null, 2)}
                    </pre>
                  </div>

                  {/* Request Body */}
                  {request.body && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-1">
                        Request Body:
                      </h4>
                      <pre className="p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                        {JSON.stringify(request.body, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Response */}
                  {request.response && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-1">
                        Response:
                      </h4>
                      <div className="space-y-2">
                        {/* Response Status */}
                        {request.response && "status" in request.response && (
                          <div
                            className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                              request.response.status === 200
                                ? "bg-green-100 text-green-800"
                                : request.response.status >= 400
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            Status: {request.response.status}
                          </div>
                        )}
                        {/* Response Data */}
                        <pre className="p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                          {JSON.stringify(request.response, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-2"></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
