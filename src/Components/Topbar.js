import '../Styles/Topbar.css';
import LogoImage from '../Images/Logo.png'
import Profile from '../Components/Profile.js';
import Icons from '../Components/Icons.js';

function Topbar() {
  return (
    <div className="Topbar">
        <header className="Logo">
            <img src={LogoImage} alt='logo' className="Logo"></img>
        </header>
        <Icons />
        <Profile user_name="Bogdan" />
    </div>
  );
}

export default Topbar;
