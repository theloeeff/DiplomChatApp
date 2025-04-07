import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [step, setStep] = useState('credentials'); // or '2fa'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState('');

  const handleCredentials = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/users/login`, {
        username, password
      });
      if (res.data.twoFA) {
        setUserId(res.data.userId);
        setStep('2fa');
      } else if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        onLogin(res.data.token, res.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handle2FA = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/users/verify-2fa`, {
        userId, code
      });
      localStorage.setItem('token', res.data.token);
      onLogin(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code');
    }
  };

  return (
    <div className="auth-container">
      {step === 'credentials' ? (
        <>
          <h2>Login</h2>
          {error && <p className="error">{error}</p>}
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
          <button onClick={handleCredentials}>Next</button>
        </>
      ) : (
        <>
          <h2>Enter verification code</h2>
          {error && <p className="error">{error}</p>}
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="6‑digit code" />
          <button onClick={handle2FA}>Verify</button>
        </>
      )}
    </div>
  );
};

export default Login;