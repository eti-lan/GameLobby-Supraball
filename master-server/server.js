const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const net = require('net');
const dgram = require('dgram');
const os = require('os');

// 🎮 Lobby System Modules
const LobbyManager = require('./lobby-manager');
const PortManager = require('./port-manager');
const ServerManager = require('./server-manager');

class SupraballMasterServer {
  constructor() {
    this.servers = new Map();
    this.matchmakingQueue = new Map();
    this.httpApp = express();
    this.tcpServer = net.createServer();
    this.udpServer = dgram.createSocket('udp4');
   
    this.lanIP = this.getLanIP();
    
    // Check for debug mode
    this.debugMode = process.argv.includes('--debug') || process.argv.includes('-d');
    
    // Cache for lobby state changes
    this.lobbyStateCache = new Map();
    
    // 🎮 Lobby System
    this.lobbyManager = new LobbyManager(this.debugMode);
    this.portManager = new PortManager(this.debugMode);
    this.serverManager = new ServerManager(this.portManager, this.debugMode);
    
    // Set callback for stopping servers when lobby is deleted
    this.lobbyManager.setStopServerCallback((lobbyId) => {
      this.serverManager.stopServer(lobbyId);
    });
    
    // 🎯 Quick Match System
    this.quickMatchQueue = new Map(); // netid -> player data
    this.quickMatchCheckInterval = null;
    
    console.log(`🌐 LAN-IP: ${this.lanIP}`);
    console.log(`🎮 Lobby System initialized`);
    console.log(`🎯 Quick Match System initialized`);
    if (this.debugMode) {
      console.log('🐛 Debug mode enabled');
    }
    
    this.setupHTTPServer();
    this.setupTCPServer();
    this.setupUDPServer();

    setInterval(() => this.cleanupServers(), 30000);
    setInterval(() => this.cleanupMatchmaking(), 60000);
    setInterval(() => this.cleanupQuickMatch(), 60000);
    
    // Check for quick matches every 2 seconds
    this.quickMatchCheckInterval = setInterval(() => this.checkQuickMatches(), 2000);
  }

  getLanIP() {
    const interfaces = os.networkInterfaces();
    for (const interfaceName in interfaces) {
      const networkInterface = interfaces[interfaceName];
      for (const address of networkInterface) {
        if (address.family === 'IPv4' && !address.internal) {
          return address.address;
        }
      }
    }
    return '127.0.0.1';
  }

