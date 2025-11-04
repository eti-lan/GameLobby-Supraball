const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const distDir = path.join(__dirname, '..', '_dist', 'master-server');
const exePath = path.join(distDir, 'supraball-master-server.exe');
const iconPath = path.join(__dirname, 'icon.ico');

// Create dist directory
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

console.log('Building master-server executable...');
console.log('');

try {
    // Build the executable using pkg
    console.log('Compiling to .exe...');
    execSync('pkg . --target node18-win-x64 --output ../_dist/master-server/supraball-master-server.exe --public', {
        cwd: __dirname,
        stdio: 'inherit'
    });
    
    // NOTE: rcedit breaks pkg executables, so we skip icon for now
    // The .exe works fine without a custom icon
    console.log('');
    console.log('ℹ️  Skipping icon (rcedit breaks pkg executables)');
    
    console.log('');
    console.log('Build completed successfully!');
    console.log(`Output: ${exePath}`);
    console.log('');
    console.log('Run the server with: supraball-master-server.exe');
    
} catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
}
