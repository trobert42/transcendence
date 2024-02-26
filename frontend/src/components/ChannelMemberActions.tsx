import {useTestSocket} from "../context/TestSocketProvider"
import {FaBan, FaMicrophoneSlash, FaUserPlus, FaSignOutAlt} from "react-icons/fa";
import {Member, MemberStatus} from '../utils/chatClasses';
import { ChannelUserActionDTO } from '../shared/chat/chat.dto';
import React from "react";
import useAuth from "../hooks/useAuth";

const ChannelMemberActions = ({channelId, member, close_action, memberStatus}: {
  channelId: number | undefined,
  member: Member,
  memberStatus: MemberStatus,
  close_action: () => (void),
}) => {
  const socket = useTestSocket();
  const {username, avatarLink} = member;
  const userId = member.id;
  // eslint-disable-next-line
  const {auth, setAuth}: any = useAuth();

  const unbanUser = () => {
    console.log(`requested unban of user #${userId} from channel ${channelId}`);
    if (channelId) {
      socket?.emit('unban', new ChannelUserActionDTO(userId, channelId));
    }
  }

  const banUser = () => {
    console.log(`requested ban of user #${userId} from channel ${channelId}`);
    if (channelId) {
      socket?.emit('ban', new ChannelUserActionDTO(userId, channelId));
    }
  }

  const muteUser = () => {
    console.log(`requested mute of user #${userId} from channel ${channelId}`);
    if (channelId) {
      socket?.emit('mute', new ChannelUserActionDTO(userId, channelId));
    }
  }
  const unmuteUser = () => {
    console.log(`requested unmute of user #${userId} from channel ${channelId}`);
    if (channelId) {
      socket?.emit('unmute', new ChannelUserActionDTO(userId, channelId));
    }
  }

  const kickUser = () => {
    console.log(`requested kick of user #${userId} from channel ${channelId}`);
    if (channelId) {
      socket?.emit('kick', new ChannelUserActionDTO(userId, channelId));
    }
  }

  const promoteUser = () => {
    console.log(`requested promotion of user #${userId} in channel ${channelId}`);
    if (channelId) {
      socket?.emit('promote', new ChannelUserActionDTO(userId, channelId));
    }
  }

  const demoteUser = () => {
    console.log(`requested depromotion of user #${userId} in channel ${channelId}`);
    if (channelId) {
      socket?.emit('demote', new ChannelUserActionDTO(userId, channelId));
    }
  }

  let class_button_promote = memberStatus.admin ? 'button_red' : 'button_green';
  let class_button_ban = memberStatus.ban ? 'button_green' : 'button_red';
  let class_button_mute = memberStatus.mute ? 'button_green' : 'button_red';
  let class_button_kick = 'button_red';

  if (member.id === auth.id || memberStatus.owner) {
    class_button_promote = 'button_disabled';
    class_button_ban = 'button_disabled';
    class_button_mute = 'button_disabled';
    class_button_kick = 'button_disabled';
  }

  return (
    <div className="channel-user-setting">
      <div className="channel-user-setting-img">
        <img src={avatarLink} alt="avatarLink"/>
      </div>
      <div>
        <div className="user_setting_top">
          <span className="span_user">{username}</span>
          <button className="close-btn" onClick={close_action}>
            X
          </button>
        </div>
        <div className="grid_button">
          <button
            onClick={memberStatus.admin?demoteUser : promoteUser}
            className={`button_action ${class_button_promote}`}
            disabled={member.id === auth.id || memberStatus.owner}
          >
            <div>
              <FaUserPlus/>
              <span>{memberStatus.admin ? 'disgrace' : 'Promote'}</span>
            </div>
          </button>
          <button
            onClick={memberStatus.ban ? unbanUser : banUser}
            className={`button_action ${class_button_ban}`}
            disabled={member.id === auth.id || memberStatus.owner}
          >
            <div>
              <FaBan/>
              <span>{memberStatus.ban ? 'Unban' : 'Ban'}</span>
            </div>
          </button>
          <button
            onClick={memberStatus.mute ? unmuteUser : muteUser}
            className={`button_action ${class_button_mute}`}
            disabled={member.id === auth.id || memberStatus.owner}
          >
            <div>
              <FaMicrophoneSlash/>
              <span>{memberStatus.mute ? 'Unmute' : 'Mute'}</span>
            </div>
          </button>
          <button onClick={kickUser} className={`button_action ${class_button_kick}`}
                  disabled={member.id === auth.id || memberStatus.owner}>
            <div>
              <FaSignOutAlt/>
              <span>Kick</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChannelMemberActions;