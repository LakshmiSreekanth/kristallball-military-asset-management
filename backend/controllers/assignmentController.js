import { queryAll, run, queryOne, transaction } from '../config/db.js';
import { getEffectiveBaseId } from '../middlewares/rbacMiddleware.js';
import { logAudit } from '../middlewares/loggerMiddleware.js';
import { getAvailableStock } from '../utils/stock.js';

export function getAssignments(req, res) {
  const baseId = getEffectiveBaseId(req, req.query.baseId ? parseInt(req.query.baseId) : null);
  let sql = `
    SELECT a.*, b.name as base_name, e.name as equipment_name, e.category, u.username as created_by_name
    FROM assignments a
    JOIN bases b ON a.base_id = b.id
    JOIN equipment_types e ON a.equipment_type_id = e.id
    LEFT JOIN users u ON a.created_by = u.id
    WHERE 1=1
  `;
  const params = [];
  if (baseId) { sql += ' AND a.base_id = ?'; params.push(baseId); }
  sql += ' ORDER BY a.date DESC';
  res.json(queryAll(sql, params));
}

export function createAssignment(req, res) {
  try {
    const { baseId, equipmentTypeId, personnelName, quantity, date } = req.body;
    const effectiveBaseId = getEffectiveBaseId(req, baseId);

    if (!effectiveBaseId || !equipmentTypeId || !personnelName || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'All fields required with positive quantity.' });
    }

    const resultId = transaction(() => {
      const available = getAvailableStock(effectiveBaseId, equipmentTypeId);
      if (available < quantity) {
        throw new Error(`Insufficient stock. Available: ${available}`);
      }

      const result = run(
        'INSERT INTO assignments (base_id, equipment_type_id, personnel_name, quantity, date, created_by) VALUES (?, ?, ?, ?, ?, ?)',
        [effectiveBaseId, equipmentTypeId, personnelName, quantity, date || new Date().toISOString().split('T')[0], req.user.id]
      );

      const equipment = queryOne('SELECT name FROM equipment_types WHERE id = ?', [equipmentTypeId]);
      logAudit(req.user.id, 'ASSIGNMENT', `Assigned ${quantity} x ${equipment?.name} to ${personnelName}`);

      return result.lastInsertRowid;
    });

    res.status(201).json({ message: 'Assignment recorded', id: resultId });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export function getExpenditures(req, res) {
  const baseId = getEffectiveBaseId(req, req.query.baseId ? parseInt(req.query.baseId) : null);
  let sql = `
    SELECT ex.*, b.name as base_name, e.name as equipment_name, e.category, u.username as created_by_name
    FROM expenditures ex
    JOIN bases b ON ex.base_id = b.id
    JOIN equipment_types e ON ex.equipment_type_id = e.id
    LEFT JOIN users u ON ex.created_by = u.id
    WHERE 1=1
  `;
  const params = [];
  if (baseId) { sql += ' AND ex.base_id = ?'; params.push(baseId); }
  sql += ' ORDER BY ex.date DESC';
  res.json(queryAll(sql, params));
}

export function createExpenditure(req, res) {
  try {
    const { baseId, equipmentTypeId, quantity, reason, date } = req.body;
    const effectiveBaseId = getEffectiveBaseId(req, baseId);

    if (!effectiveBaseId || !equipmentTypeId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'baseId, equipmentTypeId, and positive quantity required.' });
    }

    const resultId = transaction(() => {
      const available = getAvailableStock(effectiveBaseId, equipmentTypeId);
      if (available < quantity) {
        throw new Error(`Insufficient stock. Available: ${available}`);
      }

      const result = run(
        'INSERT INTO expenditures (base_id, equipment_type_id, quantity, reason, date, created_by) VALUES (?, ?, ?, ?, ?, ?)',
        [effectiveBaseId, equipmentTypeId, quantity, reason || '', date || new Date().toISOString().split('T')[0], req.user.id]
      );

      const equipment = queryOne('SELECT name FROM equipment_types WHERE id = ?', [equipmentTypeId]);
      logAudit(req.user.id, 'EXPENDITURE', `Expended ${quantity} x ${equipment?.name}. Reason: ${reason || 'N/A'}`);

      return result.lastInsertRowid;
    });

    res.status(201).json({ message: 'Expenditure recorded', id: resultId });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
