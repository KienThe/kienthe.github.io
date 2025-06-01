import { useCallback, useState } from "react"

interface PaginationState {
  page: number
  limit: number
}

interface PaginationMeta {
  current: number
  next: number | null
  prev: number | null
  last: number
  limit: number
  total: number
}

interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}

export function usePaginationQuery<TData, TInput extends PaginationState>(
  queryFn: (input: TInput) => Promise<PaginatedResponse<TData>>,
  initialInput: TInput,
  options?: {
    onSuccess?: (data: PaginatedResponse<TData>) => void
    onError?: (error: Error) => void
  }
) {
  const [input, setInput] = useState<TInput>(initialInput)
  const [data, setData] = useState<TData[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await queryFn(input)

      if (input.page === 1) {
        setData(response.data)
      } else {
        setData((prev) => [...prev, ...response.data])
      }

      setPagination(response.pagination)
      options?.onSuccess?.(response)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("An error occurred")
      setError(error)
      options?.onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }, [input, queryFn, options])

  const nextPage = useCallback(() => {
    if (pagination?.next) {
      setInput((prev) => ({ ...prev, page: pagination.next! }))
    }
  }, [pagination])

  const prevPage = useCallback(() => {
    if (pagination?.prev) {
      setInput((prev) => ({ ...prev, page: pagination.prev! }))
    }
  }, [pagination])

  const setPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= (pagination?.last ?? 1)) {
        setInput((prev) => ({ ...prev, page }))
      }
    },
    [pagination]
  )

  const setLimit = useCallback((limit: number) => {
    setInput((prev) => ({ ...prev, limit, page: 1 }))
  }, [])

  return {
    data,
    pagination,
    isLoading,
    error,
    fetchData,
    nextPage,
    prevPage,
    setPage,
    setLimit,
    currentPage: input.page,
    currentLimit: input.limit
  }
}
