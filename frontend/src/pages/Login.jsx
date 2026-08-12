import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Military Asset Management</h1>
        <p className="subtitle">Kristallball Enterprise System</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', padding: 12 }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="demo-accounts">
          <h4>Demo Accounts (click to fill)</h4>
          <table>
            <tbody>
              <tr style={{ cursor: 'pointer' }} onClick={() => quickLogin('admin_user', 'AdminPass123!')}>
                <td><strong>Admin</strong></td>
                <td>admin_user / AdminPass123!</td>
              </tr>
              <tr style={{ cursor: 'pointer' }} onClick={() => quickLogin('commander_alpha', 'CommandPass123!')}>
                <td><strong>Commander</strong></td>
                <td>commander_alpha / CommandPass123!</td>
              </tr>
              <tr style={{ cursor: 'pointer' }} onClick={() => quickLogin('logistics_officer', 'LogisticsPass123!')}>
                <td><strong>Logistics</strong></td>
                <td>logistics_officer / LogisticsPass123!</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
