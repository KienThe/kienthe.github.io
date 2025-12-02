import { useTableContext } from "@/components/table"
import type { Book } from "@/server/db/types"
import { api } from "@/trpc/react"

type BookIndexInputType = {
  page: number
  limit: number
}

export function useBookQuery() {
  const { input, getTableData } = useTableContext<Book, BookIndexInputType>()

  const result = api.books.getBooks.useQuery({
    page: input.page,
    limit: input.limit
  })

  return {
    tableData: getTableData(result as any)
  }
}
