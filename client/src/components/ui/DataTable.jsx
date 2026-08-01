import React from 'react';

export default function DataTable({ columns = [], data = [], keyField = '_id', emptyMessage = 'No records found' }) {
  return (
    <div className="w-full overflow-x-auto bg-surface border border-line rounded-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b-2 border-line-strong bg-bg/50">
            {columns.map((col, idx) => (
              <th key={idx} className="px-4 py-3 font-mono text-[10.5px] uppercase tracking-wider font-semibold text-sub">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center font-mono text-xs text-faint uppercase tracking-wider">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rIdx) => (
              <tr key={row[keyField] || rIdx} className="hover:bg-bg/40 transition-colors">
                {columns.map((col, cIdx) => (
                  <td key={cIdx} className="px-4 py-3 text-sm font-body text-ink">
                    {col.cell ? col.cell(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
