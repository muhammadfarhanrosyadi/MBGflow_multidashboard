import StatCard from '../components/StatCard';
import StockChart from '../components/StockChart';
import StockAlert from '../components/StockAlert';
import AIPrediction from '../components/AIPrediction';
import KitchenRanking from '../components/KitchenRanking';
import '../styles/dashboard.css';

interface DashboardProps {
  user: {
    username: string;
    role: string;
  };
  onLogout: () => void;
}

export default function Dashboard({ user }: DashboardProps) {
  return (
    <div className="dashboard-layout">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Dashboard SCM</h1>
            <p>Monitoring stok dapur pusat</p>
          </div>
          <div className="header-actions">
            <span className="user-badge">👤 {user.username}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Statistics Section */}
        <section className="stats-section">
          <StatCard 
            title="Total Stok Bahan" 
            value="1240" 
            icon="📦"
            trend="+12% dari minggu lalu"
            trendUp={true}
          />
          <StatCard 
            title="Dapur Aktif" 
            value="8" 
            icon="🍳"
            trend="Semua operational"
            trendUp={true}
          />
          <StatCard 
            title="Stok Hampir Habis" 
            value="3" 
            icon="⚠️"
            trend="Perlu reorder"
            trendUp={false}
          />
          <StatCard 
            title="Permintaan Mingguan" 
            value="420" 
            icon="📊"
            trend="+5% dari minggu lalu"
            trendUp={true}
          />
        </section>

        {/* Charts and Alerts Section */}
        <section className="main-grid">
          <div className="chart-section">
            <StockChart />
          </div>
          <div className="alerts-section">
            <StockAlert />
          </div>
        </section>

        {/* Prediction and Ranking Section */}
        <section className="secondary-grid">
          <AIPrediction />
          <KitchenRanking />
        </section>
      </main>
    </div>
  );
}
