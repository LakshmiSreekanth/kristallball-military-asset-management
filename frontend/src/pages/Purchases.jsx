import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Purchases() {
  const { user, hasRole } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [form, setForm] = useState({ baseId: '', equipmentTypeId: '', quantity: '', date: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.getBases(), api.getEquipmentTypes(), api.getPurchases()])
      .then(([b, e, p]) => {
        setBases(b);
        setEquipment(e);
        setPurchases(p);
        if (user.baseId) setForm(f => ({ ...f, baseId: String(user.baseId) }));
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({});
    try {
      await api.createPurchase({
        baseId: parseInt(form.baseId),
        equipmentTypeId: parseInt(form.equipmentTypeId),
        quantity: parseInt(form.quantity),
        date: form.date || undefined
      });
      setMessage({ type: 'success', text: 'Purchase recorded successfully.' });
      setForm(f => ({ ...f, equipmentTypeId: '', quantity: '', date: '' }));
      const updated = await api.getPurchases();
      setPurchases(updated);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const canCreate = hasRole('ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER');

  return (
    <div>
      <div className="page-header">
        <h1>Purchases</h1>
        <p>Log incoming assets and view purchase history</p>
      </div>

      {canCreate && (
        <div className="form-card">
          <h3>Record New Purchase</h3>
          {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {user.role !== 'BASE_COMMANDER' && (
                <div className="form-group">
                  <label>Base</label>
                  <select value={form.baseId} onChange={e => setForm(f => ({ ...f, baseId: e.target.value }))} required>
                    <option value="">Select Base</option>
                    {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Equipment Type</label>
                <select value={form.equipmentTypeId} onChange={e => setForm(f => ({ ...f, equipmentTypeId: e.target.value }))} required>
                  <option value="">Select Equipment</option>
                  {equipment.map(e => <option key={e.id} value={e.id}>{e.name} ({e.category})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input type="number" min="1" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-success" type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Record Purchase'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Base</th>
              <th>Equipment</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Recorded By</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', color: '#999' }}>No purchases recorded</td></tr>
            ) : purchases.map(p => (
              <tr key={p.id}>
                <td>{p.date?.split('T')[0] || p.date}</td>
                <td>{p.base_name}</td>
                <td>{p.equipment_name}</td>
                <td><span className={`badge badge-${p.category?.toLowerCase()}`}>{p.category}</span></td>
                <td><strong>{p.quantity}</strong></td>
                <td>{p.created_by_name || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