  setupHTTPServer() {
    this.httpApp.use(cors());
    this.httpApp.use(bodyParser.json());
    this.httpApp.use(bodyParser.urlencoded({ extended: true }));

    // LOG ALL REQUESTS (only in debug mode)
    this.httpApp.use((req, res, next) => {
      if (this.debugMode) {
        console.log('\n==================== NEW REQUEST ====================');
        console.log(`${req.method} ${req.url}`);
        console.log(`From: ${req.ip}`);
        if (req.body && Object.keys(req.body).length > 0) {
          console.log(`Body:`, JSON.stringify(req.body, null, 2));
        }
        if (req.query && Object.keys(req.query).length > 0) {
          console.log(`Query:`, JSON.stringify(req.query, null, 2));
        }
   
        console.log('====================================================\n');
      }
      next();
    });

    // Web interface
    this.httpApp.get('/', (req, res) => {
      res.send(this.generateWebInterface());
    });

    // /update endpoint with compact response format
    this.httpApp.post('/update', (req, res) => {
      if (this.debugMode) {
        console.log('Supraball UPDATE Request:', JSON.stringify(req.body, null, 2));
      }
      const clientIP = req.ip.replace('::ffff:', '') === '127.0.0.1' ? this.lanIP : req.ip.replace('::ffff:', '');
      const data = req.body;
      const serverId = `${clientIP}:${data.port || 7777}`;
      const queryPort = parseInt(data.query_port) || 27015;
      
      const server = {
        id: serverId,
        ip: clientIP,
        port: parseInt(data.port) || 7777,
        name: data.title || data.name || 'Supraball Server',
        map: data.map || 'Unknown',
        gameMode: 'DBGame',
        players: parseInt(data.current_players) || 0,
        maxPlayers: parseInt(data.max_players) || 10,
        spectators: parseInt(data.current_spectators) || 0,
        maxSpectators: parseInt(data.max_spectators) || 6,
        queryPort: queryPort,
        ping: 0,
        lastSeen: Date.now(),
        version: data.ver || '0.16.5',
        matchmaking: data.matchmaking === true
      };
      
      this.servers.set(serverId, server);
      
      if (this.debugMode) {
        console.log(`Server registered: ${server.name} (${serverId})`);
      }
      
      // 🎯 Notify ServerManager if this is a lobby server
      if (this.serverManager) {
        // Use portToLobby map directly
        // This avoids the race condition where lobby.server isn't set yet
        const portToLobby = this.serverManager.portToLobby;
        const lobbyId = portToLobby.get(queryPort);
        
        if (lobbyId) {
          // Check if server is already registered to avoid spam
          const serverInfo = this.serverManager.servers.get(lobbyId);
          const isAlreadyRegistered = serverInfo && serverInfo.registered;
          
          if (!isAlreadyRegistered) {
            if (this.debugMode) {
              console.log(`🔍 Checking if QueryPort ${queryPort} belongs to a lobby...`);
              console.log(`   ServerManager exists: ${!!this.serverManager}`);
              console.log(`   portToLobby exists: ${!!this.serverManager.portToLobby}`);
              console.log(`   portToLobby.get(${queryPort}) = ${lobbyId}`);
            }
            console.log(`✅ First /update from lobby server ${lobbyId}! Marking as registered...`);
            
            try {
              const success = this.serverManager.notifyServerRegistered(queryPort);
              
              if (this.debugMode) {
                console.log(`   notifyServerRegistered() returned: ${success}`);
              }
              
              // Don't log here - will be logged in /start endpoint
              if (!success && this.debugMode) {
                console.log(`⚠️ notifyServerRegistered() returned false`);
              }
            } catch (error) {
              console.error(`❌ ERROR calling notifyServerRegistered():`, error);
            }
          }
          // Otherwise silently skip (server already registered)
        } else {
          if (this.debugMode) {
            console.log(`ℹ️ QueryPort ${queryPort} is not a lobby server (probably regular server)`);
            console.log(`   Known lobby ports: ${Array.from(portToLobby.keys()).join(', ') || 'none'}`);
          }
        }
      } else {
        if (this.debugMode) {
          console.log(`⚠️ ServerManager not available!`);
        }
      }
      
      // Build players array with bots for lobby matches
      const players = [];
      const botId = "0x0000000000000000";
      
      // Find lobby by query port
      let lobby = null;
      if (this.lobbyManager) {
        lobby = this.lobbyManager.getLobbyByQueryPort(queryPort);
      }
      
      if (lobby && lobby.settings.botsActive) {
        if (this.debugMode) {
          console.log(`🤖 /update: Found lobby ${lobby.name} with bots enabled`);
        }
        
        // Add human players from lobby with position per team
        let redPos = 0;
        let bluePos = 0;
        
        // Red team players
        lobby.players.red.forEach((p) => {
          players.push({
            "id": p.netid,
            "team": 0,  // Red = 0
            "pos": redPos++,
            "elo": p.elo || 1000
          });
        });
        
        // Blue team players
        lobby.players.blue.forEach((p) => {
          players.push({
            "id": p.netid,
            "team": 1,  // Blue = 1
            "pos": bluePos++,
            "elo": p.elo || 1000
          });
        });
        
        // Add bots
        const numHumans = lobby.players.red.length + lobby.players.blue.length;
        const numBotsNeeded = lobby.maxPlayers - numHumans;
        const botsPerTeam = Math.floor(numBotsNeeded / 2);
        const extraBot = numBotsNeeded % 2;
        
        // Red team bots
        for (let i = 0; i < botsPerTeam; i++) {
          players.push({
            "id": botId,
            "team": 0,
            "pos": redPos++,
            "elo": lobby.settings.botSkill || 1200
          });
        }
        
        // Blue team bots
        for (let i = 0; i < botsPerTeam + extraBot; i++) {
          players.push({
            "id": botId,
            "team": 1,
            "pos": bluePos++,
            "elo": lobby.settings.botSkill || 1200
          });
        }
        
        if (this.debugMode) {
          console.log(`🤖 /update: Sending ${players.length} players (${numHumans} humans + ${numBotsNeeded} bots)`);
        }
      } else {
        // Legacy system: Use matchmaking queue
        for (const [netid, playerData] of this.matchmakingQueue.entries()) {
          // Skip bots
          if (netid === "0x0000000000000000") continue;
          
          players.push({
            "id": netid,
            "team": playerData.team,
            "pos": playerData.position || 0,
            "elo": playerData.elo || 1000
          });
        }
      }
      
      // Limit to 12 players max to keep response under 2KB
      const limitedPlayers = players.slice(0, 12);
      
      if (this.debugMode) {
        console.log(`SENDING ${limitedPlayers.length} players to Game Server (${players.length} total, ${players.length - limitedPlayers.length} truncated)`);
        limitedPlayers.forEach(player => {
          console.log(`   � ${player.id} ? Team ${player.team} (${player.team === 0 ? 'RED' : 'BLUE'})`);
        });
      }
      
      const response = {
        success: true,
        id: serverId,
        timeout: 10,
        players: limitedPlayers,    // This is what UnrealScript expects!
        bOfficialMatchmaking: lobby && lobby.settings.botsActive ? true : false,
        bRanked: false
      };
      
      const responseSize = JSON.stringify(response).length;
      if (this.debugMode) {
        console.log(`Response size: ${responseSize} bytes ${responseSize > 2048 ? 'TOO LARGE!' : '? OK'}`);
      }
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).json(response);
    });

