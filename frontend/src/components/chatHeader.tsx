import React, {useState} from 'react';
import {FaCog} from 'react-icons/fa';
import {Chat, ChatType} from "../utils/interfaces";
import {Member} from "../utils/chatClasses";
import DisplayMembers from "./DisplayMembers";
import {CircleStatus} from "./CircleStatus";
import {useNavigate} from 'react-router-dom';
import useAuth from "../hooks/useAuth";

interface ChatHeaderProps {
  focusedChat: Chat | undefined;
  members: Member[];
  handleOpenChannelSetting: () => void;
  handleInvite: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> =
  ({
     focusedChat,
     members,
     handleOpenChannelSetting,
     handleInvite,
   }) => {

    const {auth}: any = useAuth();
    const [showActions, setShowActions] = useState(false);
    const navigate = useNavigate();

    // eslint-disable-next-line
    const handleOpenUserSetting = () => {
      setShowActions(!showActions);
    };
    if (!focusedChat || members.length === 0)
      return (<div className="message-header"></div>)


    if (focusedChat.type === ChatType.PRIVATECHAT) {
        const other = members[0].id === auth.id ? members[1] : members[0];
        const {username, avatarLink, id, isLogged} = other;


        return (
            <div className="message-header">
                {focusedChat && (
                    <>
                        <div className="message-header-left">
                            <div className="chat-member-cell-header-chat">
                                <div className="div-avatar-profile-chat">
                                    <img src={avatarLink} className="avatar-profile-chat-little ellipse" alt="avatarLink"/>
                                    <div
                                        className="hover-text hoverlittle"
                                        onClick={() => navigate(`/users/profile/:${id}`)}
                                    >
                                        See user profile
                                    </div>
                                    <CircleStatus isLogged={isLogged}/>
                                </div>
                                <div>
                                    <span>{username}</span>
                                </div>
                            </div>
                        </div>
                        <div
                            className="div-icon-logo message-header-right btn_play"
                            onClick={handleInvite}
                            style={{ marginTop: '10px' }}
                        >
                            Let's play !
                        </div>
                    </>
                )}
            </div>
        );
    }

    if (focusedChat.type === ChatType.CHANNEL)
      return (
        <div className="message-header">
          {focusedChat && (
            <>
              <div className="message-header-left">
                <h2>
                  {focusedChat?.name}
                </h2>
                <DisplayMembers members={members}/>
              </div>
              <div
                className="div-icon-logo message-header-right"
                onClick={handleOpenChannelSetting}
              >
                <FaCog className="icon-logo"/>
              </div>
            </>
          )}
        </div>
      );

    return (<div className="message-header"></div>)
  };

export default ChatHeader;