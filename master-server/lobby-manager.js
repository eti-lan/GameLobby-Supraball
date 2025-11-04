// 🎮 Lobby Manager - Management of all lobbies
// Date: 2025-10-20

const { v4: uuidv4 } = require('uuid');

class LobbyManager {
  constructor(debugMode = false) {
    this.debugMode = debugMode;
    
    this.lobbies = new Map();
    this.playerToLobby = new Map(); // netid -> lobby-id mapping
    
    this.MAX_LOBBIES = 4;
    this.LOBBY_TIMEOUT = 600000; // 10 minutes
    
    this.LOBBY_TYPES = {
      "3v3": { maxPlayers: 6, minPlayers: 2, playersPerTeam: 3 },
      "5v5": { maxPlayers: 10, minPlayers: 2, playersPerTeam: 5 }
    };
    
    // Callback for stopping servers
    this.stopServerCallback = null;
    
    // Cleanup timer - runs every 10 seconds
    setInterval(() => this.cleanupInactiveLobbies(), 10000);
  }
  
  // Set callback for stopping servers when lobby is deleted
  setStopServerCallback(callback) {
    this.stopServerCallback = callback;
  }
  
  // ✅ Create lobby
  createLobby(data) {
    if (this.lobbies.size >= this.MAX_LOBBIES) {
      return { success: false, error: "Maximum lobbies reached (4/4)" };
    }
    
    const lobbyType = this.LOBBY_TYPES[data.type];
    if (!lobbyType) {
      return { success: false, error: "Invalid lobby type. Use '3v3' or '5v5'" };
    }
    
    const lobbyId = uuidv4();
    const lobby = {
      id: lobbyId,
      name: data.name || `${data.type} Match`,
      type: data.type,
      map: data.map || "DB-Pitch",
      maxPlayers: lobbyType.maxPlayers,
      
      players: {
        red: [],
        blue: []
      },
      
      settings: {
        timeLimit: data.settings?.timeLimit || 15,
        goalScore: data.settings?.goalScore || null,
        mode: data.settings?.mode || 'time',
        botsActive: data.settings?.botsActive || false,
        botSkill: data.settings?.botSkill || 1250,
        warmupTime: data.settings?.warmupTime || 30,
        ranked: data.settings?.ranked || false
      },
      
      server: null, // Set when server is started
      
      status: "waiting", // waiting, starting, ready, running, finished
      
      created: Date.now(),
      createdBy: data.createdBy,
      lastActivity: Date.now()
    };
    
    // Insert lobby into Map FIRST
    this.lobbies.set(lobbyId, lobby);
    
    // Automatically add creator (AFTER inserting into Map)
    if (data.createdBy) {
      const joinResult = this.joinLobby(lobbyId, {
        netid: data.createdBy,
        username: data.username || `Player_${data.createdBy.substring(data.createdBy.length - 6)}`,
        team: 'red' // Creator always starts in Red Team
      });
      
      if (!joinResult.success) {
        console.error('Failed to add creator to lobby:', joinResult.error);
      } else {
        console.log(`✅ Creator ${data.username} added to lobby`);
      }
    }
    
    console.log(`✅ Lobby created: ${lobby.name} (${lobbyId}) by ${data.createdBy}`);
    
    return { success: true, lobby: this.getLobbyInfo(lobby) };
  }
  
