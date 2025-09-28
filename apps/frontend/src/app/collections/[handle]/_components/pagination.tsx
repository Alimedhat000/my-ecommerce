import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <nav
      aria-label="Pagination"
      className="border-ring -col-end-1 mt-8 box-border flex w-auto justify-center justify-self-center rounded-4xl border"
    >
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="group inline-flex items-center px-5 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Previous page"
      >
        <div
          className={`animated-arrow animated-arrow--reverse ${currentPage === 1 ? 'animated-arrow--disabled' : ''}`}
        ></div>
      </button>
      <span className="px-2 py-3">
        {currentPage}&nbsp;&nbsp;/&nbsp;&nbsp;{totalPages}
      </span>
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="group inline-flex items-center px-5 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Next page"
      >
        <div
          className={`animated-arrow ${currentPage === totalPages ? 'animated-arrow--disabled' : ''}`}
        ></div>
      </button>
    </nav>
  );
}
