export default function Table({
  columns = [],
  data = [],
  striped = true,
  bordered = true,
  compact = false,
  emptyMessage = "Không có dữ liệu",
  className = "",
  onRowClick,
}) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className={`min-w-full bg-white ${bordered ? "border border-ivory-deep rounded-2xl" : ""}`}>
        <thead className="bg-ivory-alt border-b border-ivory-deep">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.accessor || col.header || idx}
                className={`text-left px-6 ${compact ? "py-3" : "py-4"} text-[10px] font-bold uppercase tracking-widest text-brand/60`}
              >
                {col.header || col.label || ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ivory-deep">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-brand/40 font-bold uppercase tracking-widest text-xs">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, ri) => (
              <tr
                key={ri}
                className={`${striped && ri % 2 === 1 ? "bg-ivory-soft/30" : "bg-white"} hover:bg-ivory-alt/50 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
                onClick={(e) => {
                  if (!onRowClick) return;
                  if (
                    e.target.closest(
                      "button, a, input, select, textarea, [role='button']"
                    )
                  ) {
                    return;
                  }
                  onRowClick(row, ri, e);
                }}
              >
                {columns.map((col, ci) => {
                  const content =
                    typeof col.render === "function"
                      ? col.render(row, ri)
                      : col.accessor
                      ? row[col.accessor]
                      : null;
                  return (
                    <td
                      key={`${ri}-${ci}`}
                      className={`px-6 ${compact ? "py-3" : "py-5"} text-sm font-medium text-brand`}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
