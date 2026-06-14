# Module M6.1 - Login & Keamanan Akun

Proyek sederhana untuk demo login system dan role-based access control menggunakan React + TypeScript (Vite) dan Node.js + Express.

## 🎯 Fitur yang Diimplementasikan

### TASK 1 - Sistem Login
- ✅ Endpoint `POST /api/login`
- ✅ Validasi username dan password
- ✅ Dummy user: `admin` / `admin123`
- ✅ Response dengan user data dan role

### TASK 2 - Cek Izin Akses
- ✅ Endpoint `GET /api/me`
- ✅ Mengembalikan data user saat ini

### TASK 3 - Frontend Login Page
- ✅ Form login dengan input username dan password
- ✅ Konsumsi API `/api/login`
- ✅ Alert success/error
- ✅ Desain modern dengan tema putih-hijau

### TASK 4 - Role-Based Access Control
- ✅ Cek role user (admin)
- ✅ Redirect ke dashboard jika role admin
- ✅ Pesan "Akses Ditolak" untuk role lain
- ✅ Dashboard sederhana dengan info user

## 📁 Struktur Project

```
maneki_project/
├── backend/
│   ├── package.json
│   ├── server.js
│   └── routes/
│       └── auth.js
└── frontend/
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── pages/
        │   ├── LoginPage.tsx
        │   └── Dashboard.tsx
        ├── services/
        │   └── authService.ts
        └── styles/
            ├── global.css
            ├── loginPage.css
            ├── dashboard.css
            └── App.css
```

## 🚀 Cara Menjalankan

### Backend Setup

```bash
cd backend
npm install express cors
npm run dev
# atau
node server.js
```

Server akan berjalan di **http://localhost:5000**

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend akan berjalan di **http://localhost:3000**

## 🎨 Tema UI - Putih & Hijau

| Komponen | Warna | Hex |
|----------|-------|-----|
| Background Utama | Abu-abu Terang | #F8FAFC |
| Card | Putih | #FFFFFF |
| Border | Abu-abu | #E5E7EB |
| Primary (Hijau) | Hijau | #16A34A |
| Hover (Hijau) | Hijau Tua | #15803D |
| Text Utama | Abu-abu Gelap | #1F2937 |

## 🔐 Dummy User untuk Login

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `admin123` |
| Role | `admin` |

## 📝 Fitur Teknis

- ✅ CORS enabled untuk komunikasi frontend-backend
- ✅ Form validation di frontend
- ✅ Error handling untuk failed login
- ✅ LocalStorage untuk menyimpan user session
- ✅ Role-based conditional rendering
- ✅ TypeScript untuk type safety
- ✅ Responsive design

## 💡 Next Steps (Untuk Development)

Fitur yang bisa ditambahkan:
- [ ] Integrasi database (MySQL/MongoDB)
- [ ] JWT authentication
- [ ] Password hashing (bcrypt)
- [ ] Session management
- [ ] Multiple roles (admin, user, supervisor)
- [ ] User registration
- [ ] Password recovery
- [ ] 2FA (Two-Factor Authentication)

## 📌 Testing

Untuk test login berhasil:
```
Username: admin
Password: admin123
```

Untuk test login gagal:
```
Username: admin
Password: salahpassword
```

---
**Module M6.1 - Login & Keamanan Akun** - Demo Project
