import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../styles/stockChart.css';

interface StockChartProps {
  data?: Array<{ name: string; value: number }>;
}

export default function StockChart({ data }: StockChartProps) {
  const dummyData = data || [
    { name: 'Senin', value: 100 },
    { name: 'Selasa', value: 120 },
    { name: 'Rabu', value: 140 },
    { name: 'Kamis', value: 130 },
    { name: 'Jumat', value: 150 },
    { name: 'Sabtu', value: 170 },
    { name: 'Minggu', value: 160 },
  ];

  return (
    <div className="stock-chart-card">
      <h2>Tren Konsumsi Bahan</h2>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dummyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#16A34A" 
              strokeWidth={3}
              dot={{ fill: '#16A34A', r: 5 }}
              activeDot={{ r: 7 }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
