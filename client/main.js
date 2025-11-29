const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const os = require('os');
const UDKNetIDGenerator = require('./UDKNetIDGenerator');
const fs = require('fs');

// Load config from localStorage (Electron Store)
function getConfig() {
  const defaultConfig = {
    masterServerUrl: 'http://supraball.servers.lan:8991',
    language: 'de'
  };
  
  try {
    const { session } = require('electron');
    // For now, just return default - config will be managed in renderer process
    return defaultConfig;
  } catch (e) {
    return defaultConfig;
  }
}

const CONFIG = getConfig();
const MASTER_SERVER_URL = CONFIG.masterServerUrl;

// Helper function to read display name from Goldberg settings
function getGoldbergUsername() {
  try {
    // Get directory where the exe is located, then go up one level
    const exeDir = path.dirname(app.getPath('exe'));
    const goldbergPath = path.resolve(exeDir, '..', 'Binaries', 'Win32', 'settings', 'account_name.txt');
    console.log(`🔍 Looking for Goldberg username at: ${goldbergPath}`);
    console.log(`🔍 File exists: ${fs.existsSync(goldbergPath)}`);
    if (fs.existsSync(goldbergPath)) {
      const username = fs.readFileSync(goldbergPath, 'utf8').trim();
      console.log(`🔍 File contents: "${username}"`);
      if (username) {
        console.log(`✅ Using Goldberg username: ${username}`);
        return username;
      }
    }
    console.log(`⚠️ Goldberg file not found or empty, using Windows username`);
  } catch (error) {
    console.log(`⚠️ Could not read Goldberg username: ${error.message}`);
  }
  // Fallback to Windows username
  const fallback = os.userInfo().username;
  console.log(`🔍 Fallback to Windows username: ${fallback}`);
  return fallback;
}

