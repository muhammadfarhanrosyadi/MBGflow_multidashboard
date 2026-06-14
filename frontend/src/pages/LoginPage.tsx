import { useState } from 'react';
import { loginUser, LoginResponse } from '../services/authService';
import '../styles/loginPage.css';

interface LoginPageProps {
  onLogin: (user: { username: string; role: string }) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  // TASK 3: Frontend halaman login
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const response: LoginResponse = await loginUser(username, password);

    if (response.success && response.user) {
      alert('Login berhasil');
      onLogin(response.user);
    } else {
      alert('Login gagal');
      setErrorMessage(response.message || 'Username atau password salah');
      setPassword('');
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Login Sistem SCM</h1>
        <p className="login-subtitle">Module M6.1 Login & Keamanan Akun</p>

        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-login"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Masuk'}
          </button>
        </form>

        <p className="demo-text">
          Demo: username <strong>admin</strong>, password <strong>admin123</strong>
        </p>
      </div>
    </div>
  );
}
