import '../styles/stockAlert.css';

interface AlertItem {
  name: string;
  quantity: string;
}

interface StockAlertProps {
  alerts?: AlertItem[];
}

export default function StockAlert({ alerts }: StockAlertProps) {
  const dummyAlerts = alerts || [
    { name: 'Beras', quantity: '5 kg' },
    { name: 'Minyak Goreng', quantity: '2 liter' },
    { name: 'Telur', quantity: '20 butir' },
  ];

  return (
    <div className="stock-alert-card">
      <h2>Stok Hampir Habis</h2>
      <div className="alert-list">
        {dummyAlerts.map((alert, index) => (
          <div key={index} className="alert-item">
            <div className="alert-content">
              <div className="alert-name">⚠️ {alert.name}</div>
              <div className="alert-quantity">{alert.quantity}</div>
            </div>
            <div className="alert-badge">Hampir Habis</div>
          </div>
        ))}
      </div>
    </div>
  );
}