// Helper function to write NetID to Goldberg settings so UDK.exe uses it
function setGoldbergSteamID(netid) {
  try {
    const exeDir = path.dirname(app.getPath('exe'));
    const settingsDir = path.resolve(exeDir, '..', 'Binaries', 'Win32', 'settings');
    const steamIdPath = path.join(settingsDir, 'user_steam_id.txt');
    
    // Convert hex NetID to decimal Steam ID
    // NetID format: 0x01100001XXXXXXXX where XXXXXXXX is the account ID
    const accountIdHex = netid.substring(10); // Get last 8 hex digits
    const accountId = parseInt(accountIdHex, 16);
    
    // Steam ID64 format: 76561197960265728 + accountId
    const steamId64 = (76561197960265728n + BigInt(accountId)).toString();
    
    // Ensure settings directory exists
    if (!fs.existsSync(settingsDir)) {
      fs.mkdirSync(settingsDir, { recursive: true });
    }
    
    // Write Steam ID to file
    fs.writeFileSync(steamIdPath, steamId64);
    console.log(`✅ Wrote Steam ID to Goldberg: ${steamId64} (from NetID: ${netid})`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to write Goldberg Steam ID: ${error.message}`);
    return false;
  }
}

// Set portable mode - store all data in local 'profile' folder
const isPortable = true;
const profilePath = path.join(path.dirname(app.getPath('exe')), 'profile');

// Determine base path for resources (HTML files, etc.)
// In packaged app, resources are in resources/app relative to the exe
// In development, they're in the same directory as main.js
const resourcesPath = app.isPackaged 
  ? path.join(process.resourcesPath, 'app')
  : __dirname;

console.log('📦 App is packaged:', app.isPackaged);
console.log('📁 Resources path:', resourcesPath);

// Create profile directory if it doesn't exist
if (isPortable && !fs.existsSync(profilePath)) {
  fs.mkdirSync(profilePath, { recursive: true });
}

// Override app paths to use local profile folder
if (isPortable) {
  app.setPath('userData', path.join(profilePath, 'userData'));
  app.setPath('cache', path.join(profilePath, 'cache'));
  app.setPath('temp', path.join(profilePath, 'temp'));
  app.setPath('logs', path.join(profilePath, 'logs'));
  
  console.log('🗂️ Portable Mode Active');
  console.log(`📁 Profile Path: ${profilePath}`);
  console.log(`📁 User Data: ${app.getPath('userData')}`);
}

// Helper function to find UDK.exe dynamically (same logic as map path detection)
function getUDKPath() {
  // Get directory where the exe is located, then go up one level
  const exeDir = path.dirname(app.getPath('exe'));
  const udkExePath = path.resolve(exeDir, '..', 'Binaries', 'Win32', 'UDK.exe');
  console.log(`🔍 exe: ${app.getPath('exe')}`);
  console.log(`🔍 exeDir: ${exeDir}`);
  console.log(`✅ UDK.exe path: ${udkExePath}`);
  return udkExePath;
}

// Helper function to get the Supraball base directory
function getBasePath() {
  // Get directory where the exe is located, then go up one level
  const exeDir = path.dirname(app.getPath('exe'));
  const basePath = path.resolve(exeDir, '..');
  console.log(`🔍 exe directory: ${exeDir}`);
  console.log(`✅ Base path: ${basePath}`);
  return basePath;
}

// Debug mode check
const DEBUG_MODE = process.argv.includes('--debug') || process.env.NODE_ENV === 'development';

let mainWindow;
let currentLobbyId = null; // Track current lobby
let currentNetID = null; // Track current player NetID

// Create comprehensive debug menu
function createDebugMenu() {
  const template = [
    {
      label: 'Debug',
      submenu: [
        {
          label: 'Open DevTools',
          accelerator: 'F12',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools();
            }
          }
        },
        {
          label: 'Reload App',
          accelerator: 'F5',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.reload();
            }
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Report Issue',
          click: () => shell.openExternal('https://github.com/supraball/supraball')
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Debug helper functions
async function testMasterServer(hostname) {
  const url = new URL(MASTER_SERVER_URL);
  const port = url.port || '8991';
  
  if (DEBUG_MODE) console.log(`[TEST] Testing Master Server: ${hostname}:${port}`);
  
  try {
    const result = await registerWithMasterServer(hostname);
    if (DEBUG_MODE) console.log(`[TEST] SUCCESS: ${hostname} responded:`, result);
    
    if (mainWindow) {
      mainWindow.webContents.executeJavaScript(`
        alert('Master Server Test SUCCESS!\\n\\nServer: ${hostname}:${port}\\nResponse: ${JSON.stringify(result, null, 2)}');
      `);
    }
  } catch (error) {
    console.error(`[ERROR] Master Server test failed (${hostname}):`, error);
    
    if (mainWindow) {
      mainWindow.webContents.executeJavaScript(`
        alert('Master Server Test FAILED!\\n\\nServer: ${hostname}:${port}\\nError: ${error.message}\\n\\nCheck console for details.');
      `);
    }
  }
}

function showRegistrationStatus() {
const netid = UDKNetIDGenerator.generateNetID();
  const status = {
    client_netid: netid,
    username: os.userInfo().username,
    hostname: os.hostname(),
    platform: os.platform(),
    timestamp: new Date().toISOString()
  };
  
  console.log('?? Registration Status:', status);
  
  if (mainWindow) {
    mainWindow.webContents.executeJavaScript(`
      alert('?? Registration Status:\\n\\n${JSON.stringify(status, null, 2)}');
    `);
  }
}

async function testGetPlayerInfoRequest() {
const netid = UDKNetIDGenerator.generateNetID();
  console.log(`?? Testing GetPlayerInfo request for NetID: ${netid}`);
  
  const url = new URL(MASTER_SERVER_URL);
  const servers = [url.hostname];
  
  for (const server of servers) {
    try {
      const result = await testGetPlayerInfo(server, netid);
      console.log(`? GetPlayerInfo SUCCESS (${server}):`, result);
    } catch (error) {
      console.error(`? GetPlayerInfo FAILED (${server}):`, error.message);
    }
  }
}

function testGetPlayerInfo(hostname, netid) {
  const url = new URL(MASTER_SERVER_URL);
  const port = url.port || '8991';
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: hostname,
      port: parseInt(port),
      path: `/getPlayerInfo?steamid=${netid}`,
      method: 'GET',
      timeout: 2000
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (e) {
          reject(new Error(`Invalid response: ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.abort();
      reject(new Error('Timeout'));
    });
    
    req.end();
  });
}

