import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Assignments() {
  const { user } = useAuth();
  const [tab, setTab] = useState('assignments');
  const [assignments, setAssignments] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [assignForm, setAssignForm] = useState({ baseId: '', equipmentTypeId: '', personnelName: '', quantity: '', date: '' });
  const [expendForm, setExpendForm] = useState({ baseId: '', equipmentTypeId: '', quantity: '', reason: '', date: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.getBases(), api.getEquipmentTypes(),
      api.getAssignments(), api.getExpenditures()
    ]).then(([b, e, a, ex]) => {
      setBases(b); setEquipment(e); setAssignments(a); setExpenditures(ex);
      if (user.baseId) {
        setAssignForm(f => ({ ...f, baseId: String(user.baseId) }));
        setExpendForm(f => ({ ...f, baseId: String(user.baseId) }));
      }
    }).catch(console.error);
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({});
    try {
      await api.createAssignment({
        baseId: parseInt(assignForm.baseId),
        equipmentTypeId: parseInt(assignForm.equipmentTypeId),
        personnelName: assignForm.personnelName,
        quantity: parseInt(assignForm.quantity),
        date: assignForm.date || undefined
      });
      setMessage({ type: 'success', text: 'Assignment recorded.' });
      setAssignForm(f => ({ ...f, personnelName: '', quantity: '', date: '' }));
      setAssignments(await api.getAssignments());
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleExpend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({});
    try {
      await api.createExpenditure({
        baseId: parseInt(expendForm.baseId),
        equipmentTypeId: parseInt(expendForm.equipmentTypeId),
        quantity: parseInt(expendForm.quantity),
        reason: expendForm.reason,
        date: expendForm.date || undefined
      });
      setMessage({ type: 'success', text: 'Expenditure recorded.' });
      setExpendForm(f => ({ ...f, quantity: '', reason: '', date: '' }));
      setExpenditures(await api.getExpenditures());
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Assignments & Expenditures</h1>
        <p>Track personnel assignments and consumed assets</p>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'assignments' ? 'active' : ''}`} onClick={() => { setTab('assignments'); setMessage({}); }}>
          Assignments
        </button>
        <button className={`tab ${tab === 'expenditures' ? 'active' : ''}`} onClick={() => { setTab('expenditures'); setMessage({}); }}>
          Expenditures
        </button>
      </div>

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      {tab === 'assignments' && (
        <>
          <div className="form-card">
            <h3>New Assignment</h3>
            <form onSubmit={handleAssign}>
              <div className="form-grid">
                {user.role !== 'BASE_COMMANDER' && (
                  <div className="form-group">
                    <label>Base</label>
                    <select value={assignForm.baseId} onChange={e => setAssignForm(f => ({ ...f, baseId: e.target.value }))} required>
                      <option value="">Select Base</option>
                      {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label>Equipment Type</label>
                  <select value={assignForm.equipmentTypeId} onChange={e => setAssignForm(f => ({ ...f, equipmentTypeId: e.target.value }))} required>
                    <option value="">Select Equipment</option>
                    {equipment.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Personnel Name</label>
                  <input value={assignForm.personnelName} onChange={e => setAssignForm(f => ({ ...f, personnelName: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input type="number" min="1" value={assignForm.quantity} onChange={e => setAssignForm(f => ({ ...f, quantity: e.target.value }))} required />
                </div>
              </div>
              <div className="form-actions">
                <button className="btn btn-success" type="submit" disabled={loading}>Record Assignment</button>
              </div>
            </form>
          </div>
          <div className="data-table">
            <table>
              <thead>
                <tr><th>Date</th><th>Base</th><th>Equipment</th><th>Personnel</th><th>Qty</th><th>By</th></tr>
              </thead>
              <tbody>
                {assignments.map(a => (
                  <tr key={a.id}>
                    <td>{a.date?.split('T')[0] || a.date}</td>
                    <td>{a.base_name}</td>
                    <td>{a.equipment_name}</td>
                    <td>{a.personnel_name}</td>
                    <td><strong>{a.quantity}</strong></td>
                    <td>{a.created_by_name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'expenditures' && (
        <>
          <div className="form-card">
            <h3>Record Expenditure</h3>
            <form onSubmit={handleExpend}>
              <div className="form-grid">
                {user.role !== 'BASE_COMMANDER' && (
                  <div className="form-group">
                    <label>Base</label>
                    <select value={expendForm.baseId} onChange={e => setExpendForm(f => ({ ...f, baseId: e.target.value }))} required>
                      <option value="">Select Base</option>
                      {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label>Equipment Type</label>
                  <select value={expendForm.equipmentTypeId} onChange={e => setExpendForm(f => ({ ...f, equipmentTypeId: e.target.value }))} required>
                    <option value="">Select Equipment</option>
                    {equipment.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input type="number" min="1" value={expendForm.quantity} onChange={e => setExpendForm(f => ({ ...f, quantity: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Reason</label>
                  <input value={expendForm.reason} onChange={e => setExpendForm(f => ({ ...f, reason: e.target.value }))} placeholder="Training, operation, etc." />
                </div>
              </div>
              <div className="form-actions">
                <button className="btn btn-success" type="submit" disabled={loading}>Record Expenditure</button>
              </div>
            </form>
          </div>
          <div className="data-table">
            <table>
              <thead>
                <tr><th>Date</th><th>Base</th><th>Equipment</th><th>Qty</th><th>Reason</th><th>By</th></tr>
              </thead>
              <tbody>
                {expenditures.map(ex => (
                  <tr key={ex.id}>
                    <td>{ex.date?.split('T')[0] || ex.date}</td>
                    <td>{ex.base_name}</td>
                    <td>{ex.equipment_name}</td>
                    <td><strong>{ex.quantity}</strong></td>
                    <td>{ex.reason || '—'}</td>
                    <td>{ex.created_by_name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
