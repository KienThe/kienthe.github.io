"use client"

import { ReactTable, TableProvider, TableSkeleton } from "@/components/table"
import type { Book } from "@/server/db/types"
import { type ColumnDef } from "@tanstack/react-table"
import { Suspense } from "react"
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
    header: "Đánh giá"
  },
  {
    accessorKey: "updatedAt",
    header: "Cập nhật",
    cell: ({ row }) =>
      row.original.updatedAt
        ? new Date(row.original.updatedAt).toLocaleDateString()
        : "Chưa cập nhật"
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
