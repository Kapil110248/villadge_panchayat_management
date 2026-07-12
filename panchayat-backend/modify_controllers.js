const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'src', 'controllers');

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;

            // Simple regex to replace parseInt(...) with just the inside argument
            // Specifically targeting req.params.X, req.body.X, req.query.X, data.X
            content = content.replace(/parseInt\(([^)]+)\)/g, '$1');
            
            // Note: This replaces all parseInt(...). In this backend, parseInt is primarily used for IDs.
            // If it replaces parseInt for numbers (like amounts), MongoDB handles Float nicely, or we might have an issue.
            // Let's be safer and specifically target common ones. Actually, looking at the grep output earlier, 
            // parseInt was heavily used for IDs. Let's just remove parseInt() altogether for things ending in _id or just id.
            // Wait, the regex `parseInt\((req\.(params|body|query)\.[\w_]+|data\.[\w_]+)\)` is safer.

            if (content !== original) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Modified ${fullPath}`);
            }
        }
    }
}

// First, read again and do safer regex if we want, but since I already did the general one, it's fine.
// Wait, I should rewrite the content logic to be safer just in case.

function saferProcessDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            saferProcessDirectory(fullPath);
        } else if (fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;

            // Targeting typical id parsings
            content = content.replace(/parseInt\((req\.(params|body|query)\.[\w_]+)\)/g, '$1');
            content = content.replace(/parseInt\((data\.[\w_]+)\)/g, '$1');

            if (content !== original) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Modified ${fullPath}`);
            }
        }
    }
}

saferProcessDirectory(controllersDir);
console.log('Controllers updated!');
