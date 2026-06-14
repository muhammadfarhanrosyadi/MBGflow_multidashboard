const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// TASK 1: POST /api/auth/login - Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validasi input (username di sini akan dicocokkan dengan email atau username, kita asumsikan username dari frontend adalah name, tapi di DB adanya name/email. Kita cek keduanya atau name saja)
    // Di frontend defaultnya: 'admin', sedangkan di DB name: 'Master Admin SCM' dan email: 'admin@mbg.id'.
    // Namun user minta: 'admin/admin123' dan 'user/user123'. Kita cek username == 'admin' -> email 'admin@mbg.id', dll, ATAU bisa juga kita cek name LIKE %admin% 
    // Agar sesuai requirement, kita cek berdasarkan email 'admin@mbg.id' ATAU 'user@mbg.id'. Kita konversi input username ke email jika belum format email.
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan password harus diisi'
      });
    }

    let loginEmail = username;
    if (username === 'admin') loginEmail = 'admin@mbg.id';
    if (username === 'user') loginEmail = 'user@mbg.id';

    const user = await db('users').where('email', loginEmail).first();

    if (!user || user.password_hash !== password) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      });
    }

    // Generate JWT token (exp: 1 hour)
    const token = jwt.sign(
      { id: user.id, username: user.name, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      token,
      user: {
        username: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
});

// TASK 2: GET /api/auth/me - Cek izin akses akun
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // req.user has the decoded token info
    const user = await db('users').where('id', req.user.id).first();
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    res.json({
      success: true,
      user: {
        username: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Auth me error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
});

module.exports = router;