function debugGameConnection() {
  console.log('?? Debugging game connection...');
  
  if (mainWindow) {
    mainWindow.webContents.executeJavaScript(`
      alert('?? Debug Game Connection\\n\\n1. Check Master Server is running\\n2. Check hosts file entries\\n3. Check firewall settings\\n4. Monitor console output\\n\\nSee console for detailed logs.');
    `);
  }
}

function showNetworkStatus() {
  const interfaces = os.networkInterfaces();
  let networkInfo = 'Network Interfaces:\n\n';
  
  for (const [name, addresses] of Object.entries(interfaces)) {
    networkInfo += `${name}:\n`;
    for (const addr of addresses) {
      if (addr.family === 'IPv4') {
        networkInfo += `  IPv4: ${addr.address}\n`;
      }
    }
    networkInfo += '\n';
  }
  
  console.log('?? Network Status:', networkInfo);
  
  if (mainWindow) {
    mainWindow.webContents.executeJavaScript(`
      alert('?? Network Status:\\n\\n${networkInfo}');
    `);
  }
}

function showDebugGuide() {
  if (mainWindow) {
    mainWindow.webContents.executeJavaScript(`
      alert('?? Debug Guide\\n\\n?? Console Output: F12 or Ctrl+Shift+I\\n?? Reload App: F5\\n?? Test Servers: Debug > Test Master Server\\n?? Force Registration: Debug > Registration Tests\\n?? DevTools: F12\\n\\nCheck console output for detailed logs!');
    `);
  }
}

function showAboutDebug() {
  if (mainWindow) {
    mainWindow.webContents.executeJavaScript(`
      alert('?? Debug Mode Active\\n\\nFeatures enabled:\\n? Developer Tools\\n? Console Logging\\n? Network Testing\\n? Registration Debugging\\n? Hot Reload\\n\\nUse Debug menu for testing and troubleshooting.');
    `);
  }
}

function copyDebugInfo() {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    client_netid: generateClientNetID(),
    username: os.userInfo().username,
    hostname: os.hostname(),
    platform: os.platform(),
    node_version: process.version,
    electron_version: process.versions.electron,
    network_interfaces: Object.keys(os.networkInterfaces())
  };
  
  console.log('?? Debug Info:', debugInfo);
  
  // Copy to clipboard would require clipboard module, so just log for now
  if (mainWindow) {
    mainWindow.webContents.executeJavaScript(`
      alert('?? Debug Info copied to console!\\n\\nCheck console output for complete debug information.');
    `);
  }
}

