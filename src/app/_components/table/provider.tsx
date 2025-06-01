"use client"

import type { PaginationMeta } from "@/lib/zod"
import type { AppRouter } from "@/server/api/root"
import type { RefetchOptions, RefetchQueryFilters } from "@tanstack/react-query"
import type { TRPCClientErrorLike } from "@trpc/client"
import type { UseTRPCQueryResult } from "@trpc/react-query/shared"
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from "react"

type PaginationParams = {
  page: number
  limit: number
}

type PaginationDataType<TData> = {
  data: TData[]
  pagination: PaginationMeta
  success: boolean
  status: number
  message: string | null
  extra: unknown[]
}

type RefetchType<TData> = <TPageData extends readonly unknown[]>(
  options?: RefetchOptions & RefetchQueryFilters<TPageData>
) => Promise<
  UseTRPCQueryResult<PaginationDataType<TData>, TRPCClientErrorLike<AppRouter>>
>

export type TableContextValue<TData, Input> = {
  pagination: PaginationParams
  input: Input
  getTableData: (
    result: UseTRPCQueryResult<
      PaginationDataType<TData>,
      TRPCClientErrorLike<AppRouter>
    >
  ) => {
    data: TData[]
    loading: boolean
    isPreviousData?: boolean
    resetPagination: (paginationParams?: PaginationParams) => void
    refetch: RefetchType<TData>
    paginationProps: {
      paginationParams: PaginationParams
      pageCount?: number
      total?: number
      handleChangePagination: (params: Partial<PaginationParams>) => void
      manualPagination: boolean
    }
  }
  handleChangeParams: (
    newParams: Partial<Input>,
    mergeParams?: boolean,
    resetPaginationMeta?: boolean
  ) => void
  handleChangePagination: (paginationParams: Partial<PaginationParams>) => void
  setFilterOptions: React.Dispatch<
    React.SetStateAction<Record<keyof Input, unknown>>
  >
}

export const TableContext = createContext<TableContextValue<unknown, unknown>>(
  {} as TableContextValue<unknown, unknown>
)

export function useTableContext<TData, Input>() {
  const ctx = useContext<TableContextValue<TData, Input>>(
    TableContext as React.Context<TableContextValue<TData, Input>>
  )
  if (!ctx || Object.keys(ctx).length === 0) {
    throw new Error("useTableContext must be used within a TableProvider")
  }

  return ctx
}

export type TableProviderProps<Input> = {
  initialParams?: Partial<Input>
}

export function TableProvider<TData, Input>({
  initialParams,
  children
}: React.PropsWithChildren<TableProviderProps<Input>>) {
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 10
  })

  const [params, setParams] = useState<Input>(initialParams as Input)
  const [filterOptions, setFilterOptions] = useState<
    Record<keyof Input, unknown> | undefined
  >()

  const handleChangePagination = useCallback(
    (paginationParams: Partial<PaginationParams>) => {
      setPagination((prev) => ({ ...prev, ...paginationParams }))
    },
    []
  )

  const resetPagination = useCallback((paginationParams?: PaginationParams) => {
    if (paginationParams) {
      setPagination(paginationParams)
    } else {
      setPagination({
        page: 1,
        limit: 10
      })
    }
  }, [])

  const handleChangeParams = useCallback(
    (
      newParams: Partial<Input>,
      mergeParams = true,
      resetPaginationMeta = true
    ) => {
      const validate = (p: Partial<Input>) =>
        Object.entries(p).reduce((acc, [key, value]) => {
          if (
            value !== undefined &&
            (value as unknown) !== "" &&
            value !== null
          ) {
            acc[key as keyof Input] = value as Input[keyof Input]
          }
          return acc
        }, {} as Partial<Input>)

      const _update = (prev: Input) =>
        (mergeParams
          ? validate({ ...prev, ...newParams })
          : validate(newParams)) as Input

      setParams(_update)
      if (resetPaginationMeta) {
        setPagination({
          page: 1,
          limit: 10
        })
      }
    },
    []
  )

  const getTableData: TableContextValue<TData, Input>["getTableData"] =
    useCallback(
      (
        result: UseTRPCQueryResult<
          PaginationDataType<TData>,
          TRPCClientErrorLike<AppRouter>
        >
      ) => {
        const { data, isLoading, refetch } = result

        return {
          paginationProps: {
            paginationParams: pagination,
            pageCount: data?.pagination?.last,
            total: data?.pagination?.total,
            handleChangePagination,
            manualPagination: true
          },
          data: data?.data || [],
          loading: isLoading,
          resetPagination,
          refetch: refetch as RefetchType<TData>
        }
      },
      [pagination, handleChangePagination, resetPagination]
    )

  const input = useMemo(() => {
    const _params = params ?? {}
    const isEmptyParams = Object.keys(_params).length === 0
    return {
      ...pagination,
      ...params,
      ...(!isEmptyParams && {
        options: Object.keys(_params).reduce(
          (acc, key) => {
            acc[key as keyof Input] = {
              ...(filterOptions?.[key as keyof Input] ?? {})
            }
            return acc
          },
          {} as Record<keyof Input, unknown>
        )
      })
    } as Input
  }, [pagination, params, filterOptions])

  const ctxValue = useMemo(
    () => ({
      pagination,
      input,
      getTableData,
      handleChangeParams,
      handleChangePagination,
      setFilterOptions
    }),
    [
      pagination,
      input,
      getTableData,
      handleChangeParams,
      handleChangePagination
    ]
  ) as unknown as TableContextValue<unknown, unknown>

  return (
    <TableContext.Provider value={ctxValue}>{children}</TableContext.Provider>
  )
}
