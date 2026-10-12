import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, FileSpreadsheet, FileText, ListFilter, RotateCcw, Search, X } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  exportValue?: (row: T) => string | number;
}

export interface DataTableFilterConfig {
  /** Column key whose exportValue represents a status/category to filter on. */
  statusKey?: string;
  /** Column key whose exportValue is a parseable date string, for date-range filtering. */
  dateKey?: string;
  /** Column keys included in free-text search. Defaults to every column. */
  searchKeys?: string[];
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  pageSize?: number;
  fileName?: string;
  emptyLabel?: string;
  filters?: DataTableFilterConfig;
}

export function DataTable<T>({
  columns,
  rows,
  pageSize = 6,
  fileName = "export",
  emptyLabel = "No records found.",
  filters,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);

  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) setFilterOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const statusColumn = filters?.statusKey ? columns.find((c) => c.key === filters.statusKey) : undefined;
  const dateColumn = filters?.dateKey ? columns.find((c) => c.key === filters.dateKey) : undefined;
  const searchColumns = filters?.searchKeys
    ? columns.filter((c) => filters.searchKeys!.includes(c.key))
    : columns;

  const statusOptions = useMemo(() => {
    if (!statusColumn) return [];
    const values = new Set<string>();
    rows.forEach((row) => {
      const v = statusColumn.exportValue ? statusColumn.exportValue(row) : String(statusColumn.render(row) ?? "");
      if (v) values.add(String(v));
    });
    return Array.from(values);
  }, [rows, statusColumn]);

  const activeFilterCount =
    (search ? 1 : 0) + (statusFilter !== "All" ? 1 : 0) + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (search) {
        const haystack = searchColumns
          .map((c) => (c.exportValue ? c.exportValue(row) : ""))
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(search.toLowerCase())) return false;
      }
      if (statusColumn && statusFilter !== "All") {
        const v = statusColumn.exportValue ? String(statusColumn.exportValue(row)) : "";
        if (v !== statusFilter) return false;
      }
      if (dateColumn && (dateFrom || dateTo)) {
        const raw = dateColumn.exportValue ? String(dateColumn.exportValue(row)) : "";
        const parsed = new Date(raw);
        if (!isNaN(parsed.getTime())) {
          if (dateFrom && parsed < new Date(dateFrom)) return false;
          if (dateTo && parsed > new Date(`${dateTo}T23:59:59`)) return false;
        }
      }
      return true;
    });
  }, [rows, search, statusFilter, dateFrom, dateTo, statusColumn, dateColumn, searchColumns]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageRows = useMemo(() => filteredRows.slice(start, start + pageSize), [filteredRows, start, pageSize]);

  const goto = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setDateFrom("");
    setDateTo("");
  };

  const exportRows = () =>
    filteredRows.map((row) => {
      const obj: Record<string, string | number> = {};
      columns.forEach((col) => {
        obj[col.header] = col.exportValue ? col.exportValue(row) : String(col.render(row) ?? "");
      });
      return obj;
    });

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(exportRows());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    const head = [columns.map((c) => c.header)];
    const body = filteredRows.map((row) => columns.map((col) => String(col.exportValue ? col.exportValue(row) : col.render(row) ?? "")));
    autoTable(doc, {
      head,
      body,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [14, 59, 57] },
    });
    doc.save(`${fileName}.pdf`);
  };

  const hasFilters = Boolean(statusColumn || dateColumn || searchColumns.length);

  const emptyMessage =
    filteredRows.length === 0 && rows.length > 0 ? "No records match your filters." : emptyLabel;

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 sm:justify-end">
        {hasFilters && (
          <div className="relative sm:mr-auto" ref={popoverRef}>
            <button
              onClick={() => setFilterOpen((o) => !o)}
              className={`btn-secondary py-1.5 text-xs ${activeFilterCount > 0 ? "!border-primary !text-primary" : ""}`}
            >
              <ListFilter size={14} /> Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {filterOpen && (
              <div className="absolute left-0 top-full z-30 mt-2 w-[calc(100vw-3rem)] max-w-xs rounded-xl border border-surface-border bg-white p-4 shadow-card sm:w-72">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-bold text-ink-900">Filter results</p>
                  <button onClick={() => setFilterOpen(false)} className="text-ink-900/40 hover:text-ink-900">
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="label">Search</label>
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-900/40" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search this table..."
                        className="input-field pl-9 !py-2 text-sm"
                      />
                    </div>
                  </div>

                  {statusColumn && (
                    <div>
                      <label className="label">Status</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input-field !py-2 text-sm"
                      >
                        <option value="All">All statuses</option>
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {dateColumn && (
                    <div>
                      <label className="label">Date range</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="input-field !py-2 text-xs"
                        />
                        <input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="input-field !py-2 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <button onClick={resetFilters} className="btn-secondary flex-1 py-2 text-xs">
                    <RotateCcw size={13} /> Reset
                  </button>
                  <button onClick={() => setFilterOpen(false)} className="btn-primary flex-1 py-2 text-xs">
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button onClick={exportExcel} className="btn-secondary py-1.5 text-xs">
            <FileSpreadsheet size={14} /> Excel
          </button>
          <button onClick={exportPdf} className="btn-secondary py-1.5 text-xs">
            <FileText size={14} /> PDF
          </button>
        </div>
      </div>

      {/* Desktop / tablet: regular table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-surface-border text-xs font-semibold text-ink-900/50">
              {columns.map((col) => (
                <th key={col.key} className="pb-3 pr-4">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <tr key={i} className="border-b border-surface-border last:border-0">
                {columns.map((col) => (
                  <td key={col.key} className="py-3.5 pr-4">{col.render(row)}</td>
                ))}
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="py-10 text-center text-sm text-ink-900/40">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: each row becomes a stacked card */}
      <div className="space-y-3 md:hidden">
        {pageRows.map((row, i) => (
          <div key={i} className="rounded-xl border border-surface-border bg-white p-4">
            <dl className="space-y-2.5">
              {columns.map((col) => (
                <div
                  key={col.key}
                  className="flex items-start justify-between gap-4 text-sm"
                >
                  {col.header && (
                    <dt className="shrink-0 text-xs font-semibold text-ink-900/50">{col.header}</dt>
                  )}
                  <dd className={`min-w-0 break-words ${col.header ? "text-right" : "w-full"}`}>
                    {col.render(row)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
        {pageRows.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-900/40">{emptyMessage}</p>
        )}
      </div>

      {/* Pagination */}
      {filteredRows.length > 0 && (
        <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-surface-border pt-4 sm:flex-row">
          <p className="text-xs text-ink-900/50">
            Showing <span className="font-semibold text-ink-900">{start + 1}</span>–
            <span className="font-semibold text-ink-900">{Math.min(start + pageSize, filteredRows.length)}</span> of{" "}
            <span className="font-semibold text-ink-900">{filteredRows.length}</span>
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => goto(page - 1)}
              disabled={page === 1}
              aria-label="Previous page"
              className="rounded-lg border border-surface-border p-2 text-ink-900/60 hover:bg-surface-muted disabled:opacity-40"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<number[]>((acc, p) => {
                if (acc.length && p - acc[acc.length - 1] > 1) acc.push(-1);
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === -1 ? (
                  <span key={`gap-${i}`} className="px-1 text-ink-900/30">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => goto(p)}
                    className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${
                      p === page ? "bg-primary text-white" : "text-ink-900/60 hover:bg-surface-muted"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => goto(page + 1)}
              disabled={page === totalPages}
              aria-label="Next page"
              className="rounded-lg border border-surface-border p-2 text-ink-900/60 hover:bg-surface-muted disabled:opacity-40"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
