// ===== KHỞI TẠO TRANG =====

document.addEventListener('DOMContentLoaded', () => {
    console.log('👤 Profile page initialized');

    // Animation cho các card links
    setupLinkCards();
});

/**
 * Thiết lập animation cho link cards
 */
function setupLinkCards() {
    const cards = document.querySelectorAll('.link-card');

    cards.forEach(card => {
        // Hover effect
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
}

/**
 * Mở link trong tab mới
 * @param {string} url - URL cần mở
 */
function openLink(url) {
    if (url && url !== '#') {
        window.open(url, '_blank', 'noopener,noreferrer');
    } else {
        showToast('Link chưa được cấu hình', 'info');
    }
}

/**
 * Copy text vào clipboard
 * @param {string} text - Text cần copy
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Đã copy: ' + text, 'success');
    }).catch(() => {
        showToast('Không thể copy', 'error');
    });
}

// ===== EXPORT FUNCTIONS =====
window.openLink = openLink;
window.copyToClipboard = copyToClipboard;
