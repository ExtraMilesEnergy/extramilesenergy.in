// ============ UTILITY FUNCTIONS ============
// Common helper functions used across the application

// Show message function (used by all modules)
function showMessage(message, type = 'info') {
    // Try to use loginMessage div first
    let msgDiv = document.getElementById('loginMessage');
    
    // If not found, create a temporary message div
    if (!msgDiv) {
        msgDiv = document.createElement('div');
        msgDiv.id = 'tempMessage';
        msgDiv.className = 'message';
        
        // Find appropriate container
        const container = document.querySelector('.container') || document.body;
        container.prepend(msgDiv);
    }
    
    msgDiv.textContent = message;
    msgDiv.className = `message ${type}`;
    msgDiv.style.display = 'block';
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        msgDiv.style.display = 'none';
    }, 3000);
}

// Format date helper
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Confirm action helper
function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// Debounce function (for search inputs)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Validate email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate phone number (Indian)
function isValidPhone(phone) {
    const re = /^[6-9]\d{9}$/;
    return re.test(phone);
}

// Make functions globally available
window.showMessage = showMessage;
window.formatDate = formatDate;
window.confirmAction = confirmAction;
window.debounce = debounce;
window.isValidEmail = isValidEmail;
window.isValidPhone = isValidPhone;
