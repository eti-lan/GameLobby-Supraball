// Quick Match System
const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// Get Master Server URL from config
const MASTER_SERVER_URL = window.MASTER_SERVER_URL || 'http://supraball.servers.lan:8991';

// Player data
let myNetId = null;
let myUsername = null;
let currentMode = null;
let searchInterval = null;
let queueStatsInterval = null;
let currentLobbyId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadPlayerData();
    startQueueStatsPolling();
});

// Load player data from main process (same as lobby-view.js)
function loadPlayerData() {
    // Get NetID from main process
    ipcRenderer.send('get-netid');
}

// Receive NetID from main process
ipcRenderer.on('netid-response', (event, data) => {
    myNetId = data.netid;
    myUsername = decodeURIComponent(data.username || `Player_${myNetId.substring(myNetId.length - 6)}`);
    console.log(`✅ Player loaded: ${myUsername} (${myNetId})`);
});

// Start Quick Match
async function startQuickMatch(mode) {
    currentMode = mode;
    console.log(`Starting Quick Match: ${mode}`);
    
    try {
        const response = await fetch(`${MASTER_SERVER_URL}/quickmatch/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                netid: myNetId,
                username: myUsername,
                mode: mode
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSearchingScreen(mode);
            startStatusPolling();
        } else {
            showError(data.error || 'Failed to join queue');
        }
    } catch (error) {
        console.error('Error joining queue:', error);
        showError('Could not connect to server');
    }
}

// Cancel Search
async function cancelSearch() {
    try {
        await fetch(`${MASTER_SERVER_URL}/quickmatch/leave`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ netid: myNetId })
        });
    } catch (error) {
        console.error('Error leaving queue:', error);
    }
    
    stopStatusPolling();
    backToModeSelection();
}

// Poll queue stats (for display on mode selection)
function startQueueStatsPolling() {
    updateQueueStats();
    queueStatsInterval = setInterval(updateQueueStats, 3000);
}

async function updateQueueStats() {
    try {
        const response = await fetch(`${MASTER_SERVER_URL}/quickmatch/stats`);
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('queue-3v3').textContent = data.stats['3v3'];
            document.getElementById('queue-5v5').textContent = data.stats['5v5'];
        }
    } catch (error) {
        console.error('Error fetching queue stats:', error);
    }
}

// Poll match status (while searching)
function startStatusPolling() {
    checkMatchStatus();
    searchInterval = setInterval(checkMatchStatus, 1000);
}

function stopStatusPolling() {
    if (searchInterval) {
        clearInterval(searchInterval);
        searchInterval = null;
    }
}

let searchStartTime = Date.now();

async function checkMatchStatus() {
    try {
        const response = await fetch(`${MASTER_SERVER_URL}/quickmatch/status?netid=${myNetId}`);
        const data = await response.json();
        
        if (!data.inQueue) {
            // No longer in queue (cancelled or error)
            stopStatusPolling();
            backToModeSelection();
            return;
        }
        
        // Update wait time
        const waitTime = Math.floor((Date.now() - searchStartTime) / 1000);
        document.getElementById('wait-time').textContent = waitTime;
        
        // Update queue size
        const required = currentMode === '3v3' ? 6 : 10;
        document.getElementById('searching-queue-size').textContent = data.queueSize;
        document.getElementById('searching-required').textContent = required;
        
        // Check if match found
        if (data.status === 'matched' && data.lobbyId) {
            console.log('Match found! Lobby ID:', data.lobbyId);
            currentLobbyId = data.lobbyId;
            stopStatusPolling();
            showMatchFoundScreen(data.lobbyId);
        }
    } catch (error) {
        console.error('Error checking status:', error);
    }
}

// Show match found and wait for server
async function showMatchFoundScreen(lobbyId) {
    showScreen('match-found-screen');
    
    // Poll lobby status until server is ready
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds timeout
    let currentLobby = null;
    
    const checkLobby = setInterval(async () => {
        attempts++;
        
        try {
            const response = await fetch(`${MASTER_SERVER_URL}/lobbies/${lobbyId}`);
            const data = await response.json();
            
            if (data.success && data.lobby) {
                const lobby = data.lobby;
                currentLobby = lobby;
                
                // Update team display
                updateTeamDisplay(lobby);
                
                // Check if server is ready - show join overlay instead of auto-connect
                if (lobby.status === 'ready' && lobby.server) {
                    clearInterval(checkLobby);
                    
                    console.log('🎮 Server ready - showing join overlay');
                    showJoinMatchOverlay(lobby);
                } else if (lobby.status === 'starting') {
                    document.getElementById('connecting-status').textContent = 
                        '🔄 Starting server...';
                } else if (lobby.status === 'error') {
                    clearInterval(checkLobby);
                    showError('Failed to start server');
                }
            }
        } catch (error) {
            console.error('Error checking lobby:', error);
        }
        
        if (attempts >= maxAttempts) {
            clearInterval(checkLobby);
            showError('Server start timeout');
        }
    }, 1000);
}

// ========================================
// JOIN MATCH OVERLAY
// ========================================

function showJoinMatchOverlay(lobby) {
    const overlay = document.getElementById('joinMatchOverlay');
    const title = document.getElementById('joinMatchTitle');
    const text = document.getElementById('joinMatchText');
    const joinBtn = document.getElementById('joinMatchBtn');
    
    if (!overlay) {
        console.error('Join overlay not found!');
        // Fallback to direct connection
        connectToServer(lobby.server.ip, lobby.server.port);
        return;
    }
    
    // Use i18n for text
    title.textContent = t('join.overlay.title.ready');
    text.textContent = t('join.overlay.text.server-ready');
    
    // Store lobby data for join button
    joinBtn.onclick = () => {
        hideJoinMatchOverlay();
        connectToServer(lobby.server.ip, lobby.server.port);
    };
    
    overlay.style.display = 'flex';
}

function hideJoinMatchOverlay() {
    const overlay = document.getElementById('joinMatchOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Update team display
function updateTeamDisplay(lobby) {
    const redTeamDiv = document.getElementById('red-team-players');
    const blueTeamDiv = document.getElementById('blue-team-players');
    
    redTeamDiv.innerHTML = '';
    blueTeamDiv.innerHTML = '';
    
    lobby.redTeam.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-item';
        playerDiv.textContent = player.username;
        if (player.netid === myNetId) {
            playerDiv.textContent += ' (You)';
            playerDiv.style.fontWeight = 'bold';
        }
        redTeamDiv.appendChild(playerDiv);
    });
    
    lobby.blueTeam.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-item';
        playerDiv.textContent = player.username;
        if (player.netid === myNetId) {
            playerDiv.textContent += ' (You)';
            playerDiv.style.fontWeight = 'bold';
        }
        blueTeamDiv.appendChild(playerDiv);
    });
}

// Connect to game server
function connectToServer(ip, port) {
    console.log(`🎮 Connecting to game server: ${ip}:${port}`);
    
    // Use same IPC method as lobby-view
    ipcRenderer.send('connect-lobby-match', {
        ip: ip,
        port: port
    }, config.getWindowedMode());
    
    // Listen for game close event
    ipcRenderer.once('game-closed', (event, closeData) => {
        console.log('🎮 Game closed from Quick Match');
        // Go back to mode selection
        backToModeSelection();
    });
}

// UI Navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function showSearchingScreen(mode) {
    searchStartTime = Date.now();
    document.getElementById('current-mode').textContent = mode;
    showScreen('searching-screen');
}

function backToModeSelection() {
    currentMode = null;
    currentLobbyId = null;
    showScreen('mode-selection');
}

function showError(message) {
    document.getElementById('error-message').textContent = message;
    showScreen('error-screen');
}

// Cleanup on close
window.addEventListener('beforeunload', async (e) => {
    console.log('🔴 Quick Match window closing - cleanup...');
    
    // Stop all intervals
    if (searchInterval) {
        clearInterval(searchInterval);
        searchInterval = null;
    }
    if (queueStatsInterval) {
        clearInterval(queueStatsInterval);
        queueStatsInterval = null;
    }
    
    // Leave queue if in search
    if (currentMode) {
        try {
            await fetch(`${MASTER_SERVER_URL}/quickmatch/leave`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ netid: myNetId })
            });
            console.log('✅ Left queue on close');
        } catch (error) {
            console.error('Error leaving queue:', error);
        }
    }
});

// Also cleanup on page unload
window.addEventListener('unload', () => {
    if (searchInterval) clearInterval(searchInterval);
    if (queueStatsInterval) clearInterval(queueStatsInterval);
});
