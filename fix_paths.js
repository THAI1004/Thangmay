const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'views');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Replace ../../ and ../ for static paths
    content = content.replace(/(href|src)="(\.\.\/)+((assets|vendors|css|js|images|documentation|modules)\/[^"]+)"/g, '$1="/$3"');
    
    // Replace missing leading slash for assets, images, vendors, css, js
    content = content.replace(/(href|src)="((assets|vendors|css|js|images|documentation|modules)\/[^"]+)"/g, '$1="/$2"');

    // Also replace ../../index.html to /
    content = content.replace(/(href|src)="(\.\.\/)+index\.html"/g, '$1="/"');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed paths in ${filePath}`);
    }
}

function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            traverse(fullPath);
        } else if (file.endsWith('.ejs')) {
            fixFile(fullPath);
        }
    }
}

traverse(viewsDir);
console.log('Script completed.');
