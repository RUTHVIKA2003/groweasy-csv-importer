"use client";

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { ArrowLeft, Sparkles, FileSpreadsheet } from "lucide-react";
import { UploadResponse } from "@/types";

interface PreviewStepProps {
  data: UploadResponse;
  onConfirm: () => void;
  onBack: () => void;
  isProcessing: boolean;
  progress: number;
}

export default function PreviewStep({
  data,
  onConfirm,
  onBack,
  isProcessing,
  progress,
}: PreviewStepProps) {
  const columns = useMemo<ColumnDef<Record<string, string>>[]>(() => {
    return data.headers.map((header) => ({
      accessorKey: header,
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider">
          {header}
        </span>
      ),
      cell: (info) => (
        <span className="text-sm truncate block max-w-[200px]" title={String(info.getValue() ?? "")}>
          {String(info.getValue() ?? "")}
        </span>
      ),
      size: Math.max(150, header.length * 10),
    }));
  }, [data.headers]);

  const table = useReactTable({
    data: data.preview,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Preview Data
          </h2>
          <div className="flex items-center gap-4 mt-1">
            <span className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
              <FileSpreadsheet className="w-4 h-4" />
              {data.filename}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {data.totalRecords} records • {data.headers.length} columns
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            {isProcessing ? "Processing..." : "Confirm & Import with AI"}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {isProcessing && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>AI is extracting CRM fields...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Processing {data.totalRecords} records in batches of 20...
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-auto max-h-[500px]">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
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

        {/* Table Footer */}
        {data.totalRecords > 100 && (
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
            Showing first 100 of {data.totalRecords} records. All records will
            be processed.
          </div>
        )}
      </div>
    </div>
  );
}
