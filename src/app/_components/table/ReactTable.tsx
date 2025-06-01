"use client"

import { Button, Flex, Select, Table, Text } from "@radix-ui/themes"
import {
  type ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable
} from "@tanstack/react-table"
import { useState } from "react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  paginationProps: {
    paginationParams: {
      page: number
      limit: number
    }
    pageCount?: number
    total?: number
    handleChangePagination: (params: { page?: number; limit?: number }) => void
    manualPagination: boolean
  }
}

export function ReactTable<TData, TValue>({
  columns,
  data,
  paginationProps
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
      pagination: {
        pageIndex: paginationProps.paginationParams.page - 1,
        pageSize: paginationProps.paginationParams.limit
      }
    },
    pageCount: paginationProps.pageCount ?? -1,
    manualPagination: paginationProps.manualPagination,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({
          pageIndex: table.getState().pagination.pageIndex,
          pageSize: table.getState().pagination.pageSize
        })
        paginationProps.handleChangePagination({
          page: newState.pageIndex + 1,
          limit: newState.pageSize
        })
      }
    }
  })

  return (
    <div>
      <Table.Root>
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Table.ColumnHeaderCell key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : typeof header.column.columnDef.header === "string"
                      ? header.column.columnDef.header
                      : ""}
                </Table.ColumnHeaderCell>
              ))}
            </Table.Row>
          ))}
        </Table.Header>
        <Table.Body>
          {table.getRowModel().rows.map((row) => (
            <Table.Row key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <Table.Cell key={cell.id}>
                  {cell.column.columnDef.cell
                    ? typeof cell.column.columnDef.cell === "function"
                      ? cell.column.columnDef.cell({
                          row: cell.row,
                          column: cell.column,
                          getValue: cell.getValue,
                          cell,
                          table: table,
                          renderValue: () => cell.getValue()
                        })
                      : cell.getValue()
                    : cell.getValue()}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <Flex justify="between" align="center" mt="4">
        <Flex gap="2" align="center">
          <Text size="2">Rows per page</Text>
          <Select.Root
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <Select.Trigger />
            <Select.Content>
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <Select.Item key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Flex>

        <Flex gap="2" align="center">
          <Text size="2">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </Text>
          <Button
            variant="soft"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </Button>
          <Button
            variant="soft"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </Button>
          <Button
            variant="soft"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {">"}
          </Button>
          <Button
            variant="soft"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {">>"}
          </Button>
        </Flex>
      </Flex>
    </div>
  )
}
