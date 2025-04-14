import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import Auth from './Login';
import CreateChat from './CreateChat';
import Topbar from './Components/Topbar';
import FriendList from './FriendList';
import UserProfileModal from './Components/UserProfileModal'; // new modal component
import './Styles/ChatApp.css';

const { REACT_APP_API_URL } = process.env;
const socket = io(REACT_APP_API_URL);

const ChatApp = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [modalUser, setModalUser] = useState(null); // for profile modal

  // Ref to scroll to bottom of messages
  const messagesEndRef = useRef(null);

  // Load auth data from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch chats
  useEffect(() => {
    if (!user) return;
    const fetchChats = async () => {
      try {
        const { data } = await axios.get(`${REACT_APP_API_URL}/chats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChats(data);
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };
    fetchChats();
  }, [user, token]);

  // Fetch messages for selected chat
  useEffect(() => {
    if (!selectedChat) return;
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(
          `${REACT_APP_API_URL}/chat/${selectedChat}/getmessages`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    fetchMessages();
  }, [selectedChat, token]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Send message via API and WebSocket
  const sendMessage = async () => {
    if (!message.trim() || !selectedChat) return;
    const newMessage = { sender: user.id, text: message, chatId: selectedChat };
    try {
      await axios.post(
        `${REACT_APP_API_URL}/chat/${selectedChat}/message`,
        newMessage,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      socket.emit('sendMessage', newMessage);
      setMessage(''); // Clear the input after sending
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Join chat via WebSocket
  useEffect(() => {
    if (!selectedChat) return;
    socket.emit('joinChat', selectedChat);
  }, [selectedChat]);

  // Listen for messages via WebSocket
  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      setMessages((prevMessages) =>
        prevMessages.some(msg => msg._id === newMessage._id)
          ? prevMessages
          : [...prevMessages, newMessage]
      );
    };
    socket.on('message', handleNewMessage);
    return () => socket.off('message', handleNewMessage);
  }, []);

  // Socket events for real-time updates (profile updates, friend requests, new chats)
  useEffect(() => {
    const handleUserUpdated = (data) => {
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.sender._id.toString() === data.userId.toString()
            ? { ...msg, sender: { ...msg.sender, ...data } }
            : msg
        )
      );
      // If the updated user is the current user, update local state/storage.
      if (user && user.id.toString() === data.userId.toString()) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    };

    socket.on('userUpdated', handleUserUpdated);
    socket.on('friendRequestReceived', (data) => {
      console.log('New friend request received:', data);
      // You can trigger a refresh of friend requests here or notify the user.
    });
    socket.on('newChat', (data) => {
      console.log('New chat created:', data);
      // Refresh the chat list:
      axios.get(`${REACT_APP_API_URL}/chats`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(({ data }) => setChats(data))
        .catch(err => console.error('Error fetching chats:', err));
    });

    return () => {
      socket.off('userUpdated');
      socket.off('friendRequestReceived');
      socket.off('newChat');
    };
  }, [token, user]);

  // Join the user's personal room for targeted socket events
  useEffect(() => {
    if (user) {
      socket.emit('joinUserRoom', user.id);
    }
  }, [user]);

  // Open direct chat (for one-on-one messaging) remains unchanged
  const openDirectChat = async (friendId) => {
    try {
      const { data } = await axios.post(
        `${REACT_APP_API_URL}/chat/direct`,
        { user1: user.id, user2: friendId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedChat(data.chat._id); // or data.chatId depending on your response format
    } catch (err) {
      console.error('Error opening direct chat:', err);
    }
  };

  // New: Open user profile modal on left click of a name (in messages or friend list)
  const openUserProfile = (profileUser) => {
    setModalUser(profileUser);
    setShowProfileModal(true);
  };

  // New: Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken('');
    // Optionally, redirect to login page if using a router.
  };

  // New: Toggle 2FA (simplified example)
  const toggle2FA = async () => {
    try {
      const res = await axios.post(
        `${REACT_APP_API_URL}/users/toggle-2fa`,
        { userId: user.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update the user state with new 2FA status
      const updatedUser = { ...user, twoFAEnabled: res.data.twoFAEnabled };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Error toggling 2FA:', err);
    }
  };

  if (!user) {
    return (
      <Auth
        onLogin={(token, user) => {
          setToken(token);
          setUser(user);
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          socket.emit('joinUserRoom', user.id);
        }}
      />
    );
  }

  return (
    <div className="chat-app">
      <Topbar 
        token={token} 
        user={user} 
        setUser={setUser}
        logout={logout}
        toggle2FA={toggle2FA}
      />
      <div className="main-content">
        {/* Left Column: Chat List */}
        <div className="chat-list-container">
          <h2>Chats</h2>
          {chats.map(chat => (
            <div
              key={chat._id}
              className="chat-item"
              onClick={() => setSelectedChat(chat._id)}
            >
              {chat.name}
            </div>
          ))}
          <CreateChat
            token={token}
            userId={user.id}
            onChatCreated={() => {
              axios
                .get(`${REACT_APP_API_URL}/chats`, {
                  headers: { Authorization: `Bearer ${token}` }
                })
                .then(({ data }) => setChats(data))
                .catch(err => console.error('Error fetching chats:', err));
            }}
          />
        </div>
        {/* Middle Column: Chat Window */}
        <div className="chat-window-container">
          <h2 className="chat-title">Chat Window</h2>
          <div className="chat-window">
            {selectedChat && messages.map(msg => (
              <div key={msg._id} className="message">
                <div className="message-user-info">
                  {msg.sender.profilePicture && (
                    <img
                      onClick={() => openUserProfile(msg.sender)}
                      src={msg.sender.profilePicture.startsWith('http')
                        ? msg.sender.profilePicture
                        : `${REACT_APP_API_URL}${msg.sender.profilePicture}`}
                      alt={`${msg.sender.nickname || msg.sender.username}'s Profile`}
                      className="profile-picture"
                    />
                  )}
                  <strong onClick={() => openUserProfile(msg.sender)}>
                    {msg.sender.nickname || msg.sender.username}:
                  </strong>
                </div>
                <span>{msg.text}</span>
              </div>
            ))}
            {/* Reference element to scroll into view */}
            <div ref={messagesEndRef} />
          </div>
          {selectedChat && (
            <div className="message-input">
              <input
                type="text"
                className="message-text-input"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Enter your message..."
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    sendMessage();
                  }
                }}
              />
              <button className="send-button" onClick={sendMessage}>
                Send
              </button>
            </div>
          )}
        </div>
        {/* Right Column: Friend List */}
        <div className="friend-section">
          <FriendList 
            token={token} 
            user={user} 
            openDirectChat={openDirectChat} 
            openUserProfile={openUserProfile}
          />
        </div>
      </div>
      {showProfileModal && modalUser && (
        <UserProfileModal 
          user={modalUser} 
          currentUser={user}
          onClose={() => setShowProfileModal(false)} 
          token={token}
        />
      )}

    </div>
  );
};

export default ChatApp;