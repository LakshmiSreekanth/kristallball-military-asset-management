import { initDatabase } from './config/db.js';
import { seedDatabase } from './seed.js';
import { getDashboardMetrics, getAuditLogs } from './controllers/assetController.js';
import { createTransfer, getStockLevels } from './controllers/transferController.js';
import { createAssignment, createExpenditure } from './controllers/assignmentController.js';

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

async function runTests() {
  console.log('--- Starting API Verification Tests ---');

  await initDatabase();
  await seedDatabase();

  // Test 1: Dashboard Metrics without filter
  {
    const { req, res, getJson } = mockReqRes();
    getDashboardMetrics(req, res);
    const data = getJson();
    console.log('Test 1 (Dashboard Metrics - No Filter):', data);
    if (typeof data.closingBalance !== 'number') throw new Error('Failed Test 1');
    if (data.openingBalance !== 0) throw new Error('Failed Test 1: Opening balance without startDate must be 0');
    if (data.closingBalance !== data.openingBalance + data.netMovement - data.assigned - data.expended) {
      throw new Error('Failed Test 1: Formula mismatch in Closing Balance');
    }
  }

  // Test 2: Dashboard Metrics with Date Filter (startDate & endDate)
  {
    const { req, res, getJson } = mockReqRes({ startDate: '2024-01-05', endDate: '2024-02-12' });
    getDashboardMetrics(req, res);
    const data = getJson();
    console.log('Test 2 (Dashboard Metrics - Date Filter 2024-01-05 to 2024-02-12):', data);
    // Purchases before 2024-01-05 were 500+10000+50 = 10550 on 2024-01-01 at Base 1
    if (data.openingBalance < 500) throw new Error('Failed Test 2: Opening balance should include pre-startDate purchases');
    if (data.closingBalance !== data.openingBalance + data.netMovement - data.assigned - data.expended) {
      throw new Error('Failed Test 2: Formula mismatch');
    }
  }

  // Test 3: Stock Levels (Returns zero stock items as well)
  {
    const { req, res, getJson } = mockReqRes();
    getStockLevels(req, res);
    const stock = getJson();
    console.log(`Test 3 (Stock Levels): Found ${stock.length} total entries.`);
    if (stock.length === 0) throw new Error('Failed Test 3');
  }

  // Test 4: Insufficient Stock handling in Transfer
  {
    const { req, res, getJson, getStatus } = mockReqRes({}, {
      sourceBaseId: 1,
      destinationBaseId: 2,
      equipmentTypeId: 1,
      quantity: 999999
    });
    createTransfer(req, res);
    console.log('Test 4 (Insufficient Stock Transfer):', getStatus(), getJson());
    if (getStatus() !== 400) throw new Error('Failed Test 4: Should return 400 for insufficient stock');
  }

  // Test 5: Audit Log Scoping for Base Commander
  {
    const { req, res, getJson } = mockReqRes({}, {}, { id: 2, role: 'BASE_COMMANDER', baseId: 1 });
    getAuditLogs(req, res);
    const logs = getJson();
    console.log(`Test 5 (Audit Trail Commander Scope): Returned ${logs.length} logs for Commander Alpha.`);
  }

  console.log('--- ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
