const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

let dbPath;

if (process.env.VERCEL) {
  dbPath = '/tmp/database.sqlite';
  const packagedDbPath = path.resolve(__dirname, '../database.sqlite');
  
  if (!fs.existsSync(dbPath)) {
    try {
      if (fs.existsSync(packagedDbPath)) {
        fs.copyFileSync(packagedDbPath, dbPath);
        console.log('Copied pre-seeded database to /tmp');
      } else {
        console.log('Packaged database not found, initDb will seed a new one in /tmp');
      }
    } catch (copyErr) {
      console.error('Failed to copy database file:', copyErr.message);
    }
  }
} else {
  dbPath = process.env.DB_PATH 
    ? path.resolve(process.env.DB_PATH) 
    : path.resolve(__dirname, '../database.sqlite');
}

// Ensure database parent directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Helper functions for db.run and db.all with Promises
const dbRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbGet = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const initDb = async () => {
  try {
    // 1. Create Users Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL,
        password TEXT NOT NULL
      )
    `);

    // 2. Create Contracts Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS contracts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contract_id TEXT UNIQUE NOT NULL,
        academy_name TEXT NOT NULL,
        equipment_category TEXT NOT NULL,
        contract_value REAL NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        renewal_date TEXT NOT NULL,
        price_revision REAL NOT NULL,
        relationship_manager TEXT NOT NULL,
        contact_person TEXT NOT NULL,
        contact_number TEXT NOT NULL,
        email TEXT NOT NULL,
        notes TEXT,
        status TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Create Audit Logs Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contract_id TEXT,
        action TEXT NOT NULL,
        performed_by TEXT NOT NULL,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed default users if they don't exist
    const userCount = await dbGet('SELECT COUNT(*) as count FROM users');
    if (userCount.count === 0) {
      console.log('Seeding default users...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await dbRun(
        'INSERT INTO users (name, email, role, password) VALUES (?, ?, ?, ?)',
        ['Admin User', 'admin@oxygensports.com', 'Admin', hashedPassword]
      );
      await dbRun(
        'INSERT INTO users (name, email, role, password) VALUES (?, ?, ?, ?)',
        ['John Doe', 'rm@oxygensports.com', 'Relationship Manager', hashedPassword]
      );
      await dbRun(
        'INSERT INTO users (name, email, role, password) VALUES (?, ?, ?, ?)',
        ['Jane Smith', 'jane@oxygensports.com', 'Relationship Manager', hashedPassword]
      );
      await dbRun(
        'INSERT INTO users (name, email, role, password) VALUES (?, ?, ?, ?)',
        ['Management User', 'mgmt@oxygensports.com', 'Management', hashedPassword]
      );
      console.log('Users seeded successfully.');
    }

    // Seed default contracts if they don't exist
    const contractCount = await dbGet('SELECT COUNT(*) as count FROM contracts');
    if (contractCount.count === 0) {
      console.log('Seeding default contracts...');
      
      // Let's seed varying dates relative to the base date 2026-06-08
      const contracts = [
        {
          contract_id: 'CTR-2025-001',
          academy_name: 'Apex Football Academy',
          equipment_category: 'Football Equipment',
          contract_value: 45000,
          start_date: '2025-05-15',
          end_date: '2026-05-15', // Expired
          renewal_date: '2026-05-15',
          price_revision: 5.5,
          relationship_manager: 'John Doe',
          contact_person: 'Robert Miller',
          contact_number: '+1-555-0199',
          email: 'robert@apexfootball.com',
          notes: 'Annual supply of pro soccer balls and practice cones.',
          status: 'Expired'
        },
        {
          contract_id: 'CTR-2025-002',
          academy_name: 'Vanguard Tennis Club',
          equipment_category: 'Tennis & Rackets',
          contract_value: 28000,
          start_date: '2025-06-25',
          end_date: '2026-06-25', // Expiring in ~17 days (Within 30 days)
          renewal_date: '2026-06-25',
          price_revision: 4.0,
          relationship_manager: 'John Doe',
          contact_person: 'Sarah Connor',
          contact_number: '+1-555-0244',
          email: 'sconnor@vanguardtennis.com',
          notes: 'Racket restringing machines and match balls.',
          status: 'Active'
        },
        {
          contract_id: 'CTR-2025-003',
          academy_name: 'Metro Cricket Arena',
          equipment_category: 'Cricket Gear',
          contract_value: 75000,
          start_date: '2025-08-05',
          end_date: '2026-08-05', // Expiring in ~58 days (Within 60 days)
          renewal_date: '2026-08-05',
          price_revision: 6.0,
          relationship_manager: 'Jane Smith',
          contact_person: 'Rahul Sharma',
          contact_number: '+1-555-0311',
          email: 'rahul@metrocricket.com',
          notes: 'Premium English willow bats and protective gear kits.',
          status: 'Active'
        },
        {
          contract_id: 'CTR-2025-004',
          academy_name: 'Pinnacle Basketball School',
          equipment_category: 'Basketball & Nets',
          contract_value: 35000,
          start_date: '2025-09-05',
          end_date: '2026-09-05', // Expiring in ~89 days (Within 90 days)
          renewal_date: '2026-09-05',
          price_revision: 5.0,
          relationship_manager: 'Jane Smith',
          contact_person: 'Marcus Vance',
          contact_number: '+1-555-0455',
          email: 'marcus@pinnaclehoops.com',
          notes: 'Indoor basketball court setups and leather basketballs.',
          status: 'Active'
        },
        {
          contract_id: 'CTR-2025-005',
          academy_name: 'Elite Swimming Center',
          equipment_category: 'Aquatic Gear',
          contract_value: 62000,
          start_date: '2025-05-30',
          end_date: '2026-05-30',
          renewal_date: '2027-05-30', // Renewed to next year
          price_revision: 3.5,
          relationship_manager: 'John Doe',
          contact_person: 'Elena Rostova',
          contact_number: '+1-555-0566',
          email: 'elena@eliteswim.com',
          notes: 'Training lane dividers, goggles, and swim caps.',
          status: 'Renewed'
        },
        {
          contract_id: 'CTR-2026-006',
          academy_name: 'Champions Athletics Club',
          equipment_category: 'Track & Field',
          contract_value: 95000,
          start_date: '2026-02-15',
          end_date: '2027-02-15', // Far expiry
          renewal_date: '2027-02-15',
          price_revision: 5.0,
          relationship_manager: 'Jane Smith',
          contact_person: 'David Briggs',
          contact_number: '+1-555-0677',
          email: 'dbriggs@championsathletics.com',
          notes: 'Electronic timers, hurdles, and starting blocks.',
          status: 'Active'
        },
        {
          contract_id: 'CTR-2026-007',
          academy_name: 'Dynamo Gymnastics Academy',
          equipment_category: 'Gymnastics Mats',
          contract_value: 50000,
          start_date: '2026-07-01',
          end_date: '2027-07-01', // Future starts
          renewal_date: '2027-07-01',
          price_revision: 4.5,
          relationship_manager: 'John Doe',
          contact_person: 'Nadia Coman',
          contact_number: '+1-555-0788',
          email: 'nadia@dynamogym.com',
          notes: 'Custom training mats and vaulting boards.',
          status: 'Pending'
        }
      ];

      for (const ctr of contracts) {
        await dbRun(`
          INSERT INTO contracts (
            contract_id, academy_name, equipment_category, contract_value, 
            start_date, end_date, renewal_date, price_revision, 
            relationship_manager, contact_person, contact_number, email, 
            notes, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `, [
          ctr.contract_id, ctr.academy_name, ctr.equipment_category, ctr.contract_value,
          ctr.start_date, ctr.end_date, ctr.renewal_date, ctr.price_revision,
          ctr.relationship_manager, ctr.contact_person, ctr.contact_number, ctr.email,
          ctr.notes, ctr.status
        ]);

        await dbRun(`
          INSERT INTO audit_logs (contract_id, action, performed_by, timestamp)
          VALUES (?, ?, ?, datetime('now'))
        `, [ctr.contract_id, 'Contract created via seed data', 'System']);
      }
      console.log('Contracts seeded successfully.');
    }
  } catch (error) {
    console.error('Database initialization error:', error.message);
  }
};

module.exports = {
  db,
  dbRun,
  dbAll,
  dbGet,
  initDb
};