function createWindow() {
  // 🗑️ CLEAR CACHE on startup to prevent stale 404 responses
  const { session } = require('electron');
  
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 900,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true,        // ?? Enable DevTools for debugging
      cache: false,          // Disable HTTP cache
      webSecurity: false,    // Disable web security (allows local file access and CORS)
      allowRunningInsecureContent: true
    }
  });
  
  // Handle window close event
  mainWindow.on('close', (event) => {
    console.log('🔴 Window closing...');
    
    // Leave lobby synchronously before closing if in one
    if (currentLobbyId && currentNetID) {
      console.log(`🚪 Leaving lobby ${currentLobbyId} before window close...`);
      
      // Prevent window from closing immediately
      event.preventDefault();
      
      // Send leave request
      const url = require('url');
      const masterServerUrl = url.parse(`${MASTER_SERVER_URL}/lobbies/${currentLobbyId}/leave`);
      const postData = JSON.stringify({ netid: currentNetID });
      
      const options = {
        hostname: masterServerUrl.hostname,
        port: masterServerUrl.port,
        path: masterServerUrl.path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 2000 // 2 second timeout
      };
      
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          console.log('✅ Left lobby successfully before close');
          currentLobbyId = null;
          currentNetID = null;
          
          // Now allow window to close
          mainWindow.destroy();
        });
      });
      
      req.on('error', (error) => {
        console.error('❌ Failed to leave lobby on close:', error);
        // Close anyway after error
        mainWindow.destroy();
      });
      
      req.on('timeout', () => {
        console.error('⏱️ Leave lobby timeout on close');
        req.abort();
        // Close anyway after timeout
        mainWindow.destroy();
      });
      
      req.write(postData);
      req.end();
    } else {
      // No lobby to leave, just cleanup
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.session.clearCache();
        mainWindow.webContents.session.clearStorageData();
      }
    }
  });
  
  mainWindow.on('closed', () => {
    console.log('🔴 Window closed');
    mainWindow = null;
  });
  
  // Clear all caches before loading
  session.defaultSession.clearCache().then(() => {
    console.log('✅ Cache cleared successfully');
  });
  
  session.defaultSession.clearStorageData({
    storages: ['cookies', 'filesystem', 'indexdb', 'localstorage', 'shadercache', 'websql', 'serviceworkers', 'cachestorage']
  }).then(() => {
    console.log('✅ Storage data cleared');
  });
  
  // ?? Create debug-friendly menu
  createDebugMenu();
    
  mainWindow.loadFile(path.join(resourcesPath, 'lobby-browser.html'));
  
  // Forward browser console logs to terminal
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    const logLevel = ['[LOG]', '[WARN]', '[ERROR]'][level] || '[INFO]';
    console.log(`${logLevel} Renderer: ${message}`);
  });
  
  // ?? Open DevTools automatically in debug mode
  if (process.env.NODE_ENV === 'development' || process.argv.includes('--debug')) {
    mainWindow.webContents.openDevTools();
  }
  
  // ?? Add global hotkeys for debugging
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // F12 - Toggle DevTools
    if (input.key === 'F12') {
      mainWindow.webContents.toggleDevTools();
    }
    
    // Ctrl+Shift+R - Force registration
    if (input.control && input.shift && input.key === 'R') {
      console.log('?? Hotkey: Force registration triggered');
      performRegistration().catch(err => console.error('? Hotkey registration failed:', err));
    }
    
    // Ctrl+Shift+T - Test master server
    if (input.control && input.shift && input.key === 'T') {
      console.log('?? Hotkey: Testing master server');
      const url = new URL(MASTER_SERVER_URL);
      testMasterServer(url.hostname);
    }
  });
  
  // Register once at startup
  console.log('CLIENT STARTUP: Registering with Master Server...');
  
  // Wait for window to load, then register once
  mainWindow.webContents.once('dom-ready', () => {
    performRegistration();
  });
}

// Master Server URL is now managed by config.js (localStorage)
// No need for masterserver.ip file anymore
console.log(`[CONFIG] ✅ Using Master Server: ${MASTER_SERVER_URL}`);

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

// Ensure complete shutdown on all platforms
app.on('window-all-closed', () => {
  console.log('🔴 All windows closed');
  
  // Force quit on all platforms (including macOS)
  app.quit();
});

// Before quit - final cleanup
app.on('before-quit', async (event) => {
  console.log('🔴 App quitting - performing cleanup...');
  
  // Leave current lobby if in one
  if (currentLobbyId && currentNetID) {
    console.log(`🚪 Leaving lobby ${currentLobbyId} before quit...`);
    
    // Prevent immediate quit
    event.preventDefault();
    
    try {
      const url = require('url');
      const masterServerUrl = url.parse(`${MASTER_SERVER_URL}/lobbies/${currentLobbyId}/leave`);
      const postData = JSON.stringify({ netid: currentNetID });
      
      const options = {
        hostname: masterServerUrl.hostname,
        port: masterServerUrl.port,
        path: masterServerUrl.path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 2000 // 2 second timeout
      };
      
      // Use promise to wait for response
      await new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            console.log('✅ Left lobby successfully before quit');
            resolve();
          });
        });
        
        req.on('error', (error) => {
          console.error('❌ Failed to leave lobby on quit:', error);
          resolve(); // Resolve anyway to allow quit
        });
        
        req.on('timeout', () => {
          console.error('⏱️ Leave lobby timeout on quit');
          req.abort();
          resolve(); // Resolve anyway to allow quit
        });
        
        req.write(postData);
        req.end();
        
        // Safety timeout
        setTimeout(() => resolve(), 3000);
      });
      
      currentLobbyId = null;
      currentNetID = null;
      
    } catch (error) {
      console.error('❌ Exception while leaving lobby on quit:', error);
    }
    
    // Clear all sessions
    const { session } = require('electron');
    session.defaultSession.clearCache();
    session.defaultSession.clearStorageData();
    
    // Now quit for real
    app.quit();
  } else {
    // Clear all sessions
    const { session } = require('electron');
    session.defaultSession.clearCache();
    session.defaultSession.clearStorageData();
  }
});

// Will quit - absolutely final
app.on('will-quit', () => {
  console.log('🔴 App will quit now');
});

