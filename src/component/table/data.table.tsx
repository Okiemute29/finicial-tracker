import type { ReactNode } from "react";
import Text from "../typography/typography";

type Column = { header: string; hidden?: string };

type DataTableProps<T> = {
  columns: Column[];
  data: T[];
  renderRow: (row: T, index: number) => ReactNode;
  renderMobileCard?: (row: T, index: number) => ReactNode;
  onRowClick?: (row: T) => void;
};

export default function DataTable<T>({ columns, data, renderRow, renderMobileCard, onRowClick }: DataTableProps<T>) {
  return (
    <>
      {renderMobileCard ? <div className="space-y-3 md:hidden">{data.map(renderMobileCard)}</div> : null}
      <div className={renderMobileCard ? "hidden overflow-x-auto md:block" : "overflow-x-auto"}>
        <table className="w-full border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="bg-slate-100">
              {columns.map((column, index) => (
                <th key={column.header} className={`border-y border-slate-200 px-4 py-4 text-left ${index === 0 ? "rounded-l-lg border-l" : ""} ${index === columns.length - 1 ? "rounded-r-lg border-r" : ""} ${column.hidden ?? ""}`}>
                  <Text size="sm" className="font-semibold text-slate-700">{column.header}</Text>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className={`bg-white transition hover:bg-slate-50 ${onRowClick ? "cursor-pointer" : ""}`} onClick={onRowClick ? () => onRowClick(row) : undefined}>
                {renderRow(row, index)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
