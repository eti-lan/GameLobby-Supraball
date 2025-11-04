// 🎮 Lobby View JavaScript
// Date: 2025-10-20

const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// Get Master Server URL from config
const MASTER_SERVER_URL = window.MASTER_SERVER_URL || 'http://supraball.servers.lan:8991';
let currentLobbyId = null;
let currentNetID = null;
let currentUsername = null;
let refreshInterval = null;
let isCreator = false;
let netidReceived = false;
let lobbyIdReceived = false;
let isGameRunning = false; // Track if game is currently running

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
  console.log('🎮 Lobby View initialized');
  
  // Get NetID and lobby ID from URL params or IPC
  ipcRenderer.send('get-netid');
  ipcRenderer.send('get-current-lobby');
  
  // Setup event listeners
  setupEventListeners();
});

// Get NetID
ipcRenderer.on('netid-response', (event, data) => {
  currentNetID = data.netid;
  // Decode username in case it's URL-encoded
  currentUsername = decodeURIComponent(data.username || `Player_${currentNetID.substring(currentNetID.length - 6)}`);
  netidReceived = true;
  console.log(`✅ NetID received: ${currentNetID}`);
  
  // Try to start if both netid and lobbyId are ready
  tryStartRefreshing();
});

// Get current lobby ID
ipcRenderer.on('current-lobby-response', (event, lobbyId) => {
  currentLobbyId = lobbyId;
  lobbyIdReceived = true;
  console.log(`🎯 Lobby ID received: ${currentLobbyId}`);
  
  if (!currentLobbyId) {
    showError('No lobby ID provided');
    return;
  }
  
  // Try to start if both netid and lobbyId are ready
  tryStartRefreshing();
});

// Allow main process to set lobby ID
ipcRenderer.on('set-lobby-id', (event, lobbyId) => {
  currentLobbyId = lobbyId;
  lobbyIdReceived = true;
  console.log(`🎯 Lobby ID set via IPC: ${currentLobbyId}`);
  
  // Try to start if both are ready
  tryStartRefreshing();
});

