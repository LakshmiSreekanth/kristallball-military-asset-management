import { queryAll, run, queryOne, transaction } from '../config/db.js';
import { getEffectiveBaseId } from '../middlewares/rbacMiddleware.js';
import { logAudit } from '../middlewares/loggerMiddleware.js';
import { getAvailableStock } from '../utils/stock.js';

export function getTransfers(req, res) {
  const baseId = getEffectiveBaseId(req, req.query.baseId ? parseInt(req.query.baseId) : null);
  let sql = `
    SELECT t.*, sb.name as source_base_name, db.name as destination_base_name,
           e.name as equipment_name, e.category, u.username as initiated_by_name
    FROM transfers t
    JOIN bases sb ON t.source_base_id = sb.id
    JOIN bases db ON t.destination_base_id = db.id
    JOIN equipment_types e ON t.equipment_type_id = e.id
    LEFT JOIN users u ON t.initiated_by = u.id
    WHERE 1=1
  `;
  const params = [];
  if (baseId) {
    sql += ' AND (t.source_base_id = ? OR t.destination_base_id = ?)';
    params.push(baseId, baseId);
  }
  sql += ' ORDER BY t.timestamp DESC';
  res.json(queryAll(sql, params));
}

export function createTransfer(req, res) {
  try {
    const { sourceBaseId, destinationBaseId, equipmentTypeId, quantity } = req.body;

    if (!sourceBaseId || !destinationBaseId || !equipmentTypeId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'All fields required with positive quantity.' });
    }

    if (sourceBaseId === destinationBaseId) {
      return res.status(400).json({ message: 'Source and destination must differ.' });
    }

    if (req.user.role === 'BASE_COMMANDER' && req.user.baseId !== sourceBaseId && req.user.baseId !== destinationBaseId) {
      return res.status(403).json({ message: 'Cannot transfer from/to other bases.' });
    }

    const result = transaction(() => {
      const available = getAvailableStock(sourceBaseId, equipmentTypeId);
      if (available < quantity) {
        throw new Error(`Insufficient stock. Available: ${available}`);
      }

      const r = run(
        `INSERT INTO transfers (source_base_id, destination_base_id, equipment_type_id, quantity, initiated_by)
         VALUES (?, ?, ?, ?, ?)`,
        [sourceBaseId, destinationBaseId, equipmentTypeId, quantity, req.user.id]
      );

      const equipment = queryOne('SELECT name FROM equipment_types WHERE id = ?', [equipmentTypeId]);
      const src = queryOne('SELECT name FROM bases WHERE id = ?', [sourceBaseId]);
      const dst = queryOne('SELECT name FROM bases WHERE id = ?', [destinationBaseId]);
      logAudit(req.user.id, 'TRANSFER', `Transferred ${quantity} x ${equipment?.name} from ${src?.name} to ${dst?.name}`);

      return r.lastInsertRowid;
    });

    res.status(201).json({ message: 'Transfer completed successfully', transferId: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export function getStockLevels(req, res) {
  const baseId = getEffectiveBaseId(req, req.query.baseId ? parseInt(req.query.baseId) : null);
  const bases = baseId
    ? queryAll('SELECT * FROM bases WHERE id = ?', [baseId])
    : queryAll('SELECT * FROM bases');
  const equipment = queryAll('SELECT * FROM equipment_types');

  const stock = [];
  for (const base of bases) {
    for (const eq of equipment) {
      const available = getAvailableStock(base.id, eq.id);
      stock.push({
        baseId: base.id,
        baseName: base.name,
        equipmentTypeId: eq.id,
        equipmentName: eq.name,
        category: eq.category,
        available
      });
    }
  }
  res.json(stock);
}
