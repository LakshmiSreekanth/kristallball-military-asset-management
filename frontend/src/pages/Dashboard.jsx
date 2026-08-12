import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import NetMoveModal from '../components/NetMoveModal';

export default function Dashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [bases, setBases] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [filters, setFilters] = useState({ baseId: '', equipmentTypeId: '', startDate: '', endDate: '' });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getBases(), api.getEquipmentTypes()])
      .then(([b, e]) => { setBases(b); setEquipment(e); })
      .catch(console.error);
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [filters]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.baseId) params.baseId = filters.baseId;
      if (filters.equipmentTypeId) params.equipmentTypeId = filters.equipmentTypeId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      const data = await api.getDashboard(params);
      setMetrics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const maxBar = metrics ? Math.max(metrics.purchases, metrics.transfersIn, metrics.transfersOut, metrics.assigned, metrics.expended, 1) : 1;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Real-time inventory metrics — Closing = Opening + Net Movement − Assigned − Expended</p>
      </div>

      <div className="filter-bar">
        {user.role !== 'BASE_COMMANDER' && (
          <div className="filter-group">
            <label>Base</label>
            <select value={filters.baseId} onChange={e => setFilters(f => ({ ...f, baseId: e.target.value }))}>
              <option value="">All Bases</option>
              {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        )}
        <div className="filter-group">
          <label>Equipment Type</label>
          <select value={filters.equipmentTypeId} onChange={e => setFilters(f => ({ ...f, equipmentTypeId: e.target.value }))}>
            <option value="">All Types</option>
            {equipment.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Start Date</label>
          <input type="date" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} />
        </div>
        <div className="filter-group">
          <label>End Date</label>
          <input type="date" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} />
        </div>
        <button className="btn btn-primary" onClick={loadMetrics}>Apply</button>
      </div>

      {loading ? (
        <div className="loading">Loading metrics...</div>
      ) : metrics && (
        <>
          <div className="stat-grid">
            <StatCard title="Opening Balance" value={metrics.openingBalance} color="blue" />
            <StatCard
              title="Net Movement"
              value={metrics.netMovement}
              color="green"
              hint="(click for detail)"
              onClick={() => setShowModal(true)}
            />
            <StatCard title="Assigned" value={metrics.assigned} color="orange" />
            <StatCard title="Expended" value={metrics.expended} color="red" />
            <StatCard title="Closing Balance" value={metrics.closingBalance} color="blue" />
          </div>

          <div className="chart-section">
            <h3>Activity Breakdown</h3>
            <div className="bar-chart">
              {[
                { label: 'Purchases', value: metrics.purchases, cls: 'purchases' },
                { label: 'Transfers In', value: metrics.transfersIn, cls: 'transfers-in' },
                { label: 'Transfers Out', value: metrics.transfersOut, cls: 'transfers-out' },
                { label: 'Assigned', value: metrics.assigned, cls: 'assigned' },
                { label: 'Expended', value: metrics.expended, cls: 'expended' }
              ].map(bar => (
                <div className="bar-row" key={bar.label}>
                  <div className="bar-label">{bar.label}</div>
                  <div className="bar-track">
                    <div
                      className={`bar-fill ${bar.cls}`}
                      style={{ width: `${Math.max((bar.value / maxBar) * 100, bar.value > 0 ? 8 : 0)}%` }}
                    >
                      {bar.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {showModal && <NetMoveModal metrics={metrics} onClose={() => setShowModal(false)} />}
    </div>
  );
}