// Helper to ensure both netid and lobbyId are ready before starting
function tryStartRefreshing() {
  console.log(`🔍 Check: NetID=${netidReceived}, LobbyID=${lobbyIdReceived}`);
  
  if (netidReceived && lobbyIdReceived && currentNetID && currentLobbyId) {
    console.log('✅ Both NetID and LobbyID ready - starting refresh');
    startRefreshing();
  } else {
    console.log('⏳ Waiting for NetID and LobbyID...');
  }
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
  // Back button
  document.getElementById('backButton')?.addEventListener('click', async () => {
    console.log('🔙 Navigating back to lobby list');
    
    // Leave lobby first
    if (currentLobbyId && currentNetID) {
      try {
        await fetchNoCache(`${MASTER_SERVER_URL}/lobbies/${currentLobbyId}/leave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ netid: currentNetID })
        });
      } catch (error) {
        console.error('Error leaving lobby:', error);
      }
    }
    
    stopRefreshing();
    ipcRenderer.send('open-lobby-browser');
  });
  
  // Team switch buttons
  document.getElementById('switchToRed').addEventListener('click', () => switchTeam('red'));
  document.getElementById('switchToBlue').addEventListener('click', () => switchTeam('blue'));
  
  // Ready checkbox
  const readyCheckbox = document.getElementById('readyCheckbox');
  const readyToggle = document.getElementById('readyToggle');
  
  readyCheckbox.addEventListener('change', (e) => {
    setReady(e.target.checked);
    updateReadyToggle(e.target.checked);
  });
  
  // Ready toggle - click on label to toggle
  if (readyToggle) {
    readyToggle.addEventListener('click', (e) => {
      // Wenn direkt auf das Label geklickt wird (nicht auf Checkbox)
      if (e.target.tagName !== 'INPUT') {
        e.preventDefault();
        readyCheckbox.checked = !readyCheckbox.checked;
        setReady(readyCheckbox.checked);
        updateReadyToggle(readyCheckbox.checked);
      }
    });
  }
  
  // Settings toggle button
  document.getElementById('settingsToggleBtn')?.addEventListener('click', (e) => {
    e.stopPropagation(); // Verhindere Event-Bubbling zum Panel
    const panel = document.getElementById('lobbyInfoPanel');
    const details = document.getElementById('lobbyDetails');
    
    panel.classList.toggle('expanded');
    details.classList.toggle('expanded');
    
    // Load maps when opening settings for the first time
    if (panel.classList.contains('expanded')) {
      const mapsContainer = document.getElementById('editMapsContainer');
      if (mapsContainer && mapsContainer.children.length === 0) {
        console.log('📍 Loading maps for edit form...');
        ipcRenderer.send('get-base-path-for-edit');
      }
    }
  });
  
  // Start button
  document.getElementById('startBtn').addEventListener('click', startMatch);
  
  // Leave button
  document.getElementById('leaveBtn').addEventListener('click', leaveLobby);
}

// ========================================
// LOBBY REFRESH
// ========================================

let refreshStarted = false;

function startRefreshing() {
  if (refreshStarted) {
    console.log('⚠️ Refresh already started, skipping...');
    return;
  }
  
  refreshStarted = true;
  console.log('🔄 Starting lobby refresh...');
  
  // Initial load
  refreshLobby();
  
  // Refresh every 2 seconds
  refreshInterval = setInterval(refreshLobby, 2000);
}

function stopRefreshing() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
    refreshStarted = false;
  }
}

async function refreshLobby() {
  if (!currentLobbyId) return;
  
  try {
    const response = await fetchNoCache(`${MASTER_SERVER_URL}/lobbies/${currentLobbyId}`);
    
    if (!response.ok) {
      console.error('Failed to fetch lobby:', response.status);
      return; // Don't navigate away on network errors
    }
    
    const data = await response.json();
    
    console.log('📥 Received lobby data:', {
      redTeam: data.lobby?.redTeam?.length || 0,
      blueTeam: data.lobby?.blueTeam?.length || 0,
      redPlayers: data.lobby?.redTeam?.map(p => p.username) || [],
      bluePlayers: data.lobby?.blueTeam?.map(p => p.username) || []
    });
    
    if (data.success && data.lobby) {
      renderLobby(data.lobby);
      // Clear any previous error
      document.getElementById('errorMessage').style.display = 'none';
    } else {
      // Only navigate away if lobby explicitly doesn't exist (deleted)
      console.warn('Lobby not found or deleted');
      showError('Lobby wurde gelöscht oder existiert nicht mehr');
      stopRefreshing();
      
      // Lobby might have been deleted - go back to browser
      setTimeout(() => {
        ipcRenderer.send('open-lobby-browser');
      }, 2000);
    }
    
  } catch (error) {
    console.error('Error fetching lobby:', error);
    // Don't show error on every refresh - just log it
    // Don't navigate away on network errors
  }
}

// ========================================
// RENDER LOBBY
// ========================================

function renderLobby(lobby) {
  // Update header
  document.getElementById('lobbyNameHeader').textContent = lobby.name;
  
  // Update info - Main display
  document.getElementById('lobbyMap').textContent = lobby.map.replace('DB-', '');
  document.getElementById('lobbyMode').textContent = `${lobby.settings.mode === 'time' ? t('view.mode.time') : t('view.mode.goal')} (${lobby.type})`;
  
  const totalPlayers = lobby.redTeam.length + lobby.blueTeam.length;
  const maxPlayers = lobby.type === '3v3' ? 6 : 10;
  document.getElementById('lobbyPlayers').textContent = `${totalPlayers}/${maxPlayers}`;
  
  // Status auf Deutsch
  const statusMap = {
    'waiting': t('view.lobby.status.waiting'),
    'starting': t('view.lobby.status.starting'),
    'in-progress': t('view.lobby.status.in-progress'),
    'finished': t('view.lobby.status.finished')
  };
  document.getElementById('lobbyStatus').textContent = statusMap[lobby.status] || lobby.status;
  
  // Update map preview
  updateMapPreview(lobby.map);
  
  // Check if current user is creator
  isCreator = (lobby.createdBy === currentNetID);
  
  // Populate edit form if creator
  if (isCreator) {
    populateEditForm(lobby);
  }
  
  // Render teams
  renderTeam('red', lobby.redTeam, lobby.type);
  renderTeam('blue', lobby.blueTeam, lobby.type);
  
  // Update controls
  updateControls(lobby);
  
  // Show status messages
  updateStatusMessage(lobby);
  
  // Auto-join if match is starting/ready and we're not the creator
  if (!isCreator && !isGameRunning && (lobby.status === 'starting' || lobby.status === 'ready' || lobby.status === 'in-progress')) {
    console.log('🎮 Match started by host - auto-joining...');
    autoJoinMatch(lobby);
  }
}

function updateMapPreview(mapName) {
  const basePath = path.join(process.cwd(), "..");
  const imagesDir = path.join(basePath, "images");
  const imgPath = path.join(imagesDir, mapName + ".jpg");
  
  const imgElement = document.getElementById('mapPreviewImg');
  const fallback = document.getElementById('mapPreviewFallback');
  
  if (fs.existsSync(imgPath)) {
    // Convert to file:// URL for Electron
    imgElement.src = 'file://' + imgPath.replace(/\\/g, '/');
    imgElement.style.display = 'block';
    fallback.style.display = 'none';
    imgElement.onerror = () => {
      imgElement.style.display = 'none';
      fallback.style.display = 'flex';
    };
  } else {
    imgElement.style.display = 'none';
    fallback.style.display = 'flex';
  }
}

function renderTeam(color, players, lobbyType) {
  const listEl = document.getElementById(`${color}TeamList`);
  const maxPerTeam = lobbyType === '3v3' ? 3 : 5;
  
  listEl.innerHTML = '';
  
  // Render players as rows
  players.forEach((player, index) => {
    const playerRow = document.createElement('div');
    playerRow.className = 'player-row';
    
    if (player.netid === currentNetID) {
      playerRow.classList.add('you');
    }
    
    // Team indicator (colored circle)
    const indicator = document.createElement('div');
    indicator.className = `team-indicator ${color}`;
    playerRow.appendChild(indicator);
    
    // Player name
    const nameDiv = document.createElement('div');
    nameDiv.className = 'player-name';
    nameDiv.textContent = player.username || `Player ${index + 1}`;
    playerRow.appendChild(nameDiv);
    
    // "YOU" badge if this is the current player
    if (player.netid === currentNetID) {
      const badge = document.createElement('div');
      badge.className = 'player-badge';
      badge.textContent = t('view.player.you');
      playerRow.appendChild(badge);
    }
    
    // Ready status
    const readyDiv = document.createElement('div');
    readyDiv.className = player.ready ? 'player-ready ready' : 'player-ready not-ready';
    readyDiv.textContent = player.ready ? '✅ Bereit' : '⏳ Nicht bereit';
    playerRow.appendChild(readyDiv);
    
    listEl.appendChild(playerRow);
  });
  
  // Fill empty slots
  const emptySlots = maxPerTeam - players.length;
  for (let i = 0; i < emptySlots; i++) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-slot';
    emptyDiv.textContent = t('view.slot.empty');
    listEl.appendChild(emptyDiv);
  }
}

function updateControls(lobby) {
  console.log('🎮 Updating controls...');
  console.log('Current NetID:', currentNetID);
  console.log('Red Team:', lobby.redTeam.map(p => `${p.username} (${p.netid})`));
  console.log('Blue Team:', lobby.blueTeam.map(p => `${p.username} (${p.netid})`));
  
  const currentPlayer = [...lobby.redTeam, ...lobby.blueTeam].find(p => p.netid === currentNetID);
  
  if (!currentPlayer) {
    // User not in lobby anymore - this might be a timing issue
    console.error('❌ Player not found in lobby!');
    console.error('Looking for NetID:', currentNetID);
    console.error('All players:', [...lobby.redTeam, ...lobby.blueTeam].map(p => p.netid));
    
    // Don't immediately error - user might have just joined
    // The next refresh will pick them up
    return;
  }
  
  console.log('✅ Found player:', currentPlayer.username, 'Team:', currentPlayer.team);
  
  // Update ready checkbox and toggle styling
  const readyCheckbox = document.getElementById('readyCheckbox');
  readyCheckbox.checked = currentPlayer.ready;
  updateReadyToggle(currentPlayer.ready);
  
  // Update team switch buttons
  const switchToRed = document.getElementById('switchToRed');
  const switchToBlue = document.getElementById('switchToBlue');
  
  const maxPerTeam = lobby.type === '3v3' ? 3 : 5;
  const redFull = lobby.redTeam.length >= maxPerTeam;
  const blueFull = lobby.blueTeam.length >= maxPerTeam;
  
  switchToRed.disabled = (currentPlayer.team === 'red') || redFull;
  switchToBlue.disabled = (currentPlayer.team === 'blue') || blueFull;
  
  // Show start button only for creator
  const startBtn = document.getElementById('startBtn');
  const editForm = document.getElementById('editLobbyForm');
  
  // Safety check: Elements might not exist yet
  if (!startBtn || !editForm) {
    console.warn('[LOBBY] Control elements not found in DOM yet');
    console.warn('startBtn:', !!startBtn, 'editForm:', !!editForm);
    return;
  }
  
  if (isCreator) {
    startBtn.style.display = 'block';
    
    // Show edit settings only if lobby hasn't started yet
    const lobbyDetails = document.getElementById('lobbyDetails');
    if (lobbyDetails) {
      if (lobby.status === 'waiting') {
        lobbyDetails.style.display = 'block';
      } else {
        lobbyDetails.style.display = 'none';
      }
    }
    
    // Owner can always start (independent of ready status)
    // IMPORTANT: Server only accepts 6 (3v3) or 10 (5v5) players!
    // With Auto-Fill Bots: Bots fill up to the full player count
    // Without Bots: Enough real players required in both teams
    const totalPlayers = lobby.redTeam.length + lobby.blueTeam.length;
    const maxPlayers = lobby.type === '3v3' ? 6 : 10;
    const requiredPerTeam = lobby.type === '3v3' ? 3 : 5;
    let hasEnoughPlayers;
    let buttonText;
    
    // If the game is running, don't override button status
    if (isGameRunning) {
      return;
    }
    
    if (lobby.settings.botsActive) {
      // With Bots: At least 1 player total, rest will be filled with bots
      hasEnoughPlayers = totalPlayers >= 1;
      if (!hasEnoughPlayers) {
        buttonText = '⏸️ ' + t('view.button.min-player-needed');
      } else {
        const botsNeeded = maxPlayers - totalPlayers;
        buttonText = botsNeeded > 0 ? '🚀 ' + t('view.button.start-with-bots', { count: botsNeeded }) : '🚀 ' + t('view.start');
      }
    } else {
      // Without Bots: Enough players for both teams (3v3: 3 each, 5v5: 5 each)
      hasEnoughPlayers = (lobby.redTeam.length >= requiredPerTeam && lobby.blueTeam.length >= requiredPerTeam);
      if (!hasEnoughPlayers) {
        buttonText = '⏸️ ' + t('view.button.players-needed', { count: requiredPerTeam });
      } else {
        buttonText = '🚀 ' + t('view.start');
      }
    }
    
    startBtn.disabled = !hasEnoughPlayers;
    startBtn.textContent = buttonText;
  } else {
    startBtn.style.display = 'none';
    const lobbyDetails = document.getElementById('lobbyDetails');
    if (lobbyDetails) {
      lobbyDetails.style.display = 'none';
    }
  }
}

function updateReadyToggle(isReady) {
  const toggle = document.getElementById('readyToggle');
  if (isReady) {
    toggle.classList.add('active');
  } else {
    toggle.classList.remove('active');
  }
}

function updateStatusMessage(lobby) {
  const statusEl = document.getElementById('statusMessage');
  const totalPlayers = lobby.redTeam.length + lobby.blueTeam.length;
  
  // Hide the status banner - we use notifications now
  statusEl.style.display = 'none';
  
  // Show notification only when status changes
  if (lobby.status === 'starting' || lobby.status === 'in-progress') {
    // No notification during server start - handled elsewhere
  } else if (totalPlayers >= 2 && totalPlayers < (lobby.type === '3v3' ? 6 : 10)) {
    // Only show if not previously shown (to avoid spam)
    if (!statusEl.dataset.lastStatus || statusEl.dataset.lastStatus !== 'waiting-start') {
      showInfo(t('view.status.waiting-start'));
      statusEl.dataset.lastStatus = 'waiting-start';
    }
  } else if (totalPlayers < 2) {
    // Only show if not previously shown
    if (!statusEl.dataset.lastStatus || statusEl.dataset.lastStatus !== 'waiting-players') {
      showWarning(t('view.status.waiting-players'));
      statusEl.dataset.lastStatus = 'waiting-players';
    }
  }
}

// ========================================
// ACTIONS
// ========================================

async function switchTeam(newTeam) {
  if (!currentLobbyId || !currentNetID) return;
  
  try {
    const response = await fetchNoCache(`${MASTER_SERVER_URL}/lobbies/${currentLobbyId}/switch-team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        netid: currentNetID,
        team: newTeam
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Switched to ${newTeam} team`);
      const teamIcon = newTeam === 'red' ? '🔴' : '🔵';
      showInfo(`${teamIcon} Team gewechselt!`);
      refreshLobby(); // Immediate refresh
    } else {
      showError(data.error || 'Team-Wechsel fehlgeschlagen');
    }
    
  } catch (error) {
    console.error('Error switching team:', error);
    showError('Team-Wechsel fehlgeschlagen');
  }
}

async function setReady(ready) {
  if (!currentLobbyId || !currentNetID) return;
  
  try {
    const response = await fetchNoCache(`${MASTER_SERVER_URL}/lobbies/${currentLobbyId}/ready`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        netid: currentNetID,
        ready: ready
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Ready status: ${ready}`);
      refreshLobby(); // Immediate refresh
    } else {
      showError(data.error || 'Failed to set ready status');
      // Revert checkbox
      document.getElementById('readyCheckbox').checked = !ready;
    }
    
  } catch (error) {
    console.error('Error setting ready:', error);
    showError('Failed to set ready status');
    document.getElementById('readyCheckbox').checked = !ready;
  }
}

async function startMatch() {
  if (!currentLobbyId || !currentNetID || !isCreator) return;
  
  const startBtn = document.getElementById('startBtn');
  const statusEl = document.getElementById('statusMessage');
  
  // Button deaktivieren und Status anzeigen
  startBtn.disabled = true;
  startBtn.textContent = t('view.status.starting');
  isGameRunning = true; // Spiel-Prozess beginnt
  
  try {
    console.log('🚀 Calling start endpoint...');
    const startTime = Date.now();
    
    const response = await fetchNoCache(`${MASTER_SERVER_URL}/lobbies/${currentLobbyId}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        netid: currentNetID
      })
    });
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ Server responded after ${elapsed}s`);
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Server started!', data);
      showSuccess('Server wird gestartet! 🚀');
      
      // Server ist ready! Button-Status aktualisieren
      startBtn.textContent = t('view.status.server-ready');
      
      // Countdown bevor Client startet
      await startClientCountdown(data);
      
    } else {
      showError(data.error || 'Failed to start server');
      startBtn.disabled = false;
      startBtn.textContent = t('view.start');
      isGameRunning = false; // Fehler beim Start
    }
    
  } catch (error) {
    console.error('Error starting server:', error);
    showError('Failed to start server');
    startBtn.disabled = false;
    startBtn.textContent = t('view.start');
    isGameRunning = false; // Fehler beim Start
  }
}

async function startClientCountdown(serverData) {
  const startBtn = document.getElementById('startBtn');
  
  // Update button status
  startBtn.textContent = t('view.status.connecting');
  
  // Small delay to allow server to fully initialize
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Start client
  connectToServer(serverData);
}

async function connectToServer(data) {
  const startBtn = document.getElementById('startBtn');
  
  // Connect to the game server
  if (data.server) {
    console.log(`🎮 Connecting to ${data.server.ip}:${data.server.port}`);
    
    // Validate server data
    if (!data.server.ip || !data.server.port) {
      console.error('❌ Server data incomplete:', data.server);
      const startBtn = document.getElementById('startBtn');
      startBtn.disabled = false;
      startBtn.textContent = '❌ Server-Fehler';
      return;
    }
    
    // Send IPC message to launch game
    ipcRenderer.send('connect-lobby-match', {
      ip: data.server.ip,
      port: data.server.port,
      lobbyId: currentLobbyId
    });
    
    // Wait for game to launch
    ipcRenderer.once('game-launched', (event, launchData) => {
      console.log('✅ Game launched successfully!', launchData);
      
      // Button stays disabled while the game is running
      const startBtn = document.getElementById('startBtn');
      startBtn.disabled = true;
      startBtn.textContent = t('view.status.ingame');
    });
    
    ipcRenderer.once('game-closed', (event, closeData) => {
      console.log('🎮 Game closed', closeData);
      
      // Re-enable button after game ends
      const startBtn = document.getElementById('startBtn');
      startBtn.disabled = false;
      startBtn.textContent = t('view.start');
      isGameRunning = false; // Spiel beendet
      
      // Refresh lobby to update status
      refreshLobby();
    });
  }
}

// Auto-join match when host starts (for non-creator players)
async function autoJoinMatch(lobby) {
  if (!lobby.server) {
    console.warn('⚠️ Match started but no server data available yet');
    return;
  }
  
  console.log('🎮 Auto-joining match:', lobby.server);
  isGameRunning = true;
  
  // Connect to the game server
  connectToServer({ server: lobby.server });
}

async function leaveLobby() {
  if (!currentLobbyId || !currentNetID) return;
  
  try {
    const response = await fetchNoCache(`${MASTER_SERVER_URL}/lobbies/${currentLobbyId}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        netid: currentNetID
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Left lobby');
      stopRefreshing();
      
      // Go back to lobby browser
      ipcRenderer.send('open-lobby-browser');
    } else {
      showError(data.error || 'Failed to leave lobby');
    }
    
  } catch (error) {
    console.error('Error leaving lobby:', error);
    showError('Failed to leave lobby');
  }
}

// ========================================
// UTILITY
// ========================================

function showError(message) {
  const errorEl = document.getElementById('errorMessage');
  errorEl.textContent = '❌ ' + message;
  errorEl.style.display = 'block';
  
  setTimeout(() => {
    errorEl.style.display = 'none';
  }, 5000);
}

// ========================================
// EDIT SETTINGS (Only for Creator)
// ========================================

function loadEditMaps() {
  // Request base path from main process
  ipcRenderer.send('get-base-path-for-edit');
}

// Receive base path and load maps
ipcRenderer.on('base-path-for-edit-response', (event, basePath) => {
  console.log('📁 Base path for edit maps:', basePath);
  
  const mapsDir = path.join(basePath, "UDKGame", "CookedPC", "Deathball", "Maps");
  const imagesDir = path.join(basePath, "images");
  const mapsContainer = document.getElementById('editMapsContainer');
  
  if (!mapsContainer) return;
  
  const excludedMaps = ["DB-FrontEndMap", "DB-Skill", "DB-Tutorial", "DB-TrainingPitch"];
  
  if (!fs.existsSync(mapsDir)) {
    console.warn('Maps directory not found:', mapsDir);
    mapsContainer.innerHTML = '<p style="text-align: center; color: #999;">Maps not found</p>';
    return;
  }
  
  console.log('✅ Found maps directory for edit:', mapsDir);
  
  let files = fs.readdirSync(mapsDir);
  let mapFiles = files.filter(file => file.toLowerCase().endsWith('.udk'));
  
  mapsContainer.innerHTML = '';
  
  mapFiles.forEach(file => {
    let mapName = path.basename(file, path.extname(file));
    if (excludedMaps.includes(mapName)) return;
    
    let mapCard = document.createElement('div');
    mapCard.classList.add('map-card');
    mapCard.dataset.mapName = mapName;
    
    let imgPath = path.join(imagesDir, mapName + ".jpg");
    let imgElement = document.createElement('img');
    if (fs.existsSync(imgPath)) {
      // Convert to file:// URL for Electron
      imgElement.src = 'file://' + imgPath.replace(/\\/g, '/');
      imgElement.onerror = () => {
        imgElement.style.display = 'none';
      };
    } else {
      imgElement.style.display = 'none';
    }
    mapCard.appendChild(imgElement);
    
    let label = document.createElement('div');
    label.classList.add('map-name');
    label.textContent = mapName.replace('DB-', '');
    mapCard.appendChild(label);
    
    mapCard.addEventListener('click', () => {
      document.querySelectorAll('#editMapsContainer .map-card').forEach(card => {
        card.classList.remove('selected');
      });
      mapCard.classList.add('selected');
    });
    
    mapsContainer.appendChild(mapCard);
  });
});

function setupEditFormListeners() {
  // Game mode toggle
  const modeTimeRadio = document.getElementById('editModeTime');
  const modeGoalRadio = document.getElementById('editModeGoal');
  const timeLimitGroup = document.getElementById('editTimeLimitGroup');
  const goalScoreGroup = document.getElementById('editGoalScoreGroup');
  
  if (modeTimeRadio && modeGoalRadio) {
    modeTimeRadio.addEventListener('change', () => {
      timeLimitGroup.style.display = 'block';
      goalScoreGroup.style.display = 'none';
    });
    
    modeGoalRadio.addEventListener('change', () => {
      timeLimitGroup.style.display = 'none';
      goalScoreGroup.style.display = 'block';
    });
  }
  
  // Bots toggle
  const botsCheckbox = document.getElementById('editBotsActive');
  const botSkillGroup = document.getElementById('editBotSkillGroup');
  
  if (botsCheckbox && botSkillGroup) {
    botsCheckbox.addEventListener('change', () => {
      botSkillGroup.style.display = botsCheckbox.checked ? 'block' : 'none';
    });
  }
  
  // Bot skill slider
  const botSkillSlider = document.getElementById('editBotSkill');
  const botSkillValue = document.getElementById('editBotSkillValue');
  
  if (botSkillSlider && botSkillValue) {
    botSkillSlider.addEventListener('input', () => {
      botSkillValue.textContent = botSkillSlider.value;
    });
  }
  
  // Cancel button
  document.getElementById('cancelEditBtn')?.addEventListener('click', () => {
    document.getElementById('editSettingsPanel').style.display = 'none';
  });
  
  // Form submit
  document.getElementById('editLobbyForm')?.addEventListener('submit', handleEditSubmit);
}

async function handleEditSubmit(e) {
  e.preventDefault();
  
  console.log('💾 Saving lobby settings...');
  
  // Get selected map
  const selectedMapCard = document.querySelector('#editMapsContainer .map-card.selected');
  if (!selectedMapCard) {
    showError('Bitte wähle eine Map aus');
    return;
  }
  
  const selectedMap = selectedMapCard.dataset.mapName;
  const lobbyType = document.querySelector('input[name="editLobbyType"]:checked').value;
  const gameMode = document.querySelector('input[name="editGameMode"]:checked').value;
  
  const settings = {
    map: selectedMap,
    mode: gameMode,
    timeLimit: parseInt(document.getElementById('editTimeLimit').value),
    goalScore: parseInt(document.getElementById('editGoalScore').value),
    botsActive: document.getElementById('editBotsActive').checked,
    botSkill: parseInt(document.getElementById('editBotSkill').value),
    warmupTime: parseInt(document.getElementById('editWarmupTime').value) * 60 // Convert to seconds
  };
  
  console.log('Settings to save:', settings);
  
  try {
    const response = await fetchNoCache(`${MASTER_SERVER_URL}/lobbies/${currentLobbyId}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        netid: currentNetID,
        settings: settings
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Settings saved successfully');
      
      // Collapse the panel
      const lobbyInfoPanel = document.getElementById('lobbyInfoPanel');
      const lobbyDetails = document.getElementById('lobbyDetails');
      lobbyInfoPanel.classList.remove('expanded');
      lobbyDetails.classList.remove('expanded');
      
      // Refresh lobby to show new settings
      await refreshLobby();
      
      showSuccess('Einstellungen gespeichert!');
    } else {
      showError(data.error || 'Fehler beim Speichern der Einstellungen');
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    showError('Verbindung zum Master Server fehlgeschlagen');
  }
}

function showSuccess(message) {
  const statusEl = document.getElementById('statusMessage');
  statusEl.textContent = message;
  statusEl.className = 'status-message success';
  statusEl.style.display = 'block';
  
  setTimeout(() => {
    statusEl.style.display = 'none';
  }, 3000);
}

function populateEditForm(lobby) {
  if (!isCreator) return;
  
  // Load maps
  loadEditMaps();
  
  // Select current map
  setTimeout(() => {
    const mapCard = document.querySelector(`#editMapsContainer .map-card[data-map-name="${lobby.map}"]`);
    if (mapCard) {
      mapCard.classList.add('selected');
    }
  }, 100);
  
  // Set lobby type
  document.querySelector(`input[name="editLobbyType"][value="${lobby.type}"]`).checked = true;
  
  // Set game mode
  if (lobby.settings.mode === 'time') {
    document.getElementById('editModeTime').checked = true;
    document.getElementById('editTimeLimitGroup').style.display = 'block';
    document.getElementById('editGoalScoreGroup').style.display = 'none';
    document.getElementById('editTimeLimit').value = lobby.settings.timeLimit;
  } else {
    document.getElementById('editModeGoal').checked = true;
    document.getElementById('editTimeLimitGroup').style.display = 'none';
    document.getElementById('editGoalScoreGroup').style.display = 'block';
    document.getElementById('editGoalScore').value = lobby.settings.goalScore || 5;
  }
  
  // Set bots
  const botsActive = lobby.settings.botsActive;
  document.getElementById('editBotsActive').checked = botsActive;
  document.getElementById('editBotSkillGroup').style.display = botsActive ? 'block' : 'none';
  document.getElementById('editBotSkill').value = lobby.settings.botSkill || 1250;
  document.getElementById('editBotSkillValue').textContent = lobby.settings.botSkill || 1250;
  
  // Set warmup (convert seconds to minutes)
  const warmupMinutes = Math.floor(lobby.settings.warmupTime / 60);
  document.getElementById('editWarmupTime').value = warmupMinutes;
  
  // Setup listeners
  setupEditFormListeners();
}

// Cleanup on window close
window.addEventListener('beforeunload', () => {
  stopRefreshing();
  
  // Leave lobby when window is closed
  if (currentLobbyId && currentNetID) {
    // Use synchronous XMLHttpRequest for beforeunload (fetch doesn't work reliably here)
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${MASTER_SERVER_URL}/lobbies/${currentLobbyId}/leave`, false); // false = synchronous
    xhr.setRequestHeader('Content-Type', 'application/json');
    try {
      xhr.send(JSON.stringify({ netid: currentNetID }));
      console.log('✅ Left lobby on window close');
    } catch (error) {
      console.error('Failed to leave lobby on close:', error);
    }
  }
});
