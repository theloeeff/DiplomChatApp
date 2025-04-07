import React, { useState } from 'react';
import axios from 'axios';

const Auth = ({ onLogin }) => {
  // which “screen” we’re on:
  // 'register', 'credentials', or '2fa'
  const [screen, setScreen] = useState('credentials');

  // form fields
  const [username, setUsername] = useState('');
  const [email,    setEmail]    = useState('');      // only for registration
  const [password, setPassword] = useState('');
  const [code,     setCode]     = useState('');      // only for 2FA
  const [userId,   setUserId]   = useState(null);    // comes back from login step 1

  const [error,    setError]    = useState('');
  const [info,     setInfo]     = useState('');      // for success messages

  // 1️⃣ Register new user
  const handleRegister = async () => {
    setError(''); setInfo('');
    if (!username || !email || !password) {
      setError('Все поля должны быть заполнены.');
      return;
    }
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/users/register`, {
        username, email, password
      });
      setInfo('Регистрация успешна! Вы теперь можете зайти в свой аккаунт.');
      // switch to login form
      setScreen('credentials');
      setPassword('');  // clear password
    } catch (err) {
      setError(err.response?.data?.error || 'Не удалось зарегестрироваться');
    }
  };

  // 2️⃣ Login / password check
  const handleLogin = async () => {
    setError(''); setInfo('');
    if (!username || !password) {
      setError('Введите имя и пароль от аккаунта.');
      return;
    }
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/users/login`,
        { username, password }
      );
      if (res.data.twoFA) {
        // step 1 of 2FA
        setUserId(res.data.userId);
        setScreen('2fa');
      } else {
        // logged in without 2FA
        localStorage.setItem('token', res.data.token);
        onLogin(res.data.token, res.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Не удалось войти');
    }
  };

  // 3️⃣ Verify emailed 2FA code
  const handleVerify2FA = async () => {
    setError(''); setInfo('');
    if (!code) {
      setError('Введите 6-ти значний код.');
      return;
    }
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/users/verify-2fa`,
        { userId, code }
      );
      localStorage.setItem('token', res.data.token);
      onLogin(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Неправильный код');
    }
  };

  // UI
  return (
    <div className="auth-container">
      {screen === 'register' && (
        <>
          <h2>Регистрация</h2>
          {error && <p className="error">{error}</p>}
          {info &&  <p className="info">{info}</p>}
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
          />
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button onClick={handleRegister}>Зарегестрироваться</button>
          <p className="switch" onClick={() => {
            setError(''); setInfo('');
            setScreen('credentials');
          }}>
            Уже есть аккаунт? Войдите
          </p>
        </>
      )}

      {screen === 'credentials' && (
        <>
          <h2>Вход</h2>
          {error && <p className="error">{error}</p>}
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button onClick={handleLogin}>Войти</button>
          <p className="switch" onClick={() => {
            setError(''); setInfo('');
            setScreen('register');
          }}>
            Нету аккаунта? Зарегестрируйтесь
          </p>
        </>
      )}

      {screen === '2fa' && (
        <>
          <h2>Введите код верификации</h2>
          {error && <p className="error">{error}</p>}
          <input
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="6‑digit code"
          />
          <button onClick={handleVerify2FA}>Verify</button>
        </>
      )}
    </div>
  );
};

export default Auth;