import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";
import { LineTitle } from "./LineTitle";
import { CircleStatus } from "./CircleStatus";
import { ButtonsBelowAvatar } from "./ButtonsBelowAvatar";
import ButtonUserAction from "./ButtonUserAction";
import { RiSendPlaneFill } from "react-icons/ri";
import { useUsers } from "../context/UsersContext";
import { HttpStatusCode } from "axios";
import { PrivateChatDTO } from "../shared/chat/chat.dto";
import { redirectToErrorPage } from "../components/redirectToErrorPage";

const DisplayUsers = () => {
  const { auth }: any = useAuth();
  const [search, setSearch] = useState("");

  const { users } = useUsers();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const registeredUsersCount = users?.filter((user) => user.isDoneRegister)
    .length;

  const messageUser = async (userId: number) => {
    try {
      const response = await axiosPrivate?.post("api/private-chats/", {
        targetId: userId,
      });

      if (response?.status === HttpStatusCode.Created) {
        const privateChat: PrivateChatDTO = response.data;
        console.log("PRIVATE CHAT ID = ", privateChat.id);
        navigate(`/private-chats/${privateChat.id}`);
      }
    } catch (error) {
      redirectToErrorPage(error, navigate);
    }
  };

  return (
    <div className="profile-element">
      <div className="profile-elements">
        <div className="flex-row-center space-bet div-search-user ">
          <div className="text-title-h2">Users</div>
          <input
            className="input-search-user"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for user..."
          />
        </div>
        <LineTitle />
        <div className="div-users">
          {registeredUsersCount ? (
            <ul className="div-users">
              {users
                .filter(
                  (user) =>
                    user.isDoneRegister &&
                    (search === "" ||
                      user.username
                        .toLowerCase()
                        .includes(search.toLowerCase())),
                )
                .map((user, i) => (
                  <li key={i} className="div-friend">
                    {user?.isDoneRegister && (
                      <>
                        <span className="text-username" title={user?.username}>
                          {user?.username}
                        </span>
                        <div className="div-avatar-profile">
                          <img
                            src={user.avatarLink}
                            className="avatar-profile ellipse"
                            width="150"
                            height="150"
                            alt="avatarLink"
                          />
                          <div
                            className="hover-text"
                            onClick={() =>
                              navigate(`/users/profile/:${user?.id}`)
                            }
                          >
                            See user profile
                          </div>
                          <CircleStatus isLogged={user?.isLogged} />
                        </div>
                        <ButtonsBelowAvatar auth={auth} user={user} />
                        {auth.username !== user.username && (
                          <ButtonUserAction
                            className="button-form button-blue"
                            text="Write message"
                            onClick={() => {
                              messageUser(user?.id);
                              navigate("/chat");
                            }}
                            Icon={RiSendPlaneFill}
                            styleIcon={{ fontSize: "20px" }}
                          />
                        )}
                      </>
                    )}
                  </li>
                ))}
            </ul>
          ) : (
            <p> No Users to display </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisplayUsers;
