import React, { useState } from 'react';
import axios from 'axios';

const Settings = ({ token, user, setUser, closeSettings }) => {
  const [nickname, setNickname] = useState(user.nickname || '');
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleNicknameChange = (e) => {
    setNickname(e.target.value);
  };

  const handleProfilePictureChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let updatedUser = { ...user };

      // Update nickname if provided
      if (nickname.trim() !== '') {
        const nicknameResponse = await axios.put(
          `${process.env.REACT_APP_API_URL}/users/nickname`,
          { nickname, user },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        updatedUser = { ...updatedUser, nickname: nicknameResponse.data.user.nickname };
      }

      // Update profile picture if a file is selected
      if (profilePicture) {
        const formData = new FormData();
        formData.append('profilePicture', profilePicture);
      
        const pfpResponse = await axios.put(
          `${process.env.REACT_APP_API_URL}/users/profile-picture`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      
        updatedUser = { ...updatedUser, profilePicture: pfpResponse.data.user.profilePicture };
      }

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      if (closeSettings) closeSettings();
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Не удалось обновить настройки');
    } finally {
      setLoading(false);
    }
  };

  // Logout handler: clears token and user from localStorage and resets user state
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Toggle 2FA handler: calls the backend and updates user state accordingly.
  const handleToggle2FA = async () => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/users/toggle-2fa`,
        { userId: user.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedUser = { ...user, twoFAEnabled: res.data.twoFAEnabled };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Error toggling 2FA:', err);
    }
  };

  return (
    <div className="settings-menu">
      <h3>Настройки</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Никнейм:</label>
          <input
            type="text"
            value={nickname}
            onChange={handleNicknameChange}
          />
        </div>
        <div>
          <label>Фото профиля:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleProfilePictureChange}
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Сохранение...' : 'Сохранить'}
        </button>
      </form>
      
      {/* Additional controls for logout and 2FA toggle */}
      <div className="settings-extra">
        <button onClick={handleLogout} className="settings-btn">Logout</button>
        <button onClick={handleToggle2FA} className="settings-btn">
          {user.twoFAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
        </button>
      </div>
    </div>
  );
};

export default Settings;