  // ✅ Join lobby
  joinLobby(lobbyId, data) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      return { success: false, error: "Lobby not found" };
    }
    
    // Check if player is already in a lobby
    const existingLobby = this.playerToLobby.get(data.netid);
    if (existingLobby && existingLobby !== lobbyId) {
      // Automatically remove from old lobby
      console.log(`⚠️ Player ${data.netid} already in lobby ${existingLobby}, removing from old lobby...`);
      this.leaveLobby(existingLobby, { netid: data.netid });
    }
    
    // Check if lobby is full
    const totalPlayers = lobby.players.red.length + lobby.players.blue.length;
    if (totalPlayers >= lobby.maxPlayers) {
      return { success: false, error: "Lobby is full" };
    }
    
    // Check if player is already in lobby
    const inRed = lobby.players.red.find(p => p.netid === data.netid);
    const inBlue = lobby.players.blue.find(p => p.netid === data.netid);
    if (inRed || inBlue) {
      return { success: false, error: "Already in this lobby" };
    }
    
    // Determine team (balanced or explicitly chosen)
    let team = data.team;
    if (!team || (team !== 'red' && team !== 'blue')) {
      // Auto-balance
      team = lobby.players.red.length <= lobby.players.blue.length ? 'red' : 'blue';
    }
    
    // Add player
    const player = {
      netid: data.netid,
      username: data.username || `Player_${data.netid.substring(data.netid.length - 6)}`,
      ready: false,
      joinedAt: Date.now()
    };
    
    lobby.players[team].push(player);
    lobby.lastActivity = Date.now();
    
    this.playerToLobby.set(data.netid, lobbyId);
    
    console.log(`✅ ${player.username} joined ${lobby.name} (${team} team)`);
    console.log(`   Red: ${lobby.players.red.length}, Blue: ${lobby.players.blue.length}`);
    
    return { success: true, lobby: this.getLobbyInfo(lobby), team };
  }
  
  // ✅ Switch team
  switchTeam(lobbyId, netid, targetTeam) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      return { success: false, error: "Lobby not found" };
    }
    
    // Find player
    let player = null;
    let currentTeam = null;
    let playerIndex = -1;
    
    const redIndex = lobby.players.red.findIndex(p => p.netid === netid);
    if (redIndex >= 0) {
      player = lobby.players.red[redIndex];
      currentTeam = 'red';
      playerIndex = redIndex;
    } else {
      const blueIndex = lobby.players.blue.findIndex(p => p.netid === netid);
      if (blueIndex >= 0) {
        player = lobby.players.blue[blueIndex];
        currentTeam = 'blue';
        playerIndex = blueIndex;
      }
    }
    
    if (!player) {
      console.error(`❌ Player ${netid} not found in lobby ${lobbyId}`);
      return { success: false, error: "Player not in lobby" };
    }
    
    // If no target team specified, switch to other team
    const newTeam = targetTeam || (currentTeam === 'red' ? 'blue' : 'red');
    
    // Already in desired team?
    if (currentTeam === newTeam) {
      console.log(`⚠️ ${player.username} already in ${newTeam} team`);
      return { success: false, error: "Already in that team" };
    }
    
    // Check if new team is full
    const lobbyType = this.LOBBY_TYPES[lobby.type];
    if (lobby.players[newTeam].length >= lobbyType.playersPerTeam) {
      console.log(`⚠️ ${newTeam} team is full (${lobby.players[newTeam].length}/${lobbyType.playersPerTeam})`);
      return { success: false, error: `${newTeam} team is full` };
    }
    
    // Move player - IMPORTANT: Use index directly
    lobby.players[currentTeam].splice(playerIndex, 1);
    lobby.players[newTeam].push(player);
    
    player.ready = false; // Reset ready status
    lobby.lastActivity = Date.now();
    
    console.log(`🔄 ${player.username}: ${currentTeam} → ${newTeam} (Red: ${lobby.players.red.length}, Blue: ${lobby.players.blue.length})`);
    
    return { success: true, lobby: this.getLobbyInfo(lobby), team: newTeam };
  }
  
  // ✅ Change ready status
  setReady(lobbyId, netid, ready) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      return { success: false, error: "Lobby not found" };
    }
    
    // Find player and set ready status
    let player = lobby.players.red.find(p => p.netid === netid);
    if (!player) {
      player = lobby.players.blue.find(p => p.netid === netid);
    }
    
    if (!player) {
      return { success: false, error: "Player not in lobby" };
    }
    
    player.ready = ready;
    lobby.lastActivity = Date.now();
    
    console.log(`✅ ${player.username} is ${ready ? 'READY' : 'NOT READY'} in ${lobby.name}`);
    
    return { success: true, lobby: this.getLobbyInfo(lobby), allReady: this.checkAllReady(lobby) };
  }
  
  // ✅ Leave lobby
  leaveLobby(lobbyId, netid) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      return { success: false, error: "Lobby not found" };
    }
    
    // Remove player from Red Team
    let removed = false;
    let username = null;
    
    const redIndex = lobby.players.red.findIndex(p => p.netid === netid);
    if (redIndex >= 0) {
      username = lobby.players.red[redIndex].username;
      lobby.players.red.splice(redIndex, 1);
      removed = true;
    } else {
      // Remove from Blue Team
      const blueIndex = lobby.players.blue.findIndex(p => p.netid === netid);
      if (blueIndex >= 0) {
        username = lobby.players.blue[blueIndex].username;
        lobby.players.blue.splice(blueIndex, 1);
        removed = true;
      }
    }
    
    if (!removed) {
      return { success: false, error: "Player not in lobby" };
    }
    
    this.playerToLobby.delete(netid);
    lobby.lastActivity = Date.now();
    
    console.log(`✅ ${username} left ${lobby.name}`);
    
    // Delete lobby if empty
    const totalPlayers = lobby.players.red.length + lobby.players.blue.length;
    if (totalPlayers === 0) {
      this.deleteLobby(lobbyId);
      return { success: true, lobbyDeleted: true };
    }
    
    return { success: true, lobby };
  }
  
  // ✅ Update lobby settings
  updateSettings(lobbyId, newSettings) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      return { success: false, error: "Lobby not found" };
    }
    
    // Update settings
    if (newSettings.map) {
      lobby.map = newSettings.map;
    }
    
    if (newSettings.mode) {
      lobby.settings.mode = newSettings.mode;
    }
    
    if (newSettings.timeLimit !== undefined) {
      lobby.settings.timeLimit = parseInt(newSettings.timeLimit);
    }
    
    if (newSettings.goalScore !== undefined) {
      lobby.settings.goalScore = parseInt(newSettings.goalScore);
    }
    
    if (newSettings.botsActive !== undefined) {
      lobby.settings.botsActive = newSettings.botsActive;
    }
    
    if (newSettings.botSkill !== undefined) {
      lobby.settings.botSkill = parseInt(newSettings.botSkill);
    }
    
    if (newSettings.warmupTime !== undefined) {
      lobby.settings.warmupTime = parseInt(newSettings.warmupTime);
    }
    
    lobby.lastActivity = Date.now();
    
    console.log(`✅ Settings updated for ${lobby.name}`);
    console.log(`   Map: ${lobby.map}`);
    console.log(`   Mode: ${lobby.settings.mode}`);
    console.log(`   Time/Goals: ${lobby.settings.mode === 'time' ? lobby.settings.timeLimit + ' min' : lobby.settings.goalScore + ' goals'}`);
    console.log(`   Bots: ${lobby.settings.botsActive ? 'Yes (Skill ' + lobby.settings.botSkill + ')' : 'No'}`);
    
    return { success: true, lobby: this.getLobbyInfo(lobby) };
  }
  
  // ✅ Delete lobby
  deleteLobby(lobbyId) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      return { success: false, error: "Lobby not found" };
    }
    
    // Stop server if running (via callback to server manager)
    // Always try to stop, even if lobby.server is not set - ServerManager will check
    if (this.stopServerCallback) {
      console.log(`🛑 Stopping server for lobby ${lobbyId} before deletion...`);
      try {
        this.stopServerCallback(lobbyId);
      } catch (error) {
        console.error(`❌ Error stopping server: ${error.message}`);
      }
    }
    
    // Remove all players
    [...lobby.players.red, ...lobby.players.blue].forEach(player => {
      this.playerToLobby.delete(player.netid);
    });
    
    this.lobbies.delete(lobbyId);
    
    console.log(`🗑️ Lobby deleted: ${lobby.name} (${lobbyId})`);
    
    return { success: true };
  }
  
  // ✅ Get all lobbies
  getAllLobbies() {
    const lobbies = [];
    for (const [id, lobby] of this.lobbies) {
      lobbies.push(this.getLobbyInfo(lobby));
    }
    return lobbies;
  }
  
  // ✅ Get single lobby
  getLobby(lobbyId) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      return null;
    }
    return this.getLobbyInfo(lobby);
  }
  
  // ✅ Find lobby by Query Port (for /prepare endpoint)
  getLobbyByQueryPort(queryPort) {
    for (const [lobbyId, lobby] of this.lobbies) {
      if (lobby.server && lobby.server.queryPort === queryPort) {
        return lobby; // Return raw lobby object, not formatted
      }
    }
    return null;
  }
  
  // ✅ Format lobby info (for client)
  getLobbyInfo(lobby) {
    const totalPlayers = lobby.players.red.length + lobby.players.blue.length;
    const allReady = this.checkAllReady(lobby);
    
    return {
      id: lobby.id,
      name: lobby.name,
      type: lobby.type,
      map: lobby.map,
      maxPlayers: lobby.maxPlayers,
      playerCount: totalPlayers,
      
      // Client expects redTeam/blueTeam
      redTeam: lobby.players.red.map(p => ({
        netid: p.netid,
        username: p.username,
        ready: p.ready,
        team: 'red'
      })),
      blueTeam: lobby.players.blue.map(p => ({
        netid: p.netid,
        username: p.username,
        ready: p.ready,
        team: 'blue'
      })),
      
      settings: lobby.settings,
      server: lobby.server,
      status: lobby.status,
      allReady: allReady,
      canStart: allReady && totalPlayers >= this.LOBBY_TYPES[lobby.type].minPlayers,
      
      created: lobby.created,
      createdBy: lobby.createdBy
    };
  }
  
  // ✅ Check if all players are ready
  checkAllReady(lobby) {
    const allPlayers = [...lobby.players.red, ...lobby.players.blue];
    if (allPlayers.length === 0) return false;
    return allPlayers.every(p => p.ready);
  }
  
  // ✅ Add server info to lobby
  setServerInfo(lobbyId, serverInfo) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return false;
    
    lobby.server = serverInfo;
    lobby.status = serverInfo.status || 'ready';
    lobby.lastActivity = Date.now();
    
    if (this.debugMode) {
      console.log(`✅ Server info added to ${lobby.name}: Port ${serverInfo.port}`);
    }
    
    return true;
  }
  
  // ✅ Change lobby status
  setLobbyStatus(lobbyId, status) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return false;
    
    lobby.status = status;
    lobby.lastActivity = Date.now();
    
    if (this.debugMode) {
      console.log(`✅ ${lobby.name} status: ${status}`);
    }
    
    return true;
  }
  
  // ✅ Save server info in lobby
  setLobbyServer(lobbyId, serverInfo) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return false;
    
    lobby.server = serverInfo;
    lobby.lastActivity = Date.now();
    
    if (this.debugMode) {
      console.log(`✅ ${lobby.name} server info saved: ${serverInfo.ip}:${serverInfo.port}`);
    }
    
    return true;
  }
  
  // 🧹 Clean up inactive lobbies
  cleanupInactiveLobbies() {
    const now = Date.now();
    
    for (const [id, lobby] of this.lobbies) {
      // Delete lobbies without players after 30 seconds
      const totalPlayers = lobby.players.red.length + lobby.players.blue.length;
      const inactiveTime = now - lobby.lastActivity;
      
      if (totalPlayers === 0 && inactiveTime > 30000) {
        console.log(`🧹 Cleanup: Removing empty lobby "${lobby.name}" (empty for ${Math.round(inactiveTime/1000)}s)`);
        this.deleteLobby(id);
        continue;
      }
      
      // Delete old waiting lobbies
      if (lobby.status === 'waiting' && now - lobby.created > this.LOBBY_TIMEOUT) {
        console.log(`⏰ Lobby timeout: ${lobby.name} (created ${Math.round((now - lobby.created)/1000/60)}min ago)`);
        this.deleteLobby(id);
      }
    }
  }
  
  // 📊 Statistics
  getStats() {
    let totalPlayers = 0;
    let readyPlayers = 0;
    
    for (const [id, lobby] of this.lobbies) {
      const allPlayers = [...lobby.players.red, ...lobby.players.blue];
      totalPlayers += allPlayers.length;
      readyPlayers += allPlayers.filter(p => p.ready).length;
    }
    
    return {
      activeLobbies: this.lobbies.size,
      maxLobbies: this.MAX_LOBBIES,
      totalPlayers: totalPlayers,
      readyPlayers: readyPlayers,
      availableSlots: this.MAX_LOBBIES - this.lobbies.size
    };
  }
}

module.exports = LobbyManager;
