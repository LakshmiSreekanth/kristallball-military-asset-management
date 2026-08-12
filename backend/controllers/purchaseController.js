import { queryAll, run, queryOne } from '../config/db.js';
import { getEffectiveBaseId } from '../middlewares/rbacMiddleware.js';
import { logAudit } from '../middlewares/loggerMiddleware.js';

export function getPurchases(req, res) {
  const baseId = getEffectiveBaseId(req, req.query.baseId ? parseInt(req.query.baseId) : null);
  let sql = `
    SELECT p.*, b.name as base_name, e.name as equipment_name, e.category, u.username as created_by_name
    FROM purchases p
    JOIN bases b ON p.base_id = b.id
    JOIN equipment_types e ON p.equipment_type_id = e.id
    LEFT JOIN users u ON p.created_by = u.id
    WHERE 1=1
  `;
  const params = [];
  if (baseId) { sql += ' AND p.base_id = ?'; params.push(baseId); }
  sql += ' ORDER BY p.created_at DESC';
  res.json(queryAll(sql, params));
}

export function createPurchase(req, res) {
  try {
    const { baseId, equipmentTypeId, quantity, date } = req.body;
    const effectiveBaseId = getEffectiveBaseId(req, baseId);

    if (!effectiveBaseId || !equipmentTypeId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'baseId, equipmentTypeId, and positive quantity required.' });
    }

    const result = run(
      'INSERT INTO purchases (base_id, equipment_type_id, quantity, date, created_by) VALUES (?, ?, ?, ?, ?)',
      [effectiveBaseId, equipmentTypeId, quantity, date || new Date().toISOString().split('T')[0], req.user.id]
    );

    const equipment = queryOne('SELECT name FROM equipment_types WHERE id = ?', [equipmentTypeId]);
    const base = queryOne('SELECT name FROM bases WHERE id = ?', [effectiveBaseId]);
    logAudit(req.user.id, 'PURCHASE', `Purchased ${quantity} x ${equipment?.name} at ${base?.name}`);

    res.status(201).json({ message: 'Purchase recorded successfully', id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
