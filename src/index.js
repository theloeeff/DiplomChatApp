import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Topbar from './Components/Topbar.js';
import ChatApp from './ChatApp.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <div className='AppContainer'>
      <Topbar />
      <ChatApp />
    </div>
  </React.StrictMode>
);