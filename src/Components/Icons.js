import '../Styles/Topbar.css';
import {ReactComponent as SettingsIcon} from '../Images/Icons/Settings.svg'

function Icons() {
    return (
        <div className="IconContainer">
            <div className="Icon">
                <SettingsIcon className="IconSVG" />
            </div>
            <div className="Icon">
                <SettingsIcon className="IconSVG" />
            </div>
            <div className="Icon">
                <SettingsIcon className="IconSVG" />
            </div>
        </div>
    );
}

export default Icons;