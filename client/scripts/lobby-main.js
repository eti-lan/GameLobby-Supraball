// 🎮 Supraball Lobby Main View
// Date: 2025-10-20

const { ipcRenderer } = require('electron');
const path = require('path');

// Get Master Server URL from config
const MASTER_SERVER_URL = window.MASTER_SERVER_URL || 'http://supraball.servers.lan:8991';
const REFRESH_INTERVAL = 3000; // 3 Sekunden
const INITIAL_RETRY_DELAY = 500; // 0.5 Sekunden
const MAX_RETRIES = 5;

// Get base path for images via IPC
let basePath = null;
let imagesDir = null;

// Request base path on load
ipcRenderer.send('get-base-path');
ipcRenderer.once('base-path-response', (event, receivedPath) => {
  basePath = receivedPath;
  imagesDir = path.join(basePath, 'images');
  console.log('📁 Images directory:', imagesDir);
});

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

let currentNetID = null;
let currentUsername = null;
let refreshTimer = null;
let pingCache = new Map();
let connectionRetries = 0;
let isFirstConnection = true;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎮 Lobby Main View initialized');
  
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
  
  // Get NetID
  ipcRenderer.send('get-netid');
  
  // Setup event listeners
  setupEventListeners();
  
  // Start auto-refresh
  startAutoRefresh();
});

// Get NetID response
ipcRenderer.on('netid-response', (event, data) => {
  currentNetID = data.netid;
  // Decode username in case it's URL-encoded
  currentUsername = decodeURIComponent(data.username);
  console.log(`✅ NetID: ${currentNetID} (${currentUsername})`);
});

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
  // Create Lobby Button
  document.getElementById('createLobbyBtn').addEventListener('click', () => {
    console.log('➕ Opening Lobby Creator...');
    ipcRenderer.send('open-lobby-creator');
  });
  
  // Quick Match Button
  const quickMatchBtn = document.getElementById('quickMatchBtn');
  if (quickMatchBtn) {
    quickMatchBtn.addEventListener('click', () => {
      if (!quickMatchBtn.disabled) {
        console.log('🎯 Opening Quick Match...');
        ipcRenderer.send('open-quick-match');
      }
    });
  }
  
  // Offline Training Button
  document.getElementById('offlineTrainingBtn').addEventListener('click', () => {
    console.log('🎯 Starting Offline Training...');
    ipcRenderer.send('start-offline-training');
  });
  
  // Classic Version Button
  document.getElementById('classicVersionBtn').addEventListener('click', () => {
    console.log('🎮 Starting Classic Version...');
    ipcRenderer.send('start-classic-version');
  });
  
  // Refresh Button
  document.getElementById('refreshBtn').addEventListener('click', () => {
    console.log('🔄 Manual refresh...');
    // Reset retry logic for manual refresh
    connectionRetries = 0;
    isFirstConnection = false;
    refreshLobbies();
  });
}

// ========================================
// AUTO-REFRESH
// ========================================

function startAutoRefresh() {
  // Initial load with delay for first connection
  if (isFirstConnection) {
    console.log('🔄 First connection - waiting 500ms before initial fetch...');
    setTimeout(() => {
      refreshLobbies();
    }, INITIAL_RETRY_DELAY);
  } else {
    refreshLobbies();
  }
  
  // Refresh every 3 seconds
  refreshTimer = setInterval(refreshLobbies, REFRESH_INTERVAL);
  console.log(`🔄 Auto-refresh started (every ${REFRESH_INTERVAL}ms)`);
}

function stopAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
    console.log('⏹️ Auto-refresh stopped');
  }
}

// ========================================
// FETCH LOBBIES
// ========================================

async function refreshLobbies() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 Sekunden Timeout
    
    const response = await fetchNoCache(`${MASTER_SERVER_URL}/lobbies`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    const data = await response.json();
    
    if (data.success) {
      renderLobbies(data.lobbies);
      updateConnectionStatus(true);
      connectionRetries = 0; // Reset retry counter on success
      isFirstConnection = false;
    } else {
      console.error('Failed to fetch lobbies:', data.error);
      handleConnectionError(data.error);
    }
  } catch (error) {
    console.error('Error fetching lobbies:', error);
    handleConnectionError('Master Server nicht erreichbar');
  }
}