async function performRegistration() {
try {
  // Use UDK-compatible NetID generation
  const clientNetID = UDKNetIDGenerator.generateNetID();
  const username = os.userInfo().username || 'Player';
    
    if (DEBUG_MODE) console.log(`[REG] Registering: ${clientNetID} (${username})`);
    
    // Registration target: Configured Master Server
    const url = new URL(MASTER_SERVER_URL);
    const serverTargets = [
      { hostname: url.hostname, description: 'Configured Master Server' }
    ];
    
    if (DEBUG_MODE) console.log(`[REG] Starting registration to ${serverTargets.length} server(s)`);
    
    // Start registration
    const registrationPromises = serverTargets.map(async (serverConfig) => {
      try {
        if (DEBUG_MODE) console.log(`[REG] Attempting: ${serverConfig.hostname} (${serverConfig.description})`);
        const result = await registerWithMasterServer(serverConfig.hostname);
        if (DEBUG_MODE) console.log(`[REG] SUCCESS: ${serverConfig.hostname} - Team ${result.team}`);
        return { serverTarget: serverConfig.hostname, result, success: true };
      } catch (error) {
        if (DEBUG_MODE) {
          console.log(`[REG] FAILED: ${serverConfig.hostname} - ${error.message}`);
          if (error.code === 'ENOTFOUND') {
            console.log(`[REG] DNS Error: ${serverConfig.hostname} not found`);
          }
        }
        return { serverTarget: serverConfig.hostname, error: error.message, success: false };
      }
    });
  
    const results = await Promise.allSettled(registrationPromises);

    let successCount = 0;
    let firstSuccess = null;
    
    for (const promiseResult of results) {
      if (promiseResult.status === 'fulfilled' && promiseResult.value.success) {
        successCount++;
        if (!firstSuccess) {
          firstSuccess = promiseResult.value;
        }
        
        // Send success status to UI 
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('registration-status', {
            success: true,
            netid: clientNetID,
            team: promiseResult.value.result.team,
            server: promiseResult.value.serverTarget,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
    
    console.log(`✅ REGISTRATION COMPLETE: ${successCount}/${serverTargets.length} servers successful`);
    
    if (successCount === 0) {
      const url = new URL(MASTER_SERVER_URL);
      console.log('❌ Registration failed');
      console.log('⚠️ Possible solutions:');
      console.log(`   1. Check Master Server is running at ${url.host}`);
      console.log('   2. Check network connectivity');
      console.log('   3. Check settings menu (⚙️) to configure Master Server URL');
      throw new Error('All registration attempts failed');
    }
    
    return firstSuccess ? firstSuccess.result : null;
    
  } catch (error) {
    console.error('?? Registration cycle failed:', error);
    
    // Send error status to UI
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('registration-status', {
        success: false,
        error: error.message
      });
    }
    
    throw error;
  }
}

async function registerWithMasterServer(serverIP) {
return new Promise((resolve, reject) => {
  // 🔑 CRITICAL: Use UDK-compatible NetID generation
  const clientNetID = UDKNetIDGenerator.generateNetID();
  // 👤 Display name from Goldberg settings
  const username = getGoldbergUsername();
  
  const url = new URL(MASTER_SERVER_URL);
  const port = url.port || '8991';
    
    const registrationData = {
      action: 'register_client',
      netid: clientNetID,
      username: username,
      server_target: serverIP,
      timestamp: Date.now(),
      client_version: '0.16.5'
    };
    
    const postData = JSON.stringify(registrationData);
    
    const options = {
      hostname: serverIP,
      port: parseInt(port),
      path: '/add_player',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'SupraballClient/2025.02.08-Optimized'
      },
      timeout: 1000 // Only 1 second timeout - fast fail
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.result === true || response.success === true) {
            resolve(response);
          } else {
            reject(new Error(`Registration failed: ${response.message || 'Unknown error'}`));
          }
        } catch (e) {
          reject(new Error(`Invalid response: ${data}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.abort();
      reject(new Error('Registration timeout'));
    });
    
    req.write(postData);
    req.end();
  });
}

// Generate a Steam-compatible NetID that matches UE3/Steam expectations
function generateClientNetID() {
  // Use the proper UDKNetIDGenerator that uses Windows username
  return UDKNetIDGenerator.generateNetID();
}

ipcMain.on('connect-server', async (event, serverIP, windowedMode = false) => {
  console.log('?? CONNECTION REQUEST: Ensuring fresh registration before UDK.exe start...');
  
  try {
    // Force a fresh registration right before connecting
    await performRegistration();
    console.log('✅ Fresh registration complete - starting UDK.exe...');
    
    // Small delay to ensure registration is processed
    setTimeout(() => {
      const args = [`${serverIP}:7777?ReadUp=1?ConfirmConnect=0?bTravel=0`];
      if (windowedMode) {
        args.push('-windowed');
      }
      const executablePath = getUDKPath();
      const workingDir = path.dirname(path.dirname(path.dirname(executablePath)));
      const clientProcess = spawn(executablePath, args, { cwd: workingDir });
      clientProcess.stdout.on('data', (data) => console.log(`stdout: ${data}`));
      clientProcess.stderr.on('data', (data) => console.error(`stderr: ${data}`));
      clientProcess.on('close', (code) => console.log(`Client process exited with code ${code}`));
    }, 100); // Only 100ms delay since we're continuously registering
    
  } catch (error) {
    console.error('❌ Pre-connection registration failed:', error);
    console.log('⚠️ Proceeding anyway - continuous registration should have us covered...');
    
    // Continue anyway since continuous registration should have us covered
    const args = [`${serverIP}:7777?ReadUp=1?ConfirmConnect=0?bTravel=0`];
    if (windowedMode) {
      args.push('-windowed');
    }
    const executablePath = getUDKPath();
    const workingDir = path.dirname(path.dirname(path.dirname(executablePath)));
    const clientProcess = spawn(executablePath, args, { cwd: workingDir });
    clientProcess.stdout.on('data', (data) => console.log(`stdout: ${data}`));
    clientProcess.stderr.on('data', (data) => console.error(`stderr: ${data}`));
    clientProcess.on('close', (code) => console.log(`Client process exited with code ${code}`));
  }
});

// Connect to lobby match server
ipcMain.on('connect-lobby-match', async (event, connectionInfo, windowedMode = false) => {
  console.log(`🎮 LOBBY MATCH: Connecting to ${connectionInfo.ip}:${connectionInfo.port}...`);
  
  try {
    // Force a fresh registration right before connecting
    await performRegistration();
    console.log('✅ Fresh registration complete - starting UDK.exe for lobby match...');
    
    // Write NetID to Goldberg settings so UDK.exe uses the same NetID
    const clientNetID = UDKNetIDGenerator.generateNetID();
    setGoldbergSteamID(clientNetID);
    
    // Small delay to ensure registration is processed
    setTimeout(() => {
      const serverAddress = `${connectionInfo.ip}:${connectionInfo.port}`;
      const args = [`${serverAddress}?ReadUp=1?ConfirmConnect=0?bTravel=0`];
      if (windowedMode) {
        args.push('-windowed');
      }
      const executablePath = getUDKPath();
      const workingDir = path.dirname(path.dirname(path.dirname(executablePath)));
      
      console.log(`🚀 Launching: ${executablePath} ${args[0]}`);
      
      const clientProcess = spawn(executablePath, args, { cwd: workingDir });
      
      clientProcess.stdout.on('data', (data) => console.log(`[UDK] ${data}`));
      clientProcess.stderr.on('data', (data) => console.error(`[UDK ERROR] ${data}`));
      clientProcess.on('close', (code) => {
        console.log(`🎮 Game closed with code ${code}`);
        // Notify renderer that game has closed
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('game-closed', { code });
        }
      });
      
      // Notify renderer that game has launched
      event.reply('game-launched', { success: true, server: connectionInfo });
      
    }, 100);
    
  } catch (error) {
    console.error('❌ Pre-connection registration failed:', error);
    console.log('⚠️ Proceeding anyway - continuous registration should have us covered...');
    
    // Write NetID to Goldberg settings so UDK.exe uses the same NetID
    const clientNetID = UDKNetIDGenerator.generateNetID();
    setGoldbergSteamID(clientNetID);
    
    // Continue anyway since continuous registration should have us covered
    const serverAddress = `${connectionInfo.ip}:${connectionInfo.port}`;
    const args = [`${serverAddress}?ReadUp=1?ConfirmConnect=0?bTravel=0`];
    if (windowedMode) {
      args.push('-windowed');
    }
    const executablePath = getUDKPath();
    const workingDir = path.dirname(path.dirname(path.dirname(executablePath)));
    
    const clientProcess = spawn(executablePath, args, { cwd: workingDir });
    clientProcess.stdout.on('data', (data) => console.log(`[UDK] ${data}`));
    clientProcess.stderr.on('data', (data) => console.error(`[UDK ERROR] ${data}`));
    clientProcess.on('close', (code) => console.log(`Game closed with code ${code}`));
    
    event.reply('game-launched', { success: true, server: connectionInfo });
  }
});

ipcMain.on('start-training', (event, trainingMap, windowedMode = false) => {
  const args = [`${trainingMap}?Training=1`];
  if (windowedMode) {
    args.push('-windowed');
  }
  const executablePath = getUDKPath();
  const workingDir = path.dirname(path.dirname(path.dirname(executablePath)));
  const clientProcess = spawn(executablePath, args, { cwd: workingDir });
  clientProcess.stdout.on('data', (data) => console.log(`stdout: ${data}`));
  clientProcess.stderr.on('data', (data) => console.error(`stderr: ${data}`));
  clientProcess.on('close', (code) => console.log(`Training process exited with code ${code}`));
});

ipcMain.on('start-tutorial', (event, windowedMode = false) => {
  console.log('📚 Starting Tutorial (DB-Tutorial)...');
  const args = [`DB-Tutorial`];
  if (windowedMode) {
    args.push('-windowed');
  }
  const executablePath = getUDKPath();
  const workingDir = path.dirname(path.dirname(path.dirname(executablePath)));
  const clientProcess = spawn(executablePath, args, { cwd: workingDir });
  clientProcess.stdout.on('data', (data) => console.log(`stdout: ${data}`));
  clientProcess.stderr.on('data', (data) => console.error(`stderr: ${data}`));
  clientProcess.on('close', (code) => console.log(`Tutorial process exited with code ${code}`));
});

ipcMain.on('start-offline-training', (event, windowedMode = false) => {
  console.log('🎯 Starting Offline Training (db-smallpitch)...');
  const args = [`db-smallpitch?Training=1`];
  if (windowedMode) {
    args.push('-windowed');
  }
  const executablePath = getUDKPath();
  const workingDir = path.dirname(path.dirname(path.dirname(executablePath)));
  const clientProcess = spawn(executablePath, args, { cwd: workingDir });
  clientProcess.stdout.on('data', (data) => console.log(`stdout: ${data}`));
  clientProcess.stderr.on('data', (data) => console.error(`stderr: ${data}`));
  clientProcess.on('close', (code) => console.log(`Offline training process exited with code ${code}`));
});

ipcMain.on('start-classic-version', (event) => {
  console.log('🎮 Starting Classic Version...');
  
  // Determine correct path based on whether app is packaged
  let classicExePath;
  let workingDir;
  
  if (app.isPackaged) {
    // When packaged: exe is in _dist/client folder, Classic is in parent directory
    const exeDir = path.dirname(app.getPath('exe'));
    classicExePath = path.resolve(exeDir, '..', 'Classic', 'Binaries', 'Win64', 'UDK.exe');
    workingDir = path.resolve(exeDir, '..', 'Classic');
  } else {
    // When in dev mode: __dirname is in client folder, Classic is in parent (Supraball root)
    classicExePath = path.join(__dirname, '..', 'Classic', 'Binaries', 'Win64', 'UDK.exe');
    workingDir = path.join(__dirname, '..', 'Classic');
  }
  
  console.log(`🔍 App packaged: ${app.isPackaged}`);
  console.log(`🔍 Classic UDK.exe path: ${classicExePath}`);
  console.log(`🔍 Working directory: ${workingDir}`);
  
  // Check if file exists
  if (!fs.existsSync(classicExePath)) {
    console.error(`❌ Classic UDK.exe not found at: ${classicExePath}`);
    return;
  }
  
  // Start Classic version without parameters
  const clientProcess = spawn(classicExePath, [], { cwd: workingDir });
  clientProcess.stdout.on('data', (data) => console.log(`[Classic] stdout: ${data}`));
  clientProcess.stderr.on('data', (data) => console.error(`[Classic] stderr: ${data}`));
  clientProcess.on('close', (code) => console.log(`Classic version process exited with code ${code}`));
});

ipcMain.on('start-combined-training', (event) => {
  const args = [`db-smallpitch?ReadUp=1?ConfirmConnect=0?bTravel=0`];
  const executablePath = getUDKPath();
  const workingDir = path.dirname(path.dirname(path.dirname(executablePath)));
  const clientProcess = spawn(executablePath, args, { cwd: workingDir });
  clientProcess.stdout.on('data', (data) => console.log(`stdout: ${data}`));
  clientProcess.stderr.on('data', (data) => console.error(`stderr: ${data}`));
  clientProcess.on('close', (code) => console.log(`Combined training client exited with code ${code}`));
});

// ?? Debug IPC handlers
ipcMain.on('debug-console', (event) => {
  console.log('?? Debug: Opening DevTools...');
  if (mainWindow) {
    mainWindow.webContents.toggleDevTools();
  }
});

ipcMain.on('debug-test-servers', (event) => {
  console.log('🔧 Debug: Testing master server...');
  const url = new URL(MASTER_SERVER_URL);
  testMasterServer(url.hostname);
});

ipcMain.on('debug-force-register', (event) => {
  console.log('🔧 Debug: Force registration requested...');
  performRegistration()
    .then(() => console.log('✅ Debug: Force registration completed!'))
    .catch(err => console.error('❌ Debug: Force registration failed:', err));
});

// 🎮 LOBBY SYSTEM IPC HANDLERS

// Get NetID for lobby system
ipcMain.on('get-netid', (event) => {
  const clientNetID = UDKNetIDGenerator.generateNetID();
  // 👤 Display name from Goldberg settings
  const username = getGoldbergUsername();
  
  // Store globally for cleanup on quit
  currentNetID = clientNetID;
  
  event.reply('netid-response', {
    netid: clientNetID,
    username: username
  });
  
  console.log(`🎮 NetID requested: ${clientNetID} (${username})`);
});

// Get current lobby ID
ipcMain.on('get-current-lobby', (event) => {
  event.reply('current-lobby-response', currentLobbyId);
  console.log(`🎮 Current Lobby ID requested: ${currentLobbyId || 'none'}`);
});

// IPC handler to get base path dynamically (same logic as getUDKPath)
ipcMain.on('get-base-path', (event) => {
  const basePath = getBasePath();
  event.reply('base-path-response', basePath);
  console.log(`📁 IPC: Base path sent: ${basePath}`);
});

// Set current lobby ID (when joining/creating lobby)
ipcMain.on('set-lobby-id', (event, lobbyId) => {
  currentLobbyId = lobbyId;
  console.log(`🎮 Lobby ID set: ${lobbyId}`);
});

// Open lobby browser window
ipcMain.on('open-lobby-browser', () => {
  console.log('🎮 Navigating to Lobby Browser...');
  
  if (mainWindow) {
    mainWindow.loadFile(path.join(resourcesPath, 'lobby-browser.html'));
  }
});

// Open lobby view window
ipcMain.on('open-lobby-view', (event, lobbyId) => {
  console.log(`🎮 Navigating to Lobby View for: ${lobbyId || currentLobbyId}`);
  
  if (mainWindow) {
    const targetLobbyId = lobbyId || currentLobbyId;
    mainWindow.loadFile(path.join(resourcesPath, 'lobby-view.html'));
    
    // Send lobby ID to view after it loads
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.send('set-lobby-id', targetLobbyId);
    });
  }
});

// Open lobby creator window
ipcMain.on('open-lobby-creator', () => {
  console.log('🎮 Navigating to Lobby Creator...');
  
  if (mainWindow) {
    mainWindow.loadFile(path.join(resourcesPath, 'lobby-creator.html'));
  }
});

// Open quick match window
ipcMain.on('open-quick-match', () => {
  console.log(' Opening Quick Match...');
  
  if (mainWindow) {
    mainWindow.loadFile(path.join(resourcesPath, 'quick-match.html'));
  }
});

// Focus/bring window to front
ipcMain.on('focus-window', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.show();
    mainWindow.focus();
    mainWindow.setAlwaysOnTop(true);
    mainWindow.setAlwaysOnTop(false);
  }
});
