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
      <table className={`min-w-full bg-white ${bordered ? "border border-gray-200 rounded-xl" : ""}`}>
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.accessor || col.header || idx}
                className={`text-left px-4 ${compact ? "py-2" : "py-3"} text-sm font-semibold text-gray-700`}
              >
                {col.header || col.label || ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, ri) => (
              <tr
                key={ri}
                className={`${striped && ri % 2 === 1 ? "bg-gray-50/50" : "bg-white"} hover:bg-gray-50 ${onRowClick ? "cursor-pointer" : ""}`}
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
                      className={`px-4 ${compact ? "py-2" : "py-3"} text-sm text-gray-700`}
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
