// Chat functionality for Supraball Client
// Note: ipcRenderer is already available globally from other scripts

let currentChatMode = 'global'; // 'global' or 'lobby'
let currentLobbyForChat = null;
let chatMessages = [];
let chatNetID = null;
let chatUsername = null;
let chatPollInterval = null;
let chatInitialized = false; // Prevent double initialization

// DOM Elements
const chatContainer = document.getElementById('chatContainer');
const chatMessagesEl = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatModeEl = document.getElementById('chatMode');
const chatSendBtn = document.getElementById('chatSendBtn');

// Initialize chat
function initializeChat() {
  // Prevent double initialization
  if (chatInitialized) {
    console.log('💬 Chat already initialized, skipping...');
    return;
  }
  
  console.log('💬 Initializing chat...');
  
  // Verify elements exist
  if (!chatInput || !chatMessagesEl) {
    console.error('❌ Chat elements not found!');
    return;
  }
  
  // Get NetID and Username from localStorage (set by lobby-main.js or lobby-view.js)
  chatNetID = localStorage.getItem('supraball-netid');
  chatUsername = localStorage.getItem('supraball-username');
  
  console.log('💬 Chat initialized with NetID:', chatNetID, 'Username:', chatUsername);
  
  // Mark as initialized
  chatInitialized = true;
  
  // Setup send button click handler
  if (chatSendBtn) {
    chatSendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      sendChatMessage();
    });
  }
  
  // Setup input handlers - use addEventListener with capture to catch before any form handlers
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopImmediatePropagation();
      sendChatMessage();
    }
  }, true); // Use capture phase
  
  // Also prevent the keypress event
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true); // Use capture phase
  
  // Auto-resize textarea
  chatInput.addEventListener('input', () => {
    chatInput.style.height = '34px'; // Reset to min height
    const newHeight = Math.min(chatInput.scrollHeight, 70);
    chatInput.style.height = newHeight + 'px';
  });
  
  console.log('✅ Chat input handlers attached');
  
  // Start polling for messages
  startChatPolling();
}

// Send chat message
async function sendChatMessage() {
  const message = chatInput.value.trim();
  if (!message) return;
  
  // Update NetID and Username from localStorage if not set
  if (!chatNetID) {
    chatNetID = localStorage.getItem('supraball-netid');
  }
  if (!chatUsername) {
    chatUsername = localStorage.getItem('supraball-username');
  }
  
  // Don't send if we still don't have credentials
  if (!chatNetID || !chatUsername) {
    console.warn('⚠️ Cannot send message: NetID or Username not available yet');
    return;
  }
  
  // Get MASTER_SERVER_URL from window or config
  const masterServerUrl = window.MASTER_SERVER_URL || config.getMasterServerUrl();
  
  const endpoint = currentChatMode === 'global' 
    ? `${masterServerUrl}/chat/global`
    : `${masterServerUrl}/chat/lobby/${currentLobbyForChat}`;
  
  console.log(`💬 Sending message to ${currentChatMode} chat:`, message);
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        netid: chatNetID,
        username: chatUsername,
        message: message
      })
    });
    
    if (response.ok) {
      console.log('✅ Message sent successfully');
      chatInput.value = '';
      chatInput.style.height = '34px';
      // Message will appear on next poll
      setTimeout(fetchChatMessages, 100);
    } else {
      console.error('❌ Failed to send message:', response.status);
    }
  } catch (error) {
    console.error('❌ Failed to send chat message:', error);
  }
}

// Fetch chat messages
async function fetchChatMessages() {
  // Get MASTER_SERVER_URL from window or config
  const masterServerUrl = window.MASTER_SERVER_URL || config.getMasterServerUrl();
  
  const endpoint = currentChatMode === 'global'
    ? `${masterServerUrl}/chat/global`
    : `${masterServerUrl}/chat/lobby/${currentLobbyForChat}`;
  
  try {
    const response = await fetch(endpoint);
    if (response.ok) {
      const data = await response.json();
      updateChatMessages(data.messages || []);
    }
  } catch (error) {
    // Silently fail - server might not have chat endpoints yet
  }
}

// Update chat messages display
function updateChatMessages(messages) {
  if (JSON.stringify(messages) === JSON.stringify(chatMessages)) {
    return; // No changes
  }
  
  chatMessages = messages;
  
  if (messages.length === 0) {
    chatMessagesEl.innerHTML = `
      <div class="chat-empty">
        <div class="chat-empty-icon">💬</div>
        <div class="chat-empty-text">Noch keine Nachrichten</div>
      </div>
    `;
    return;
  }
  
  const shouldScrollToBottom = isScrolledToBottom();
  
  chatMessagesEl.innerHTML = messages.map(msg => {
    const isOwn = msg.netid === chatNetID;
    const isSystem = msg.type === 'system';
    const time = new Date(msg.timestamp).toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    if (isSystem) {
      return `
        <div class="chat-message system">
          <div class="chat-message-text">${escapeHtml(msg.message)}</div>
          <div class="chat-message-time">${time}</div>
        </div>
      `;
    }
    
    return `
      <div class="chat-message ${isOwn ? 'own' : ''}">
        <div class="chat-message-author">${escapeHtml(msg.playerName || 'Spieler')}</div>
        <div class="chat-message-text">${escapeHtml(msg.message)}</div>
        <div class="chat-message-time">${time}</div>
      </div>
    `;
  }).join('');
  
  if (shouldScrollToBottom) {
    scrollToBottom();
  }
}

// Check if scrolled to bottom
function isScrolledToBottom() {
  const threshold = 50;
  return chatMessagesEl.scrollHeight - chatMessagesEl.scrollTop - chatMessagesEl.clientHeight < threshold;
}

// Scroll to bottom
function scrollToBottom() {
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Switch chat mode
function switchChatMode(mode, lobbyId = null) {
  currentChatMode = mode;
  currentLobbyForChat = lobbyId;
  
  // Keep it simple - just "Chat"
  chatModeEl.textContent = '💬 Chat';
  
  chatMessages = [];
  fetchChatMessages();
}

// Start polling for messages
function startChatPolling() {
  if (chatPollInterval) {
    clearInterval(chatPollInterval);
  }
  
  chatPollInterval = setInterval(fetchChatMessages, 2000); // Poll every 2 seconds
  fetchChatMessages(); // Initial fetch
}

// Stop polling
function stopChatPolling() {
  if (chatPollInterval) {
    clearInterval(chatPollInterval);
    chatPollInterval = null;
  }
}

// Wait for credentials to be ready (fired by lobby-main.js)
window.addEventListener('supraball-credentials-ready', (event) => {
  console.log('💬 Credentials ready event received:', event.detail);
  initializeChat();
});

// Also check if credentials are already in localStorage (e.g., page reload)
if (localStorage.getItem('supraball-netid') && localStorage.getItem('supraball-username')) {
  console.log('💬 Credentials already in localStorage, initializing immediately');
  initializeChat();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { switchChatMode, stopChatPolling, startChatPolling };
}
