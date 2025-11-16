export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-xl border border-white/20 bg-white/5 text-white/80 font-semibold hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 backdrop-blur-sm"
      >
        Previous
      </button>
      
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-white/40">
                ...
              </span>
            )
          }
          
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-4 py-2 rounded-xl border font-semibold transition-all duration-300 ${
                currentPage === page
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white border-violet-500 shadow-lg shadow-violet-500/30'
                  : 'bg-white/5 text-white/80 border-white/20 hover:bg-white/10 hover:border-white/30'
              }`}
            >
              {page}
            </button>
          )
        })}
      </div>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-xl border border-white/20 bg-white/5 text-white/80 font-semibold hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 backdrop-blur-sm"
      >
        Next
      </button>
    </div>
  )
}
