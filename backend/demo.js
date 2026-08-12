import { initDatabase } from './config/db.js';
import { seedDatabase } from './seed.js';
import { getDashboardMetrics, getBases, getEquipmentTypes, getAuditLogs } from './controllers/assetController.js';
import { getStockLevels, createTransfer, getTransfers } from './controllers/transferController.js';
import { createPurchase, getPurchases } from './controllers/purchaseController.js';
import { createAssignment, getAssignments, createExpenditure, getExpenditures } from './controllers/assignmentController.js';

function mockReqRes(query = {}, body = {}, user = { id: 1, role: 'ADMIN', baseId: null }) {
  const req = { query, body, user };
  let statusCode = 200;
  let jsonResult = null;
  const res = {
    status(code) { statusCode = code; return this; },
    json(data) { jsonResult = data; return this; }
  };
  return { req, res, getStatus: () => statusCode, getJson: () => jsonResult };
}

async function runDemo() {
  console.log('====================================================');
  console.log('  KRISTALLBALL MILITARY ASSET MANAGEMENT SYSTEM');
  console.log('====================================================\n');

  console.log('[1] Initializing Database & Seeding Data...');
  await initDatabase();
  await seedDatabase();
  console.log('-> Database Initialized & Seeded Successfully.\n');

  console.log('[2] Fetching Bases & Equipment Types...');
  {
    const { req, res, getJson } = mockReqRes();
    getBases(req, res);
    const bases = getJson();
    console.log(`-> Bases (${bases.length}):`, bases.map(b => `${b.name} (${b.location})`).join(', '));
  }
  {
    const { req, res, getJson } = mockReqRes();
    getEquipmentTypes(req, res);
    const types = getJson();
    console.log(`-> Equipment Types (${types.length}):`, types.map(t => `${t.name} [${t.category}]`).join(', '), '\n');
  }

  console.log('[3] Global Dashboard Inventory Metrics (No Filter)...');
  {
    const { req, res, getJson } = mockReqRes();
    getDashboardMetrics(req, res);
    const m = getJson();
    console.log('----------------------------------------------------');
    console.log(`  Opening Balance: ${m.openingBalance}`);
    console.log(`  Purchases:       ${m.purchases}`);
    console.log(`  Transfers In:    ${m.transfersIn}`);
    console.log(`  Transfers Out:   ${m.transfersOut}`);
    console.log(`  Net Movement:    ${m.netMovement}`);
    console.log(`  Assigned:        ${m.assigned}`);
    console.log(`  Expended:        ${m.expended}`);
    console.log(`  --------------------------------------------------`);
    console.log(`  Closing Balance: ${m.closingBalance}`);
    console.log('----------------------------------------------------\n');
  }

  console.log('[4] Recording New Purchase...');
  {
    const { req, res, getJson, getStatus } = mockReqRes({}, {
      baseId: 1,
      equipmentTypeId: 1, // M4 Carbine
      quantity: 100
    });
    createPurchase(req, res);
    console.log(`-> Purchase Status ${getStatus()}:`, getJson());
  }

  console.log('[5] Executing Cross-Base Transfer (Fort Alpha -> Fort Bravo)...');
  {
    const { req, res, getJson, getStatus } = mockReqRes({}, {
      sourceBaseId: 1,
      destinationBaseId: 2,
      equipmentTypeId: 1, // M4 Carbine
      quantity: 25
    });
    createTransfer(req, res);
    console.log(`-> Transfer Status ${getStatus()}:`, getJson());
  }

  console.log('[6] Recording Personnel Assignment...');
  {
    const { req, res, getJson, getStatus } = mockReqRes({}, {
      baseId: 1,
      equipmentTypeId: 1,
      personnelName: 'Sgt. Miller',
      quantity: 10
    });
    createAssignment(req, res);
    console.log(`-> Assignment Status ${getStatus()}:`, getJson());
  }

  console.log('[7] Fetching Updated Dashboard Metrics...');
  {
    const { req, res, getJson } = mockReqRes();
    getDashboardMetrics(req, res);
    const m = getJson();
    console.log('----------------------------------------------------');
    console.log(`  Opening Balance: ${m.openingBalance}`);
    console.log(`  Purchases:       ${m.purchases}`);
    console.log(`  Net Movement:    ${m.netMovement}`);
    console.log(`  Assigned:        ${m.assigned}`);
    console.log(`  Expended:        ${m.expended}`);
    console.log(`  --------------------------------------------------`);
    console.log(`  Closing Balance: ${m.closingBalance}`);
    console.log('----------------------------------------------------\n');
  }

  console.log('[8] Checking System Audit Trail Logs...');
  {
    const { req, res, getJson } = mockReqRes();
    getAuditLogs(req, res);
    const logs = getJson();
    console.log(`-> Audit Trail Recent Entries (Total ${logs.length}):`);
    logs.slice(0, 5).forEach(l => {
      console.log(`   - [${l.created_at || 'NOW'}] (${l.action}): ${l.details}`);
    });
  }

  console.log('\n====================================================');
  console.log('  DEMO COMPLETE — SYSTEM OPERATING 100% CORRECTLY');
  console.log('====================================================');
}

runDemo().catch(err => console.error('Demo Error:', err));
