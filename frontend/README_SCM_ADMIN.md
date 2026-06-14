# 📱 Platform SCM MBG - Master Admin Frontend

## Struktur Proyek

```
frontend/
├── src/
│   ├── components/
│   │   ├── SidebarSCM.tsx           # Sidebar navigation dengan 6 menu
│   │   ├── Header.tsx                # Top header dengan info Master Admin & logout
│   │   ├── KPICards.tsx              # 4 KPI cards dengan status color coding
│   │   ├── EfficiencyChart.tsx       # Line chart Efisiensi vs Konsumsi (7 hari)
│   │   ├── SystemAlerts.tsx          # Tabel peringatan sistem lintas modul
│   │   ├── MainDashboard.tsx         # Dashboard utama (gabungan semua komponen)
│   │   ├── ModulePlaceholder.tsx     # Placeholder untuk modul under development
│   │   ├── MainLayout.tsx            # Layout wrapper (sidebar + content)
│   │   └── Header.tsx, KPICards.tsx, ... (komponen dashboard)
│   ├── types/
│   │   └── index.ts                  # TypeScript interfaces & types
│   ├── styles/
│   │   └── globals.css               # Tailwind CSS directives
│   ├── App.tsx                       # Entry point dengan login + routing
│   └── main.tsx                      # React DOM render
├── tailwind.config.js                # Tailwind config (dark mode theme)
├── postcss.config.js                 # PostCSS config untuk Tailwind
└── package.json
```

## Fitur Utama

### 1. Login Screen
- Username: `admin`
- Password: `admin123`
- Dark mode gradient background
- Demo credentials display

### 2. Master Dashboard
- **Header**: Menampilkan "Master Admin" + Info user + Logout button
- **KPI Cards (4 buah)**:
  - Total Dapur Aktif: 12 ✓ NORMAL
  - Stok Kritis: 5 item ⚠️ KRITIS (merah)
  - Efisiensi AI: 92% ✓ NORMAL
  - Pengiriman Hari Ini: 24 order ⚡ PERHATIAN (kuning)
  
- **Line Chart**: Tren Efisiensi Produksi vs Pengeluaran Bahan Baku (7 hari terakhir)
  - Menggunakan Recharts library
  - 2 line series: Efisiensi (hijau) & Konsumsi (indigo)
  - Interactive tooltips

- **System Alerts Table**: 4 peringatan dummy dengan:
  - Tanggal & waktu
  - Modul asal
  - Pesan peringatan
  - Severity level (Low/Medium/High)
  - Status (Resolved/Pending/Critical)

### 3. Sidebar Navigation
- **Menu Items**:
  1. Dashboard Global SCM (aktif menampilkan dashboard)
  2-6. Placeholder modul (menampilkan "Under Development")
- **Fitur**:
  - Collapse/expand toggle
  - Active state highlighting (emerald gradient)
  - Responsive icons
  - Version info

### 4. Module Placeholders
- Menampilkan untuk menu 2-6 (Produksi, Bahan Baku, Menu Planning, Logistik, Tracking)
- Design: ⏳ icon + pesan "Modul Sedang Dalam Pengerjaan"
- Shows development phases: Planning → Development → Testing

## Tech Stack

- **React 18.2** + TypeScript
- **Tailwind CSS** (Dark Mode)
- **Recharts** (Data visualization)
- **Vite** (Build tool)
- **Node v25**

## Install & Run

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

Server akan berjalan di `http://localhost:3001` (port 3000 mungkin sudah terpakai)

## CSS Framework

Menggunakan **Tailwind CSS** dengan custom theme:
- Background utama: `bg-gray-900`
- Card: `bg-gray-800`
- Border: `border-gray-700`
- Text: `text-white` / `text-gray-300`
- Accent colors: 
  - Hijau emerald untuk status normal/positive
  - Merah untuk critical
  - Kuning untuk warning
  - Indigo untuk secondary info

## TypeScript Interfaces

### KPICard
```typescript
interface KPICard {
  id: string;
  title: string;
  value: number | string;
  unit?: string;
  trend?: number;
  status: 'normal' | 'warning' | 'critical';
  icon: string;
}
```

### ChartDatapoint
```typescript
interface ChartDatapoint {
  date: string;
  efficiency: number;
  consumption: number;
}
```

### SystemAlert
```typescript
interface SystemAlert {
  id: string;
  date: string;
  module: string;
  message: string;
  status: 'resolved' | 'pending' | 'critical';
  severity: 'low' | 'medium' | 'high';
}
```

### MenuItemType
```typescript
interface MenuItemType {
  id: string;
  label: string;
  icon: string;
  path: string;
}
```

## Data Flow

```
App.tsx (Login/State Management)
    ├── LoginScreen (if not logged in)
    └── MainLayout (if logged in)
        ├── Sidebar (Navigation)
        └── Content Area
            ├── MainDashboard (if activeMenu === 'dashboard')
            │   ├── Header
            │   ├── KPICards
            │   ├── EfficiencyChart
            │   └── SystemAlerts
            └── ModulePlaceholder (if activeMenu !== 'dashboard')
```

## Dummy Data

Semua data menggunakan `useMemo()` untuk performance optimization:
- **KPI Values**: Hardcoded dengan trend indicators
- **Chart Data**: 7 hari dengan pattern: efisiensi naik, konsumsi turun
- **Alerts**: 4 contoh peringatan dengan severity berbeda

## Customization

### Mengubah Warna Theme
Edit `tailwind.config.js` pada section `colors`:
```javascript
colors: {
  primary: { ... }, // Ubah emerald menjadi indigo/blue/etc
}
```

### Menambah KPI Cards
Di `MainDashboard.tsx`, tambah item ke array `kpiCards`:
```typescript
{
  id: '5',
  title: 'New Metric',
  value: 100,
  unit: 'unit',
  trend: 2,
  status: 'normal',
  icon: '📊',
}
```

### Menambah System Alerts
Di `MainDashboard.tsx`, tambah item ke array `systemAlerts`:
```typescript
{
  id: '5',
  date: '2026-04-16 XX:XX',
  module: 'Module Name',
  message: 'Alert message here',
  status: 'pending',
  severity: 'medium',
}
```

## Notes

- ✅ Pure UI/Frontend - tidak ada backend integration (kecuali untuk login dummy)
- ✅ Full TypeScript support dengan strict mode
- ✅ Responsive design (mobile-friendly dengan Tailwind)
- ✅ Dark mode by default
- ✅ Semua dummy data bersifat statis dalam component
- ❌ Belum connected ke backend (bisa ditambahkan nanti)

## Next Steps

Untuk integration dengan backend:
1. Update `App.tsx` login function untuk call API endpoint
2. Replace dummy data di `MainDashboard.tsx` dengan API calls
3. Update KPI cards, chart data, alerts dari API responses
4. Add loading states & error handling

---

**Version**: 1.0  
**Created**: 2026-04-16  
**Author**: Master Admin Dashboard Team
