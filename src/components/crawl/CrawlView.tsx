"use client"

import React, { useEffect, useState } from "react"
import {
  clearLogs,
  clearNetworkRequests,
  getCrawlState,
  getNovelDetails,
  getNovels,
  login,
  type CrawlLog,
  type NetworkRequest
} from "~/app/crawl/actions"
import axios from "axios"

interface Novel {
  id: number
  title: string
  slug: string
  description?: string
  cover_url?: string
}

interface ApiResponse<T> {
  status: number
  success: boolean
  message?: string
  data: T
}

interface LogEntry {
  id: string
  timestamp: string
  type: "info" | "error" | "success"
  message: string
  data?: unknown
}

interface DiscoveredEndpoint {
  url: string
  method: string
  headers?: Record<string, string>
  response?: Record<string, unknown>
  error?: string
}

export function CrawlView() {
  const [email, setEmail] = useState("godnaruto6519@gmail.com")
  const [password, setPassword] = useState("kien89928")
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [novels, setNovels] = useState<Novel[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [networkRequests, setNetworkRequests] = useState<NetworkRequest[]>([])
  const [showNetworkRequests, setShowNetworkRequests] = useState(false)
  const [discoveredEndpoints, setDiscoveredEndpoints] = useState<DiscoveredEndpoint[]>([])
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [url, setUrl] = useState("")

  const updateState = async () => {
    try {
      const state = await getCrawlState()
      setLogs(state.logs)
      setIsAuthenticated(state.isAuthenticated)
      setNetworkRequests(state.networkRequests)
    } catch (error) {
      console.error("Error updating state:", error)
    }
  }

  useEffect(() => {
    void updateState()
    const interval = setInterval(() => void updateState(), 1000)
    return () => clearInterval(interval)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(email, password)
      await updateState()
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetNovels = async () => {
    setIsLoading(true)
    try {
      const result = await getNovels(currentPage)
      if (result && "data" in result) {
        const response = result as ApiResponse<Novel[]>
        setNovels(response.data)
      }
      await updateState()
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetNovelDetails = async (novelId: number) => {
    setIsLoading(true)
    try {
      await getNovelDetails(novelId)
      await updateState()
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearLogs = async () => {
    setIsLoading(true)
    try {
      await clearLogs()
      await updateState()
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearNetworkRequests = async () => {
    setIsLoading(true)
    try {
      await clearNetworkRequests()
      await updateState()
    } finally {
      setIsLoading(false)
    }
  }

  const startDiscovery = async () => {
    try {
      setIsLoading(true)
      setLogs([])
      setDiscoveredEndpoints([])

      setLogs((prev: LogEntry[]) => [
        ...prev,
        {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          type: "info",
          message: "Starting API discovery..."
        }
      ])

      const response = await axios.post("/api/crawl/start", { url })
      const { discoveredEndpoints } = response.data

      setDiscoveredEndpoints(discoveredEndpoints)
      setLogs((prev: LogEntry[]) => [
        ...prev,
        {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          type: "success",
          message: `Discovered ${discoveredEndpoints.length} API endpoints`,
          data: discoveredEndpoints
        }
      ])
    } catch (error) {
      setLogs((prev: LogEntry[]) => [
        ...prev,
        {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          type: "error",
          message: "Failed to start API discovery",
          data: error instanceof Error ? error.message : "Unknown error"
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const clearEndpoints = () => {
    setDiscoveredEndpoints([])
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="mb-4 text-2xl font-bold">API Discovery Tool</h1>
        <div className="flex gap-4">
          <input
            type="text"
            value={url}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
            placeholder="Enter URL to crawl"
            className="flex-1 rounded-md border border-gray-300 px-4 py-2"
          />
          <button
            onClick={startDiscovery}
            disabled={isLoading || !url}
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isLoading ? "Discovering..." : "Start Discovery"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-semibold">Discovery Logs</h2>
          <div className="space-y-4">
            {logs.map((log: LogEntry, index: number) => (
              <div
                key={index}
                className={`rounded-md p-4 ${
                  log.type === "error"
                    ? "bg-red-50 text-red-700"
                    : log.type === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{log.message}</span>
                </div>
                {log.data !== undefined && (
                  <pre className="mt-2 overflow-x-auto rounded bg-gray-100 p-2 text-xs">
                    {typeof log.data === 'string' 
                      ? log.data 
                      : JSON.stringify(log.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold">Discovered Endpoints</h2>
          <div className="space-y-4">
            {discoveredEndpoints.map((endpoint: DiscoveredEndpoint, index: number) => (
              <div
                key={index}
                className="rounded-md border border-gray-200 p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-sm">{endpoint.method}</span>
                  <span className="font-mono text-sm">{endpoint.url}</span>
                </div>
                {endpoint.error ? (
                  <div className="text-sm text-red-600">{endpoint.error}</div>
                ) : (
                  endpoint.response && (
                    <pre className="mt-2 overflow-x-auto rounded bg-gray-100 p-2 text-xs">
                      {JSON.stringify(endpoint.response, null, 2)}
                    </pre>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
