const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf8');

// 1. Change provider to mongodb
content = content.replace(/provider\s*=\s*"mysql"/, 'provider = "mongodb"');

// 2. Change all id Int @id @default(autoincrement())
content = content.replace(/id\s+Int\s+@id\s+@default\(autoincrement\(\)\)/g, 'id String @id @default(auto()) @map("_id") @db.ObjectId');

// 3. Change foreign key fields (e.g. sender_id Int? -> sender_id String? @db.ObjectId)
// This is tricky because we need to find all foreign keys.
// A good heuristic: any field ending in _id that is Int or Int?
content = content.replace(/(\w+_id)\s+Int(\?)?/g, '$1 String$2 @db.ObjectId');

// 4. Also need to change some unique combinations or specific keys if they are Int
// E.g., employee_id, citizen_id, camp_id, etc.
// Let's do a more robust replacement: look for any model field that has `@relation` pointing to it, or is named like `_id`.
// Let's replace some specific ones known from schema:
const idFields = [
    'sender_id', 'employee_id', 'camp_id', 'citizen_id', 'processed_by_id',
    'user_id', 'assigned_to_id', 'head_id', 'meeting_id', 'created_by_id',
    'reviewed_by_id', 'suggestion_id', 'scheme_id', 'family_member_id'
];

for (const field of idFields) {
    const regex1 = new RegExp(`\\b${field}\\s+Int\\b`, 'g');
    content = content.replace(regex1, `${field} String @db.ObjectId`);
    const regex2 = new RegExp(`\\b${field}\\s+Int\\?\\b`, 'g');
    content = content.replace(regex2, `${field} String? @db.ObjectId`);
}

// 5. MongoDB relations don't use `onDelete: Cascade` in the same way, but Prisma MongoDB supports it, so we can leave it.
// 6. Fix `@@index` and `@@unique` ? Prisma MongoDB supports them but sometimes they need to be on the `_id` field. We leave them as is.

// 7. Remove any `map: "..."` from `@relation` ? No, Prisma handles them.
// Wait, Prisma requires foreign keys in MongoDB to be scalars of type String @db.ObjectId.
// Let's check `family` model: `head_id` is unique. 

fs.writeFileSync(schemaPath, content, 'utf8');
console.log('Schema updated for MongoDB!');