    // Client registration endpoint
    this.httpApp.post('/add_player', (req, res) => {
      const netid = req.body.netid || req.query.netid;
      const username = req.body.username || req.query.username || `Player_${netid?.substring(-6)}`;
      const action = req.body.action || 'add_player';
      const serverTarget = req.body.server_target;
      
      if (!netid) {
        res.status(400).json({"error": "netid required"});
        return;
      }
      
      // Auto-balance teams
      const teamCounts = { 0: 0, 1: 0 };
      for (const [id, player] of this.matchmakingQueue.entries()) {
        if (player.team === 0 || player.team === 1) {
          teamCounts[player.team]++;
        }
      }
      
      const assignedTeam = teamCounts[0] <= teamCounts[1] ? 0 : 1;
      
      // Add to matchmaking queue
      this.matchmakingQueue.set(netid, {
        username: username,
        team: assignedTeam,
        spectator: false,
        timestamp: Date.now(),
        lastSeen: Date.now(),
        requestCount: 0,
        server_target: serverTarget,
        client_registered: true,
        registration_source: req.ip
      });
      
      console.log(`👤 Client registered: ${username} (${netid}) from ${req.ip}`);
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).json({
        "result": true,
        "success": true,
        "netid": netid,
        "team": assignedTeam,
        "username": username,
        "spectator": false,
        "allowed": true,
        "message": "Client registered successfully"
      });
    });

    // GetPlayerInfo endpoint
    this.httpApp.get('/getPlayerInfo', (req, res) => {
      this.handleGetPlayerInfo(req, res);
    });

    this.httpApp.post('/getPlayerInfo', (req, res) => {
      this.handleGetPlayerInfo(req, res);
    });

    // Prepare endpoint
    // Called by game server to get player list with bots
    this.httpApp.post('/prepare', (req, res) => {
      console.log('\n🤖 ==================== PREPARE (BOT SPAWN) ====================');
      console.log('Request body:', req.body);
      console.log('Query port:', req.body.query_port || req.query.query_port);
      
      const queryPort = parseInt(req.body.query_port || req.query.query_port || req.body.QueryPort || req.query.QueryPort);
      
      if (!queryPort) {
        console.log('❌ No query port provided');
        return res.json({ players: [] });
      }
      
      // Find lobby by query port
      const lobby = this.lobbyManager.getLobbyByQueryPort(queryPort);
      
      if (!lobby) {
        console.log(`❌ No lobby found for query port ${queryPort}`);
        return res.json({ players: [] });
      }
      
      console.log(`✅ Found lobby: ${lobby.name} (${lobby.id})`);
      console.log(`   Bots active: ${lobby.settings.botsActive}`);
      console.log(`   Bot skill: ${lobby.settings.botSkill}`);
      console.log(`   MaxPlayers: ${lobby.maxPlayers}`);
      
      const players = [];
      const botId = "0x0000000000000000"; // Special bot ID
      
      // Add human players
      [...lobby.players.red, ...lobby.players.blue].forEach((player, index) => {
        players.push({
          id: player.netid,
          team: lobby.players.red.includes(player) ? 0 : 1,
          pos: index,
          elo: player.elo || 1200
        });
      });
      
      // Add bots if enabled
      if (lobby.settings.botsActive) {
        const numHumans = lobby.players.red.length + lobby.players.blue.length;
        const numBotsNeeded = lobby.maxPlayers - numHumans;
        
        console.log(`   Adding ${numBotsNeeded} bots (${lobby.maxPlayers} max - ${numHumans} humans)`);
        
        // Distribute bots evenly across teams
        const botsPerTeam = Math.floor(numBotsNeeded / 2);
        const extraBot = numBotsNeeded % 2;
        
        // Red team bots
        for (let i = 0; i < botsPerTeam; i++) {
          players.push({
            id: botId,
            team: 0,
            pos: lobby.players.red.length + i,
            elo: lobby.settings.botSkill || 1200
          });
        }
        
        // Blue team bots
        for (let i = 0; i < botsPerTeam + extraBot; i++) {
          players.push({
            id: botId,
            team: 1,
            pos: lobby.players.blue.length + i,
            elo: lobby.settings.botSkill || 1200
          });
        }
        
        console.log(`   Total players in response: ${players.length} (${numHumans} humans + ${numBotsNeeded} bots)`);
      }
      
      res.json({ players });
    });

    // ========================================
    // LOBBY SYSTEM API ENDPOINTS
    // ========================================
    
    // Get all lobbies
    this.httpApp.get('/lobbies', (req, res) => {
      const lobbies = this.lobbyManager.getAllLobbies();
      const stats = this.lobbyManager.getStats();
      res.json({ success: true, lobbies, stats });
    });
    
    // Get single lobby
    this.httpApp.get('/lobbies/:id', (req, res) => {
      const lobby = this.lobbyManager.getLobby(req.params.id);
      if (!lobby) {
        return res.status(404).json({ success: false, error: 'Lobby not found' });
      }
      
      // Only log if lobby state changed
      const redPlayers = lobby.redTeam.map(p => p.username).join(',');
      const bluePlayers = lobby.blueTeam.map(p => p.username).join(',');
      const currentState = `${lobby.status}|${redPlayers}|${bluePlayers}`;
      const cachedState = this.lobbyStateCache.get(req.params.id);
      
      if (this.debugMode && cachedState !== currentState) {
        console.log(`📤 Sending lobby data for ${req.params.id}:`);
        console.log(`   Red Team: ${lobby.redTeam.length} players -`, redPlayers || '(none)');
        console.log(`   Blue Team: ${lobby.blueTeam.length} players -`, bluePlayers || '(none)');
        this.lobbyStateCache.set(req.params.id, currentState);
      }
      
      res.json({ success: true, lobby });
    });
    
    // Create lobby
    this.httpApp.post('/lobbies/create', (req, res) => {
      if (this.debugMode) {
        console.log('\n🎮 ==================== CREATE LOBBY ====================');
        console.log('Request:', JSON.stringify(req.body, null, 2));
      }
      
      const result = this.lobbyManager.createLobby(req.body);
      
      // Don't log here - LobbyManager already logs it
      if (!result.success) {
        console.log(`❌ Failed to create lobby: ${result.error}`);
      }
      
      res.json(result);
    });
    
    // Join lobby
    this.httpApp.post('/lobbies/:id/join', (req, res) => {
      if (this.debugMode) {
        console.log(`\n🎮 JOIN LOBBY: ${req.params.id}`);
        console.log('Player:', req.body.netid, req.body.username);
      }
      
      const result = this.lobbyManager.joinLobby(req.params.id, req.body);
      res.json(result);
    });
    
    // Switch team
    this.httpApp.post('/lobbies/:id/switch-team', (req, res) => {
      const result = this.lobbyManager.switchTeam(req.params.id, req.body.netid, req.body.team);
      res.json(result);
    });
    
    // Set ready status
    this.httpApp.post('/lobbies/:id/ready', (req, res) => {
      if (this.debugMode) {
        console.log(`\n✅ READY: ${req.params.id}`);
        console.log('Player:', req.body.netid, 'Ready:', req.body.ready);
      }
      
      const result = this.lobbyManager.setReady(req.params.id, req.body.netid, req.body.ready);
      res.json(result);
    });
    
    // Leave lobby
    this.httpApp.post('/lobbies/:id/leave', (req, res) => {
      if (this.debugMode) {
        console.log(`\n👋 LEAVE LOBBY: ${req.params.id}`);
        console.log('Player:', req.body.netid);
      }
      
      const result = this.lobbyManager.leaveLobby(req.params.id, req.body.netid);
      res.json(result);
    });
    
    // Leave lobby
    this.httpApp.post('/lobbies/:id/leave', (req, res) => {
      console.log(`\n👋 LEAVE LOBBY: ${req.params.id} (NetID: ${req.body.netid})`);
      
      const result = this.lobbyManager.leaveLobby(req.params.id, req.body.netid);
      res.json(result);
    });
    
    // Update lobby settings
    this.httpApp.patch('/lobbies/:id/settings', (req, res) => {
      if (this.debugMode) {
        console.log(`\n⚙️ UPDATE SETTINGS: ${req.params.id}`);
        console.log('New settings:', JSON.stringify(req.body, null, 2));
      }
      
      const lobby = this.lobbyManager.getLobby(req.params.id);
      if (!lobby) {
        return res.status(404).json({ success: false, error: 'Lobby not found' });
      }
      
      // Check if requester is creator
      if (req.body.netid !== lobby.createdBy) {
        return res.status(403).json({ success: false, error: 'Only creator can update settings' });
      }
      
      // Check if lobby is still waiting (can't change settings after start)
      if (lobby.status !== 'waiting') {
        return res.status(400).json({ success: false, error: 'Cannot change settings after lobby started' });
      }
      
      const result = this.lobbyManager.updateSettings(req.params.id, req.body.settings);
      res.json(result);
    });
    
    // Start server for lobby
    this.httpApp.post('/lobbies/:id/start', async (req, res) => {
      console.log(`\n🚀 START SERVER: ${req.params.id}`);
      
      // Get RAW lobby object (not formatted)
      const lobby = this.lobbyManager.lobbies.get(req.params.id);
      if (!lobby) {
        return res.status(404).json({ success: false, error: 'Lobby not found' });
      }
      
      // Check if requester is in lobby
      const allPlayers = [...lobby.players.red, ...lobby.players.blue];
      const isInLobby = allPlayers.some(p => p.netid === req.body.netid);
      if (!isInLobby) {
        return res.status(403).json({ success: false, error: 'Not in lobby' });
      }
      
      // Check if enough players
      const totalPlayers = allPlayers.length;
      const maxPlayers = lobby.type === '3v3' ? 6 : 10;
      const requiredPerTeam = lobby.type === '3v3' ? 3 : 5;
  
      if (lobby.settings.botsActive) {
        // With bots: Minimum 1 player, rest will be automatically filled with bots
        if (totalPlayers < 1) {
          return res.status(400).json({ 
            success: false, 
            error: 'Need at least 1 player (Bots will fill remaining slots)' 
          });
        }
        console.log(`✅ Auto-Fill enabled: ${totalPlayers} players + ${maxPlayers - totalPlayers} bots = ${maxPlayers} total`);
      } else {
        // Without bots: Both teams must be full (3v3: 3 each, 5v5: 5 each)
        const redCount = lobby.players.red.length;
        const blueCount = lobby.players.blue.length;
        
        if (redCount < requiredPerTeam || blueCount < requiredPerTeam) {
          return res.status(400).json({ 
            success: false, 
            error: `Need ${requiredPerTeam} players per team (Red: ${redCount}/${requiredPerTeam}, Blue: ${blueCount}/${requiredPerTeam}) or enable Auto-Fill Bots` 
          });
        }
        console.log(`✅ Full teams: Red ${redCount}/${requiredPerTeam}, Blue ${blueCount}/${requiredPerTeam}`);
      }
      
      // Check if requester is creator (only creator can start)
      if (req.body.netid !== lobby.createdBy) {
        return res.status(403).json({ success: false, error: 'Only lobby creator can start the match' });
      }
      
      // Start server
      try {
        console.log(`\n🚀 Starting game server for ${lobby.name}...`);
        
        this.lobbyManager.setLobbyStatus(req.params.id, 'starting');
        
        const result = await this.serverManager.startServer(
          lobby,
          this.lobbyManager
        );
        
        if (this.debugMode) {
          console.log(`   startServer() returned:`, result.success ? 'SUCCESS' : 'FAILED');
        }
        
        if (!result.success) {
          this.lobbyManager.setLobbyStatus(req.params.id, 'error');
          return res.status(500).json(result);
        }
        
        if (this.debugMode) {
          console.log(`✅ Server process started, NOW WAITING for registration...`);
        }
        
        // ⏳ Wait until server registers at master server (max 30 seconds)
        const registrationStart = Date.now();
        const registered = await this.serverManager.waitForServerRegistration(req.params.id, 30000);
        const registrationTime = Date.now() - registrationStart;
        
        if (this.debugMode) {
          console.log(`   waitForServerRegistration() returned after ${registrationTime}ms:`, registered);
        }
        
        if (registered) {
          console.log(`🎮 Server READY! Client can connect now!`);
          this.lobbyManager.setLobbyStatus(req.params.id, 'ready');
          
          // ✅ Save server info in lobby for other clients
          this.lobbyManager.setLobbyServer(req.params.id, result.server);
          
          res.json({
            success: true,
            lobby: this.lobbyManager.getLobby(req.params.id),
            server: result.server,
            message: 'Server is ready for connections'
          });
        } else {
          console.warn(`⚠️ Server started but did not register within timeout`);
          this.lobbyManager.setLobbyStatus(req.params.id, 'starting');
          
          // ✅ Save server info anyway for other clients
          this.lobbyManager.setLobbyServer(req.params.id, result.server);
          
          res.json({
            success: true,
            lobby: this.lobbyManager.getLobby(req.params.id),
            server: result.server,
            message: 'Server starting (may take a moment)',
            warning: 'Server not yet registered, connection may fail'
          });
        }
      } catch (error) {
        console.error('❌ Error starting server:', error);
        this.lobbyManager.setLobbyStatus(req.params.id, 'error');
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    // Delete lobby
    this.httpApp.delete('/lobbies/:id', (req, res) => {
      if (this.debugMode) {
        console.log(`\n🗑️ DELETE LOBBY: ${req.params.id}`);
      }
      
      const lobby = this.lobbyManager.getLobby(req.params.id);
      if (!lobby) {
        return res.status(404).json({ success: false, error: 'Lobby not found' });
      }
      
      // Only creator or admin can delete
      if (req.body.netid !== lobby.createdBy) {
        return res.status(403).json({ success: false, error: 'Only creator can delete lobby' });
      }
      
      // Stop server if running
      if (lobby.server) {
        this.serverManager.stopServer(req.params.id);
      }
      
      const result = this.lobbyManager.deleteLobby(req.params.id);
      res.json(result);
    });
    
    // Get lobby system stats
    this.httpApp.get('/lobby-stats', (req, res) => {
      const lobbyStats = this.lobbyManager.getStats();
      const portStats = this.portManager.getStatus();
      const serverStats = this.serverManager.getStats();
      
      res.json({
        success: true,
        lobbies: lobbyStats,
        ports: portStats,
        servers: serverStats
      });
    });
    
    // ========================================
    // END LOBBY SYSTEM API
    // ========================================
    
    // ========================================
    // QUICK MATCH SYSTEM API
    // ========================================
    
    // Join quick match queue
    this.httpApp.post('/quickmatch/join', (req, res) => {
      const { netid, username, mode } = req.body;
      
      if (!netid) {
        return res.status(400).json({ success: false, error: 'netid required' });
      }
      
      const gameMode = mode || '3v3';
      if (gameMode !== '3v3' && gameMode !== '5v5') {
        return res.status(400).json({ success: false, error: 'mode must be 3v3 or 5v5' });
      }
      
      // Add to quick match queue
      this.quickMatchQueue.set(netid, {
        netid: netid,
        username: username || `Player_${netid.substring(netid.length - 6)}`,
        mode: gameMode,
        timestamp: Date.now(),
        status: 'searching'
      });
      
      console.log(`🎯 Quick Match: ${username} joined ${gameMode} queue`);
      
      // Immediately try to form a match
      this.checkQuickMatches();
      
      res.json({ 
        success: true, 
        inQueue: true,
        mode: gameMode,
        queueSize: this.getQueueSize(gameMode)
      });
    });
    
    // Leave quick match queue
    this.httpApp.post('/quickmatch/leave', (req, res) => {
      const { netid } = req.body;
      
      if (this.quickMatchQueue.has(netid)) {
        const player = this.quickMatchQueue.get(netid);
        this.quickMatchQueue.delete(netid);
        console.log(`🎯 Quick Match: ${player.username} left queue`);
        res.json({ success: true });
      } else {
        res.json({ success: false, error: 'Not in queue' });
      }
    });
    
    // Get quick match status
    this.httpApp.get('/quickmatch/status', (req, res) => {
      const netid = req.query.netid;
      
      if (!netid) {
        return res.status(400).json({ success: false, error: 'netid required' });
      }
      
      const player = this.quickMatchQueue.get(netid);
      
      if (!player) {
        return res.json({ 
          success: true, 
          inQueue: false 
        });
      }
      
      res.json({
        success: true,
        inQueue: true,
        status: player.status,
        mode: player.mode,
        queueSize: this.getQueueSize(player.mode),
        lobbyId: player.lobbyId,
        waitTime: Math.floor((Date.now() - player.timestamp) / 1000)
      });
    });
    
    // Get queue stats
    this.httpApp.get('/quickmatch/stats', (req, res) => {
      const stats = {
        '3v3': this.getQueueSize('3v3'),
        '5v5': this.getQueueSize('5v5'),
        total: this.quickMatchQueue.size
      };
      
      res.json({ success: true, stats });
    });
    
    // ========================================
    // END QUICK MATCH SYSTEM API
    // ========================================

    // Catch-all for any other endpoint
    this.httpApp.all('*', (req, res, next) => {
      const allParams = { ...req.query, ...req.body };
      const netid = allParams.steamid || allParams.netid || allParams.uniqueid;
      
      if (netid && netid.startsWith('0x01100001')) {
        console.log('EMERGENCY: FOUND THE MISSING NETID REQUEST! ');
        console.log(`NetID: ${netid} - This should fix the spectator problem!`);
        
        // Dynamic team assignment
        const teamCounts = { 0: 0, 1: 0 };
        for (const [id, player] of this.matchmakingQueue.entries()) {
          if (player.team === 0 || player.team === 1) {
            teamCounts[player.team]++;
          }
        }
        
        const assignedTeam = teamCounts[0] <= teamCounts[1] ? 0 : 1;
        const username = `Player_${netid.substring(-6)}`;
        
        console.log(`DYNAMIC REGISTRATION: ${netid} ? Team ${assignedTeam} (Red: ${teamCounts[0]}, Blue: ${teamCounts[1]})`);
        
        const fixResponse = {
          "result": true,
          "success": true,
          "netid": netid,
          "team": assignedTeam,
          "spectator": false,
          "allowed": true,
          "username": username,
          "error": null,
          "timestamp": Math.floor(Date.now() / 1000),
          "source": "dynamic-assignment"
        };
        
        // Add to matchmaking queue
        this.matchmakingQueue.set(netid, {
          username: username,
          team: assignedTeam,
          spectator: false,
          timestamp: Date.now(),
          lastSeen: Date.now(),
          requestCount: 1,
          dynamic_assignment: true,
          client_registered: true
        });
        
        console.log('EMERGENCY RESPONSE:', JSON.stringify(fixResponse, null, 2));
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json(fixResponse);
        return;
      }
      
      console.log(`Generic request - sending OK response`);
      res.status(200).send('OK');
    });

    // Start HTTP server on ALL INTERFACES
    this.httpApp.listen(8991, '0.0.0.0', () => {
      console.log('HTTP Master Server running on Port 8991');
      console.log('Web Interface: http://localhost:8991/');
      console.log(`LAN Access: http://${this.lanIP}:8991/\n`);
    });
  }

  setupTCPServer() {
    this.tcpServer = net.createServer((socket) => {
      socket.on('data', (data) => {
        try {
          this.handleTCPMessage(socket, data);
        } catch (error) {
          console.error('TCP Error:', error);
        }
      });
    });

    this.tcpServer.listen(28900, () => {
      console.log('TCP Master Server running on port 28900');
    });
  }

  setupUDPServer() {
    this.udpServer = dgram.createSocket('udp4');
    
    this.udpServer.on('message', (msg, rinfo) => {
      try {
        this.handleUDPMessage(msg, rinfo);
      } catch (error) {
        console.error('UDP Error:', error);
      }
    });

    this.udpServer.bind(28900, () => {
      console.log('UDP Master Server running on port 28900');
    });
  }

  handleTCPMessage(socket, data) {
    const message = data.toString('utf8');
    console.log('\n==================== TCP MESSAGE ====================');
    console.log(`From: ${socket.remoteAddress}:${socket.remotePort}`);
    console.log(`Content: ${message.substring(0, 500)}`);
    console.log('====================================================\n');
    
    socket.write('OK\n');
    socket.end();
  }

  handleUDPMessage(msg, rinfo) {
    const message = msg.toString('utf8');
    console.log(`UDP Message from ${rinfo.address}:${rinfo.port}: ${message.substring(0, 100)}...`);
  }

  handleGetPlayerInfo(req, res) {
    const steamid = req.query.steamid || req.query.netid || req.query.uniqueid;
    const lobbyId = req.query.lobbyId; // 🎮 NEW: Lobby-specific request
    const ranked = req.query.ranked === 'true';
    const is3v3 = req.query.is3v3 === 'true';
    
    if (this.debugMode) {
      console.log(`\n🎮 ==================== GETPLAYERINFO (LOBBY SYSTEM) ====================`);
      console.log(`📋 From: ${req.ip}`);
      console.log(`🆔 SteamID/NetID: ${steamid}`);
      console.log(`🏆 Lobby ID: ${lobbyId || 'none (global)'}`);
      console.log(`🎮 ================================================================\n`);
    }
    
    if (!steamid) {
      const tempNetId = `0x01100001${Math.random().toString(16).substring(2, 10).toUpperCase()}`;
      
      const fallbackResponse = {
        "result": true,
        "success": true,
        "netid": tempNetId,
        "team": 0,
        "spectator": false,
        "allowed": true,
        "username": "TempPlayer",
        "error": null,
        "timestamp": Math.floor(Date.now() / 1000)
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).json(fallbackResponse);
      return;
    }
    
    // 🎮 LOBBY SYSTEM: Search for NetID in all lobbies
    if (this.lobbyManager) {
      if (this.debugMode) {
        console.log(`🔍 Searching for ${steamid} in ${this.lobbyManager.lobbies.size} lobbies...`);
      }
      
      // Normalize NetID to uppercase for comparison
      const normalizedSteamId = steamid.toUpperCase();
      
      for (const [currentLobbyId, lobby] of this.lobbyManager.lobbies.entries()) {
        if (this.debugMode) {
          console.log(`   Checking lobby ${currentLobbyId} (status: ${lobby.status}, bots: ${lobby.settings.botsActive})`);
        }
        
        // Check only active lobbies (not finished/cancelled)
        if (lobby.status === 'finished' || lobby.status === 'cancelled') {
          if (this.debugMode) {
            console.log(`   ⏭️ Skipping lobby ${currentLobbyId} (status: ${lobby.status})`);
          }
          continue;
        }
        
        const allPlayers = [...lobby.players.red, ...lobby.players.blue];
        const player = allPlayers.find(p => p.netid.toUpperCase() === normalizedSteamId);
        
        if (this.debugMode) {
          console.log(`   Red team: ${lobby.players.red.map(p => p.netid).join(', ')}`);
          console.log(`   Blue team: ${lobby.players.blue.map(p => p.netid).join(', ')}`);
          console.log(`   Player found: ${player ? 'YES' : 'NO'}`);
        }
        
        if (player) {
          const playerTeam = player.team === 'red' ? 0 : 1;
          const teamName = player.team === 'red' ? 'RED' : 'BLUE';
          
          // 🤖 Build players array with bots if enabled
          const players = [];
          const botId = "0x0000000000000000";
          
          // Add all human players with position per team
          let redPos = 0;
          let bluePos = 0;
          
          allPlayers.forEach((p) => {
            const teamNum = p.team === 'red' ? 0 : 1;
            const pos = p.team === 'red' ? redPos++ : bluePos++;
            
            players.push({
              id: p.netid,
              team: teamNum,
              pos: pos,
              elo: p.elo || 1000
            });
          });
          
          // Add bots if enabled
          if (lobby.settings.botsActive) {
            const numHumans = allPlayers.length;
            const numBotsNeeded = lobby.maxPlayers - numHumans;
            
            if (this.debugMode) {
              console.log(`🤖 Adding ${numBotsNeeded} bots (${lobby.maxPlayers} max - ${numHumans} humans)`);
            }
            
            // Distribute bots evenly
            const botsPerTeam = Math.floor(numBotsNeeded / 2);
            const extraBot = numBotsNeeded % 2;
            
            // Red team bots - start from next available position
            for (let i = 0; i < botsPerTeam; i++) {
              players.push({
                id: botId,
                team: 0,
                pos: redPos++,
                elo: lobby.settings.botSkill || 1200
              });
            }
            
            // Blue team bots - start from next available position
            for (let i = 0; i < botsPerTeam + extraBot; i++) {
              players.push({
                id: botId,
                team: 1,
                pos: bluePos++,
                elo: lobby.settings.botSkill || 1200
              });
            }
            
            if (this.debugMode) {
              console.log(`🤖 Total in response: ${players.length} (${numHumans} humans + ${numBotsNeeded} bots)`);
            }
          }
          
          const serverIp = this.lanIP || this.getLanIP() || '127.0.0.1';
          const response = {
            "success": true,
            "id": `${serverIp}:${lobby.server?.gamePort || 7777}`,
            "timeout": 10,
            "players": players,
            "bOfficialMatchmaking": true,  // Must be true for bots to spawn!
            "bRanked": false
          };
          
          console.log(`✅ Player ${steamid} in lobby ${lobby.name} → Team ${playerTeam} (${teamName})`);
          
          if (this.debugMode) {
            console.log(`🏆 Lobby: ${lobby.name} (${currentLobbyId})`);
            console.log(`📤 Response:`, JSON.stringify(response, null, 2));
          }
          
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.status(200).json(response);
          return;
        }
      }
      
      console.log(`⚠️ Not found in any active lobby - using legacy system`);
    }
    
    // 🔧 LEGACY SYSTEM: Global Matchmaking Queue (Fallback)
    let playerData = this.matchmakingQueue.get(steamid);
    
    if (!playerData) {
      console.log(`🆕 NEW PLAYER: ${steamid} - Auto-assigning team...`);
      
      const teamCounts = { 0: 0, 1: 0 };
      for (const [netid, player] of this.matchmakingQueue.entries()) {
        if (player.team === 0 || player.team === 1) {
          teamCounts[player.team]++;
        }
      }
      
      let assignedTeam;
      const redCount = teamCounts[0];
      const blueCount = teamCounts[1];
      
      if (redCount < blueCount) {
        assignedTeam = 0;
      } else if (blueCount < redCount) {
        assignedTeam = 1;
      } else {
        const hash = steamid.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        assignedTeam = hash % 2;
      }
      
      const shortId = steamid.substring(Math.max(0, steamid.length - 6));
      const username = `Player_${shortId}`;
      
      playerData = {
        username: username,
        team: assignedTeam,
        timestamp: Date.now(),
        spectator: false,
        ranked: ranked,
        is3v3: is3v3,
        lastSeen: Date.now(),
        requestCount: 1,
        ip: req.ip
      };
      
      this.matchmakingQueue.set(steamid, playerData);
      
      console.log(`🎯 TEAM ASSIGNED: ${steamid} → Team ${assignedTeam} (${assignedTeam === 0 ? 'RED TEAM' : 'BLUE TEAM'})`);
    } else {
      playerData.lastSeen = Date.now();
      playerData.requestCount = (playerData.requestCount || 0) + 1;
      this.matchmakingQueue.set(steamid, playerData);
      
      console.log(`🔁 RETURNING PLAYER: ${steamid} → Team ${playerData.team} (Request #${playerData.requestCount})`);
    }
    
    const response = {
      "result": true,
      "success": true,
      "netid": steamid,
      "team": playerData.team,
      "spectator": false,
      "allowed": true,
      "username": playerData.username,
      "error": null,
      "ranked": ranked,
      "is3v3": is3v3,
      "timestamp": Math.floor(Date.now() / 1000),
      "requestCount": playerData.requestCount,
      "source": "legacy-matchmaking"
    };
    
    console.log(`📤 LEGACY RESPONSE:`, JSON.stringify(response, null, 2));
    console.log(`✅ Player should join ${response.team === 0 ? 'RED' : 'BLUE'} team!`);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(response);

  }

  cleanupServers() {
    const now = Date.now();
    const timeout = 60000;
    
    for (const [serverId, server] of this.servers) {
      if (now - server.lastSeen > timeout) {
        this.servers.delete(serverId);
        console.log(`Server removed: ${server.name} (${serverId})`);
      }
    }
  }

  cleanupMatchmaking() {
    const now = Date.now();
    const timeout = 300000;
    
    for (const [netId, player] of this.matchmakingQueue) {
      if (now - player.timestamp > timeout) {
        this.matchmakingQueue.delete(netId);
        console.log(`Player ${player.username} removed (timeout)`);
      }
    }
  }
  
  // 🎯 Quick Match System Functions
  
  cleanupQuickMatch() {
    const now = Date.now();
    const timeout = 120000; // 2 minutes timeout
    
    for (const [netId, player] of this.quickMatchQueue) {
      if (now - player.timestamp > timeout && player.status === 'searching') {
        this.quickMatchQueue.delete(netId);
        console.log(`🎯 Quick Match: ${player.username} removed (timeout)`);
      }
    }
  }
  
  getQueueSize(mode) {
    let count = 0;
    for (const player of this.quickMatchQueue.values()) {
      if (player.mode === mode && player.status === 'searching') {
        count++;
      }
    }
    return count;
  }
  
  checkQuickMatches() {
    // Check 3v3 queue
    this.tryFormMatch('3v3', 6);
    
    // Check 5v5 queue
    this.tryFormMatch('5v5', 10);
  }
  
  async tryFormMatch(mode, requiredPlayers) {
    // Get all searching players for this mode
    const waitingPlayers = Array.from(this.quickMatchQueue.values())
      .filter(p => p.mode === mode && p.status === 'searching');
    
    if (waitingPlayers.length < requiredPlayers) {
      return; // Not enough players
    }
    
    console.log(`\n🎯 ==================== QUICK MATCH FOUND ====================`);
    console.log(`   Mode: ${mode}`);
    console.log(`   Players: ${waitingPlayers.length}/${requiredPlayers}`);
    
    // Take first required players
    const matchPlayers = waitingPlayers.slice(0, requiredPlayers);
    
    // Balance teams (alternate assignment)
    const redTeam = [];
    const blueTeam = [];
    
    matchPlayers.forEach((player, index) => {
      if (index % 2 === 0) {
        redTeam.push(player);
      } else {
        blueTeam.push(player);
      }
    });
    
    console.log(`   Red Team: ${redTeam.map(p => p.username).join(', ')}`);
    console.log(`   Blue Team: ${blueTeam.map(p => p.username).join(', ')}`);
    
    // Select random map based on mode
    const maps3v3 = ['DB-SmallPitch', 'DB-Pitch']; // Smaller maps for 3v3
    const maps5v5 = ['DB-Stadium', 'DB-Beach', 'DB-Castle', 'DB-Hall', 'DB-Cave', 'DB-Volcano', 'DB-Desert', 'DB-Moon']; // Larger maps for 5v5
    
    const mapPool = mode === '3v3' ? maps3v3 : maps5v5;
    const randomMap = mapPool[Math.floor(Math.random() * mapPool.length)];
    
    console.log(`   Map: ${randomMap}`);
    
    // Create auto-lobby
    try {
      const lobbyData = {
        name: `Quick Match ${mode}`,
        type: mode,
        map: randomMap,
        createdBy: matchPlayers[0].netid,
        username: matchPlayers[0].username,
        settings: {
          timeLimit: 15,
          goalScore: null,
          mode: 'time',
          botsActive: false,
          warmupTime: 30,
          ranked: false
        }
      };
      
      const result = this.lobbyManager.createLobby(lobbyData);
      
      if (!result.success) {
        console.error(`❌ Failed to create auto-lobby: ${result.error}`);
        return;
      }
      
      const lobbyId = result.lobby.id;
      console.log(`✅ Auto-lobby created: ${lobbyId}`);
      
      // Add all players to lobby
      for (const player of matchPlayers) {
        const team = redTeam.includes(player) ? 'red' : 'blue';
        
        const joinResult = this.lobbyManager.joinLobby(lobbyId, {
          netid: player.netid,
          username: player.username,
          team: team
        });
        
        if (joinResult.success) {
          // Set player as ready
          this.lobbyManager.setReady(lobbyId, player.netid, true);
          
          // Update quick match status
          player.status = 'matched';
          player.lobbyId = lobbyId;
          
          console.log(`   ✅ ${player.username} added to ${team} team`);
        }
      }
      
      // Auto-start server after 5 seconds
      setTimeout(async () => {
        console.log(`🚀 Auto-starting server for quick match lobby ${lobbyId}...`);
        
        const lobby = this.lobbyManager.lobbies.get(lobbyId);
        if (!lobby) {
          console.error(`❌ Lobby ${lobbyId} no longer exists`);
          return;
        }
        
        this.lobbyManager.setLobbyStatus(lobbyId, 'starting');
        
        const serverResult = await this.serverManager.startServer(
          lobby,
          this.lobbyManager
        );
        
        if (serverResult.success) {
          console.log(`✅ Quick Match server started successfully`);
          
          // Wait for registration
          const registered = await this.serverManager.waitForServerRegistration(lobbyId, 30000);
          
          if (registered) {
            this.lobbyManager.setLobbyStatus(lobbyId, 'ready');
            this.lobbyManager.setLobbyServer(lobbyId, serverResult.server);
            console.log(`🎮 Quick Match ready! Players can connect.`);
          }
        } else {
          console.error(`❌ Failed to start quick match server: ${serverResult.error}`);
          this.lobbyManager.setLobbyStatus(lobbyId, 'error');
        }
      }, 5000);
      
      console.log(`🎯 ========================================================\n`);
      
    } catch (error) {
      console.error(`❌ Error forming quick match: ${error.message}`);
    }
  }

  prePopulateCommonNetIDs() {
    console.log('PRE-POPULATING common NetIDs...');
    
    const observedNetID = '0x011000011D71A65F';
    const commonNetIDs = [
      observedNetID,
      '0x01100001E0827FB7',
      '0x011000011D71A660',
      '0x011000011D71A661',
      '0x011000011D71A662',
      '0x0110000100000001',
      '0x0110000100000002'
    ];
    
    for (let i = 0; i < commonNetIDs.length; i++) {
      const netid = commonNetIDs[i];
      const team = i % 2;
      const username = netid === observedNetID ? 'ObservedPlayer' : `PrePop_${netid.substring(-6)}`;
      
      this.matchmakingQueue.set(netid, {
        username: username,
        team: team,
        spectator: false,
        position: i,           // Add position field
        elo: 1000,             // Add elo field
        timestamp: Date.now(),
        lastSeen: Date.now(),
        requestCount: 0,
        pre_populated: true
      });
      
      console.log(`PRE-POPULATED: ${netid} ? Team ${team} (${team === 0 ? 'RED' : 'BLUE'}) [${netid === observedNetID ? 'OBSERVED' : 'PREDICTED'}]`);
    }
    
    console.log(`? PRE-POPULATED ${commonNetIDs.length} common NetIDs`);
  }

  generateWebInterface() {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Supraball Master Server</title>
    <style>
        body { font-family: Arial; margin: 20px; background: #f0f0f0; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        h1 { color: #333; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Supraball Master Server</h1>
        <p style="text-align: center;">Server running on ALL interfaces: Port 8991</p>
        <p style="text-align: center;">Ready for GetPlayerInfo requests!</p>
        <p style="text-align: center; color: #666;">Last update: ${new Date().toLocaleString()}</p>
    </div>
</body>
</html>`;
  }
}

console.log('Supraball Master Server Emulator starting...');
console.log('=====================================');
const masterServer = new SupraballMasterServer();

process.on('SIGINT', () => {
  console.log('\nMaster Server shutting down...');
  if (masterServer.tcpServer) masterServer.tcpServer.close();
  if (masterServer.udpServer) masterServer.udpServer.close();
  process.exit(0);
});
