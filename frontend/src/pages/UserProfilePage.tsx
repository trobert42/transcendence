import { useNavigate, useParams } from "react-router-dom";
import useProtectLogoutRedirect from "../hooks/useProtectLogoutRedirect";
import Menu from "../components/Menu";
import { CircleStatus } from "../components/CircleStatus";
import { LineTitle } from "../components/LineTitle";
import { axiosPrivate } from "../utils/api";
import { RiSendPlaneFill } from "react-icons/ri";
import useAuth from "../hooks/useAuth";
import { useState } from "react";
import { ButtonsBelowAvatar } from "../components/ButtonsBelowAvatar";
import ButtonUserAction from "../components/ButtonUserAction";
import { IoSettingsSharp } from "react-icons/io5";
import { UserHistory } from "../components/UserHistory";
import { useUsers } from "../context/UsersContext";
import { redirectToErrorPage } from "../components/redirectToErrorPage";
import { BiSolidUserMinus } from "react-icons/bi";
import { HttpStatusCode } from "axios";
import { PrivateChatDTO } from "../shared/chat/chat.dto";

const UserProfilePage = () => {
  const { auth }: any = useAuth();
  const { id } = useParams();
  const [openSetting, setOpenSetting] = useState(false);
  const navigate = useNavigate();

  useProtectLogoutRedirect();

  const {
    users,
    friends,
    pendingFriends,
    removeFriend,
    blockUser,
    unblockUser,
  } = useUsers();

  let part = id?.split(":") || ["", ""];
  let isFriend = false;
  if (part && part[1]) {
    isFriend = friends.some((friend) => friend.id === Number(part[1]));
  }

  const user: any = users.find((user) => user.id === Number(part[1]));

  const messageUser = async (userId: number) => {
    try {
      const response = await axiosPrivate?.post("api/private-chats/", {
        targetId: userId,
      });

      if (response?.status === HttpStatusCode.Created) {
        const privateChat: PrivateChatDTO = response.data;
        navigate(`/private-chats/${privateChat.id}`);
      }
    } catch (error) {
      redirectToErrorPage(error, navigate);
    }
  };

  return (
    <div className="page">
      <div className="main-container">
        <div className="div-transparent"></div>
        <div className="main-container-element">
          <div className="div-user-title">
            <div className="div-avatar-profile ml-1">
              <img
                src={user?.avatarLink}
                className="avatar-profile ellipse"
                width="250"
                height="250"
                alt="avatarLink"
              />
              <CircleStatus isLogged={user?.isLogged} />
            </div>
            <div className="div-user-title2">
              <div className="title-col">
                <span className="text-title-h1" title={user?.username}>
                  {user?.username && user?.username.length > 12
                    ? `${user?.username.substring(0, 7)}... 's profile`
                    : `${user?.username}'s profile`}{" "}
                </span>
                {user?.isLogged && !user?.isInGame && (
                  <span className="user-status status-online"> online </span>
                )}
                {user?.isLogged && user?.isInGame && (
                  <span className="user-status" style={{ color: "#E5B24B" }}>
                    {" "}
                    in game{" "}
                  </span>
                )}
                {!user?.isLogged && (
                  <span className="user-status"> offline </span>
                )}
                <div style={{ position: "relative" }}>
                  {user?.id && user?.id !== auth?.id && (
                    <IoSettingsSharp
                      className="button-user-setting"
                      type="button"
                      onClick={() => setOpenSetting((prev) => !prev)}
                    />
                  )}
                  {openSetting && user?.id && user?.id !== auth?.id && (
                    <div className="user-drop-settings flex-col-center">
                      {!user?.isBlocked && (
                        <button
                          type="button"
                          onClick={() => {
                            blockUser(user?.id);
                          }}
                          className="hover-strong"
                        >
                          Block
                        </button>
                      )}
                      {user?.isBlocked && (
                        <button
                          type="button"
                          onClick={() => {
                            unblockUser(user?.id);
                          }}
                          className="hover-strong"
                        >
                          Unblock
                        </button>
                      )}
                      {user?.id && user?.id !== auth?.id && isFriend && (
                        <ButtonUserAction
                          className="button-form button-red"
                          text="Remove friend"
                          onClick={() => {
                            removeFriend(user?.id);
                          }}
                          Icon={BiSolidUserMinus}
                          styleIcon={{ fontSize: "23px" }}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
              {user && pendingFriends && (
                <div className="flex-row-center g-10 wrap">
                  <ButtonsBelowAvatar
                    auth={auth}
                    user={user}
                    pendingFriends={pendingFriends}
                  />
                </div>
              )}
              {user && user.id !== auth.id && (
                <ButtonUserAction
                  className="button-form button-blue"
                  text="Write message"
                  onClick={() => {
                    messageUser(user.id);
                    navigate("/chat");
                  }}
                  Icon={RiSendPlaneFill}
                />
              )}
            </div>
          </div>
          <div className="profile-element">
            <div className="profile-elements">
              <div className="text-title-h2">Informations</div>
              <LineTitle />
              <div className="text-user-profile">
                <p>username: {user?.username}</p>
                <p>firstname: {user?.firstname}</p>
                <p>lastname: {user?.lastname}</p>
                <p>email: {user?.email}</p>
              </div>
            </div>
            <div className="profile-elements">
              <div className="text-title-h2"> Player Overview </div>
              <LineTitle />
              <UserHistory userId={user?.id} />
            </div>
          </div>
        </div>
      </div>
      <Menu />
    </div>
  );
};

export default UserProfilePage;
