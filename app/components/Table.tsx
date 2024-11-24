import {
  getCoreRowModel,
  TableOptions,
  useReactTable,
} from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { Table as MantineTable, TableProps } from "@mantine/core";

export function Table<TData>({
  columns,
  data,
  ...rest
}: Pick<TableOptions<TData>, "columns" | "data"> & TableProps) {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <MantineTable {...rest}>
      <MantineTable.Thead>
        {table.getHeaderGroups().map((headerGroup) => {
          return (
            <MantineTable.Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <MantineTable.Th key={header.id} colSpan={header.colSpan}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </MantineTable.Th>
              ))}
            </MantineTable.Tr>
          );
        })}
      </MantineTable.Thead>
      <MantineTable.Tbody>
        {table.getRowModel().rows.map((row) => (
          <MantineTable.Tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <MantineTable.Td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </MantineTable.Td>
            ))}
          </MantineTable.Tr>
        ))}
      </MantineTable.Tbody>
    </MantineTable>
  );
}
