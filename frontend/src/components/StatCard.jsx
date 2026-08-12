export default function StatCard({ title, value, color = 'blue', onClick, hint }) {
  return (
    <div className={`stat-card ${color}`} onClick={onClick}>
      <h3>{title}{hint && <span style={{ fontWeight: 400, textTransform: 'none' }}> {hint}</span>}</h3>
      <div className="value">{value ?? '—'}</div>
    </div>
  );
}
