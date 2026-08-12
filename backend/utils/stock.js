import { queryOne } from '../config/db.js';

export function getAvailableStock(baseId, equipmentTypeId) {
  const purchases = queryOne(
    'SELECT COALESCE(SUM(quantity), 0) as t FROM purchases WHERE base_id = ? AND equipment_type_id = ?',
    [baseId, equipmentTypeId]
  )?.t || 0;

  const transferIn = queryOne(
    'SELECT COALESCE(SUM(quantity), 0) as t FROM transfers WHERE destination_base_id = ? AND equipment_type_id = ? AND (status IS NULL OR status = "COMPLETED")',
    [baseId, equipmentTypeId]
  )?.t || 0;

  const transferOut = queryOne(
    'SELECT COALESCE(SUM(quantity), 0) as t FROM transfers WHERE source_base_id = ? AND equipment_type_id = ? AND (status IS NULL OR status = "COMPLETED")',
    [baseId, equipmentTypeId]
  )?.t || 0;

  const assigned = queryOne(
    'SELECT COALESCE(SUM(quantity), 0) as t FROM assignments WHERE base_id = ? AND equipment_type_id = ?',
    [baseId, equipmentTypeId]
  )?.t || 0;

  const expended = queryOne(
    'SELECT COALESCE(SUM(quantity), 0) as t FROM expenditures WHERE base_id = ? AND equipment_type_id = ?',
    [baseId, equipmentTypeId]
  )?.t || 0;

  return purchases + transferIn - transferOut - assigned - expended;
}
