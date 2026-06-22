# Supply Chain Management (SCM) Master Admin Dashboard

Proyek web aplikasi SCM tingkat lanjut dengan dukungan analitik AI (Gemini), pelaporan dinamis multi-dapur, manajemen inventaris, pelacakan logistik, pengaturan keuangan, dan sistem persetujuan pemasok (Vendor Approval). Dibangun menggunakan React + TypeScript (Vite) untuk frontend dan Node.js + Express + Knex.js + SQLite untuk backend.

## 🎯 Fitur Utama

- **Sistem Login Super Admin**: `admin` / `admin123` dengan akses penuh.
- **Dashboard Global SCM**: Tinjauan metrik utama secara real-time.
- **Manajemen Karyawan (Role & Gaji)**: Menambahkan, mengedit, dan memfilter data karyawan berdasarkan dapur.
- **Manajemen Persetujuan Pemasok (Vendor Approval)**: Modul untuk verifikasi, meninjau ulang, dan menyetujui calon pemasok bahan baku.
- **Sistem Pelaporan Universal**: Filter rentang tanggal (Harian, Bulanan, Tahunan, Kustom) dan ekspor laporan (XLSX, PDF) yang tersedia di seluruh modul.
- **Universal AI Analyst**: Dukungan analisis data secara otomatis menggunakan Gemini AI, mencakup seluruh modul.

## 📁 Struktur Project

```
maneki_project/
├── backend/
│   ├── database/       # Migrasi & Seeding Knex.js
│   ├── routes/         # Endpoint API Express (ai, employees, finance, modules, dll.)
│   ├── services/       # Service layer (aiHistoryService, reportService, dll.)
│   ├── server.js       # Entry point Backend
│   └── scm_mbg.sql     # Berkas database SQLite
└── frontend/
    ├── src/
    │   ├── components/ # Komponen UI re-usable (ReportFilterBar, SidebarMenu, dll.)
    │   ├── pages/      # Halaman modul utama (FinancePage, EmployeePage, dll.)
    │   ├── services/   # Service layer Frontend (aiHistoryService.ts, dll.)
    │   ├── App.tsx     # Router & Entry point Frontend
    │   └── main.tsx    
    └── vite.config.ts  
```

## 🚀 Cara Menjalankan

### 1. Backend Setup

```bash
cd backend
npm install
npm run migrate:latest  # Memperbarui skema database (jika ada perubahan)
npm run seed:run        # Mengisi data dummy (optional)
npm run dev             # Menjalankan server backend
```
Server backend akan berjalan di **http://localhost:5000**

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Frontend akan berjalan di **http://localhost:3000** atau port acak yang dialokasikan Vite.

---

## 🔗 PANDUAN INTEGRASI API (Untuk Web Teman/Partner)

Jika sistem SCM ini ingin dihubungkan dengan website lain (seperti web e-commerce, portal supplier eksternal, atau aplikasi kasir), Anda dapat memanfaatkan REST API backend yang telah disediakan.

### 1. Autentikasi API
Sebagian besar endpoint SCM dilindungi oleh token. Pastikan sistem eksternal melakukan login terlebih dahulu atau gunakan *Service Account Token* (Bearer Token) pada header.
```http
Authorization: Bearer <TOKEN_ANDA>
```

### 2. Endpoint Integrasi Utama

#### A. Integrasi Pemasok (Vendor) Eksternal
Jika web teman Anda adalah portal pendaftaran pemasok, mereka bisa mengirimkan data pendaftaran ke:
- **POST** `/api/vendors/register`
  - **Payload:** `{ "companyName": "PT XYZ", "category": "Bahan Baku", "contact": "0812...", "email": "xyz@mail.com" }`
  - **Fungsi:** Mengirim calon vendor ke antrean *Vendor Approval* di SCM ini.
- **GET** `/api/vendors/status/:id`
  - **Fungsi:** Mengecek status vendor (Pending/Approved/Rejected).

#### B. Integrasi Inventaris & Produksi
Jika web teman Anda adalah aplikasi kasir (POS) yang membutuhkan informasi ketersediaan stok:
- **GET** `/api/modules/bahan-baku`
  - **Fungsi:** Menarik data stok bahan baku secara real-time.
- **GET** `/api/modules/produksi`
  - **Fungsi:** Melihat status produksi harian per dapur.

#### C. Menarik Laporan AI secara Terpusat
- **GET** `/api/ai/history/all`
  - **Query Params:** `?reportType=monthly` (opsional: `startDate`, `endDate`)
  - **Fungsi:** Mengambil riwayat keputusan AI untuk ditampilkan di dashboard eksekutif gabungan.

### 3. Konfigurasi CORS
Secara default, backend SCM mengizinkan akses (CORS) dari semua domain (`*`). Jika aplikasi akan diunggah ke production, pastikan Anda memodifikasi konfigurasi CORS di `backend/server.js` untuk hanya mengizinkan URL web teman Anda demi alasan keamanan:

```javascript
// Di server.js
const corsOptions = {
  origin: ['https://web-teman-anda.com', 'https://web-lainnya.com'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
```

---
**Module SCM Master Admin** - © 2026
