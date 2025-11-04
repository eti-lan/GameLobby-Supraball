// 🎮 Lobby Browser JavaScript
// Date: 2025-10-20

const { ipcRenderer } = require('electron');

// Configuration
const MASTER_SERVER_URL = window.MASTER_SERVER_URL || 'http://supraball.servers.lan:8991';
let currentNetID = null;
let currentUsername = null;
let refreshInterval = null;

// 🚫 NO-CACHE fetch helper to prevent Electron caching issues
function fetchNoCache(url, options = {}) {
  const noCacheOptions = {
    ...options,
    headers: {
      ...options.headers,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    cache: 'no-store'
  };
  return fetch(url, noCacheOptions);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎮 Lobby Browser initialized');
  
  // Initially disable Quick Match and Create Lobby buttons until connected
  const quickMatchBtn = document.getElementById('quickMatchBtn');
  const createLobbyBtn = document.getElementById('createLobbyBtn');
  
  if (quickMatchBtn) {
    quickMatchBtn.disabled = true;
    quickMatchBtn.style.opacity = '0.5';
    quickMatchBtn.style.cursor = 'not-allowed';
  }
  if (createLobbyBtn) {
    createLobbyBtn.disabled = true;
    createLobbyBtn.style.opacity = '0.5';
    createLobbyBtn.style.cursor = 'not-allowed';
  }
  
  // Get NetID from main process
  ipcRenderer.send('get-netid');
  
  // Start auto-refresh
  refreshLobbies();
  startAutoRefresh();
  
  // Setup Quick Match button
  if (quickMatchBtn) {
    quickMatchBtn.addEventListener('click', () => {
      if (!quickMatchBtn.disabled) {
        console.log('🎯 Opening Quick Match...');
        ipcRenderer.send('open-quick-match');
      }
    });
  } else {
    console.warn('⚠️ Quick Match button not found');
  }
});

// Get NetID from main process
ipcRenderer.on('netid-response', (event, data) => {
  currentNetID = data.netid;
  // Decode username in case it's URL-encoded
  currentUsername = decodeURIComponent(data.username || `Player_${currentNetID.substring(currentNetID.length - 6)}`);
  console.log(`✅ NetID received: ${currentNetID} (${currentUsername})`);
});

// ========================================
// LOBBY MANAGEMENT
// ========================================

async function refreshLobbies() {
  try {
    console.log(`🔍 Fetching lobbies from: ${MASTER_SERVER_URL}/lobbies`);
    const response = await fetchNoCache(`${MASTER_SERVER_URL}/lobbies`);
    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log(`📦 Response data:`, data);
    
    if (data.success) {
      renderLobbies(data.lobbies);
      updateStats(data.stats);
      updateConnectionStatus(true);
      console.log(`✅ Successfully loaded ${data.lobbies.length} lobbies`);
    } else {
      console.error('❌ Failed to fetch lobbies:', data.error);
      updateConnectionStatus(false);
    }
  } catch (error) {
    console.error('❌ Error fetching lobbies:', error);
    console.error('   Error type:', error.name);
    console.error('   Error message:', error.message);
    updateConnectionStatus(false);
    showError('Failed to connect to Master Server');
  }
}

function updateConnectionStatus(connected) {
  const statusElement = document.getElementById('connectionStatus');
  const statusIndicator = statusElement?.closest('.status-indicator');
  const statusDot = statusIndicator?.querySelector('.status-dot');
  const quickMatchBtn = document.getElementById('quickMatchBtn');
  const createLobbyBtn = document.getElementById('createLobbyBtn');
  
  if (connected) {
    if (statusIndicator) {
      statusIndicator.style.borderColor = '#4caf50';
      statusIndicator.style.color = '#4caf50';
      statusIndicator.style.background = 'rgba(76, 175, 80, 0.2)';
    }
    if (statusDot) {
      statusDot.style.background = '#4caf50';
      statusDot.style.animation = 'pulse 2s infinite';
    }
    if (statusElement) {
      statusElement.textContent = 'Connected';
      statusElement.setAttribute('data-i18n', 'lobby.browser.connected');
    }
    // Enable buttons when connected
    if (quickMatchBtn) {
      quickMatchBtn.disabled = false;
      quickMatchBtn.style.opacity = '1';
      quickMatchBtn.style.cursor = 'pointer';
    }
    if (createLobbyBtn) {
      createLobbyBtn.disabled = false;
      createLobbyBtn.style.opacity = '1';
      createLobbyBtn.style.cursor = 'pointer';
    }
  } else {
    if (statusIndicator) {
      statusIndicator.style.borderColor = '#f44336';
      statusIndicator.style.color = '#f44336';
      statusIndicator.style.background = 'rgba(244, 67, 54, 0.2)';
    }
    if (statusDot) {
      statusDot.style.background = '#f44336';
      statusDot.style.animation = 'none';
    }
    if (statusElement) {
      statusElement.textContent = 'Disconnected';
      statusElement.setAttribute('data-i18n', 'lobby.browser.disconnected');
    }
    // Disable buttons when disconnected
    if (quickMatchBtn) {
      quickMatchBtn.disabled = true;
      quickMatchBtn.style.opacity = '0.5';
      quickMatchBtn.style.cursor = 'not-allowed';
    }
    if (createLobbyBtn) {
      createLobbyBtn.disabled = true;
      createLobbyBtn.style.opacity = '0.5';
      createLobbyBtn.style.cursor = 'not-allowed';
    }
  }
}

