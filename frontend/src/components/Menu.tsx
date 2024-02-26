import useAuth from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { CircleStatus } from "./CircleStatus";
import { BsChatTextFill } from "react-icons/bs";
import { IoHome } from "react-icons/io5";
import { FaUserGroup } from "react-icons/fa6";
import { FaTableTennis } from "react-icons/fa";
import ButtonSignOut from "./ButtonSignOut";
import useProtectLogoutRedirect from "../hooks/useProtectLogoutRedirect";

const Menu = () => {
  const { auth }: any = useAuth();
  useProtectLogoutRedirect();

  return (
    <div className="navbar">
      <div className="navbar-content">
        <div className="div-user-pseudo-avatar">
          <span className="title-user-navbar" title={auth.username}>
            {auth.username}
          </span>
          <div className="div-avatar-profile">
            <img
              src={auth.avatarLink}
              className="avatar-profile ellipse"
              alt="haha tema la tete"
            />
            <CircleStatus isLogged={auth.isLogged} />
          </div>
        </div>
        <div className="menu">
          <div className="menu-elements-list">
            <Link className="div-element-list" to="/">
              <div className="div-icon-logo">
                <IoHome className="icon-logo" />
              </div>
              <div className="text-wrapper">Profile</div>
            </Link>
          </div>
          <div className="menu-elements-list">
            <Link className="div-element-list" to="/friends">
              <div className="div-icon-logo">
                <img
                  className="icon-logo-friends"
                  src="/images/icons/friends_icon.png"
                  alt="friends_icon"
                />
              </div>
              <div className="text-wrapper">Friends</div>
            </Link>
          </div>
          <div className="menu-elements-list">
            <Link className="div-element-list" to="/users">
              <div className="div-icon-logo">
                <FaUserGroup className="icon-logo" />
              </div>
              <div className="text-wrapper">Users</div>
            </Link>
          </div>
          <div className="menu-elements-list">
            <Link className="div-element-list" to="/chat">
              <div className="div-icon-logo">
                <BsChatTextFill className="icon-logo" />
              </div>
              <div className="text-wrapper">Chat</div>
            </Link>
          </div>
          <div className="menu-elements-list">
            <Link className="div-element-list" to="/game">
              <div className="div-icon-logo">
                <FaTableTennis className="icon-logo" />
              </div>
              <div className="text-wrapper">Pong</div>
            </Link>
          </div>
          <div className="menu-elements-list">
            <Link className="div-element-list" to="/aboutus">
              <div className="div-icon-logo">
                <img className="icon-logo-42" src="/images/icons/42_Logo.png" alt="42_Logo"/>
              </div>
              <div className="text-wrapper">About us</div>
            </Link>
          </div>
        </div>
        <div className="div-signout">
          <ButtonSignOut />
        </div>
      </div>
    </div>
  );
};

export default Menu;
