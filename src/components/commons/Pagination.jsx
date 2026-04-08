import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  siblingCount = 1,
  className = "",
}) {
  const createRange = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const getRange = () => {
    const totalNumbers = siblingCount * 2 + 5;
    if (totalPages <= totalNumbers) return createRange(1, totalPages);

    const leftSibling = Math.max(currentPage - siblingCount, 1);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages);
    const showLeftEllipsis = leftSibling > 2;
    const showRightEllipsis = rightSibling < totalPages - 1;

    const range = [];
    range.push(1);
    if (showLeftEllipsis) range.push("...");
    range.push(...createRange(leftSibling, rightSibling));
    if (showRightEllipsis) range.push("...");
    range.push(totalPages);
    return range;
  };

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;
  const items = getRange();

  const baseBtn =
    "inline-flex items-center justify-center min-w-9 h-9 px-3 rounded-lg text-sm transition border";
  const active =
    "bg-[#27592D] text-white border-[#27592D] hover:bg-[#1f4022]";
  const inactive =
    "bg-white text-gray-700 border-gray-200 hover:bg-gray-50";
  const disabled =
    "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed";

  return (
    <nav className={`flex items-center gap-2 ${className}`} aria-label="Pagination">
      <button
        className={`${baseBtn} ${canPrev ? inactive : disabled}`}
        onClick={() => canPrev && onPageChange?.(1)}
        disabled={!canPrev}
        aria-label="Trang đầu"
      >
        <ChevronsLeft className="w-4 h-4" />
      </button>
      <button
        className={`${baseBtn} ${canPrev ? inactive : disabled}`}
        onClick={() => canPrev && onPageChange?.(currentPage - 1)}
        disabled={!canPrev}
        aria-label="Trang trước"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {items.map((it, idx) =>
        it === "..." ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 select-none">
            ...
          </span>
        ) : (
          <button
            key={`page-${it}`}
            className={`${baseBtn} ${currentPage === it ? active : inactive}`}
            onClick={() => onPageChange?.(it)}
            aria-current={currentPage === it ? "page" : undefined}
          >
            {it}
          </button>
        )
      )}

      <button
        className={`${baseBtn} ${canNext ? inactive : disabled}`}
        onClick={() => canNext && onPageChange?.(currentPage + 1)}
        disabled={!canNext}
        aria-label="Trang sau"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      <button
        className={`${baseBtn} ${canNext ? inactive : disabled}`}
        onClick={() => canNext && onPageChange?.(totalPages)}
        disabled={!canNext}
        aria-label="Trang cuối"
      >
        <ChevronsRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
