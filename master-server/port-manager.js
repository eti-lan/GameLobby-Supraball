// 🔌 Port Manager - Verwaltung der Server-Ports
// Date: 2025-10-20

class PortManager {
  constructor(debugMode = false) {
    this.debugMode = debugMode;
    
    // Verfügbare Ports für Game Server
    this.basePorts = [7777, 7778, 7779, 7780];
    this.baseQueryPorts = [27015, 27016, 27017, 27018];
    
    this.availablePorts = [...this.basePorts];
    this.availableQueryPorts = [...this.baseQueryPorts];
    
    // Port -> Lobby-ID Mapping
    this.portToLobby = new Map();
    this.queryPortToLobby = new Map();
    
    // Lobby-ID -> Ports Mapping
    this.lobbyToPorts = new Map();
  }
  
  // ✅ Port-Paar allokieren (Game Port + Query Port)
  allocate(lobbyId) {
    if (this.availablePorts.length === 0) {
      throw new Error("No ports available. Maximum 4 servers running.");
    }
    
    const gamePort = this.availablePorts.shift();
    const queryPort = this.availableQueryPorts.shift();
    
    this.portToLobby.set(gamePort, lobbyId);
    this.queryPortToLobby.set(queryPort, lobbyId);
    
    this.lobbyToPorts.set(lobbyId, {
      gamePort: gamePort,
      queryPort: queryPort
    });
    
    if (this.debugMode) {
      console.log(`🔌 Ports allocated for lobby ${lobbyId}: Game=${gamePort}, Query=${queryPort}`);
    }
    
    return {
      gamePort: gamePort,
      queryPort: queryPort
    };
  }
  
  // ✅ Ports freigeben
  release(lobbyId) {
    const ports = this.lobbyToPorts.get(lobbyId);
    if (!ports) {
      console.warn(`⚠️ No ports found for lobby ${lobbyId}`);
      return false;
    }
    
    // Aus Mappings entfernen
    this.portToLobby.delete(ports.gamePort);
    this.queryPortToLobby.delete(ports.queryPort);
    this.lobbyToPorts.delete(lobbyId);
    
    // Zurück in verfügbare Ports
    this.availablePorts.push(ports.gamePort);
    this.availableQueryPorts.push(ports.queryPort);
    
    // Sortieren für konsistente Vergabe
    this.availablePorts.sort((a, b) => a - b);
    this.availableQueryPorts.sort((a, b) => a - b);
    
    if (this.debugMode) {
      console.log(`🔌 Ports released for lobby ${lobbyId}: Game=${ports.gamePort}, Query=${ports.queryPort}`);
    }
    
    return true;
  }
  
  // ✅ Ports für Lobby abrufen
  getPorts(lobbyId) {
    return this.lobbyToPorts.get(lobbyId) || null;
  }
  
  // ✅ Lobby-ID für Port abrufen
  getLobbyByPort(port) {
    return this.portToLobby.get(port) || this.queryPortToLobby.get(port) || null;
  }
  
  // ✅ Prüfen ob Ports verfügbar sind
  hasAvailablePorts() {
    return this.availablePorts.length > 0;
  }
  
  // ✅ Anzahl verfügbarer Ports
  getAvailableCount() {
    return this.availablePorts.length;
  }
  
  // ✅ Alle verwendeten Ports
  getUsedPorts() {
    return Array.from(this.portToLobby.entries()).map(([port, lobbyId]) => ({
      gamePort: port,
      queryPort: this.lobbyToPorts.get(lobbyId).queryPort,
      lobbyId: lobbyId
    }));
  }
  
  // 📊 Status
  getStatus() {
    return {
      available: this.availablePorts.length,
      total: this.basePorts.length,
      used: this.basePorts.length - this.availablePorts.length,
      availablePorts: [...this.availablePorts],
      usedPorts: this.getUsedPorts()
    };
  }
  
  // 🔄 Reset (für Testing)
  reset() {
    this.availablePorts = [...this.basePorts];
    this.availableQueryPorts = [...this.baseQueryPorts];
    this.portToLobby.clear();
    this.queryPortToLobby.clear();
    this.lobbyToPorts.clear();
    console.log('🔄 Port Manager reset');
  }
}

module.exports = PortManager;
