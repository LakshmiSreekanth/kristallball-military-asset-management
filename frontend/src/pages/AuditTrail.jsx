import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function AuditTrail() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAuditLogs()
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const actionColors = {
    PURCHASE: '#3b82f6',
    TRANSFER: '#059669',
    ASSIGNMENT: '#d97706',
    EXPENDITURE: '#dc2626'
  };

  return (
    <div>
      <div className="page-header">
        <h1>Audit Trail</h1>
        <p>Complete log of all asset mutations across the system</p>
      </div>

      {loading ? (
        <div className="loading">Loading audit logs...</div>
      ) : (
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', color: '#999' }}>No audit logs</td></tr>
              ) : logs.map(log => (
                <tr key={log.id}>
                  <td>{log.created_at?.replace('T', ' ').split('.')[0]}</td>
                  <td>{log.username || 'System'}</td>
                  <td>
                    <span className="badge" style={{
                      background: actionColors[log.action] + '20',
                      color: actionColors[log.action]
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td>{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
