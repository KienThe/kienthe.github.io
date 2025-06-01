"use client"

import { ReactTable, TableSkeleton } from "@/components/table"
import type { Book } from "@/types/Book"
import { type ColumnDef } from "@tanstack/react-table"
import { Suspense } from "react"
import {
  TableProvider,
  useTableContext
} from "~/app/_components/table/provider"
import { useBookQuery } from "./useBookQuery"

const columns: ColumnDef<Book>[] = [
  {
    accessorKey: "name",
    header: "Tên truyện"
  },
  {
    accessorKey: "status_name",
    header: "Trạng thái"
  },
  {
    accessorKey: "chapter_count",
    header: "Số chương"
  },
  {
    accessorKey: "view_count",
    header: "Lượt xem"
  },
  {
    accessorKey: "bookmark_count",
    header: "Lượt theo dõi"
  },
  {
    accessorKey: "review_score",
    header: "Đánh giá",
    cell: ({ row }) =>
      `${row.original.review_score} (${row.original.review_count})`
  },
  {
    accessorKey: "updated_at",
    header: "Cập nhật",
    cell: ({ row }) => new Date(row.original.updated_at).toLocaleDateString()
  }
]

type Input = {
  page: number
  limit: number
}

function BookTableContent() {
  const { tableData } = useBookQuery()

  if (!tableData) return <div>Loading...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <ReactTable {...tableData} columns={columns} data={tableData.data} />
    </div>
  )
}

export function BookTable() {
  return (
    <TableProvider<Book, Input>>
      <Suspense fallback={<TableSkeleton />}>
        <BookTableContent />
      </Suspense>
    </TableProvider>
  )
}
