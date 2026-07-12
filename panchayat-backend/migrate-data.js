// migrate-data.js
const mysql = require('mysql2/promise');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

function padId(id) {
    if (id === null || id === undefined) return null;
    return String(id).padStart(24, '0');
}

async function runMigration() {
    console.log("Connecting to MySQL...");
    const connection = await mysql.createConnection(process.env.MYSQL_URL);
    
    // List all tables we want to migrate
    const tables = [
        'user', 'citizenprofile', 'adminnotification', 'citizennotification',
        'complaint', 'family', 'notice', 'scheme', 'schemeapplication',
        'employee', 'attendance', 'leaverequest', 'healthcamp',
        'campregistration', 'certificate', 'feedback', 'gramsabhameeting',
        'sabhaattendance', 'sabhasuggestion', 'sabhasuggestionreply',
        'taxrecord', 'developmentproject', 'emergencyalert', 'agrischeme',
        'seasonaladvisory', 'rationreceipt', 'rationschedule',
        'registrationrequest', 'usersuggestion', 'suggestionvote',
        'villageasset', 'watersupplyschedule', 'watertank'
    ];

    // Boolean fields in MySQL that need to be converted from 1/0 to true/false for Prisma
    const booleanFields = [
        'is_read', 'is_active', 'is_published', 'notice_published',
        'active', 'citizen_confirmed'
    ];

    // Clear existing data to avoid duplicates if re-running
    // Actually, just let it fail or we can clear them. Since it failed halfway, 
    // it's safer to delete all records from MongoDB before inserting, or just insert them.
    // We will clear all tables first.
    console.log("Clearing existing MongoDB collections to retry...");
    for (const table of tables.slice().reverse()) {
        try {
            await prisma[table].deleteMany({});
        } catch (e) {
            // ignore
        }
    }

    for (const table of tables) {
        console.log(`Migrating table: ${table}...`);
        const [rows] = await connection.execute(`SELECT * FROM \`${table}\``);
        
        if (rows.length === 0) {
            console.log(`  No data in ${table}`);
            continue;
        }

        const transformedData = rows.map(row => {
            const newRow = { ...row };
            if (newRow.id) newRow.id = padId(newRow.id);
            
            for (const key of Object.keys(newRow)) {
                if (key.endsWith('_id') && newRow[key] !== null) {
                    newRow[key] = padId(newRow[key]);
                }
                if (booleanFields.includes(key) && newRow[key] !== null) {
                    newRow[key] = (newRow[key] === 1 || newRow[key] === true);
                }
            }
            return newRow;
        });

        try {
            await prisma[table].createMany({
                data: transformedData,
            });
            console.log(`  Successfully inserted ${rows.length} records into ${table}`);
        } catch (err) {
            console.error(`  Error migrating ${table}:`, err.message);
        }
    }

    await connection.end();
    await prisma.$disconnect();
    console.log("Migration Complete!");
}

runMigration().catch(console.error);
