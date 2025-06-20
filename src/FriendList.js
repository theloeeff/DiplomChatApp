import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io(process.env.REACT_APP_API_URL);

const FriendList = ({ token, user, openDirectChat, openUserProfile }) => {
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [error, setError] = useState('');

  // Use useCallback so these functions are not recreated on every render
  const fetchFriends = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/users/${user.id}/friends`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFriends(res.data.friends);
    } catch (err) {
      console.error('Error fetching friends:', err);
    }
  }, [user, token]);

  const fetchRequests = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/users/${user.id}/requests`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIncomingRequests(res.data.incoming);
      setOutgoingRequests(res.data.outgoing);
    } catch (err) {
      console.error('Error fetching friend requests:', err);
    }
  }, [user, token]);

  // On mount, fetch friends and requests
  useEffect(() => {
    fetchFriends();
    fetchRequests();
  }, [user, fetchFriends, fetchRequests]);  

  // IMPORTANT: Ensure this component's socket instance joins the user room.
  useEffect(() => {
    if (user && socket) {
      // Use the correct event name: "joinUserRoom"
      socket.emit('joinUserRoom', user.id);
    }
  }, [user]);

  // Listen for friend request updates via socket
  useEffect(() => {
    const handleFriendRequest = (data) => {
      console.log('FriendList received friendRequestReceived event:', data);
      fetchRequests();
    };

    socket.on('friendRequestReceived', handleFriendRequest);
    return () => {
      socket.off('friendRequestReceived', handleFriendRequest);
    };
  }, [fetchRequests]);

  const handleSendRequest = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/users/send-request`,
        { fromUserId: user.id, toUsername: searchUsername },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSearchUsername('');
      fetchRequests();
    } catch (err) {
      console.error('Error sending friend request:', err);
      setError('Failed to send friend request');
    }
  };

  const handleAccept = async (requesterId) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/users/accept-request`,
        { currentUserId: user.id, requesterId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFriends();
      fetchRequests();
    } catch (err) {
      console.error('Error accepting friend request:', err);
    }
  };

  const handleDecline = async (requesterId) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/users/decline-request`,
        { currentUserId: user.id, requesterId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRequests();
    } catch (err) {
      console.error('Error declining friend request:', err);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/users/remove-friend`,
        { currentUserId: user.id, friendId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFriends();
    } catch (err) {
      console.error('Error removing friend:', err);
    }
  };

  return (
    <div className="friend-list">
      <h3>Друзья</h3>
      <ul>
        {friends.map(f => (
          <li key={f._id}>
            <img
              onClick={() => openUserProfile(f)}
              src={f.profilePicture ? `${process.env.REACT_APP_API_URL}${f.profilePicture}` : '/default.png'}
              alt={f.nickname || f.username}
              width="30"
              height="30"
            />
            <span onClick={() => openUserProfile(f)}>{f.nickname || f.username}</span>
            <button onClick={() => openDirectChat(f._id)}>Message</button>
            <button onClick={() => handleRemoveFriend(f._id)}>Remove</button>
          </li>
        ))}
      </ul>

      <h4>Входящие запросы в друзья</h4>
      <ul>
        {incomingRequests.map(r => (
          <li key={r._id}>
            <img
              onClick={() => openUserProfile(r)}
              src={r.profilePicture ? `${process.env.REACT_APP_API_URL}${r.profilePicture}` : '/default.png'}
              alt={r.nickname || r.username}
              width="30"
              height="30"
            />
            <span onClick={() => openUserProfile(r)}>{r.nickname || r.username}</span>
            <button onClick={() => handleAccept(r._id)}>Accept</button>
            <button onClick={() => handleDecline(r._id)}>Decline</button>
          </li>
        ))}
      </ul>

      <h4>Отправить запрос в друзья</h4>
      <input
        type="text"
        placeholder="Введите имя пользователя"
        value={searchUsername}
        onChange={(e) => setSearchUsername(e.target.value)}
      />
      <button className="send-request" onClick={handleSendRequest}>Отправить</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default FriendList;