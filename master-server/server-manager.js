// 🖥️ Server Manager - Management of Game Server Processes
// Date: 2025-10-20

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const EventEmitter = require('events');
const fs = require('fs');

class ServerManager extends EventEmitter {
  constructor(portManager, debugMode = false) {
    super();
    this.portManager = portManager;
    this.debugMode = debugMode;
    this.servers = new Map(); // lobbyId -> server process info
    this.portToLobby = new Map(); // queryPort -> lobbyId mapping
    
    // Path to UDK.exe - flexible for different execution locations
    // Options:
    // 1. As Node.js: master-server/server.js -> ../Server/...
    // 2. As .exe in _dist/master-server: -> ../../Server/...
    // 3. As .exe in main directory: -> ./Server/...
    const basePath = process.pkg ? path.dirname(process.execPath) : path.join(__dirname, '..');
    
    // Try different possible paths
    const possiblePaths = [
      path.join(basePath, 'Server', 'Binaries', 'Win64', 'UDK.exe'),           // From main directory
      path.join(basePath, '..', 'Server', 'Binaries', 'Win64', 'UDK.exe'),     // From _dist/master-server
      path.join(basePath, '..', '..', 'Server', 'Binaries', 'Win64', 'UDK.exe') // Fallback
    ];
    
    this.UDK_PATH = null;
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        this.UDK_PATH = testPath;
        break;
      }
    }
    
    if (!this.UDK_PATH) {
      console.warn('⚠️ WARNING: UDK.exe not found in any expected location!');
      this.UDK_PATH = possiblePaths[0]; // Use first path as fallback
    }
    
    // Server start timeout
    this.START_TIMEOUT = 10000; // 10 seconds - faster for testing
    
    console.log(`🖥️ Server Manager initialized`);
    console.log(`   UDK Path: ${this.UDK_PATH}`);
    console.log(`   UDK exists: ${fs.existsSync(this.UDK_PATH)}`);
    console.log(`   Running as ${process.pkg ? 'packaged exe' : 'Node.js script'}`);
    
    // Cleanup on process end
    process.on('exit', () => this.cleanupAll());
    process.on('SIGINT', () => {
      this.cleanupAll();
      process.exit();
    });
  }
  
  // ✅ Start server
  async startServer(lobby, lobbyManager) {
    if (this.debugMode) {
      console.log(`\n🚀 ==================== STARTING SERVER ====================`);
      console.log(`   Lobby: ${lobby.name} (${lobby.id})`);
      console.log(`   Type: ${lobby.type}`);
      console.log(`   Map: ${lobby.map}`);
    }
    
    try {
      // 1. Allocate ports
      if (!this.portManager.hasAvailablePorts()) {
        throw new Error("No ports available. Maximum 4 servers running.");
      }
      
      const ports = this.portManager.allocate(lobby.id);
      
      if (this.debugMode) {
        console.log(`   Game Port: ${ports.gamePort}`);
        console.log(`   Query Port: ${ports.queryPort}`);
      }
      
      // 2. Create server parameters
      const params = this.buildServerParams(lobby, ports);
      
      if (this.debugMode) {
        console.log(`   Full Command: UDK.exe server ${params}`);
      }
      
      // 2.5. UPDATE INI FILE before starting server
      // CRITICAL: UDKDeathball.ini has bMatchmaking that must be TRUE!
      const basePath = process.pkg ? path.dirname(process.execPath) : path.join(__dirname, '..');
      
      // Try different possible paths for the INI
      const possibleIniPaths = [
        path.join(basePath, 'Server', 'UDKGame', 'Config', 'UDKDeathball.ini'),
        path.join(basePath, '..', 'Server', 'UDKGame', 'Config', 'UDKDeathball.ini'),
        path.join(basePath, '..', '..', 'Server', 'UDKGame', 'Config', 'UDKDeathball.ini')
      ];
      
      let iniPath = null;
      for (const testPath of possibleIniPaths) {
        if (fs.existsSync(testPath)) {
          iniPath = testPath;
          break;
        }
      }
      
      if (iniPath) {
        if (this.debugMode) {
          console.log(`   📝 Updating ${iniPath} with matchmaking settings...`);
        }
      
        try {
          let iniContent = fs.readFileSync(iniPath, 'utf8');
          
          // Ensure bMatchmaking=True in [DBGame.DBGame] section
          iniContent = iniContent.replace(/^bMatchmaking=.*/m, 'bMatchmaking=True');
          
          fs.writeFileSync(iniPath, iniContent, 'utf8');
          
          if (this.debugMode) {
            console.log(`   ✅ INI updated: bMatchmaking=True`);
          }
        } catch (error) {
          console.error(`   ⚠️ Failed to update INI: ${error.message}`);
        }
      } else {
        if (this.debugMode) {
          console.warn(`   ⚠️ INI file not found - using first path attempt: ${possibleIniPaths[0]}`);
        }
      }
      
      // 3. Start UDK.exe
      // CRITICAL: UDK.exe expects parameters WITHOUT quotes!
      // server-test.cmd: server DB-Pitch?params... -port=7777 ...
      // NOT: server "DB-Pitch?params..." -port=7777 ...
      
      // We must use cmd.exe because spawn() automatically adds quotes
      const fullCommand = `server ${params} -port=${ports.gamePort} -multihome=0.0.0.0 -unattended -log -FORCELOGFLUSH -ini=DBGameServer.ini`;
      
      // Determine Working Directory flexibly (basePath should be same as UDK_PATH)
      const serverBasePath = process.pkg ? path.dirname(process.execPath) : path.join(__dirname, '..');
      const possibleWorkingDirs = [
        path.join(serverBasePath, 'Server'),
        path.join(serverBasePath, '..', 'Server'),
        path.join(serverBasePath, '..', '..', 'Server')
      ];
      
      let serverWorkingDir = null;
      for (const testDir of possibleWorkingDirs) {
        if (fs.existsSync(testDir)) {
          serverWorkingDir = testDir;
          break;
        }
      }
      
      if (!serverWorkingDir) {
        serverWorkingDir = possibleWorkingDirs[0]; // Fallback
        if (this.debugMode) {
          console.warn(`   ⚠️ Working directory not found - using fallback: ${serverWorkingDir}`);
        }
      }
      
      if (this.debugMode) {
        console.log(`   Starting: ${this.UDK_PATH}`);
        console.log(`   Working Dir: ${serverWorkingDir}`);
        console.log(`   Full command: ${fullCommand}`);
      }
      
      // Use cmd.exe /c start to start it EXACTLY like server-test.cmd
      const serverProcess = spawn('cmd.exe', [
        '/c',
        'start',
        '"Supraball Server"',
        `"${this.UDK_PATH}"`,
        'server',
        params,
        `-port=${ports.gamePort}`,
        '-multihome=0.0.0.0',
        '-unattended',
        '-log',
        '-FORCELOGFLUSH',
        '-ini=DBGameServer.ini'
      ], {
        cwd: serverWorkingDir,
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true
      });
      
      if (this.debugMode) {
        console.log(`   Process ID: ${serverProcess.pid}`);
      }
      
      // 4. Save server info
      const serverInfo = {
        lobbyId: lobby.id,
        pid: serverProcess.pid,
        gamePort: ports.gamePort,
        queryPort: ports.queryPort,
        process: serverProcess,
        status: 'starting',
        startedAt: Date.now(),
        logs: [],
        registered: false  // Becomes true when /update is called
      };
      
      this.servers.set(lobby.id, serverInfo);
      this.portToLobby.set(ports.queryPort, lobby.id);  // Mapping for /update lookup
      
      // 5. Output handler
      serverProcess.stdout.on('data', (data) => {
        const log = data.toString().trim();
        if (log) {
          serverInfo.logs.push({ time: Date.now(), type: 'stdout', message: log });
          console.log(`   [${lobby.name}] ${log.substring(0, 100)}`);
          
          // Check for successful start
          if (log.includes('SERVER READY') || log.includes('Level loaded successfully')) {
            serverInfo.status = 'ready';
            console.log(`   ✅ Server is READY!`);
          }
        }
      });
      
      serverProcess.stderr.on('data', (data) => {
        const log = data.toString().trim();
        if (log) {
          serverInfo.logs.push({ time: Date.now(), type: 'stderr', message: log });
          console.error(`   [${lobby.name}] ERROR: ${log.substring(0, 100)}`);
        }
      });
      
      serverProcess.on('error', (error) => {
        console.error(`   ❌ Server process error: ${error.message}`);
        serverInfo.status = 'error';
        serverInfo.error = error.message;
      });
      
      serverProcess.on('exit', (code, signal) => {
        console.log(`   🛑 Server process exited: code=${code}, signal=${signal}`);
        
        // NOTE: Don't release ports or delete serverInfo here!
        // The process is started with "cmd /c start" which exits immediately,
        // but the actual UDK.exe keeps running in the background.
        // Only release ports when stopServer() is explicitly called.
        
        // Just update status for logging
        if (serverInfo) {
          serverInfo.exitCode = code;
          serverInfo.processExited = true;
        }
        
        // Don't change lobby status here - server is still running
      });
      
      // 6. Add server info to lobby (immediately, still in 'starting' status)
      const publicServerInfo = {
        port: ports.gamePort,
        queryPort: ports.queryPort,
        pid: serverProcess.pid,
        status: 'starting',
        ip: this.getLanIP()
      };
      
      lobbyManager.setServerInfo(lobby.id, publicServerInfo);
      
      if (this.debugMode) {
        console.log(`🚀 Server process started successfully`);
        console.log(`🚀 ========================================================\n`);
      }
      
      // Return immediately with success, but status='starting'
      // The caller must then use waitForServerRegistration()!
      return { success: true, server: publicServerInfo };
      
    } catch (error) {
      console.error(`❌ Failed to start server: ${error.message}`);
      
      // Release ports if allocated
      if (this.portManager.getPorts(lobby.id)) {
        this.portManager.release(lobby.id);
      }
      
      return { success: false, error: error.message };
    }
  }
  
  // ✅ Stop server
  async stopServer(lobbyId) {
    // Get ports FIRST before anything is deleted
    const ports = this.portManager.getPorts(lobbyId);
    
    const serverInfo = this.servers.get(lobbyId);
    if (!serverInfo) {
      console.warn(`⚠️ No server found for lobby ${lobbyId}`);
      
      // Try to stop by port if we have it from PortManager
      if (ports && ports.gamePort) {
        console.log(`🔍 No serverInfo, but found ports - killing by port ${ports.gamePort}...`);
        const result = await this.stopServerByPort(ports.gamePort, lobbyId);
        
        // Cleanup
        this.portManager.release(lobbyId);
        return result;
      }
      
      // No server info and no ports - nothing to do
      console.log(`ℹ️ No server or ports found for lobby ${lobbyId} - nothing to stop`);
      return { success: true, message: "No server to stop" };
    }
    
    console.log(`🛑 Stopping server for lobby ${lobbyId} (PID: ${serverInfo.pid || 'unknown'})`);
    
    try {
      // Get game port for killing
      let gamePort = serverInfo.gamePort || serverInfo.port;
      
      // If still no port in serverInfo, use port from PortManager (already fetched above)
      if (!gamePort && ports) {
        gamePort = ports.gamePort;
      }
      
      if (gamePort) {
        // ALWAYS kill by port on Windows because PID is from cmd.exe, not UDK.exe
        if (os.platform() === 'win32') {
          console.log(`🔫 Killing server by port ${gamePort}...`);
          await this.stopServerByPort(gamePort, lobbyId);
        } else if (serverInfo.pid) {
          // Unix: kill by PID if available
          process.kill(serverInfo.pid, 'SIGTERM');
        } else {
          console.error(`❌ Cannot stop server: No PID on Unix system`);
          // Still cleanup
          this.portManager.release(lobbyId);
          this.servers.delete(lobbyId);
          return { success: false, error: "No PID available on Unix" };
        }
      } else {
        console.error(`❌ Cannot stop server: No port information available`);
        // Still cleanup
        this.portManager.release(lobbyId);
        this.servers.delete(lobbyId);
        return { success: false, error: "No port available" };
      }
      
      // Wait until process is terminated
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Cleanup
      this.portManager.release(lobbyId);
      this.servers.delete(lobbyId);
      
      console.log(`✅ Server stopped successfully`);
      
      return { success: true };
      
    } catch (error) {
      console.error(`❌ Failed to stop server: ${error.message}`);
      // Still cleanup even on error
      this.portManager.release(lobbyId);
      this.servers.delete(lobbyId);
      return { success: false, error: error.message };
    }
  }
  
  // ✅ Stop server by port (Windows only)
  async stopServerByPort(port, lobbyId) {
    if (os.platform() !== 'win32') {
      console.warn(`⚠️ Stop by port only supported on Windows`);
      return { success: false, error: "Platform not supported" };
    }
    
    try {
      console.log(`🔍 Finding process using port ${port}...`);
      
      // Use netstat to find PID
      const { exec } = require('child_process');
      const netstatOutput = await new Promise((resolve, reject) => {
        exec(`netstat -ano | findstr :${port}`, (error, stdout, stderr) => {
          if (error) {
            // Port might not be in use anymore
            console.warn(`⚠️ netstat error (port ${port} might be closed): ${error.message}`);
            resolve('');
            return;
          }
          resolve(stdout);
        });
      });
      
      if (!netstatOutput || netstatOutput.trim() === '') {
        console.log(`ℹ️ No process found using port ${port} - might already be closed`);
        return { success: true, message: "Port not in use" };
      }
      
      if (this.debugMode) {
        console.log(`   netstat output:\n${netstatOutput}`);
      }
      
      // Parse PID from netstat output - look for ANY line with the port
      const lines = netstatOutput.split('\n');
      let killedAny = false;
      
      for (const line of lines) {
        if (line.trim() === '') continue;
        
        // Match any line that contains the port (not just LISTENING/ESTABLISHED)
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        
        if (pid && pid !== '0' && /^\d+$/.test(pid)) {
          console.log(`✅ Found PID ${pid} for port ${port}, killing...`);
          
          // Use exec to wait for taskkill to complete
          await new Promise((resolve) => {
            exec(`taskkill /PID ${pid} /F /T`, (error, stdout, stderr) => {
              if (error) {
                console.error(`   ⚠️ taskkill error: ${error.message}`);
              } else if (this.debugMode) {
                console.log(`   ✅ Process ${pid} killed`);
              }
              resolve();
            });
          });
          
          killedAny = true;
          break; // Only kill first matching PID
        }
      }
      
      if (!killedAny) {
        console.warn(`⚠️ No valid PID found in netstat output for port ${port}`);
      }
      
      return { success: true };
      
    } catch (error) {
      console.error(`❌ Failed to stop server by port: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
  
  // ✅ Create server parameters (based on server-test.cmd)
  buildServerParams(lobby, ports) {
    let params = lobby.map;
    
    // IMPORTANT: MaxPlayers must always be 6 (3v3) or 10 (5v5)!
    const maxPlayers = lobby.type === '3v3' ? 6 : 10;
    
    // Count number of human players
    const numHumanPlayers = lobby.players.red.length + lobby.players.blue.length;
    
    console.log(`   📊 Lobby Type: ${lobby.type}`);
    console.log(`   📊 MaxPlayers enforced: ${maxPlayers} (from lobby.maxPlayers: ${lobby.maxPlayers})`);
    console.log(`   📊 Current players: Red ${lobby.players.red.length}, Blue ${lobby.players.blue.length}`);
    console.log(`   📊 Human Players: ${numHumanPlayers}`);
    console.log(`   📊 Bots active: ${lobby.settings.botsActive}`);
    
    // IMPORTANT: Exact order like server-test.cmd!
    // 1. NumPlay (MUST come before MaxPlayers!)
    // NumPlay = Number of human players (not bots!)
    // With bots: Use NumPlay=0 like server-test.cmd so ALL slots filled with bots
    // Humans will replace bots when they connect
    if (lobby.settings.botsActive) {
      params += `?NumPlay=0`;
      console.log(`   📊 NumPlay=0 (bots fill all ${maxPlayers} slots, humans replace bots on connect)`);
    } else {
      params += `?NumPlay=${numHumanPlayers}`;
      console.log(`   📊 NumPlay=${numHumanPlayers} (no bots)`);
    }
    
    // 2. MaxPlayers - ALWAYS 6 or 10!
    params += `?MaxPlayers=${maxPlayers}`;
    
    // 3. bIsLanMatch
    params += `?bIsLanMatch=false`;
    
    // 4. MaxSpectators
    params += `?MaxSpectators=10`;
    
    // 5. Match Info
    // Replace spaces with underscores instead of URL encoding to avoid %20 in game UI
    const cleanLobbyName = lobby.name.replace(/ /g, '_');
    params += `?Matchtitle=${cleanLobbyName}`;
    params += `?MatchDescription=Lobby_Match`;
    
    // 6. QueryPort
    params += `?QueryPort=${ports.queryPort}`;
    
    // 7. Master Server
    params += `?BetaMasterHost=localhost`;
    params += `?BetaMasterPort=8991`;
    
    // 8. Matchmaking - BEIDE FLAGS setzen!
    params += `?bMatchMaking=true`;  // Note: Capital M!
    params += `?bMatchmaking=true`;  // lowercase version
    params += `?bOfficialMatchmaking=true`;  // Must be true for bots to spawn!
    params += `?bOfficialMatchMaking=true`;  // Capital M version
    
    // 9. PublicIP
    params += `?PublicIP=${this.getLanIP()}`;
    
    // 10. Bot parameters REMOVED - Original Supraball doesn't support Auto-Bots
    // AutoNumBots would require UnrealScript changes that we cannot compile
    
    // 11. Team Balance
    params += `?bPlayersBalanceTeams=true`;
    
    // 12. Warmup (at the end like in server-test.cmd!)
    // Use SHORT warmup like server-test.cmd (5 seconds)
    const warmupTime = lobby.settings.botsActive ? 5 : lobby.settings.warmupTime;
    params += `?bWarmupRound=true`;
    params += `?WarmupTime=${warmupTime}`;
    console.log(`   📊 WarmupTime=${warmupTime}s`);
    
    // 13. Game Mode & Time/Goals (at the end!)
    if (lobby.settings.mode === 'time') {
      params += `?timelimit=${lobby.settings.timeLimit}`;
    } else if (lobby.settings.mode === 'goal') {
      params += `?GoalScore=${lobby.settings.goalScore}`;
    }
    
    return params;
  }
  
  // ✅ Wait until server is ready
  async waitForServerReady(serverInfo, maxWait = this.START_TIMEOUT) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
      if (serverInfo.status === 'ready') {
        return true;
      }
      if (serverInfo.status === 'error' || serverInfo.status === 'stopped') {
        return false;
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return false;
  }
  
  // ✅ Server was registered at master server (called from /update)
  notifyServerRegistered(queryPort) {
    if (this.debugMode) {
      console.log(`🔔 notifyServerRegistered() called with QueryPort: ${queryPort}`);
    }
    
    const lobbyId = this.portToLobby.get(queryPort);
    if (!lobbyId) {
      if (this.debugMode) {
        console.log(`⚠️ Server registration for port ${queryPort} but no lobby found in portToLobby map`);
        console.log(`   Available ports in map: ${Array.from(this.portToLobby.keys()).join(', ')}`);
      }
      return false;
    }
    
    if (this.debugMode) {
      console.log(`🔍 Found lobbyId: ${lobbyId} for QueryPort ${queryPort}`);
    }
    
    const serverInfo = this.servers.get(lobbyId);
    if (!serverInfo) {
      if (this.debugMode) {
        console.log(`⚠️ Server registration for lobby ${lobbyId} but no server info found`);
        console.log(`   Available server IDs: ${Array.from(this.servers.keys()).join(', ')}`);
        console.log(`   Creating minimal serverInfo for registration...`);
      }
      
      // Get ports from PortManager for this lobby
      const ports = this.portManager.getPorts(lobbyId);
      
      // Create minimal server info if not exists (shouldn't happen, but failsafe)
      const minimalInfo = {
        lobbyId: lobbyId,
        queryPort: queryPort,
        status: 'ready',
        registered: true,
        startedAt: Date.now()
      };
      
      // Add ports if available
      if (ports) {
        minimalInfo.gamePort = ports.gamePort;
        minimalInfo.port = ports.gamePort; // Both properties for compatibility
        if (this.debugMode) {
          console.log(`   Added ports from PortManager: Game=${ports.gamePort}, Query=${ports.queryPort}`);
        }
      }
      
      this.servers.set(lobbyId, minimalInfo);
      
      if (this.debugMode) {
        console.log(`✅ Server registered (minimal info) for lobby ${lobbyId} (QueryPort: ${queryPort})`);
      }
      this.emit('server-ready', { lobbyId, queryPort });
      return true;
    }
    
    if (this.debugMode) {
      console.log(`🔍 Found serverInfo for ${lobbyId}, registered status: ${serverInfo.registered}`);
    }
    
    // ALWAYS set to true to avoid race conditions
    const wasAlreadyRegistered = serverInfo.registered;
    serverInfo.registered = true;
    serverInfo.status = 'ready';
    
    if (!wasAlreadyRegistered) {
      console.log(`✅ Server registered and READY for lobby ${lobbyId} (QueryPort: ${queryPort})`);
      // Emit event so the start process can wait - only on first registration
      this.emit('server-ready', { lobbyId, queryPort });
    } else {
      if (this.debugMode) {
        console.log(`✅ Server registration confirmed for lobby ${lobbyId} (QueryPort: ${queryPort})`);
      }
      // Don't emit event again - already registered
    }
    
    return true;
  }
  
  // ✅ Wait until server is registered at master server
  async waitForServerRegistration(lobbyId, maxWait = 10000) {
    if (this.debugMode) {
      console.log(`\n⏳ ==================== WAIT FOR REGISTRATION ====================`);
      console.log(`   Lobby ID: ${lobbyId}`);
      console.log(`   Max Wait: ${maxWait}ms`);
    }
    
    // Verwende Event-basiertes Warten statt Polling
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.off('server-ready', readyHandler);
        if (this.debugMode) {
          console.log(`⏱️ TIMEOUT! Server did not register after ${maxWait}ms`);
        }
        resolve(false);
      }, maxWait);
      
      const readyHandler = (data) => {
        if (data.lobbyId === lobbyId) {
          clearTimeout(timeout);
          this.off('server-ready', readyHandler);
          if (this.debugMode) {
            console.log(`✅ Server registered! Event received for lobby ${lobbyId}`);
          }
          resolve(true);
        }
      };
      
      // Check if already registered
      const serverInfo = this.servers.get(lobbyId);
      if (serverInfo && serverInfo.registered) {
        clearTimeout(timeout);
        if (this.debugMode) {
          console.log(`✅ Server already registered!`);
        }
        resolve(true);
        return;
      }
      
      // Wait for event
      if (this.debugMode) {
        console.log(`   Waiting for server-ready event...`);
      }
      this.on('server-ready', readyHandler);
    });
  }
  
  // ✅ Get server info
  getServerInfo(lobbyId) {
    const serverInfo = this.servers.get(lobbyId);
    if (!serverInfo) return null;
    
    return {
      lobbyId: serverInfo.lobbyId,
      pid: serverInfo.pid,
      gamePort: serverInfo.gamePort,
      queryPort: serverInfo.queryPort,
      status: serverInfo.status,
      registered: serverInfo.registered,
      uptime: Date.now() - serverInfo.startedAt,
      logCount: serverInfo.logs.length
    };
  }
  
  // ✅ Get all servers
  getAllServers() {
    const servers = [];
    for (const [lobbyId, serverInfo] of this.servers) {
      servers.push(this.getServerInfo(lobbyId));
    }
    return servers;
  }
  
  // ✅ Get server logs
  getServerLogs(lobbyId, limit = 50) {
    const serverInfo = this.servers.get(lobbyId);
    if (!serverInfo) return [];
    
    return serverInfo.logs.slice(-limit);
  }
  
  // 🧹 Shut down all servers
  cleanupAll() {
    if (this.debugMode) {
      console.log('🧹 Cleaning up all servers...');
    }
    
    for (const [lobbyId, serverInfo] of this.servers) {
      try {
        // Only kill if we have a PID
        if (serverInfo.pid) {
          if (os.platform() === 'win32') {
            spawn('taskkill', ['/PID', serverInfo.pid.toString(), '/F', '/T']);
          } else {
            process.kill(serverInfo.pid, 'SIGTERM');
          }
        } else {
          console.warn(`⚠️ Cannot kill server ${lobbyId}: No PID available`);
        }
      } catch (error) {
        console.error(`Failed to kill process ${serverInfo.pid || 'unknown'}: ${error.message}`);
      }
    }
    
    this.servers.clear();
    
    if (this.debugMode) {
      console.log('✅ All servers cleaned up');
    }
  }
  
  // 📊 Statistics
  getStats() {
    return {
      activeServers: this.servers.size,
      maxServers: 4,
      servers: this.getAllServers()
    };
  }
  
  // 🌐 Determine LAN IP
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
}

module.exports = ServerManager;
