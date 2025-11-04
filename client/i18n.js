// Multi-language support for Supraball Client
// Supported languages: Deutsch (de), English (en), Français (fr)

const translations = {
  de: {
    // Lobby Browser
    'lobby.browser.title': '🎮 Supraball',
    'lobby.browser.connecting': 'Verbindung wird hergestellt...',
    'lobby.browser.connected': 'Verbunden',
    'lobby.browser.refresh': '🔄 Aktualisieren',
    'lobby.browser.create': '➕ Neue Lobby erstellen',
    'lobby.browser.offline': '🎯 Offline Training',
    'lobby.browser.empty.title': '🏆 Keine Lobbies verfügbar',
    'lobby.browser.empty.subtitle': 'Erstelle die erste Lobby und starte ein Match!',
    'lobby.browser.empty.button': '➕ Erste Lobby erstellen',
    
    // Table headers
    'table.map': 'Map',
    'table.lobbyname': 'Lobby Name',
    'table.players': 'Spieler',
    'table.mode': 'Modus',
    'table.status': 'Status',
    'table.ping': 'Ping',
    
    // Lobby Creator
    'creator.title': '🏆 Neue Lobby erstellen',
    'creator.back': '← Zurück zur Lobby-Liste',
    'creator.map.title': '🗺️ Map auswählen',
    'creator.type.title': '⚽ Lobby Typ',
    'creator.type.3v3': '🎯 3v3',
    'creator.type.5v5': '🏆 5v5',
    'creator.mode.title': '🎮 Spielmodus',
    'creator.mode.time': '⏱️ Zeit',
    'creator.mode.goal': '🎯 Tore',
    'creator.time.title': '⏱️ Zeit-Limit',
    'creator.time.minutes': 'Minuten:',
    'creator.goal.title': '🎯 Tor-Limit',
    'creator.goal.goals': 'Tore:',
    'creator.bots.title': '🤖 Bots',
    'creator.bots.enable': 'Auto-Fill aktivieren',
    'creator.bots.description': 'Füllt automatisch auf 6 (3v3) oder 10 (5v5) Spieler auf',
    'creator.warmup.title': '⏱️ Aufwärmzeit',
    'creator.warmup.minutes': 'Minuten:',
    'creator.cancel': '❌ Abbrechen',
    'creator.create': '✅ Lobby erstellen',
    
    // Lobby View
    'view.title': 'Lobby',
    'view.back': '← Zurück zur Lobby-Liste',
    'view.settings': 'Einstellungen',
    'view.info.map': 'Karte',
    'view.info.mode': 'Spielmodus',
    'view.info.players': 'Spieler',
    'view.info.status': 'Status',
    'view.team.red': '🔴 Rotes Team',
    'view.team.blue': '🔵 Blaues Team',
    'view.team.join': 'Beitreten',
    'view.ready': '✓ Bereit',
    'view.start': '🚀 Match starten',
    'view.leave': 'Lobby verlassen',
    'view.you': 'Du',
    'view.host': 'Host',
    'view.empty.slot': 'Leerer Platz',
    'view.status.waiting': 'Warten',
    'view.status.ready': 'Bereit',
    'view.status.notready': 'Nicht bereit',
    'view.save': '💾 Einstellungen speichern',
    'view.cancel.edit': '❌ Abbrechen',
    
    // Dynamic messages - Lobby View
    'view.player.you': 'DU',
    'view.slot.empty': 'Warte auf Spieler...',
    'view.status.waiting-start': '⏳ Warte auf Match-Start...',
    'view.status.waiting-players': '⏳ Warte auf mehr Spieler...',
    'view.status.starting': '🚀 Server wird gestartet...',
    'view.status.server-ready': '✅ Server bereit! Verbinde...',
    'view.status.connecting': '🎮 Verbinde...',
    'view.status.server-error': '❌ Server-Fehler',
    'view.status.ingame': '🎮 Spiel läuft...',
    'view.mode.time': 'Zeitlimit',
    'view.mode.goal': 'Tor-Anzahl',
    'view.lobby.status.waiting': 'Warten',
    'view.lobby.status.starting': 'Startet...',
    'view.lobby.status.in-progress': 'Im Spiel',
    'view.lobby.status.finished': 'Beendet',
    'view.button.players-needed': 'Je {count} Spieler pro Team benötigt',
    'view.button.min-player-needed': 'Mindestens 1 Spieler benötigt',
    'view.button.start-with-bots': 'Match starten (+{count} Bots)',
    
    // Dynamic messages - Lobby Browser
    'browser.status.waiting': '⏳ Wartet',
    'browser.status.starting': '🚀 Startet...',
    'browser.status.running': '🎮 Läuft',
    'browser.connected.full': 'Verbunden mit Master Server',
    
    // Dynamic messages - Lobby Creator
    'creator.creating': '⏳ Erstelle Lobby...',
    
    // Quick Match
    'quick.title': '🎯 Quick Match',
    'quick.back': '← Zurück',
    'quick.3v3.title': 'Quick 3v3',
    'quick.3v3.description': 'Schnelle 3 gegen 3 Matches',
    'quick.3v3.button': 'Spiel 3v3',
    'quick.5v5.title': 'Quick 5v5',
    'quick.5v5.description': 'Standard 5 gegen 5 Matches',
    'quick.5v5.button': 'Spiel 5v5',
    'quick.queue.players': 'Spieler in Warteschlange',
    'quick.searching.title': '🔍 Suche Match',
    'quick.searching.mode': 'Modus:',
    'quick.searching.wait': 'Warte:',
    'quick.searching.cancel': 'Suche abbrechen',
    'quick.found.title': '🎮 Match gefunden!',
    'quick.found.starting': 'Starte Server...',
    'quick.found.red': 'Rotes Team',
    'quick.found.blue': 'Blaues Team',
    'quick.found.preparing': 'Bereite Server vor...',
    'quick.error.title': '❌ Fehler',
    'quick.error.message': 'Etwas ist schiefgelaufen',
    'quick.error.retry': 'Erneut versuchen'
  },
  
  en: {
    // Lobby Browser
    'lobby.browser.title': '🎮 Supraball',
    'lobby.browser.connecting': 'Connecting...',
    'lobby.browser.connected': 'Connected',
    'lobby.browser.refresh': '🔄 Refresh',
    'lobby.browser.create': '➕ Create New Lobby',
    'lobby.browser.offline': '🎯 Offline Training',
    'lobby.browser.empty.title': '🏆 No Lobbies Available',
    'lobby.browser.empty.subtitle': 'Create the first lobby and start a match!',
    'lobby.browser.empty.button': '➕ Create First Lobby',
    
    // Table headers
    'table.map': 'Map',
    'table.lobbyname': 'Lobby Name',
    'table.players': 'Players',
    'table.mode': 'Mode',
    'table.status': 'Status',
    'table.ping': 'Ping',
    
    // Lobby Creator
    'creator.title': '🏆 Create New Lobby',
    'creator.back': '← Back to Lobby List',
    'creator.map.title': '🗺️ Select Map',
    'creator.type.title': '⚽ Lobby Type',
    'creator.type.3v3': '🎯 3v3',
    'creator.type.5v5': '🏆 5v5',
    'creator.mode.title': '🎮 Game Mode',
    'creator.mode.time': '⏱️ Time',
    'creator.mode.goal': '🎯 Goals',
    'creator.time.title': '⏱️ Time Limit',
    'creator.time.minutes': 'Minutes:',
    'creator.goal.title': '🎯 Goal Limit',
    'creator.goal.goals': 'Goals:',
    'creator.bots.title': '🤖 Bots',
    'creator.bots.enable': 'Enable Auto-Fill',
    'creator.bots.description': 'Automatically fills to 6 (3v3) or 10 (5v5) players',
    'creator.warmup.title': '⏱️ Warmup Time',
    'creator.warmup.minutes': 'Minutes:',
    'creator.cancel': '❌ Cancel',
    'creator.create': '✅ Create Lobby',
    
    // Lobby View
    'view.title': 'Lobby',
    'view.back': '← Back to Lobby List',
    'view.settings': 'Settings',
    'view.info.map': 'Map',
    'view.info.mode': 'Game Mode',
    'view.info.players': 'Players',
    'view.info.status': 'Status',
    'view.team.red': '🔴 Red Team',
    'view.team.blue': '🔵 Blue Team',
    'view.team.join': 'Join',
    'view.ready': '✓ Ready',
    'view.start': '🚀 Start Match',
    'view.leave': 'Leave Lobby',
    'view.you': 'You',
    'view.host': 'Host',
    'view.empty.slot': 'Empty Slot',
    'view.status.waiting': 'Waiting',
    'view.status.ready': 'Ready',
    'view.status.notready': 'Not Ready',
    'view.save': '💾 Save Settings',
    'view.cancel.edit': '❌ Cancel',
    
    // Dynamic messages - Lobby View
    'view.player.you': 'YOU',
    'view.slot.empty': 'Waiting for player...',
    'view.status.waiting-start': '⏳ Waiting for match start...',
    'view.status.waiting-players': '⏳ Waiting for more players...',
    'view.status.starting': '🚀 Starting server...',
    'view.status.server-ready': '✅ Server ready! Connecting...',
    'view.status.connecting': '🎮 Connecting...',
    'view.status.server-error': '❌ Server Error',
    'view.status.ingame': '🎮 Game Running...',
    'view.mode.time': 'Time Limit',
    'view.mode.goal': 'Goal Count',
    'view.lobby.status.waiting': 'Waiting',
    'view.lobby.status.starting': 'Starting...',
    'view.lobby.status.in-progress': 'In Game',
    'view.lobby.status.finished': 'Finished',
    'view.button.players-needed': '{count} players per team required',
    'view.button.min-player-needed': 'At least 1 Player Required',
    'view.button.start-with-bots': 'Start Match (+{count} Bots)',
    
    // Dynamic messages - Lobby Browser
    'browser.status.waiting': '⏳ Waiting',
    'browser.status.starting': '🚀 Starting...',
    'browser.status.running': '🎮 Running',
    'browser.connected.full': 'Connected to Master Server',
    
    // Dynamic messages - Lobby Creator
    'creator.creating': '⏳ Creating Lobby...',
    
    // Quick Match
    'quick.title': '🎯 Quick Match',
    'quick.back': '← Back',
    'quick.3v3.title': 'Quick 3v3',
    'quick.3v3.description': 'Fast-paced 3 vs 3 matches',
    'quick.3v3.button': 'Play 3v3',
    'quick.5v5.title': 'Quick 5v5',
    'quick.5v5.description': 'Standard 5 vs 5 matches',
    'quick.5v5.button': 'Play 5v5',
    'quick.queue.players': 'players in queue',
    'quick.searching.title': '🔍 Searching for Match',
    'quick.searching.mode': 'Mode:',
    'quick.searching.wait': 'Waiting:',
    'quick.searching.cancel': 'Cancel Search',
    'quick.found.title': '🎮 Match Found!',
    'quick.found.starting': 'Starting server...',
    'quick.found.red': 'Red Team',
    'quick.found.blue': 'Blue Team',
    'quick.found.preparing': 'Preparing server...',
    'quick.error.title': '❌ Error',
    'quick.error.message': 'Something went wrong',
    'quick.error.retry': 'Try Again'
  },
  
  fr: {
    // Lobby Browser
    'lobby.browser.title': '🎮 Supraball',
    'lobby.browser.connecting': 'Connexion en cours...',
    'lobby.browser.connected': 'Connecté',
    'lobby.browser.refresh': '🔄 Actualiser',
    'lobby.browser.create': '➕ Créer un nouveau lobby',
    'lobby.browser.offline': '🎯 Entraînement hors ligne',
    'lobby.browser.empty.title': '🏆 Aucun lobby disponible',
    'lobby.browser.empty.subtitle': 'Créez le premier lobby et commencez un match!',
    'lobby.browser.empty.button': '➕ Créer le premier lobby',
    
    // Table headers
    'table.map': 'Carte',
    'table.lobbyname': 'Nom du lobby',
    'table.players': 'Joueurs',
    'table.mode': 'Mode',
    'table.status': 'Statut',
    'table.ping': 'Ping',
    
    // Lobby Creator
    'creator.title': '🏆 Créer un nouveau lobby',
    'creator.back': '← Retour à la liste des lobbies',
    'creator.map.title': '🗺️ Sélectionner la carte',
    'creator.type.title': '⚽ Type de lobby',
    'creator.type.3v3': '🎯 3v3',
    'creator.type.5v5': '🏆 5v5',
    'creator.mode.title': '🎮 Mode de jeu',
    'creator.mode.time': '⏱️ Temps',
    'creator.mode.goal': '🎯 Buts',
    'creator.time.title': '⏱️ Limite de temps',
    'creator.time.minutes': 'Minutes:',
    'creator.goal.title': '🎯 Limite de buts',
    'creator.goal.goals': 'Buts:',
    'creator.bots.title': '🤖 Bots',
    'creator.bots.enable': 'Activer le remplissage automatique',
    'creator.bots.description': 'Remplit automatiquement à 6 (3v3) ou 10 (5v5) joueurs',
    'creator.warmup.title': '⏱️ Temps d\'échauffement',
    'creator.warmup.minutes': 'Minutes:',
    'creator.cancel': '❌ Annuler',
    'creator.create': '✅ Créer le lobby',
    
    // Lobby View
    'view.title': 'Lobby',
    'view.back': '← Retour à la liste des lobbies',
    'view.settings': 'Paramètres',
    'view.info.map': 'Carte',
    'view.info.mode': 'Mode de jeu',
    'view.info.players': 'Joueurs',
    'view.info.status': 'Statut',
    'view.team.red': '🔴 Équipe rouge',
    'view.team.blue': '🔵 Équipe bleue',
    'view.team.join': 'Rejoindre',
    'view.ready': '✓ Prêt',
    'view.start': '🚀 Démarrer le match',
    'view.leave': 'Quitter le lobby',
    'view.you': 'Vous',
    'view.host': 'Hôte',
    'view.empty.slot': 'Place vide',
    'view.status.waiting': 'En attente',
    'view.status.ready': 'Prêt',
    'view.status.notready': 'Pas prêt',
    'view.save': '💾 Enregistrer les paramètres',
    'view.cancel.edit': '❌ Annuler',
    
    // Dynamic messages - Lobby View
    'view.player.you': 'VOUS',
    'view.slot.empty': 'En attente de joueur...',
    'view.status.waiting-start': '⏳ En attente du démarrage...',
    'view.status.waiting-players': '⏳ En attente de joueurs...',
    'view.status.starting': '🚀 Démarrage du serveur...',
    'view.status.server-ready': '✅ Serveur prêt! Connexion...',
    'view.status.connecting': '🎮 Connexion...',
    'view.status.server-error': '❌ Erreur serveur',
    'view.status.ingame': '🎮 Partie en cours...',
    'view.mode.time': 'Limite de temps',
    'view.mode.goal': 'Nombre de buts',
    'view.lobby.status.waiting': 'En attente',
    'view.lobby.status.starting': 'Démarrage...',
    'view.lobby.status.in-progress': 'En jeu',
    'view.lobby.status.finished': 'Terminé',
    'view.button.players-needed': '{count} Joueurs par équipe requis',
    'view.button.min-player-needed': 'Au moins 1 joueur requis',
    'view.button.start-with-bots': 'Démarrer (+{count} Bots)',
    
    // Dynamic messages - Lobby Browser
    'browser.status.waiting': '⏳ En attente',
    'browser.status.starting': '🚀 Démarrage...',
    'browser.status.running': '🎮 En cours',
    'browser.connected.full': 'Connecté au serveur maître',
    
    // Dynamic messages - Lobby Creator
    'creator.creating': '⏳ Création du lobby...',
    
    // Quick Match
    'quick.title': '🎯 Quick Match',
    'quick.back': '← Retour',
    'quick.3v3.title': 'Quick 3v3',
    'quick.3v3.description': 'Matchs rapides 3 contre 3',
    'quick.3v3.button': 'Jouer 3v3',
    'quick.5v5.title': 'Quick 5v5',
    'quick.5v5.description': 'Matchs standard 5 contre 5',
    'quick.5v5.button': 'Jouer 5v5',
    'quick.queue.players': 'joueurs en file',
    'quick.searching.title': '🔍 Recherche de match',
    'quick.searching.mode': 'Mode:',
    'quick.searching.wait': 'Attente:',
    'quick.searching.cancel': 'Annuler la recherche',
    'quick.found.title': '🎮 Match trouvé!',
    'quick.found.starting': 'Démarrage du serveur...',
    'quick.found.red': 'Équipe Rouge',
    'quick.found.blue': 'Équipe Bleue',
    'quick.found.preparing': 'Préparation du serveur...',
    'quick.error.title': '❌ Erreur',
    'quick.error.message': 'Quelque chose s\'est mal passé',
    'quick.error.retry': 'Réessayer'
  }
};

