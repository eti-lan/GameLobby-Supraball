const fs = require('fs-extra');
const path = require('path');

// Move win-unpacked contents to _dist/client folder
const source = path.join(__dirname, '..', '_dist', 'win-unpacked');
const target = path.join(__dirname, '..', '_dist', 'client');

if (fs.existsSync(source)) {
  console.log('📦 Moving build output to _dist/client...');
  
  // Remove old client folder if exists
  if (fs.existsSync(target)) {
    fs.removeSync(target);
  }
  
  // Move win-unpacked to client
  fs.moveSync(source, target);
  
  console.log('✅ Build output moved to _dist/client');
} else {
  console.log('⚠️ win-unpacked folder not found');
}