function handleConnectionError(errorMsg) {
  // Always update status to show connection failed
  updateConnectionStatus(false, errorMsg);
  
  if (isFirstConnection && connectionRetries < MAX_RETRIES) {
    connectionRetries++;
    const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, connectionRetries - 1); // Exponential backoff
    console.log(`⚠️ Connection attempt ${connectionRetries}/${MAX_RETRIES} failed, retrying in ${retryDelay}ms...`);
    
    setTimeout(() => {
      refreshLobbies();
    }, retryDelay);
  } else {
    isFirstConnection = false;
  }
}

// ========================================
// RENDER LOBBIES
// ========================================

function renderLobbies(lobbies) {
  const tbody = document.getElementById('lobbyTableBody');
  const emptyState = document.getElementById('emptyState');
  
  if (!lobbies || lobbies.length === 0) {
    tbody.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  tbody.innerHTML = '';
  
  lobbies.forEach(lobby => {
    const row = createLobbyRow(lobby);
    tbody.appendChild(row);
  });
}

function createLobbyRow(lobby) {
  const tr = document.createElement('tr');
  tr.dataset.lobbyId = lobby.id;
  
  // Map Preview
  const mapTd = document.createElement('td');
  const mapImg = document.createElement('img');
  mapImg.className = 'map-preview';
  
  if (imagesDir) {
    const mapImagePath = path.join(imagesDir, lobby.map + '.jpg');
    // Convert to file:// URL for Electron
    mapImg.src = 'file://' + mapImagePath.replace(/\\/g, '/');
  } else {
    // Placeholder until base path is loaded
    mapImg.style.background = '#666';
  }
  
  mapImg.alt = lobby.map;
  mapImg.onerror = () => {
    mapImg.style.background = '#666';
    mapImg.src = '';
  };
  const mapName = document.createElement('div');
  mapName.textContent = lobby.map.replace('DB-', '');
  mapName.style.fontSize = '12px';
  mapName.style.marginTop = '4px';
  mapTd.appendChild(mapImg);
  mapTd.appendChild(mapName);
  
  // Lobby Name
  const nameTd = document.createElement('td');
  const nameDiv = document.createElement('div');
  nameDiv.textContent = lobby.name;
  nameDiv.style.fontWeight = 'bold';
  const typeDiv = document.createElement('div');
  typeDiv.textContent = lobby.type;
  typeDiv.style.fontSize = '12px';
  typeDiv.style.opacity = '0.7';
  nameTd.appendChild(nameDiv);
  nameTd.appendChild(typeDiv);
  
  // Players
  const playersTd = document.createElement('td');
  const redTeam = lobby.redTeam || [];
  const blueTeam = lobby.blueTeam || [];
  const totalPlayers = redTeam.length + blueTeam.length;
  const maxPlayers = lobby.type === '3v3' ? 6 : 10;
  
  const playersDiv = document.createElement('div');
  playersDiv.textContent = `${totalPlayers}/${maxPlayers}`;
  playersDiv.style.marginBottom = '4px';
  playersDiv.style.fontWeight = 'bold';
  
  const indicatorDiv = document.createElement('div');
  indicatorDiv.className = 'players-indicator';
  
  // Red Team Dots
  redTeam.forEach(() => {
    const dot = document.createElement('span');
    dot.className = 'player-dot dot-red';
    indicatorDiv.appendChild(dot);
  });
  
  // Blue Team Dots
  blueTeam.forEach(() => {
    const dot = document.createElement('span');
    dot.className = 'player-dot dot-blue';
    indicatorDiv.appendChild(dot);
  });
  
  // Empty slots
  const emptySlots = maxPlayers - totalPlayers;
  for (let i = 0; i < emptySlots; i++) {
    const dot = document.createElement('span');
    dot.className = 'player-dot dot-empty';
    indicatorDiv.appendChild(dot);
  }
  
  playersTd.appendChild(playersDiv);
  playersTd.appendChild(indicatorDiv);
  
  // Mode
  const modeTd = document.createElement('td');
  const modeBadge = document.createElement('span');
  modeBadge.className = 'mode-badge';
  
  if (lobby.settings.mode === 'time') {
    modeBadge.textContent = `⏱️ ${lobby.settings.timeLimit} Min`;
  } else {
    modeBadge.textContent = `🎯 ${lobby.settings.goalScore} Tore`;
  }
  
  modeTd.appendChild(modeBadge);
  
  // Status
  const statusTd = document.createElement('td');
  const statusBadge = document.createElement('span');
  statusBadge.className = 'status-badge';
  
  switch (lobby.status) {
    case 'waiting':
      statusBadge.className += ' status-waiting';
      statusBadge.textContent = t('browser.status.waiting');
      break;
    case 'starting':
      statusBadge.className += ' status-starting';
      statusBadge.textContent = t('browser.status.starting');
      break;
    case 'in-progress':
      statusBadge.className += ' status-inprogress';
      statusBadge.textContent = t('browser.status.running');
      break;
    default:
      statusBadge.textContent = lobby.status;
  }
  
  statusTd.appendChild(statusBadge);
  
  // Ping
  const pingTd = document.createElement('td');
  const pingSpan = document.createElement('span');
  pingSpan.className = 'ping-indicator';
  
  // Calculate/fetch ping
  const ping = getPing(lobby.id);
  pingSpan.textContent = ping ? `${ping}ms` : '...';
  
  pingTd.appendChild(pingSpan);
  
  // Append all cells
  tr.appendChild(mapTd);
  tr.appendChild(nameTd);
  tr.appendChild(playersTd);
  tr.appendChild(modeTd);
  tr.appendChild(statusTd);
  tr.appendChild(pingTd);
  
  // Click handler - Join/View Lobby
  tr.addEventListener('click', () => {
    console.log(`🎯 Clicked lobby: ${lobby.id}`);
    openLobby(lobby);
  });
  
  return tr;
}

// ========================================
// PING CALCULATION
// ========================================

function getPing(lobbyId) {
  // Simple ping simulation (in real app: measure actual latency)
  if (!pingCache.has(lobbyId)) {
    // Simulate ping between 10-50ms for localhost
    pingCache.set(lobbyId, Math.floor(Math.random() * 40) + 10);
  }
  return pingCache.get(lobbyId);
}

// ========================================
// OPEN LOBBY
// ========================================

function openLobby(lobby) {
  // Handle both data structures: lobby.players.red/blue OR lobby.redTeam/blueTeam
  const redTeam = lobby.players?.red || lobby.redTeam || [];
  const blueTeam = lobby.players?.blue || lobby.blueTeam || [];
  const allPlayers = [...redTeam, ...blueTeam];
  const isInLobby = allPlayers.some(p => p.netid === currentNetID);
  
  if (isInLobby) {
    // Already in lobby - open lobby view
    console.log('✅ Already in lobby - opening view');
    ipcRenderer.send('open-lobby-view', lobby.id);
  } else {
    // Not in lobby - join it
    console.log('🔗 Joining lobby...');
    joinLobby(lobby.id);
  }
}

async function joinLobby(lobbyId) {
  if (!currentNetID) {
    alert('NetID not available yet. Please wait...');
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
      console.log('✅ Joined lobby successfully');
      ipcRenderer.send('set-lobby-id', lobbyId);
      ipcRenderer.send('open-lobby-view', lobbyId);
    } else {
      alert('Fehler beim Beitreten: ' + (data.error || 'Unbekannter Fehler'));
    }
  } catch (error) {
    console.error('Error joining lobby:', error);
    alert('Konnte nicht beitreten. Master Server nicht erreichbar.');
  }
}

