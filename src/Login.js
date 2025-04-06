import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');

    const handleAuth = async () => {
        if (!username.trim() || !password.trim()) {
            setError('Введите логин и пароль');
            return;
        }

        try {
            const url = isRegistering 
                ? 'http://localhost:5000/users/register' 
                : 'http://localhost:5000/users/login';

            const response = await axios.post(url, { username, password });
            console.log('Response data:', response.data);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                // Сохраняем пользователя, если он есть в ответе
                if (response.data.user) {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
                onLogin(response.data.token, response.data.user);
            } else {
                setError(response.data.message || 'Ошибка авторизации');
            }
        } catch (err) {
            console.log(err)
            setError('Ошибка: ' + (err.response?.data?.error || 'Сервер недоступен'));
        }
    };

    return (
        <div className="auth-container">
            <h2>{isRegistering ? 'Регистрация' : 'Вход'}</h2>
            {error && <p className="error">{error}</p>}
            <input 
                type="text" 
                placeholder="Логин" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
            />
            <input 
                type="password" 
                placeholder="Пароль" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
            />
            <button onClick={handleAuth}>
                {isRegistering ? 'Зарегистрироваться' : 'Войти'}
            </button>
            <p onClick={() => { 
                setIsRegistering(!isRegistering);
                setError('');
            }}>
                {isRegistering ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
            </p>
        </div>
    );
};

export default Login;
