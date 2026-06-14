import '../styles/modulePage.css';

export default function IngredientsPage() {
  return (
    <div className="module-page">
      <header className="module-header">
        <h1>📦 Bahan Baku & Pemasok Lokal</h1>
        <p>Monitoring stok bahan baku dan pemasok lokal</p>
      </header>

      <main className="module-content">
        <div className="module-placeholder">
          <div className="status-badge">Under Development</div>
          <h2>Module under development</h2>
          <p>Fitur modul Bahan Baku sedang dalam pengembangan. Kembali ke dashboard untuk mengakses fitur lainnya.</p>
          
          <div className="features-list">
            <h3>Fitur yang akan datang:</h3>
            <ul>
              <li>🏪 Database bahan baku dengan 500+ item</li>
              <li>📊 Tracking stok real-time per lokasi</li>
              <li>👨‍🌾 Manajemen supplier lokal terintegrasi</li>
              <li>🤖 Prediksi kebutuhan dengan AI</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
