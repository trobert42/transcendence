import { Member, MemberStatus } from '../utils/chatClasses';
import { useNavigate } from 'react-router-dom';
import { FaCog } from 'react-icons/fa';
import React, { useState } from 'react';

import ChannelMemberActions from '../components/ChannelMemberActions';
import { Chat } from '../utils/interfaces';
import { CircleStatus } from './CircleStatus';

const ChatMemberCell = ({
  member,
  channel,
  memberStatus,
  userStatus,
}: {
  member: Member;
  channel: Chat | undefined;
  memberStatus: MemberStatus;
  userStatus: string | null;
}) => {
  const { username, avatarLink, id, isLogged } = member;
  const [showActions, setShowActions] = useState(false);
  const channelId = channel?.id;
  const navigate = useNavigate();

  const handleOpenUserSetting = () => {
    setShowActions(!showActions);
  };

  const getStatuses = () => {
    const statuses = [];

    if (memberStatus.admin) {
      statuses.push(
        <div key="admin" style={{ color: 'blue' }}>
          Admin
        </div>,
      );
    }
    if (memberStatus.ban) {
      statuses.push(
        <div key="banned" style={{ color: 'red' }}>
          Banned
        </div>,
      );
    }
    if (memberStatus.mute) {
      statuses.push(
        <div key="muted" style={{ color: 'orange' }}>
          Muted
        </div>,
      );
    }
    if (memberStatus.owner) {
      statuses.push(
        <div key="owner" style={{ color: 'green' }}>
          Owner
        </div>,
      );
    }

    return statuses;
  };

  return (
    <>
      <div className="chat-member-cell">
        <div className="div-avatar-profile-chat">
          <img src={avatarLink} className="avatar-profile-chat ellipse" alt="avatarLink"/>
          <div
            className="hover-text"
            onClick={() => navigate(`/users/profile/:${id}`)}
          >
            See user profile
          </div>
          <CircleStatus isLogged={isLogged} />
        </div>
        <div>
          <span>{username}</span>
          <div className="member_status"> {getStatuses()}</div>
        </div>
        {userStatus != null && (
          <div className="user_div_setting">
            <div className="div-icon-logo " onClick={handleOpenUserSetting}>
              <FaCog className="icon-logo" />
            </div>
          </div>
        )}
      </div>
      {showActions && (
        <div className="modal-overlay">
          <ChannelMemberActions
            channelId={channelId}
            member={member}
            close_action={handleOpenUserSetting}
            memberStatus={memberStatus}
          />
        </div>
      )}
    </>
  );
};

export default ChatMemberCell;
