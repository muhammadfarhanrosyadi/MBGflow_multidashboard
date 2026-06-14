import '../styles/kitchenRanking.css';

interface KitchenItem {
  rank: number;
  name: string;
  efficiency: number;
}

interface KitchenRankingProps {
  ranking?: KitchenItem[];
}

export default function KitchenRanking({ ranking }: KitchenRankingProps) {
  const dummyRanking = ranking || [
    { rank: 1, name: 'Dapur Jakarta', efficiency: 95 },
    { rank: 2, name: 'Dapur Bandung', efficiency: 88 },
    { rank: 3, name: 'Dapur Surabaya', efficiency: 85 },
    { rank: 4, name: 'Dapur Medan', efficiency: 80 },
  ];

  return (
    <div className="kitchen-ranking-card">
      <h2>Top Dapur Berdasarkan Efisiensi</h2>
      <div className="ranking-list">
        {dummyRanking.map((kitchen) => (
          <div key={kitchen.rank} className={`ranking-item ${kitchen.rank === 1 ? 'top' : ''}`}>
            <div className="ranking-position">
              <div className="rank-number">{kitchen.rank}</div>
              {kitchen.rank === 1 && <div className="badge-top">🏆 Top</div>}
            </div>
            <div className="ranking-content">
              <div className="kitchen-name">{kitchen.name}</div>
              <div className="efficiency-bar">
                <div 
                  className="efficiency-fill" 
                  style={{ width: `${kitchen.efficiency}%` }}
                ></div>
              </div>
              <div className="efficiency-percentage">{kitchen.efficiency}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
