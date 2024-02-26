import {useTestSocket} from "../context/TestSocketProvider"
import React,{useState} from 'react';
import useAuth from "../hooks/useAuth";
import {ChannelJoinReq, Member} from "../utils/chatClasses";
import { ChannelUserActionDTO } from '../shared/chat/chat.dto';


const ChatWaitingCell = ({joinRequest, member}: { joinRequest: ChannelJoinReq, member: Member }) => {
  const {auth, setAuth}: any = useAuth();
  const [isHidden, setIsHidden] = useState(false);

  const socket = useTestSocket();

  const channelId = joinRequest.channelId;
  const userId = joinRequest.userId;

  const accept = () => {
    socket?.emit('approveJoin', new ChannelUserActionDTO(userId, channelId));
    setIsHidden(true);
  }

  const deny = () => {
    setIsHidden(true);
  }

  if (isHidden) return null;

  return (
    <>
      <div className='chat-member-cell'>
        <img src={member.avatarLink} style={{maxHeight: '50px'}} alt="avatarLink"/>
        <div>
          <span>{member.username}</span>
        </div>
        <button className="button_action button_green" onClick={accept}>
          Approve
        </button>
        <button className="button_action button_red" onClick={deny}>
          Deny
        </button>
      </div>
    </>
  );
};

export default ChatWaitingCell;