document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    lucide.createIcons();

    // 2. Real-time UTC System Clock (Bottom left overlay)
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

    // 3. Password Visibility Toggle
    const togglePasswordBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');

    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle icon
            const icon = togglePasswordBtn.querySelector('i');
            if (type === 'text') {
                icon.setAttribute('data-lucide', 'eye-off');
            } else {
                icon.setAttribute('data-lucide', 'eye');
            }
            lucide.createIcons({ root: togglePasswordBtn });
        });
    }

    // 4. Button Press Animation
    const btn = document.getElementById('login-btn');
    if (btn) {
        btn.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.97)';
        });
        btn.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-2px)';
        });
        btn.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    }

    // 5. Form Submission Simulation & Terminal Text Logic
    const loginForm = document.getElementById('login-form');
    const typingStatus = document.getElementById('typing-status');
    const statusMessages = [
        "Verifying credentials...",
        "Authenticating with Mainframe...",
        "Deciphering payload...",
        "Access Granted. Initializing Uplink..."
    ];

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            // Note: Remove e.preventDefault() in production to allow actual Flask POST submission.
            // Keeping it here to demonstrate the UI interaction flow before redirect.
            // Allow Flask login request 
            
            const submitBtn = document.getElementById('login-btn');
            
            // Disable inputs & button
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i data-lucide="loader" class="spinner"></i> <span>Authenticating...</span>`;
            
            // Spinning animation for loader
            const style = document.createElement('style');
            style.innerHTML = `
                .spinner { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `;
            document.head.appendChild(style);
            lucide.createIcons({ root: submitBtn });

            document.querySelectorAll('.secure-input').forEach(input => input.disabled = true);

            // Simulate Terminal Text updates
            let step = 0;
            const interval = setInterval(() => {
                if (step < statusMessages.length) {
                    typingStatus.textContent = statusMessages[step];
                    typingStatus.style.color = step === statusMessages.length - 1 ? 'var(--accent-green)' : 'var(--text-tertiary)';
                    step++;
                } else {
                    clearInterval(interval);
                    // Trigger actual form submission or redirect here
                    
                    // HTMLFormElement.prototype.submit.call(loginForm); // Real submission bypass
                    // window.location.href = '/dashboard'; // Direct redirect simulation
                    setTimeout(() => {
                        loginForm.submit();
                        }, 500);
                }
            }, 600);
        });
    }
});