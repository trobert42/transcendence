import {Socket} from "socket.io-client";
import {ChatType} from "../utils/interfaces"
import {FaUserGroup} from "react-icons/fa6";

interface ChatTabProps {
  chat: any;
  socket: Socket | null;
  banned: number[];
}

const ChatTab: React.FC<ChatTabProps> = ({chat, socket, banned}) => {

  const isUserBanned = banned.includes(chat.id) && chat.type === ChatType.CHANNEL;
  if (chat.type === ChatType.CHANNEL)
    return (
      <div className="channel_div" onClick={() => {
        chat.join(socket);
      }}>
        <div className="div-icon-logo div-icon-chattab">
          <FaUserGroup className="icon-logo"/>
        </div>
        <div className="text-chattab">
          {chat.name}
        </div>

        {isUserBanned && (
          <div className="channel_banned">
            <span>BANNED</span>
          </div>
        )}
      </div>
    );
  else {
    const avatarLink = chat.target.avatarLink;
    return (
      <div className="channel_div" onClick={() => chat.join(socket)}>
        <div className="div-icon-logo div-icon-chattab">
          <img className="avatar-chattab" src={avatarLink} alt="avatarLink"/>
        </div>
        <div className="text-chattab">
          {chat.name}
        </div>
      </div>
    );
  }
}

export default ChatTab;