// Current language (default: Deutsch)
let currentLanguage = localStorage.getItem('supraball-language') || 'de';

// Translation function
function t(key, params = {}) {
  const translation = translations[currentLanguage]?.[key];
  if (!translation) {
    console.warn(`Translation missing for key: ${key} (language: ${currentLanguage})`);
    return key;
  }
  
  // Replace placeholders like {count}, {name}, etc.
  let result = translation;
  for (const [param, value] of Object.entries(params)) {
    result = result.replace(`{${param}}`, value);
  }
  
  return result;
}

// Set language
function setLanguage(lang) {
  if (!translations[lang]) {
    console.error(`Language not supported: ${lang}`);
    return;
  }
  currentLanguage = lang;
  localStorage.setItem('supraball-language', lang);
  
  // Update all elements with data-i18n attribute
  updateTranslations();
  
  // Dispatch event for custom updates
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
}

// Get current language
function getCurrentLanguage() {
  return currentLanguage;
}

// Update all translations in the document
function updateTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = t(key);
    
    // Update different element types appropriately
    if (element.tagName === 'INPUT' && (element.type === 'button' || element.type === 'submit')) {
      element.value = translation;
    } else if (element.tagName === 'INPUT' && element.placeholder !== undefined) {
      element.placeholder = translation;
    } else {
      element.textContent = translation;
    }
  });
}

// Initialize translations when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateTranslations);
} else {
  updateTranslations();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { t, setLanguage, getCurrentLanguage, updateTranslations };
}
