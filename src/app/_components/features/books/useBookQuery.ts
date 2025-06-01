import { useTableContext } from "@/components/table"
import { api } from "@/trpc/react"
import type { Book } from "@/types/Book"

type BookIndexInputType = {
  page: number
  limit: number
}

export function useBookQuery() {
  const { input, getTableData } = useTableContext<Book, BookIndexInputType>()

  const result = api.external.fetch.useQuery({
    url: `https://backend.metruyencv.com/api/books?page=${input.page}&limit=${input.limit}`,
    method: "GET"
  })

  return {
    tableData: getTableData(result)
  }
}
