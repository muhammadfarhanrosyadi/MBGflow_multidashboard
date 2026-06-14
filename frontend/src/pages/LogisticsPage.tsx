import '../styles/modulePage.css';

export default function LogisticsPage() {
  return (
    <div className="module-page">
      <header className="module-header">
        <h1>🚚 Logistik & Distribusi (Fleet Management)</h1>
        <p>Manajemen armada distribusi bahan dan makanan</p>
      </header>

      <main className="module-content">
        <div className="module-placeholder">
          <div className="status-badge">Under Development</div>
          <h2>Module under development</h2>
          <p>Fitur modul Logistik sedang dalam pengembangan. Kembali ke dashboard untuk mengakses fitur lainnya.</p>
          
          <div className="features-list">
            <h3>Fitur yang akan datang:</h3>
            <ul>
              <li>🚗 Fleet management 50+ kendaraan</li>
              <li>📍 Route optimization dengan GPS</li>
              <li>📊 Real-time tracking pengiriman</li>
              <li>⚡ Manajemen pengiriman dengan akses control</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
