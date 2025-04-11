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
      // Start with a copy of the current user
      let updatedUser = { ...user };

      // If a non-empty nickname is provided, update it
      if (nickname.trim() !== '') {
        const nicknameResponse = await axios.put(
          `${process.env.REACT_APP_API_URL}/users/nickname`,
          { nickname, user },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        updatedUser = { ...updatedUser, nickname: nicknameResponse.data.user.nickname };
      }

      // If a new profile picture is selected, upload it
      if (profilePicture) {
        const formData = new FormData();
        formData.append('profilePicture', profilePicture); // Append the file correctly
      
        const pfpResponse = await axios.put(
          `${process.env.REACT_APP_API_URL}/users/profile-picture`,
          formData,  // Send formData directly
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'  // Ensure Content-Type is set for file upload
            }
          }
        );
      
        updatedUser = { ...updatedUser, profilePicture: pfpResponse.data.user.profilePicture };
      }

      // Update user state and localStorage so changes persist across sessions
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Optionally close the settings menu after saving
      if (closeSettings) closeSettings();
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Не удалось обновить настройки');
    } finally {
      setLoading(false);
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
    </div>
  );
};

export default Settings;
