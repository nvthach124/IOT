/**
 * Pagination component tái sử dụng cho Data Sensor + Active History
 */
export default function Pagination({ pagination, pageSize, goToPage, onPageSizeChange }) {
    const { currentPage: page, totalPages, total } = pagination;

    if (total === 0) return null;

    const start = total > 0 ? (page - 1) * pageSize + 1 : 0;
    const end = Math.min(page * pageSize, total);

    // Tính các số trang hiển thị
    const maxVisible = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return (
        <div className="pagination-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div className="pagination-info" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                
                {onPageSizeChange && (
                    <div className="page-size-selector" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ position: 'relative' }}>
                            <select 
                                value={pageSize}
                                onChange={(e) => onPageSizeChange(e.target.value)}
                                style={{
                                    padding: '6px 32px 6px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--color-border)',
                                    backgroundColor: 'var(--color-surface)',
                                    color: 'var(--color-text-primary)',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    fontSize: '13px',
                                    appearance: 'none',
                                    transition: 'all 0.2s ease',
                                    minWidth: '100px',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.borderColor = 'var(--color-primary)';
                                    e.target.style.boxShadow = '0 0 0 2px var(--color-primary-light)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.borderColor = 'var(--color-border)';
                                    e.target.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                                }}
                            >
                                <option value="10">10 / page</option>
                                <option value="20">20 / page</option>
                                <option value="50">50 / page</option>
                            </select>
                            <span 
                                className="material-symbols-outlined" 
                                style={{
                                    position: 'absolute',
                                    right: '8px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    fontSize: '18px',
                                    pointerEvents: 'none',
                                    color: 'var(--color-text-secondary)',
                                    opacity: 0.7
                                }}
                            >
                                expand_more
                            </span>
                        </div>
                    </div>
                )}
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                    Showing <strong>{start}</strong> - <strong>{end}</strong> of <strong>{total}</strong> entries
                </span>
            </div>
            
            {totalPages > 1 && (
                <div className="pagination-controls">
                    <button
                        className="pagination-btn"
                        onClick={() => goToPage(page - 1)}
                        disabled={page <= 1}
                    >
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>

                    {startPage > 1 && (
                        <>
                            <button className="pagination-btn" onClick={() => goToPage(1)}>1</button>
                            {startPage > 2 && <span className="pagination-page-info">...</span>}
                        </>
                    )}

                    {pages.map(i => (
                        <button
                            key={i}
                            className={`pagination-btn ${i === page ? 'active' : ''}`}
                            onClick={() => goToPage(i)}
                        >
                            {i}
                        </button>
                    ))}

                    {endPage < totalPages && (
                        <>
                            {endPage < totalPages - 1 && <span className="pagination-page-info">...</span>}
                            <button className="pagination-btn" onClick={() => goToPage(totalPages)}>{totalPages}</button>
                        </>
                    )}

                    <button
                        className="pagination-btn"
                        onClick={() => goToPage(page + 1)}
                        disabled={page >= totalPages}
                    >
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            )}
        </div>
    );
}
