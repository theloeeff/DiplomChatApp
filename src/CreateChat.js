import React, { useState } from 'react';
import axios from 'axios';

const CreateChat = ({ token, userId, onChatCreated }) => {
  const [chatName, setChatName] = useState('');
  const [participantsInput, setParticipantsInput] = useState('');
  const [error, setError] = useState('');

  const handleCreateChat = async () => {
    if (!chatName.trim() || !participantsInput.trim()) {
      setError('Введите название чата и участников');
      return;
    }

    // Предполагаем, что участники вводятся через запятую (например, ID или логины)
    const participants = participantsInput
      .split(',')
      .map(p => p.trim())
      .filter(p => p);

    // Если текущий пользователь не включён, добавляем его
    if (!participants.includes(userId)) {
      participants.push(userId);
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/chat',
        { chat_name: chatName, user: userId, participants },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Чат создан:', response.data);
      setChatName('');
      setParticipantsInput('');
      setError('');
      if (onChatCreated) onChatCreated(); // Например, перезагрузить список чатов
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