function renderLobbies(lobbies) {
  const container = document.getElementById('lobbiesContainer');
  const emptyState = document.getElementById('emptyState');
  
  if (lobbies.length === 0) {
    container.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  
  container.style.display = 'grid';
  emptyState.style.display = 'none';
  
  container.innerHTML = lobbies.map(lobby => renderLobbyCard(lobby)).join('');
}

function renderLobbyCard(lobby) {
  const redPlayers = lobby.players.red;
  const bluePlayers = lobby.players.blue;
  const totalPlayers = redPlayers.length + bluePlayers.length;
  
  // Player dots
  const redDots = renderPlayerDots(redPlayers.length, Math.ceil(lobby.maxPlayers / 2));
  const blueDots = renderPlayerDots(bluePlayers.length, Math.floor(lobby.maxPlayers / 2));
  
  // Status
  let statusClass = 'waiting';
  let statusText = `Waiting for players (${totalPlayers}/${lobby.maxPlayers})`;
  
  if (lobby.status === 'ready') {
    statusClass = 'ready';
    statusText = '✅ Ready to start!';
  } else if (lobby.status === 'starting') {
    statusClass = 'starting';
    statusText = '🚀 Server starting...';
  } else if (lobby.status === 'running') {
    statusClass = 'starting';
    statusText = '🎮 Match in progress';
  }
  
  // Can join check
  const isFull = totalPlayers >= lobby.maxPlayers;
  const isRunning = lobby.status === 'running' || lobby.status === 'starting';
  const canJoin = !isFull && !isRunning;
  
  return `
    <div class="lobby-card">
      <div class="lobby-header">
        <h3>🏆 ${escapeHtml(lobby.name)}</h3>
        <span class="lobby-type">${lobby.type}</span>
      </div>
      
      <div class="lobby-info">
        <div class="lobby-info-row">
          <label>Map:</label>
          <value>${lobby.map}</value>
        </div>
        <div class="lobby-info-row">
          <label>Players:</label>
          <value>${totalPlayers}/${lobby.maxPlayers}</value>
        </div>
        <div class="lobby-info-row">
          <label>Mode:</label>
          <value>${lobby.settings.mode === 'time' ? `${lobby.settings.timeLimit} min` : `${lobby.settings.goalScore} goals`}</value>
        </div>
      </div>
      
      <div class="lobby-teams">
        <div class="team red">
          <div class="team-label">🔴 Red Team</div>
          <div class="team-players">${redDots}</div>
        </div>
        <div class="team blue">
          <div class="team-label">🔵 Blue Team</div>
          <div class="team-players">${blueDots}</div>
        </div>
      </div>
      
      <div class="lobby-status ${statusClass}">
        ${statusText}
      </div>
      
      ${canJoin ? `
        <button class="btn btn-primary" onclick="joinLobby('${lobby.id}')">
          Join Lobby
        </button>
      ` : `
        <button class="btn btn-secondary" disabled>
          ${isFull ? 'Lobby Full' : 'In Progress'}
        </button>
      `}
      
      <button class="btn btn-secondary" onclick="viewLobby('${lobby.id}')">
        View Details
      </button>
    </div>
  `;
}

function renderPlayerDots(filled, total) {
  let dots = '';
  for (let i = 0; i < total; i++) {
    if (i < filled) {
      dots += '<span class="player-dot filled">⚫</span>';
    } else {
      dots += '<span class="player-dot empty">⚪</span>';
    }
  }
  return dots;
}

function updateStats(stats) {
  document.getElementById('lobbyCount').textContent = stats.activeLobbies;
  document.getElementById('playerCount').textContent = stats.totalPlayers;
  
  // Get server count from separate endpoint
  fetchNoCache(`${MASTER_SERVER_URL}/lobby-stats`)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        document.getElementById('serverCount').textContent = data.servers.activeServers;
      }
    })
    .catch(err => console.error('Failed to fetch server stats:', err));
}

// ========================================
// LOBBY ACTIONS
// ========================================

async function joinLobby(lobbyId) {
  if (!currentNetID) {
    showError('NetID not available yet. Please wait...');
    return;
  }
  
  try {
    const response = await fetchNoCache(`${MASTER_SERVER_URL}/lobbies/${lobbyId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        netid: currentNetID,
        username: currentUsername
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Joined lobby:', lobbyId);
      // Open lobby view
      viewLobby(lobbyId);
    } else {
      showError(data.error || 'Failed to join lobby');
    }
  } catch (error) {
    console.error('Error joining lobby:', error);
    showError('Failed to join lobby');
  }
}

function viewLobby(lobbyId) {
  // Tell main process to open lobby view
  ipcRenderer.send('open-lobby-view', lobbyId);
}

function showCreateLobby() {
  // Navigate to lobby creator page
  ipcRenderer.send('open-lobby-creator');
}

function hideCreateLobby() {
  // Not needed anymore - navigation based
  refreshLobbies();
}

function goBack() {
  ipcRenderer.send('close-lobby-browser');
}

// ========================================
// AUTO REFRESH
// ========================================

function startAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  refreshInterval = setInterval(refreshLobbies, 3000); // Every 3 seconds
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

// Stop refresh when window is hidden
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopAutoRefresh();
  } else {
    startAutoRefresh();
  }
});

// ========================================
// UTILITY FUNCTIONS
// ========================================

function showError(message) {
  alert(message); // TODO: Better error UI
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// ========================================
// LISTEN FOR LOBBY CREATED EVENT
// ========================================

window.addEventListener('message', (event) => {
  if (event.data.type === 'lobby-created') {
    console.log('✅ Lobby created:', event.data.lobby);
    hideCreateLobby();
    refreshLobbies();
    
    // Automatically open the new lobby
    setTimeout(() => {
      viewLobby(event.data.lobby.id);
    }, 500);
  }
});
