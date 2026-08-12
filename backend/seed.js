import bcrypt from 'bcryptjs';
import { queryOne, run, queryAll } from './config/db.js';

export async function seedDatabase() {
  const existing = queryOne('SELECT COUNT(*) as c FROM users');
  if (existing?.c > 0) {
    console.log('Database already seeded.');
    return;
  }

  console.log('Seeding database...');

  const bases = [
    ['Fort Alpha', 'Northern Region'],
    ['Fort Bravo', 'Eastern Region'],
    ['Fort Charlie', 'Southern Region']
  ];
  for (const [name, location] of bases) {
    run('INSERT INTO bases (name, location) VALUES (?, ?)', [name, location]);
  }

  const equipment = [
    ['M4 Carbine', 'WEAPON'],
    ['Humvee', 'VEHICLE'],
    ['5.56mm Ammunition', 'AMMUNITION'],
    ['M240 Machine Gun', 'WEAPON'],
    ['MRAP Vehicle', 'VEHICLE'],
    ['7.62mm Ammunition', 'AMMUNITION']
  ];
  for (const [name, category] of equipment) {
    run('INSERT INTO equipment_types (name, category) VALUES (?, ?)', [name, category]);
  }

  const users = [
    ['admin_user', 'AdminPass123!', 'ADMIN', null],
    ['commander_alpha', 'CommandPass123!', 'BASE_COMMANDER', 1],
    ['logistics_officer', 'LogisticsPass123!', 'LOGISTICS_OFFICER', 1]
  ];
  for (const [username, password, role, baseId] of users) {
    const hash = await bcrypt.hash(password, 10);
    run('INSERT INTO users (username, password_hash, role, base_id) VALUES (?, ?, ?, ?)',
      [username, hash, role, baseId]);
  }

  const adminId = queryOne("SELECT id FROM users WHERE username = 'admin_user'")?.id;

  run('INSERT INTO purchases (base_id, equipment_type_id, quantity, date, created_by) VALUES (?, ?, ?, ?, ?)',
    [1, 1, 500, '2024-01-01', adminId]);
  run('INSERT INTO purchases (base_id, equipment_type_id, quantity, date, created_by) VALUES (?, ?, ?, ?, ?)',
    [1, 3, 10000, '2024-01-01', adminId]);
  run('INSERT INTO purchases (base_id, equipment_type_id, quantity, date, created_by) VALUES (?, ?, ?, ?, ?)',
    [1, 2, 50, '2024-01-01', adminId]);
  run('INSERT INTO purchases (base_id, equipment_type_id, quantity, date, created_by) VALUES (?, ?, ?, ?, ?)',
    [2, 1, 300, '2024-01-05', adminId]);
  run('INSERT INTO purchases (base_id, equipment_type_id, quantity, date, created_by) VALUES (?, ?, ?, ?, ?)',
    [2, 5, 30, '2024-01-05', adminId]);
  run('INSERT INTO purchases (base_id, equipment_type_id, quantity, date, created_by) VALUES (?, ?, ?, ?, ?)',
    [3, 4, 100, '2024-01-10', adminId]);
  run('INSERT INTO purchases (base_id, equipment_type_id, quantity, date, created_by) VALUES (?, ?, ?, ?, ?)',
    [3, 6, 5000, '2024-01-10', adminId]);

  run('INSERT INTO transfers (source_base_id, destination_base_id, equipment_type_id, quantity, initiated_by) VALUES (?, ?, ?, ?, ?)',
    [1, 2, 1, 50, adminId]);
  run('INSERT INTO transfers (source_base_id, destination_base_id, equipment_type_id, quantity, initiated_by) VALUES (?, ?, ?, ?, ?)',
    [2, 3, 5, 5, adminId]);

  run('INSERT INTO assignments (base_id, equipment_type_id, personnel_name, quantity, date, created_by) VALUES (?, ?, ?, ?, ?, ?)',
    [1, 1, 'Sgt. Johnson', 20, '2024-02-01', adminId]);
  run('INSERT INTO assignments (base_id, equipment_type_id, personnel_name, quantity, date, created_by) VALUES (?, ?, ?, ?, ?, ?)',
    [1, 2, 'Lt. Martinez', 5, '2024-02-05', adminId]);

  run('INSERT INTO expenditures (base_id, equipment_type_id, quantity, reason, date, created_by) VALUES (?, ?, ?, ?, ?, ?)',
    [1, 3, 500, 'Training exercise', '2024-02-10', adminId]);
  run('INSERT INTO expenditures (base_id, equipment_type_id, quantity, reason, date, created_by) VALUES (?, ?, ?, ?, ?, ?)',
    [3, 6, 200, 'Field operation', '2024-02-15', adminId]);

  run('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
    [adminId, 'PURCHASE', 'Initial seed: Stock loaded across all bases']);
  run('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
    [adminId, 'TRANSFER', 'Initial seed: Cross-base transfers completed']);

  console.log('Database seeded successfully.');
}
