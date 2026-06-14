import '../styles/modulePage.css';

export default function TrackingPage() {
  return (
    <div className="module-page">
      <header className="module-header">
        <h1>🗺️ Mobile Distribution Tracking</h1>
        <p>Melacak pengiriman makanan secara real-time</p>
      </header>

      <main className="module-content">
        <div className="module-placeholder">
          <div className="status-badge">Under Development</div>
          <h2>Module under development</h2>
          <p>Fitur modul Tracking sedang dalam pengembangan. Kembali ke dashboard untuk mengakses fitur lainnya.</p>
          
          <div className="features-list">
            <h3>Fitur yang akan datang:</h3>
            <ul>
              <li>📱 Mobile app untuk driver (iOS & Android)</li>
              <li>🗺️ Live GPS tracking per pengiriman</li>
              <li>🔔 Notifikasi real-time untuk customer</li>
              <li>👥 Contact driver langsung dari app</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
