import React, { useState } from 'react';
import axios from 'axios';
import './Styles/CreateChat.css'

const CreateChat = ({ token, userId, onChatCreated }) => {
  const [chatName, setChatName] = useState('');
  const [participantsInput, setParticipantsInput] = useState('');
  const [error, setError] = useState('');

  const handleCreateChat = async () => {
    if (!chatName.trim() || !participantsInput.trim()) {
      setError('Введите название чата и участников');
      return;
    }
    const participants = participantsInput
      .split(',')
      .map(p => p.trim())
      .filter(p => p);
    if (!participants.includes(userId)) {
      participants.push(userId);
    }
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/chat`,
        { chat_name: chatName, user: userId, participants },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Чат создан:', response.data);
      setChatName('');
      setParticipantsInput('');
      setError('');
      if (onChatCreated) onChatCreated();
    } catch (err) {
      console.error('Ошибка при создании чата:', err);
      setError(err.response?.data?.error || 'Ошибка при создании чата');
    }
  };

  return (
    <div className="create-chat">
      <h2>Создать чат</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="text"
        placeholder="Название чата"
        value={chatName}
        onChange={(e) => setChatName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Участники (через запятую)"
        value={participantsInput}
        onChange={(e) => setParticipantsInput(e.target.value)}
      />
      <button onClick={handleCreateChat}>Создать чат</button>
    </div>
  );
};

export default CreateChat;