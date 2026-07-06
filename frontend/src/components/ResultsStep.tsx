"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ProcessResponse, CRMRecord } from "@/types";

interface ResultsStepProps {
  data: ProcessResponse;
  onReset: () => void;
}

export default function ResultsStep({ data, onReset }: ResultsStepProps) {
  const [showSkipped, setShowSkipped] = useState(false);
  const { extracted, skipped, summary } = data.data;

  const columns = useMemo<ColumnDef<CRMRecord>[]>(() => {
    const fields = data.data.crmFields;
    return fields.map((field) => ({
      accessorKey: field,
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider">
          {field.replace(/_/g, " ")}
        </span>
      ),
      cell: (info) => {
        const value = String(info.getValue() ?? "");
        return (
          <span
            className="text-sm truncate block max-w-[200px]"
            title={value}
          >
            {value || <span className="text-gray-400">—</span>}
          </span>
        );
      },
      size: Math.max(130, field.length * 9),
    }));
  }, [data.data.crmFields]);

  const table = useReactTable({
    data: extracted,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const downloadCSV = () => {
    const headers = data.data.crmFields;
    const csvContent = [
      headers.join(","),
      ...extracted.map((record) =>
        headers
          .map((h) => {
            const val = record[h as keyof CRMRecord] || "";
            // Escape commas and quotes
            if (val.includes(",") || val.includes('"') || val.includes("\n")) {
              return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "groweasy_crm_import.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                #
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Processed
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary.totalProcessed}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Successfully Imported
              </p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {summary.totalImported}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/40 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Skipped
              </p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {summary.totalSkipped}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Extracted CRM Records
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Import Another
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-6">
        <div className="overflow-auto max-h-[500px]">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap"
                      style={{ minWidth: header.getSize() }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${
                    idx % 2 === 0 ? "" : "bg-gray-50/50 dark:bg-gray-800/50"
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Skipped Records */}
      {skipped.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowSkipped(!showSkipped)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Skipped Records ({skipped.length})
            </span>
            {showSkipped ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          {showSkipped && (
            <div className="border-t border-gray-200 dark:border-gray-700">
              {skipped.map((record, idx) => (
                <div
                  key={idx}
                  className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 last:border-b-0"
                >
                  <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                    Reason: {record.reason}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
                    {JSON.stringify(record.original).slice(0, 200)}
                    {JSON.stringify(record.original).length > 200 ? "..." : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
