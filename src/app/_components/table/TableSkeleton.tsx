import { Skeleton, Table } from "@radix-ui/themes"

const TABLE_CELL_ROW_HEIGHT = 32
const TABLE_HEADER_ROW_HEIGHT = 32

export type TableSkeletonType = {
  row_number?: number
  col_number?: number
}

const TableSkeleton: React.FC<TableSkeletonType> = ({
  col_number = 4,
  row_number = 10
}) => {
  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          {new Array(col_number).fill(0).map((el, idx) => (
            <Table.ColumnHeaderCell key={idx}>
              <Skeleton height="100%" />
            </Table.ColumnHeaderCell>
          ))}
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {new Array(row_number).fill(0).map((el, idx) => (
          <Table.Row key={idx}>
            <Table.Cell height={TABLE_CELL_ROW_HEIGHT} colSpan={col_number}>
              <Skeleton height="100%" />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}

export { TableSkeleton }
