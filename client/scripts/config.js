// 🔧 Configuration Manager
// Manages application settings with localStorage persistence

class ConfigManager {
  constructor() {
    this.defaults = {
      masterServerUrl: 'http://supraball.servers.lan:8991',
      language: 'de',
      windowedMode: false
    };
    
    this.settings = this.load();
  }

  load() {
    try {
      const stored = localStorage.getItem('supraball-config');
      if (stored) {
        const parsed = JSON.parse(stored);
        const merged = { ...this.defaults, ...parsed };
        
        // Sync language from i18n if available
        if (typeof getCurrentLanguage === 'function') {
          merged.language = getCurrentLanguage();
        }
        
        return merged;
      }
    } catch (error) {
      console.warn('Failed to load config:', error);
    }
    
    // Try to get language from i18n
    const lang = typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'de';
    return { ...this.defaults, language: lang };
  }

  save() {
    try {
      localStorage.setItem('supraball-config', JSON.stringify(this.settings));
      console.log('✅ Config saved:', this.settings);
      return true;
    } catch (error) {
      console.error('Failed to save config:', error);
      return false;
    }
  }

  get(key) {
    return this.settings[key] ?? this.defaults[key];
  }

  set(key, value) {
    this.settings[key] = value;
    this.save();
  }

  reset() {
    this.settings = { ...this.defaults };
    this.save();
  }

  // Convenience getters
  getMasterServerUrl() {
    return this.get('masterServerUrl');
  }

  setMasterServerUrl(url) {
    this.set('masterServerUrl', url);
  }

  getLanguage() {
    return this.get('language');
  }

  setLanguage(lang) {
    this.set('language', lang);
  }

  getWindowedMode() {
    return this.get('windowedMode');
  }

  setWindowedMode(enabled) {
    this.set('windowedMode', enabled);
  }
}

// Global instance
const config = new ConfigManager();

// Export for use in other scripts
window.config = config;
window.MASTER_SERVER_URL = config.getMasterServerUrl();

console.log('🔧 Config loaded:', config.settings);
