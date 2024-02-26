import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { LineTitle } from "./LineTitle";
import { CircleStatus } from "./CircleStatus";
import { RiSendPlaneFill } from "react-icons/ri";
import ButtonUserAction from "./ButtonUserAction";
import { useUsers } from "../context/UsersContext";
import { BiSolidUserMinus } from "react-icons/bi";
import { HttpStatusCode } from "axios";
import { PrivateChatDTO } from "../shared/chat/chat.dto";
import { redirectToErrorPage } from "../components/redirectToErrorPage";

const DisplayFriends = () => {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  const { friends, removeFriend } = useUsers();

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
    <div className="profile-element">
      <div className="profile-elements">
        <div className="text-title-h2">My bestas</div>
        <LineTitle />
        <div className="div-users">
          {friends?.length ? (
            <ul className="div-users">
              {friends.map((friend, i) => (
                <li key={i} className="div-friend">
                  <span className="text-username" title={friend?.username}>
                    {friend?.username}
                  </span>
                  <div className="div-avatar-profile">
                    <img
                      src={friend.avatarLink}
                      className="avatar-profile ellipse"
                      width="150"
                      height="150"
                      alt="avatarLink"
                    />
                    <div
                      className="hover-text"
                      onClick={() => navigate(`/users/profile/:${friend?.id}`)}
                    >
                      See friend profile
                    </div>
                    <CircleStatus isLogged={friend?.isLogged} />
                  </div>
                  <ButtonUserAction
                    className="button-form button-red"
                    text="Remove friend"
                    onClick={() => {
                      removeFriend(friend?.id);
                    }}
                    Icon={BiSolidUserMinus}
                    styleIcon={{ fontSize: "25px" }}
                  />
                  <ButtonUserAction
                    className="button-form button-blue"
                    text="Write message"
                    onClick={() => {
                      messageUser(friend?.id);
                      navigate("/chat");
                    }}
                    Icon={RiSendPlaneFill}
                    styleIcon={{ fontSize: "20px" }}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-user-profile"> No friends to display </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisplayFriends;
