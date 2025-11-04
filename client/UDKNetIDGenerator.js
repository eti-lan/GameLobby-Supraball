// UDK-compatible NetID Generator for Supraball
const crypto = require('crypto');
const os = require('os');

/**
 * Generate a Steam-compatible NetID that matches UE3/Steam expectations
 * Format: 0x0110000100000000 + AccountID (Steam format)
 */
function generateNetID() {
  // Get hardware-based identifiers for consistency
  const hostname = os.hostname();
  const username = os.userInfo().username;
  const platform = os.platform();
  const networkInterfaces = os.networkInterfaces();
  
  // Get MAC address for hardware fingerprint
  let macAddress = '';
  for (const interfaceName in networkInterfaces) {
    const networkInterface = networkInterfaces[interfaceName];
    for (const addressInfo of networkInterface) {
      if (!addressInfo.internal && addressInfo.mac !== '00:00:00:00:00:00') {
        macAddress = addressInfo.mac;
        break;
      }
    }
    if (macAddress) break;
  }
  
  // Create a deterministic but unique identifier
  const hwFingerprint = `${hostname}-${username}-${platform}-${macAddress}`;
  
  // Use crypto hash for consistent results
  const hash = crypto.createHash('sha256').update(hwFingerprint).digest();
  
  // Extract 32-bit AccountID from hash (Steam format)
  const accountID = hash.readUInt32LE(0);
  
  // Combine with Steam base to create valid NetID
  // Steam base: 0x0110000100000000
  // Our NetID: 0x01100001 + AccountID (32-bit)
  const steamNetID = `0x01100001${(accountID >>> 0).toString(16).padStart(8, '0')}`;
  
  return steamNetID;
}

module.exports = {
  generateNetID
};
