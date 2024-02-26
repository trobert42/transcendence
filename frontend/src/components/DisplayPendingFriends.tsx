import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { LineTitle } from "./LineTitle";
import { CircleStatus } from "./CircleStatus";
import { RiSendPlaneFill } from "react-icons/ri";
import { BiSolidUserCheck, BiSolidUserX } from "react-icons/bi";
import ButtonUserAction from "./ButtonUserAction";
import { FiLoader } from "react-icons/fi";
import { useUsers } from "../context/UsersContext";
import { HttpStatusCode } from "axios";
import { PrivateChatDTO } from "../shared/chat/chat.dto";
import { redirectToErrorPage } from "../components/redirectToErrorPage";

const DisplayPendingFriends = () => {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  const { pendingFriends, acceptFriend, rejectFriend } = useUsers();

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
        <div className="text-title-h2">My maybe almost friend ?</div>
        <LineTitle />
        <div className="div-users">
          {pendingFriends?.length ? (
            <ul className="div-users">
              {pendingFriends.map((pendingFriend, i) => (
                <li key={i} className="div-friend">
                  <span
                    className="text-username"
                    title={pendingFriend?.username}
                  >
                    {pendingFriend?.username}
                  </span>
                  <div className="div-avatar-profile">
                    <img
                      src={pendingFriend.avatarLink}
                      className="avatar-profile ellipse"
                      width="150"
                      height="150"
                      alt="avatarLink"
                    />
                    <div
                      className="hover-text"
                      onClick={() =>
                        navigate(`/users/profile/:${pendingFriend?.id}`)
                      }
                    >
                      See friend profile
                    </div>
                    <CircleStatus isLogged={pendingFriend?.isLogged} />
                  </div>
                  {!pendingFriend?.isReceiver && (
                    <>
                      <ButtonUserAction
                        className="button-form button-green"
                        text="Accept invitation"
                        onClick={() => acceptFriend(pendingFriend?.id)}
                        Icon={BiSolidUserCheck}
                        styleIcon={{ fontSize: "25px" }}
                      />
                      <ButtonUserAction
                        className="button-form button-red"
                        text="Refuse invitation"
                        onClick={() => {
                          rejectFriend(pendingFriend?.id);
                        }}
                        Icon={BiSolidUserX}
                        styleIcon={{ fontSize: "25px" }}
                      />
                    </>
                  )}
                  {pendingFriend?.isReceiver && (
                    <ButtonUserAction
                      className="button-form button-grey"
                      text="Waiting for friendship"
                      Icon={FiLoader}
                      styleIcon={{ fontSize: "25px" }}
                    />
                  )}
                  <ButtonUserAction
                    className="button-form button-blue"
                    text="Write message"
                    onClick={() => {
                      messageUser(pendingFriend?.id);
                      navigate("/chat");
                    }}
                    Icon={RiSendPlaneFill}
                    styleIcon={{ fontSize: "20px" }}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-user-profile">No invitations to display</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisplayPendingFriends;