// ========================================
// CONNECTION STATUS
// ========================================

function updateConnectionStatus(connected, errorMsg = null) {
  const statusEl = document.getElementById('connectionStatus');
  const statusIndicator = statusEl.parentElement;
  const quickMatchBtn = document.getElementById('quickMatchBtn');
  const createLobbyBtn = document.getElementById('createLobbyBtn');
  
  if (connected) {
    statusIndicator.style.borderColor = '#28a745';
    statusIndicator.style.color = '#28a745';
    statusIndicator.style.background = 'rgba(40, 167, 69, 0.2)';
    statusEl.textContent = t('browser.connected.full');
    
    const dot = statusIndicator.querySelector('.status-dot');
    if (dot) {
      dot.style.background = '#28a745';
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
    statusIndicator.style.borderColor = '#dc3545';
    statusIndicator.style.color = '#dc3545';
    statusIndicator.style.background = 'rgba(220, 53, 69, 0.2)';
    statusEl.textContent = errorMsg || 'Verbindung zum Master Server fehlgeschlagen';
    
    const dot = statusIndicator.querySelector('.status-dot');
    if (dot) {
      dot.style.background = '#dc3545';
      dot.style.animation = 'none';
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

// ========================================
// CLEANUP
// ========================================

window.addEventListener('beforeunload', () => {
  stopAutoRefresh();
});
