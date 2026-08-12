import { queryAll, queryOne } from '../config/db.js';
import { getEffectiveBaseId } from '../middlewares/rbacMiddleware.js';

function buildDateConditions(dateCol, startDate, endDate, beforeDate) {
  let sql = '';
  const params = [];
  if (beforeDate) {
    sql += ` AND ${dateCol} < ?`;
    params.push(beforeDate);
  } else {
    if (startDate) {
      sql += ` AND ${dateCol} >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      // Handles string comparison for date strings or timestamps up to 23:59:59 of end date
      sql += ` AND (${dateCol} <= ? OR ${dateCol} <= ?)`;
      params.push(endDate, endDate + ' 23:59:59');
    }
  }
  return { sql, params };
}

function sumPurchases(baseId, equipmentTypeId, startDate, endDate, beforeDate) {
  let sql = 'SELECT COALESCE(SUM(quantity), 0) as total FROM purchases WHERE 1=1';
  const params = [];
  if (baseId) { sql += ' AND base_id = ?'; params.push(baseId); }
  if (equipmentTypeId) { sql += ' AND equipment_type_id = ?'; params.push(equipmentTypeId); }
  
  const dc = buildDateConditions('date', startDate, endDate, beforeDate);
  sql += dc.sql;
  params.push(...dc.params);

  return queryOne(sql, params)?.total || 0;
}

function sumTransfersIn(baseId, equipmentTypeId, startDate, endDate, beforeDate) {
  let sql = 'SELECT COALESCE(SUM(quantity), 0) as total FROM transfers WHERE 1=1';
  const params = [];
  if (baseId) { sql += ' AND destination_base_id = ?'; params.push(baseId); }
  if (equipmentTypeId) { sql += ' AND equipment_type_id = ?'; params.push(equipmentTypeId); }

  const dc = buildDateConditions('timestamp', startDate, endDate, beforeDate);
  sql += dc.sql;
  params.push(...dc.params);

  return queryOne(sql, params)?.total || 0;
}

function sumTransfersOut(baseId, equipmentTypeId, startDate, endDate, beforeDate) {
  let sql = 'SELECT COALESCE(SUM(quantity), 0) as total FROM transfers WHERE 1=1';
  const params = [];
  if (baseId) { sql += ' AND source_base_id = ?'; params.push(baseId); }
  if (equipmentTypeId) { sql += ' AND equipment_type_id = ?'; params.push(equipmentTypeId); }

  const dc = buildDateConditions('timestamp', startDate, endDate, beforeDate);
  sql += dc.sql;
  params.push(...dc.params);

  return queryOne(sql, params)?.total || 0;
}

function sumAssigned(baseId, equipmentTypeId, startDate, endDate, beforeDate) {
  let sql = 'SELECT COALESCE(SUM(quantity), 0) as total FROM assignments WHERE 1=1';
  const params = [];
  if (baseId) { sql += ' AND base_id = ?'; params.push(baseId); }
  if (equipmentTypeId) { sql += ' AND equipment_type_id = ?'; params.push(equipmentTypeId); }

  const dc = buildDateConditions('date', startDate, endDate, beforeDate);
  sql += dc.sql;
  params.push(...dc.params);

  return queryOne(sql, params)?.total || 0;
}

function sumExpended(baseId, equipmentTypeId, startDate, endDate, beforeDate) {
  let sql = 'SELECT COALESCE(SUM(quantity), 0) as total FROM expenditures WHERE 1=1';
  const params = [];
  if (baseId) { sql += ' AND base_id = ?'; params.push(baseId); }
  if (equipmentTypeId) { sql += ' AND equipment_type_id = ?'; params.push(equipmentTypeId); }

  const dc = buildDateConditions('date', startDate, endDate, beforeDate);
  sql += dc.sql;
  params.push(...dc.params);

  return queryOne(sql, params)?.total || 0;
}

export function getDashboardMetrics(req, res) {
  try {
    const baseId = getEffectiveBaseId(req, req.query.baseId ? parseInt(req.query.baseId) : null);
    const equipmentTypeId = req.query.equipmentTypeId ? parseInt(req.query.equipmentTypeId) : null;
    const { startDate, endDate } = req.query;

    // Opening balance is inventory prior to startDate.
    // If no startDate is specified, opening balance is 0.
    let openingBalance = 0;
    if (startDate) {
      const openingPurchases = sumPurchases(baseId, equipmentTypeId, null, null, startDate);
      const openingTransferIn = sumTransfersIn(baseId, equipmentTypeId, null, null, startDate);
      const openingTransferOut = sumTransfersOut(baseId, equipmentTypeId, null, null, startDate);
      const openingAssigned = sumAssigned(baseId, equipmentTypeId, null, null, startDate);
      const openingExpended = sumExpended(baseId, equipmentTypeId, null, null, startDate);

      openingBalance = openingPurchases + openingTransferIn - openingTransferOut - openingAssigned - openingExpended;
    }

    const purchases = sumPurchases(baseId, equipmentTypeId, startDate, endDate, null);
    const transfersIn = sumTransfersIn(baseId, equipmentTypeId, startDate, endDate, null);
    const transfersOut = sumTransfersOut(baseId, equipmentTypeId, startDate, endDate, null);
    const assigned = sumAssigned(baseId, equipmentTypeId, startDate, endDate, null);
    const expended = sumExpended(baseId, equipmentTypeId, startDate, endDate, null);

    const netMovement = purchases + transfersIn - transfersOut;
    const closingBalance = openingBalance + netMovement - assigned - expended;

    res.json({
      openingBalance,
      purchases,
      transfersIn,
      transfersOut,
      netMovement,
      assigned,
      expended,
      closingBalance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export function getBases(req, res) {
  const bases = queryAll('SELECT * FROM bases ORDER BY id');
  res.json(bases);
}

export function getEquipmentTypes(req, res) {
  const types = queryAll('SELECT * FROM equipment_types ORDER BY category, name');
  res.json(types);
}

export function getAuditLogs(req, res) {
  const baseId = getEffectiveBaseId(req, req.query.baseId ? parseInt(req.query.baseId) : null);
  let sql = `
    SELECT al.*, u.username
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE 1=1
  `;
  const params = [];
  if (baseId) {
    sql += ' AND u.base_id = ?';
    params.push(baseId);
  }
  sql += ' ORDER BY al.created_at DESC LIMIT 100';
  const logs = queryAll(sql, params);
  res.json(logs);
}
