import '../styles/modulePage.css';

export default function MenuAIPage() {
  return (
    <div className="module-page">
      <header className="module-header">
        <h1>🤖 Perencanaan Menu & Analisis Gizi (AI)</h1>
        <p>AI membantu merencanakan menu dan analisis nilai gizi</p>
      </header>

      <main className="module-content">
        <div className="module-placeholder">
          <div className="status-badge">Under Development</div>
          <h2>Module under development</h2>
          <p>Fitur modul Menu Planning sedang dalam pengembangan. Kembali ke dashboard untuk mengakses fitur lainnya.</p>
          
          <div className="features-list">
            <h3>Fitur yang akan datang:</h3>
            <ul>
              <li>🤖 AI Menu Planner dengan algoritma nutrisi</li>
              <li>📊 Analisis nilai gizi lengkap per menu</li>
              <li>🌱 Rekomendasi menu berbasis musim & bahan lokal</li>
              <li>💰 Estimasi cost per portion</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
