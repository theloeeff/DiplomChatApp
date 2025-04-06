import '../Styles/Topbar.css';
import DefaultImage from '../Images/Default_Profile_Image.png'

function Profile({ user_name, profile_image }) {
    const profileSrc = profile_image || DefaultImage;

    return (
        <div className="Profile">
            <img className="ProfilePicture" src={profileSrc} alt="User Profile" />
        </div>
    );
}

export default Profile;