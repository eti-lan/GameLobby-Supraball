const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', '_dist', 'master-server');
const sourceFiles = [
    'server.js',
    'lobby-manager.js',
    'port-manager.js',
    'server-manager.js',
    'package.json',
    'package-lock.json'
];

// Create dist directory
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Copy source files
console.log('Building master-server...');
sourceFiles.forEach(file => {
    const src = path.join(__dirname, file);
    const dest = path.join(distDir, file);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`Copied: ${file}`);
    }
});

// Copy node_modules
const nodeModulesSrc = path.join(__dirname, 'node_modules');
const nodeModulesDest = path.join(distDir, 'node_modules');

if (fs.existsSync(nodeModulesSrc)) {
    console.log('Copying node_modules...');
    copyDir(nodeModulesSrc, nodeModulesDest);
    console.log('node_modules copied successfully');
}

console.log('Build completed successfully!');
console.log(`Output: ${distDir}`);

function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
