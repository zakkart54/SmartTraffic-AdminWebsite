import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useState, ReactNode } from "react";

export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (record: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  getRowKey: (record: T) => string;
  onRowClick?: (record: T) => void;
}

export function DataTable<T extends Record<string, any>>({ 
  data, 
  columns,
  getRowKey,
  onRowClick 
}: DataTableProps<T>) {
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedData = sortField ? [...data].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    // Handle date strings
    if (typeof aValue === 'string' && !isNaN(Date.parse(aValue))) {
      const aTime = new Date(aValue).getTime();
      const bTime = new Date(bValue).getTime();
      return sortDirection === "asc" ? aTime - bTime : bTime - aTime;
    }

    // Handle numbers
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    // Handle strings
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    
    if (aStr < bStr) return sortDirection === "asc" ? -1 : 1;
    if (aStr > bStr) return sortDirection === "asc" ? 1 : -1;
    return 0;
  }) : data;

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {columns.map((column) => (
              <TableHead 
                key={column.key}
                className={column.headerClassName}
              >
                {column.sortable ? (
                  <button
                    onClick={() => handleSort(column.key)}
                    className="flex items-center font-medium text-xs uppercase tracking-wide hover-elevate active-elevate-2 px-2 py-1 rounded -mx-2"
                  >
                    {column.header}
                    <SortIcon field={column.key} />
                  </button>
                ) : (
                  <span className="font-medium text-xs uppercase tracking-wide">
                    {column.header}
                  </span>
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={columns.length} 
                className="h-24 text-center text-muted-foreground"
              >
                No data found
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((record) => (
              <TableRow
                key={getRowKey(record)}
                className={onRowClick ? "hover-elevate cursor-pointer" : "hover-elevate"}
                onClick={() => onRowClick?.(record)}
              >
                {columns.map((column) => (
                  <TableCell 
                    key={column.key}
                    className={column.className}
                  >
                    {column.render 
                      ? column.render(record) 
                      : record[column.key]
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}