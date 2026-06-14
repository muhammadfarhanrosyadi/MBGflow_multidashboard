import '../styles/modulePage.css';

export default function ProductionPage() {
  return (
    <div className="module-page">
      <header className="module-header">
        <h1>🏭 Manajemen Produksi & Multi Dapur</h1>
        <p>Monitoring aktivitas produksi semua dapur dan kapasitas produksi</p>
      </header>

      <main className="module-content">
        <div className="module-placeholder">
          <div className="status-badge">Under Development</div>
          <h2>Module under development</h2>
          <p>Fitur modul Produksi sedang dalam pengembangan. Kembali ke dashboard untuk mengakses fitur lainnya.</p>
          
          <div className="features-list">
            <h3>Fitur yang akan datang:</h3>
            <ul>
              <li>📊 Dashboard produksi real-time untuk 12 dapur</li>
              <li>📈 Monitoring kapasitas produksi per shift</li>
              <li>👥 Manajemen SDM dapur (chef, pekerja)</li>
              <li>⚙️ Monitoring peralatan produksi</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
