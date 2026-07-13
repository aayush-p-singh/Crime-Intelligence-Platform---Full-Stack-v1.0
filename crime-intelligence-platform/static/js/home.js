document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    const sysTimeElement = document.getElementById('sys-time');
    
    function updateSystemTime() {
        const now = new Date();
        const hours = String(now.getUTCHours()).padStart(2, '0');
        const minutes = String(now.getUTCMinutes()).padStart(2, '0');
        const seconds = String(now.getUTCSeconds()).padStart(2, '0');
        
        if (sysTimeElement) {
            sysTimeElement.textContent = `${hours}:${minutes}:${seconds} UTC`;
        }
    }
    
    updateSystemTime();
    setInterval(updateSystemTime, 1000);

    const searchInput = document.querySelector('.search-input');
    const searchContainer = document.querySelector('.search-container');
    
    if (searchInput && searchContainer) {
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-fade-in');
    animatedElements.forEach(el => {
        observer.observe(el);
    });

    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.97)';
        });
        btn.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-1px)'; 
        });
        btn.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
});