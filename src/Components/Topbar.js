import React, { useState } from 'react';
import LogoImage from '../Images/Logo.png';
import Profile from '../Components/Profile';
import Icons from '../Components/Icons';
import Settings from '../Components/Settings';
import {ReactComponent as SettingsIcon} from '../Images/Icons/Settings.svg'

function Topbar({ token, user, setUser }) {
  const [showSettings, setShowSettings] = useState(false);

  const toggleSettings = () => {
    setShowSettings((prev) => !prev);
  };

  return (
    <>
      <div className="Topbar">
        <header className="Logo">
          <img src={LogoImage} alt="logo" className="Logo" />
        </header>

        <div onClick={toggleSettings}>
          <div className="Icon">
            <SettingsIcon className="IconSVG" />
          </div>
        </div>
      </div>

      {/* Floating settings popup */}
      {showSettings && (
        <div className="SettingsPopup">
          <Settings
            token={token}
            user={user}
            setUser={setUser}
            closeSettings={toggleSettings}
          />
        </div>
      )}
    </>
  );
}


export default Topbar;