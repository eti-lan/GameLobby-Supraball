// 🎮 Lobby Creator JavaScript
// Date: 2025-10-20

const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// Get Master Server URL from config
const MASTER_SERVER_URL = window.MASTER_SERVER_URL || 'http://supraball.servers.lan:8991';
let selectedMap = "DB-Pitch";
let currentNetID = null;
let currentUsername = null;

// Sound effects - same as lobby-view
const sounds = {
  playerJoin: new Audio('sounds/player_join.mp3'),
  startMatch: new Audio('sounds/start_match.mp3')
};

// Preload sounds
sounds.playerJoin.load();
sounds.startMatch.load();

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
  console.log('🎮 Lobby Creator initialized');
  
  // Get NetID
  ipcRenderer.send('get-netid');
  
  // Load maps
  loadMaps();
  
  // Setup event listeners
  setupEventListeners();
});

// Get NetID
ipcRenderer.on('netid-response', (event, data) => {
  currentNetID = data.netid;
  // Decode username in case it's URL-encoded
  currentUsername = decodeURIComponent(data.username || `Player_${currentNetID.substring(currentNetID.length - 6)}`);
  console.log(`✅ NetID: ${currentNetID}`);
});

// ========================================
// MAP LOADING (from server-launcher)
// ========================================

function loadMaps() {
  // Get the base path by asking main process for exe location
  ipcRenderer.send('get-base-path');
}

// Receive base path from main process
ipcRenderer.on('base-path-response', (event, basePath) => {
  console.log('📁 Base path:', basePath);
  
  const mapsDir = path.join(basePath, "UDKGame", "CookedPC", "Deathball", "Maps");
  const imagesDir = path.join(basePath, "images");
  const mapsContainer = document.getElementById('mapsContainer');
  
  const excludedMaps = ["DB-FrontEndMap", "DB-Skill", "DB-Tutorial", "DB-TrainingPitch"];
  
  if (!fs.existsSync(mapsDir)) {
    console.warn('Maps directory not found:', mapsDir);
    mapsContainer.innerHTML = '<p style="text-align: center; color: #999;">Maps not found</p>';
    return;
  }
  
  console.log('✅ Found maps directory:', mapsDir);
  
  // Load maps from file system (same as server-launcher)
  let files = fs.readdirSync(mapsDir);
  let mapFiles = files.filter(file => file.toLowerCase().endsWith('.udk'));
  
  mapFiles.forEach(file => {
    let mapName = path.basename(file, path.extname(file));
    if (excludedMaps.includes(mapName)) return;
    
    let mapCard = document.createElement('div');
    mapCard.classList.add('map-card');
    mapCard.dataset.mapName = mapName;
    
    // Add image
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
    
    // Add label (show without DB- prefix)
    let label = document.createElement('div');
    label.classList.add('map-name');
    label.textContent = mapName.replace('DB-', '');
    mapCard.appendChild(label);
    
    // Click handler
    mapCard.addEventListener('click', () => {
      document.querySelectorAll('.map-card').forEach(box => box.classList.remove('selected'));
      mapCard.classList.add('selected');
      selectedMap = mapName;
      console.log('Selected map:', selectedMap);
    });
    
    mapsContainer.appendChild(mapCard);
    
    // Select DB-Pitch by default
    if (mapName === 'DB-Pitch') {
      mapCard.classList.add('selected');
    }
  });
});

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
  // Back button
  document.getElementById('backButton')?.addEventListener('click', () => {
    console.log('🔙 Navigating back to lobby list');
    ipcRenderer.send('open-lobby-browser');
  });
  
  // Game mode toggle
  document.querySelectorAll('input[name="gameMode"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const isTime = document.querySelector('input[name="gameMode"]:checked').value === 'time';
      document.getElementById('timeLimitGroup').style.display = isTime ? 'block' : 'none';
      document.getElementById('goalScoreGroup').style.display = isTime ? 'none' : 'block';
    });
  });
  
  // Bots toggle - Skill Level auskommentiert
  document.getElementById('botsActive').addEventListener('change', (e) => {
    // document.getElementById('botSkillGroup').style.display = e.target.checked ? 'block' : 'none';
  });
  
  // Bot skill slider - auskommentiert, da UI-Element versteckt
  // document.getElementById('botSkill').addEventListener('input', (e) => {
  //   document.getElementById('botSkillValue').textContent = e.target.value;
  // });
  
  // Form submit
  document.getElementById('createLobbyForm').addEventListener('submit', handleSubmit);
  
  // Cancel button
  document.getElementById('cancelButton').addEventListener('click', () => {
    console.log('❌ Lobby creation cancelled');
    ipcRenderer.send('open-lobby-browser');
  });
}

