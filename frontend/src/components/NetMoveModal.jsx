export default function NetMoveModal({ metrics, onClose }) {
  if (!metrics) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Net Movement Breakdown</h2>
        <div className="modal-row">
          <span>Purchases (+)</span>
          <span className="text-green">+{metrics.purchases}</span>
        </div>
        <div className="modal-row">
          <span>Transfers In (+)</span>
          <span className="text-green">+{metrics.transfersIn}</span>
        </div>
        <div className="modal-row">
          <span>Transfers Out (-)</span>
          <span className="text-red">-{metrics.transfersOut}</span>
        </div>
        <div className="modal-row total">
          <span>Total Net Movement</span>
          <span>{metrics.netMovement}</span>
        </div>
        <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
