import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Transfers() {
  const [transfers, setTransfers] = useState([]);
  const [stock, setStock] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [form, setForm] = useState({ sourceBaseId: '', destinationBaseId: '', equipmentTypeId: '', quantity: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.getBases(), api.getEquipmentTypes(), api.getTransfers(), api.getStock()])
      .then(([b, e, t, s]) => { setBases(b); setEquipment(e); setTransfers(t); setStock(s); })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({});
    try {
      await api.createTransfer({
        sourceBaseId: parseInt(form.sourceBaseId),
        destinationBaseId: parseInt(form.destinationBaseId),
        equipmentTypeId: parseInt(form.equipmentTypeId),
        quantity: parseInt(form.quantity)
      });
      setMessage({ type: 'success', text: 'Transfer completed successfully.' });
      setForm({ sourceBaseId: '', destinationBaseId: '', equipmentTypeId: '', quantity: '' });
      const [t, s] = await Promise.all([api.getTransfers(), api.getStock()]);
      setTransfers(t);
      setStock(s);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const getAvailable = (baseId, eqId) => {
    const item = stock.find(s => s.baseId === parseInt(baseId) && s.equipmentTypeId === parseInt(eqId));
    return item?.available ?? 0;
  };

  return (
    <div>
      <div className="page-header">
        <h1>Transfers</h1>
        <p>Cross-base asset transfers with atomic transaction safety</p>
      </div>

      <div className="form-card">
        <h3>Initiate Transfer</h3>
        {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Source Base</label>
              <select value={form.sourceBaseId} onChange={e => setForm(f => ({ ...f, sourceBaseId: e.target.value }))} required>
                <option value="">Select Source</option>
                {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Destination Base</label>
              <select value={form.destinationBaseId} onChange={e => setForm(f => ({ ...f, destinationBaseId: e.target.value }))} required>
                <option value="">Select Destination</option>
                {bases.filter(b => String(b.id) !== form.sourceBaseId).map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Equipment Type</label>
              <select value={form.equipmentTypeId} onChange={e => setForm(f => ({ ...f, equipmentTypeId: e.target.value }))} required>
                <option value="">Select Equipment</option>
                {equipment.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Quantity {form.sourceBaseId && form.equipmentTypeId && (
                <span style={{ color: '#059669' }}>(Available: {getAvailable(form.sourceBaseId, form.equipmentTypeId)})</span>
              )}</label>
              <input type="number" min="1" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} required />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-success" type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Execute Transfer'}
            </button>
          </div>
        </form>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>From</th>
              <th>To</th>
              <th>Equipment</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Initiated By</th>
            </tr>
          </thead>
          <tbody>
            {transfers.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', color: '#999' }}>No transfers recorded</td></tr>
            ) : transfers.map(t => (
              <tr key={t.id}>
                <td>{t.timestamp?.split('T')[0] || t.timestamp?.split(' ')[0]}</td>
                <td>{t.source_base_name}</td>
                <td>{t.destination_base_name}</td>
                <td>{t.equipment_name}</td>
                <td><strong>{t.quantity}</strong></td>
                <td><span className="badge" style={{ background: '#ecfdf5', color: '#065f46' }}>{t.status}</span></td>
                <td>{t.initiated_by_name || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
