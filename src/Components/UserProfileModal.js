
import React, { useState } from 'react';
import '../Styles/UserModal.css';
import axios from 'axios';

const UserProfileModal = ({ user: profileUser, currentUser, token, onClose, updateUser }) => {
  const [isFriend, setIsFriend] = useState(
    currentUser.friends?.includes(profileUser._id)
  );
  const [requestSent, setRequestSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddFriend = async () => {
    setLoading(true);
    try {

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/users/send-request`,
        {
          fromUserId: currentUser.id,
          toUsername: profileUser.username,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Friend request sent:', response.data);
      setRequestSent(true);
    } catch (error) {
      console.error('Error sending friend request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/users/remove-friend`,
        {
          userId: currentUser._id,
          friendId: profileUser._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Friend removed:', response.data);

      // Optional: update current user’s friend list via parent state
      if (updateUser) {
        updateUser(response.data.updatedUser); // assuming backend returns updated user
      }
      setIsFriend(false);
    } catch (error) {
      console.error('Error removing friend:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>
        <img
          src={
            profileUser.profilePicture
              ? `${process.env.REACT_APP_API_URL}${profileUser.profilePicture}`
              : '/default.png'
          }
          alt={profileUser.nickname || profileUser.username}
          className="modal-profile-picture"
        />
        <h2>{profileUser.nickname || profileUser.username}</h2>
        <p>Username: {profileUser.username}</p>

        <div className="modal-actions">
          {isFriend ? (
            <button
              className="remove-friend-btn"
              onClick={handleRemoveFriend}
              disabled={loading}
            >
              {loading ? 'Removing...' : 'Remove Friend'}
            </button>
          ) : requestSent ? (
            <button className="friend-request-sent-btn" disabled>
              Request Sent
            </button>
          ) : (
            <button
              className="add-friend-btn"
              onClick={handleAddFriend}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Add Friend'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


export default UserProfileModal;
