'use client';

interface OrdersPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function OrdersPagination({
  currentPage,
  totalPages,
  onPageChange,
}: OrdersPaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="group inline-flex items-center px-5 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Previous page"
      >
        <div
          className={`animated-arrow animated-arrow--reverse ${currentPage === 1 ? 'animated-arrow--disabled' : ''}`}
        ></div>
      </button>

      <div className="flex gap-1">
        {getPageNumbers().map((page, index) =>
          typeof page === 'number' ? (
            <button
              key={index}
              onClick={() => onPageChange(page)}
              className={`min-w-[40px] rounded-lg px-3 py-2 text-sm font-medium transition ${
                currentPage === page
                  ? 'bg-black text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ) : (
            <span
              key={index}
              className="flex min-w-[40px] items-center justify-center px-3 py-2 text-sm text-gray-500"
            >
              {page}
            </span>
          )
        )}
      </div>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="group inline-flex items-center px-5 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Next page"
      >
        <div
          className={`animated-arrow ${currentPage === totalPages ? 'animated-arrow--disabled' : ''}`}
        ></div>
      </button>
    </div>
  );
}
