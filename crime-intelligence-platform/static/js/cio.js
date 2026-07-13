document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Icons
    lucide.createIcons();

    // 2. Real-time UTC System Clock
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

    // 3. Global Search Shortcut
    const globalSearch = document.getElementById('global-search');
    if (globalSearch) {
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                globalSearch.focus();
            }
        });
    }

    // 4. Chat Feed Auto-scroll
    const chatFeed = document.getElementById('chat-feed');
    function scrollToBottom() {
        if (chatFeed) {
            chatFeed.scrollTop = chatFeed.scrollHeight;
        }
    }
    // Initial scroll
    scrollToBottom();

    // 5. Textarea Auto-resize
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
            
            // Limit max height visually
            if(this.scrollHeight > 150) {
                this.style.overflowY = 'auto';
            } else {
                this.style.overflowY = 'hidden';
            }
        });

        // Handle Enter to send (Shift+Enter for new line)
        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // 6. Send Message Logic (Frontend Placeholder)
    const sendBtn = document.getElementById('send-btn');
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }

    function sendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;

        // Reset input
        messageInput.value = '';
        messageInput.style.height = 'auto';

        // 1. Render User Message immediately
        appendUserMessage(text);
        
        // 2. Trigger Backend Call (Flask / WebSocket)
        // Example:
        /*
        fetch('/api/chat', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ message: text, session_id: activeSessionId })
        })
        .then(res => res.json())
        .then(data => appendAIMessage(data.reply));
        */

        // Placeholder fake delay for AI response
        setTimeout(() => {
            appendAIMessage("Processing intel request. Standby for sector cross-referencing...");
        }, 1000);
    }

    function appendUserMessage(text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message user-message';
        msgDiv.innerHTML = `
            <div class="msg-content">
                <div class="msg-bubble">
                    <p>${escapeHTML(text)}</p>
                </div>
                <span class="msg-time">Just now</span>
            </div>
            <div class="msg-avatar"><img src="https://i.pravatar.cc/150?img=33" alt="User"></div>
        `;
        chatFeed.appendChild(msgDiv);
        scrollToBottom();
    }

    function appendAIMessage(text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message ai-message';
        
        // Get current system time for the message
        const now = new Date();
        const timeStr = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}`;

        msgDiv.innerHTML = `
            <div class="msg-avatar"><i data-lucide="cpu"></i></div>
            <div class="msg-content">
                <div class="msg-bubble glass-panel">
                    <p>${escapeHTML(text)}</p>
                </div>
                <span class="msg-time">System Time: <span class="terminal-font">${timeStr}</span></span>
            </div>
        `;
        chatFeed.appendChild(msgDiv);
        lucide.createIcons({ root: msgDiv }); // Re-init icon for the new element
        scrollToBottom();
    }

    // Utility to prevent XSS in chat input
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag])
        );
    }

    // 7. Suggested Prompts logic
    const promptChips = document.querySelectorAll('.prompt-chip');
    promptChips.forEach(chip => {
        chip.addEventListener('click', () => {
            if (messageInput) {
                messageInput.value = chip.textContent;
                messageInput.focus();
                // Optionally auto-send:
                // sendMessage();
            }
        });
    });

    // 8. Session Switching Logic Placeholder
    const chatSessions = document.querySelectorAll('.chat-session');
    chatSessions.forEach(session => {
        session.addEventListener('click', function() {
            // Remove active class from all
            chatSessions.forEach(s => s.classList.remove('active'));
            // Add to clicked
            this.classList.add('active');
            
            // Backend Integration: Fetch chat history for this ID
            // const chatId = this.getAttribute('data-chat-id');
            // loadChatHistory(chatId);
        });
    });

    // 9. Button Press Animations
    const buttons = document.querySelectorAll('.btn, .icon-btn');
    buttons.forEach(btn => {
        btn.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.95)';
        });
        btn.addEventListener('mouseup', function() {
            this.style.transform = '';
        });
        btn.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
});