const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf8');

// Remove @db.Text and @db.LongText
content = content.replace(/@db\.Text/g, '');
content = content.replace(/@db\.LongText/g, '');

// Remove map: "..." from @relation(...)
content = content.replace(/,\s*map:\s*"[^"]+"/g, '');
content = content.replace(/map:\s*"[^"]+"\s*/g, ''); // if it was the only arg

// Fix cyclic relations: user and family
// Add onDelete: NoAction, onUpdate: NoAction to Family -> user_family_head_idTouser
content = content.replace(
    /@relation\("family_head_idTouser", fields: \[head_id\], references: \[id\]\)/g, 
    '@relation("family_head_idTouser", fields: [head_id], references: [id], onDelete: NoAction, onUpdate: NoAction)'
);

fs.writeFileSync(schemaPath, content, 'utf8');
console.log('Schema updated again to fix MongoDB constraints!');
