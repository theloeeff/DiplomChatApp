import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import Login from './Login';
import CreateChat from './CreateChat';

const socket = io('http://localhost:5000');

const ChatApp = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchChats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/chats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChats(response.data);
      } catch (error) {
        console.error('Ошибка загрузки чатов:', error);
      }
    };

    fetchChats();
  }, [user, token]);

  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/chat/${selectedChat}/getmessages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Ошибка загрузки сообщений:', error);
      }
    };

    fetchMessages();
  }, [selectedChat, token]);

  // Слушаем события для получения сообщений
  const sendMessage = async () => {
    if (!message.trim() || !selectedChat) return;

    const newMessage = { sender: user.id, text: message, chatId: selectedChat };

    try {
        // Сначала отправляем сообщение через API
        await axios.post(`http://localhost:5000/chat/${selectedChat}/message`, newMessage, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // После этого отправляем его через WebSocket
        socket.emit('sendMessage', newMessage);

        // Добавляем сообщение в список сообщений на клиенте
        setMessages(prev => [...prev, newMessage]);
        setMessage('');
    } catch (error) {
        console.error('Ошибка отправки сообщения:', error);
    }
};

useEffect(() => {
    if (!selectedChat) return;

    socket.emit('joinChat', selectedChat); // Присоединяемся к чату по WebSocket

    return () => {
        socket.off('message'); // Отписываемся при смене чата
    };
}, [selectedChat]);

useEffect(() => {
    socket.on('message', (newMessage) => {
        setMessages((prevMessages) => {
            // Проверяем, есть ли уже такое сообщение
            if (!prevMessages.some(msg => msg._id === newMessage._id)) {
                return [...prevMessages, newMessage];
            }
            return prevMessages;
        });
    });

    return () => {
        socket.off('message');
    };
}, []);


  if (!user) return (
    <Login onLogin={(token, user) => {
      setToken(token);
      setUser(user);
    }} />
  );

  return (
    <div className="chat-app">
      <h2>Чаты</h2>
      <div className="chat-list">
        {chats.map(chat => (
          <div key={chat._id} onClick={() => setSelectedChat(chat._id)}>
            {chat.name}
          </div>
        ))}
      </div>
      <CreateChat token={token} userId={user.id} onChatCreated={() => {
        axios.get('http://localhost:5000/chats', {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setChats(res.data))
        .catch(err => console.error('Ошибка загрузки чатов:', err));
      }} />
      <div className="chat-window">
        {selectedChat && (
          <>
            {messages.map(msg => (
              <div key={msg._id}>
                <strong>{msg.sender.username}: </strong>{msg.text}
              </div>
            ))}
            <input 
              type="text" 
              value={message} 
              onChange={e => setMessage(e.target.value)} 
              placeholder="Введите сообщение..."
            />
            <button onClick={sendMessage}>Отправить</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatApp;