// ========================================
// FORM SUBMISSION
// ========================================

async function handleSubmit(e) {
  e.preventDefault();
  
  // Clear any existing notifications (optional)
  // notificationSystem.clear();
  
  if (!currentNetID) {
    showError('NetID not available yet. Please wait...');
    return;
  }
  
  if (!selectedMap) {
    showError('Please select a map');
    return;
  }
  
  // Generate lobby name from username
  const lobbyName = `Lobby von ${currentUsername}`;
  
  // Collect form data
  const lobbyData = {
    name: lobbyName,
    type: document.querySelector('input[name="lobbyType"]:checked').value,
    map: selectedMap,
    createdBy: currentNetID,
    username: currentUsername,
    settings: {
      mode: document.querySelector('input[name="gameMode"]:checked').value,
      timeLimit: parseInt(document.getElementById('timeLimit').value),
      goalScore: parseInt(document.getElementById('goalScore').value),
      botsActive: document.getElementById('botsActive').checked,
      botSkill: 2500, // Fest auf Maximum gesetzt (100% Skill)
      warmupTime: parseInt(document.getElementById('warmupTime').value) * 60, // Convert minutes to seconds
      ranked: false // Always false
    }
  };
  
  console.log('Creating lobby:', lobbyData);
  
  // Disable submit button
  const createBtn = document.getElementById('createButton');
  if (createBtn) {
    createBtn.disabled = true;
    createBtn.textContent = t('creator.creating');
  }
  
  try {
    console.log(`🌐 Sending request to: ${MASTER_SERVER_URL}/lobbies/create`);
    console.log(`📦 Request body:`, JSON.stringify(lobbyData, null, 2));
    
    const response = await fetchNoCache(`${MASTER_SERVER_URL}/lobbies/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lobbyData)
    });
    
    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    console.log(`📡 Response headers:`, [...response.headers.entries()]);
    
    // Check if response is actually JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error(`❌ Server returned non-JSON response (${contentType}):`, text);
      throw new Error(`Server returned: ${text.substring(0, 100)}`);
    }
    
    const data = await response.json();
    console.log(`📥 Response data:`, data);
    
    if (data.success) {
      console.log('✅ Lobby created:', data.lobby);
      showSuccess('Lobby erfolgreich erstellt!');
      
      // Play lobby created sound
      console.log('🔊 Playing lobby created sound');
      try {
        sounds.playerJoin.currentTime = 0;
        sounds.playerJoin.play().catch(err => console.warn('Sound play failed:', err));
      } catch (error) {
        console.warn('Error playing sound:', error);
      }
      
      // Set lobby ID and open lobby view
      ipcRenderer.send('set-lobby-id', data.lobby.id);
      
      // Navigate to lobby view (no window.close needed - same window)
      setTimeout(() => {
        ipcRenderer.send('open-lobby-view', data.lobby.id);
      }, 1000);
      
    } else {
      showError(data.error || 'Failed to create lobby');
      const createBtn = document.getElementById('createButton');
      if (createBtn) {
        createBtn.disabled = false;
        createBtn.textContent = t('creator.create');
      }
    }
    
  } catch (error) {
    console.error('Error creating lobby:', error);
    showError('Failed to connect to Master Server');
    const createBtn = document.getElementById('createButton');
    if (createBtn) {
      createBtn.disabled = false;
      createBtn.textContent = t('creator.create');
    }
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================
// showError and showSuccess are now provided by notifications.js

