import { config } from 'dotenv';
import { useNavigate, useParams } from "react-router-dom";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ClientEvents } from "../shared/client/ClientEvents";
import { ServerEvents } from "../shared/server/ServerEvents";
import {
  ChannelDTO,
  ChannelJoinedDTO,
  ChannelUserActionDTO,
  CreateChannelDTO,
  MessageDTO,
  newChannelMemberDTO,
  PrivateChatDTO,
  PrivateChatJoinDTO,
  UpdateChannelDTO,
  UserDTO,
} from "../shared/chat/chat.dto";
import axios from "axios";
import { useTestSocket } from "../context/TestSocketProvider";
import { Chat, ChatType } from "../utils/interfaces";
import {
  Channel,
  ChannelJoinReq,
  Member,
  MemberStatus,
  Message,
  PrivateChat,
} from "../utils/chatClasses";
import {
  getChannelFromChannelDTO,
  getMemberFromUserDTO,
  getMessageFromMessageDTO,
  getPrivateChatFromDTO,
} from "../utils/chatDTOHelpers";
import ChatTab from "../components/ChatTab";
import MessageBubble from "../components/MessageBubble";
import Menu from "../components/Menu";
import ChatMemberCell from "../components/ChatMemberCell";
import useAuth from "../hooks/useAuth";
import ChatWaitingCell from "../components/ChatWaitingCell";
import GameOptions from "../components/GameOptions";
import ChatHeader from "../components/chatHeader";

type ChatPageParams = {
  id: string;
};

interface ChannelJoinReqResponse {
  id: number;
  approved: boolean;
  channelId: number;
  userId: number;
}

function generateUniqueKey(chat: Channel | PrivateChat) {
  let keyPrefix = "";
  if (chat.type === ChatType.CHANNEL) {
    keyPrefix = "channel_";
  } else if (chat.type === ChatType.PRIVATECHAT) {
    keyPrefix = "private_";
  }

  return keyPrefix + chat.id;
}

const ChatPage: React.FC = () => {
  const params = useParams<ChatPageParams>();
  // eslint-disable-next-line
  const { auth, setAuth }: any = useAuth();

  const socket = useTestSocket();
  const [userSelf, setUserSelf] = useState<number | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [privateChats, setPrivateChats] = useState<PrivateChat[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [activeMembers, setActiveMembers] = useState<number[]>([]);
  const [owner, setOwner] = useState<number | null>(null);
  const [admins, setAdmins] = useState<number[]>([]);
  const [banned, setBanned] = useState<number[]>([]);
  const [muted, setMuted] = useState<number[]>([]);
  const [postedMessages, setPostedMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [focusedChat, setFocusedChat] = useState<Chat | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);
  const [showChannelSetting, setShowChannelSetting] = useState(false);
  const [showRequestSent, setshowRequestSent] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelType, setNewChannelType] = useState("PUBLIC");
  const [newChannelPwd, setNewChannelPwd] = useState("");
  const [chanBan, setChanBan] = useState<number[]>([]);
  const [waintingUser, setWaitingUser] = useState<ChannelJoinReq[]>([]);
  const [allUser, setAllUser] = useState<Member[]>([]);
  const [passwordError, setPasswordError] = useState(false);

  const messageContainerRef = useRef<HTMLDivElement>(null);

  const handleOpenModal = () => {
    setPasswordError(false);
    setNewChannelName("");
    setNewChannelPwd("");
    setNewChannelType("PUBLIC");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleOpenChannelSetting = () => {
    if (focusedChat) setNewChannelName(focusedChat.name);
    setShowChannelSetting(true);
  };

  const handleCloseChannelSetting = () => {
    setShowChannelSetting(false);
  };

  const handleSaveChannel = () => {
    if (focusedChat) {
      socket?.emit(
        ClientEvents.updateChannel,
        new UpdateChannelDTO(
          focusedChat.id,
          newChannelName,
          newChannelType,
          newChannelPwd,
        ),
      );
    }
    handleCloseChannelSetting();
  };

  const handleCreateChannel = () => {
    if (newChannelType === 'PROTECTED' && newChannelPwd.length < 6) {
      setPasswordError(true);
      return;
    }

    socket?.emit(
      ClientEvents.createChannel,
      new CreateChannelDTO(newChannelName, newChannelType, newChannelPwd),
    );
    setNewChannelName("");
    handleCloseModal();
  };

  useEffect(() => {
    setMembers(sortMembers({ memberToSort: members }));
    userStatus =
      owner === auth.id ? "owner" : admins.includes(auth.id) ? "admin" : null;
  }, [owner, admins, banned, muted]);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [postedMessages]);

  // ============ FETCHING CHANNELS AND PRIVATE CHATS ===========
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await axios.get(
          process.env.REACT_APP_SITE_URL+":3333/api/channels/",
          { withCredentials: true },
        );
        const retrievedChannels: Channel[] = response.data.map(
          (channel: ChannelDTO) => getChannelFromChannelDTO(channel),
        );
        setChannels(retrievedChannels);
      } catch (error) {
        console.error("Error fetching channels: ", error);
      }
    };

    const fetchPrivateChats = async () => {
      try {
        const response = await axios.get(
          process.env.REACT_APP_SITE_URL+":3333/api/private-chats/",
          { withCredentials: true },
        );
        const retrievedPrivateChats: PrivateChat[] = response.data.map(
          (pvChat: PrivateChatDTO) => getPrivateChatFromDTO(pvChat),
        );
        setPrivateChats(retrievedPrivateChats);
      } catch (error) {
        console.error("Error fetching privateChats: ", error);
      }
    };

    const fetchChanBan = async () => {
      try {
        const response = await axios.get(
          process.env.REACT_APP_SITE_URL+":3333/api/channels/banned",
          { withCredentials: true },
        );
        const bannedChannels: number[] = response.data;
        setChanBan(bannedChannels);
      } catch (error) {
        console.error("Error fetching channels: ", error);
      }
    };

    const fetchAllUser = async () => {
      try {
        const response = await axios.get(process.env.REACT_APP_SITE_URL+":3333/users/", {
          withCredentials: true,
        });
        const retrievedAllUser: Member[] = response.data.map((user: UserDTO) =>
          getMemberFromUserDTO(user),
        );
        setAllUser(retrievedAllUser);
      } catch (error) {
        console.error("Error fetching all users: ", error);
      }
    };

    const fetchUser = async () => {
      interface UserRes {
        id: number;
      }

      try {
        const response = await axios.get<UserRes>(
          process.env.REACT_APP_SITE_URL+":3333/users/me",
          { withCredentials: true },
        );
        setUserSelf(response.data.id);
      } catch (error) {
        setUserSelf(null);
      }
    };

    fetchChannels();
    fetchChanBan();
    fetchAllUser();
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchPrivateChats = async () => {
      try {
        const response = await axios.get(
          process.env.REACT_APP_SITE_URL+":3333/api/private-chats/",
          {withCredentials: true},
        );
        const retrievedPrivateChats: PrivateChat[] = response.data.map(
          (pvChat: PrivateChatDTO) => getPrivateChatFromDTO(pvChat),
        );
        setPrivateChats(retrievedPrivateChats);
      } catch (error) {
        console.error("Error fetching privateChats: ", error);
      }
    };

    fetchPrivateChats();
    if (params.id) {
      const foundPvChat = privateChats.find(
        (chat) => chat.id === Number(params.id),
      );
      if (foundPvChat) {
        foundPvChat?.join(socket);
        setFocusedChat(foundPvChat);
      }
    }
  }, [params.id]);

  useEffect(() => {
    if (!focusedChat) {
      setPostedMessages([]);
    }
    setInputMessage("");
  }, [focusedChat]);

  const sortMembers = ({ memberToSort }: { memberToSort: Member[] }) => {
    const sortedMembers = [...memberToSort];

    const getStatus = ({ memberId }: { memberId: number }) => {
      if (owner !== null && memberId === owner) return "owner";
      if (admins.includes(memberId)) return "admin";
      if (muted.includes(memberId)) return "muted";
      if (banned.includes(memberId)) return "banned";
      return "regular";
    };

    sortedMembers.sort((a, b) => {
      const statusA = getStatus({ memberId: a.id });
      const statusB = getStatus({ memberId: b.id });

      if (statusA === statusB) {
        return a.username.localeCompare(b.username);
      } else {
        const statusOrder = {
          owner: 1,
          admin: 2,
          regular: 3,
          muted: 4,
          banned: 5,
        };
        return statusOrder[statusA] - statusOrder[statusB];
      }
    });

    return sortedMembers;
  };

  // ============= SOCKETS EVENT HANDLERS DEFINITION ================

  // ====== CHANNEL HANDLERS =======
  const handleChannelJoinAccepted = useCallback(

    (dto: ChannelJoinedDTO) => {
      const fetchWaitingUser = async () => {
        try {
          const response = await axios.get(
            process.env.REACT_APP_SITE_URL+":3333/api/channels/" +
              dto.channelId +
              "/join-requests",
            { withCredentials: true },
          );
          const retrievedPrivateChats: ChannelJoinReq[] = response.data.map(
            (item: ChannelJoinReqResponse) => {
              return new ChannelJoinReq(
                item.id,
                item.approved,
                item.channelId,
                item.userId,
              );
            },
          );
          setWaitingUser(retrievedPrivateChats);
        } catch (error) {
          console.error("Error fetching waitingUser: ", error);
        }
      };

      if (dto.owner === auth.id) fetchWaitingUser();
      else setWaitingUser([]);

      const messages = dto.messages.map((msg) => getMessageFromMessageDTO(msg));
      setPostedMessages(messages);
      const members = dto.members.map((user) => getMemberFromUserDTO(user));

      setOwner(dto.owner);
      setAdmins(dto.admins);
      setBanned(dto.banned);
      setMuted(dto.muted);

      setMembers(sortMembers({ memberToSort: members }));

      const foundChannel = channels.find((chan) => chan.id === dto.channelId);
      if (foundChannel)
        setFocusedChat((prevFocusedChat) => {
          return foundChannel;
        });
    },
    [channels, focusedChat, members, sortMembers, auth.id],
  );

  const handleChannelJoinStandby = (channelId: number) => {
    setshowRequestSent(true);
  };

  const handleChannelJoinDeclined = () => {
    
  };

  const handleNewChannel = useCallback(
    (channelDTO: ChannelDTO) => {
      const channel = getChannelFromChannelDTO(channelDTO);
      setChannels((prevChannels) => [...prevChannels, channel]);
    },
    [channels],
  );

  const handleChannelUpdated = useCallback(
    (dto: ChannelDTO) => {
        setChannels((prevChannels) =>
        prevChannels.map((chan) =>
          chan.id === dto.id ? { ...chan, ...dto } : chan,
        ),
      );
    },
    [setChannels],
  );

  const handleChannelDeleted = useCallback(
    (channelId: number) => {
      if (
        focusedChat?.type === ChatType.CHANNEL &&
        focusedChat?.id === channelId
      ) {
        setFocusedChat(undefined);
      }
      const updatedChannels = channels.filter((chan) => chan.id !== channelId);
      setChannels(updatedChannels);
    },
    [focusedChat, channels],
  );

  const handleNewChannelMember = useCallback(
    (dto: newChannelMemberDTO) => {

      if (
        focusedChat?.type === ChatType.CHANNEL &&
        focusedChat.id === dto.channelId
      ) {
        setMembers((prevMembers) => [
          ...prevMembers,
          getMemberFromUserDTO(dto.user),
        ]);
      }
    },
    [focusedChat, members],
  );

  const handleDeletedChannelMember = useCallback(
    (dto: newChannelMemberDTO) => {

      if (
        focusedChat?.type === ChatType.CHANNEL &&
        focusedChat.id === dto.channelId
      ) {
        const member = getMemberFromUserDTO(dto.user);
        const updatedMembers = members.filter(mem => mem.id !== member.id);
        setMembers(updatedMembers);
      }
    },
    [focusedChat, members],
  );

  const handleBanned = useCallback(
    (dto: ChannelUserActionDTO) => {
      if (
        focusedChat?.type === ChatType.CHANNEL &&
        focusedChat?.id === dto.channelId
      ) {
        setBanned((prevBanned) => [...prevBanned, dto.userId]);
      }
      if (userSelf === dto.userId) {
        setFocusedChat(undefined);
        setShowChannelSetting(false);
      }
    },
    [focusedChat, banned, userSelf],
  );

  const handleUnbanned = useCallback(
    (dto: ChannelUserActionDTO) => {
      if (
        focusedChat?.type === ChatType.CHANNEL &&
        focusedChat.id === dto.channelId
      ) {
        const updatedBanned = banned.filter((ban) => ban !== dto.userId);
        setBanned(updatedBanned);
      }
    },
    [focusedChat, banned],
  );

  const handleKicked = useCallback(
    (dto: ChannelUserActionDTO) => {
      if (userSelf === dto.userId) {
        setFocusedChat(undefined);
        setShowChannelSetting(false);
      }
    },
    [focusedChat],
  );

  const handleMuted = useCallback(
    (dto: ChannelUserActionDTO) => {
      if (
        focusedChat?.type === ChatType.CHANNEL &&
        focusedChat.id === dto.channelId
      ) {
        setMuted((prevMuted) => [...prevMuted, dto.userId]);
      }
    },
    [focusedChat, muted],
  );

  const handleUnmuted = useCallback(
    (dto: ChannelUserActionDTO) => {
      if (
        focusedChat?.type === ChatType.CHANNEL &&
        focusedChat.id === dto.channelId
      ) {
        const updatedMuted = muted.filter((m) => m !== dto.userId);
        setMuted(updatedMuted);
      }
    },
    [focusedChat, muted],
  );

  const handlePromoted = useCallback(
    (dto: ChannelUserActionDTO) => {
      if (
        focusedChat?.type === ChatType.CHANNEL &&
        focusedChat.id === dto.channelId
      ) {
        setAdmins((prevAdminds) => [...prevAdminds, dto.userId]);
      }
    },
    [focusedChat, admins],
  );

  const handleDemoted = useCallback(
    (dto: ChannelUserActionDTO) => {
      if (
        focusedChat?.type === ChatType.CHANNEL &&
        focusedChat.id === dto.channelId
      ) {
        const updateAdmins = admins.filter((adm) => adm !== dto.userId);
        setAdmins(updateAdmins);
      }
    },
    [focusedChat, admins],
  );

  const handleOwnerChanged = useCallback(
    (dto: ChannelUserActionDTO) => {
      if (
        focusedChat?.type === ChatType.CHANNEL &&
        focusedChat.id === dto.channelId
      ) {
        if (dto.userId === 0) setOwner(null);
        else setOwner(dto.userId);
      }
    },
    [owner, focusedChat],
  );

  // ======== PRIVATECHAT HANDLERS =======

  const handleNewPrivateChat = useCallback(
    (dto: PrivateChatDTO) => {
      const privateChat = getPrivateChatFromDTO(dto);
      setPrivateChats((prevPrivateChats) => [...prevPrivateChats, privateChat]);
    },
    [privateChats],
  );

  const handlePrivateChatJoinAccepted = useCallback(
    (dto: PrivateChatJoinDTO) => {
      
      const messages = dto.messages.map((msg) => getMessageFromMessageDTO(msg));
      setPostedMessages(messages);

      const members = dto.users.map((user) => getMemberFromUserDTO(user));
      setMembers(sortMembers({ memberToSort: members }));

      const foundPrivateChat = privateChats.find((pC) => pC.id === dto.id);
      if (foundPrivateChat) setFocusedChat(foundPrivateChat);
    },
    [privateChats, focusedChat, members],
  );

  const handlePrivateChatJoinDeclined = () => {
    
  };

  // ======= GENERAL HANDLERS ======

  const handleIncomingMessage = useCallback(
    (messageDTO: MessageDTO) => {
      const msg = getMessageFromMessageDTO(messageDTO);
      setPostedMessages((prevMessages) => [...prevMessages, msg]);
    },
    [postedMessages],
  );

  useEffect(() => {
    if (socket) {
      socket.on(ServerEvents.channelJoinAccepted, handleChannelJoinAccepted);
      socket.on(ServerEvents.channelJoinDeclined, handleChannelJoinDeclined);
      socket.on(ServerEvents.channelJoinStandby, handleChannelJoinStandby);
      socket.on(ServerEvents.newMessageInChat, handleIncomingMessage);
      socket.on(ServerEvents.newChannel, handleNewChannel);
      socket.on(ServerEvents.channelUpdated, handleChannelUpdated);
      socket.on(ServerEvents.channelDeleted, handleChannelDeleted);
      socket.on(
        ServerEvents.privateChatJoinAccepted,
        handlePrivateChatJoinAccepted,
      );
      socket.on(
        ServerEvents.privateChatJoinDeclined,
        handlePrivateChatJoinDeclined,
      );
      socket.on(ServerEvents.banned, handleBanned);
      socket.on(ServerEvents.kicked, handleKicked);
      socket.on(ServerEvents.newPrivateChat, handleNewPrivateChat);
      socket.on(ServerEvents.newChannelMember, handleNewChannelMember);
      socket.on(ServerEvents.unbanned, handleUnbanned);
      socket.on(ServerEvents.unmuted, handleUnmuted);
      socket.on(ServerEvents.muted, handleMuted);
      socket.on(ServerEvents.promoted, handlePromoted);
      socket.on(ServerEvents.demoted, handleDemoted);
      socket.on(ServerEvents.channelOwnerChanged, handleOwnerChanged);
      socket.on(ServerEvents.deletedChannelMember, handleDeletedChannelMember);

      return () => {
        socket?.off(
          ServerEvents.channelJoinAccepted,
          handleChannelJoinAccepted,
        );
        socket?.off(
          ServerEvents.channelJoinDeclined,
          handleChannelJoinDeclined,
        );
        socket?.off(ServerEvents.channelJoinStandby, handleChannelJoinStandby);
        socket?.off(ServerEvents.newMessageInChat, handleIncomingMessage);
        socket?.off(ServerEvents.newChannel, handleNewChannel);
        socket?.off(ServerEvents.channelUpdated, handleChannelUpdated);
        socket?.off(ServerEvents.channelDeleted, handleChannelDeleted);
        socket?.off(
          ServerEvents.privateChatJoinAccepted,
          handlePrivateChatJoinAccepted,
        );
        socket?.off(
          ServerEvents.privateChatJoinDeclined,
          handlePrivateChatJoinDeclined,
        );
        socket.off(ServerEvents.banned, handleBanned);
        socket.off(ServerEvents.kicked, handleKicked);
        socket.off(ServerEvents.newPrivateChat, handleNewPrivateChat);
        socket.off(ServerEvents.newChannelMember, handleNewChannelMember);
        socket.off(ServerEvents.unbanned, handleUnbanned);
        socket.off(ServerEvents.unmuted, handleUnmuted);
        socket.off(ServerEvents.muted, handleMuted);
        socket.off(ServerEvents.promoted, handlePromoted);
        socket.off(ServerEvents.demoted, handleDemoted);
        socket.off(ServerEvents.channelOwnerChanged, handleOwnerChanged);
        socket.off(ServerEvents.deletedChannelMember, handleDeletedChannelMember);
      };
    }
    // eslint-disable-next-line
  }, [
    socket,
    channels,
    focusedChat,
    privateChats,
    members,
    admins,
    muted,
    banned,
    postedMessages,
    owner,
    userSelf,
  ]);

  // ========= CALLED BY UI ELEMENTS FUNCTIONS DEFINITION ============
  // eslint-disable-next-line
  const createPublicChannel = () => {
    socket?.emit(
      ClientEvents.createChannel,
      new CreateChannelDTO("Channel", "PUBLIC", ""),
    );
  };

  const deleteChannel = (channelId: number) => {
    setShowChannelSetting(false);
    socket?.emit("deleteChannel", channelId);
  };

  const leaveChannel = (channelId: number) => {
    setShowChannelSetting(false);
    
    setFocusedChat(undefined);
    socket?.emit(ClientEvents.leaveChannel, channelId);
  };

  const postMessage = () => {
    if (inputMessage.trim() !== "" && focusedChat !== undefined) {
      focusedChat.postMessage(socket, inputMessage);
      setInputMessage("");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      postMessage();
    }
  };

  const handleInvite = () => {
    setInvitePlayer(!invitePlayer);
  };

  let userStatus =
    owner === auth.id ? "owner" : admins.includes(auth.id) ? "admin" : null;

  const [invitePlayer, setInvitePlayer] = useState<boolean>(false);
  const [idNewGame, setIdNewGame] = useState("");
  const navigate = useNavigate();

  const onGameMessage = (idNewGame: string) => {
    if (idNewGame && focusedChat !== undefined) {
      focusedChat.postInvit(socket, idNewGame);
      navigate(`/game/lobby/${idNewGame}`, { replace: true });
    }
  };

  useEffect(() => {
    onGameMessage(idNewGame);
    // eslint-disable-next-line
  }, [idNewGame]);

  return (
    <>
      <div className="page">
        <div className="main-container">
          <div className="div-transparent"></div>
          {invitePlayer && (
            <GameOptions
              componentUseForInvite={true}
              setIdNewGameProp={setIdNewGame}
            />
          )}
          <div className="chat-container">
            <div className="user-list">
              {[...channels, ...privateChats].map((chat) => (
                <ChatTab
                  key={generateUniqueKey(chat)}
                  chat={chat}
                  socket={socket}
                  banned={chanBan}
                />
              ))}
              <div className="chat_bottom">
                <button className="channel_div" onClick={handleOpenModal}>
                  Create channel
                </button>
              </div>
            </div>
            <div className="chat-window d-flex flex-column">
              <ChatHeader
                focusedChat={focusedChat}
                members={members}
                handleOpenChannelSetting={handleOpenChannelSetting}
                handleInvite={handleInvite}
              />
              {focusedChat ? (
                <div className="message-container" ref={messageContainerRef}>
                  {postedMessages.map((msg, index) => (
                    <MessageBubble
                      key={index}
                      members={members}
                      msg={msg}
                      show_sender={focusedChat.type === ChatType.CHANNEL}
                    />
                  ))}
                </div>
              ) : (
                <div className="message-container-nochan">
                  {<p>Please select a channel</p>}
                </div>
              )}
              <div className="chat_input">
                <input
                  type="text"
                  placeholder="Enter your message"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={focusedChat == undefined}
                />
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={postMessage}
                  disabled={focusedChat == undefined}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
        <Menu />
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Create Channel</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                X
              </button>
            </div>
            <div className="modal-body">
              <label>Channel Name:</label>
              <input
                type="text"
                placeholder="Enter channel name"
                value={newChannelName}
                onChange={(e) => {
                  const newName = e.target.value.substring(0, 26);
                  setNewChannelName(newName);
                }}
              />
              <label>Channel Type:</label>
              <select
                value={newChannelType}
                onChange={(e) => setNewChannelType(e.target.value)}
              >
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
                <option value="PROTECTED">Protected</option>
              </select>
              {newChannelType === "PROTECTED" && (
                <div>
                  <label>Password</label>
                  <input
                    type="text"
                    placeholder="Enter channel password"
                    value={newChannelPwd}
                    onChange={(e) => {
                      const newPwd = e.target.value.substring(0, 26);
                      setNewChannelPwd(newPwd);
                      if (newPwd.length >= 6) {
                        setPasswordError(false);
                      }
                    }
                  }
                  />
                  {passwordError && <p style={{ color: 'red' }}>Password must be at least 6 characters long</p>}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCloseModal}>
                Close
              </button>
              <button className="btn-create" onClick={handleCreateChannel}>
                Create Channel
              </button>
            </div>
          </div>
        </div>
      )}

      {showRequestSent && (
        <div
          className="modal-overlay"
          onClick={() => {
            setshowRequestSent(false);
          }}
        >
          <div className="modal-joinrequest">
            <h2>Join request sent!</h2>
            <p>Your join request has been successfully sent.</p>
          </div>
        </div>
      )}

      {showChannelSetting && (
        <div className="modal-overlay">
          <div className="modal_channel_setting">
            <div className="modal-header">
              <h2>Channel Settings</h2>
              <button className="close-btn" onClick={handleCloseChannelSetting}>
                X
              </button>
            </div>
            <div className="modal-body">
              {userStatus === null ? (
                <div>
                  <label>Channel Name: {focusedChat?.name}</label>
                </div>
              ) : (
                <div>
                  <label>Channel Name:</label>
                  <input
                    type="text"
                    placeholder="Enter channel name"
                    value={newChannelName}
                    onChange={(e) => {
                      const newName = e.target.value.substring(0, 26);
                      setNewChannelName(newName);
                    }}
                  />
                </div>
              )}
              {userStatus === "owner" && false && (
                <>
                  <label>Channel Type:</label>
                  <select
                    value={focusedChat?.type}
                    onChange={(e) => setNewChannelType(e.target.value)}
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="PRIVATE">Private</option>
                    <option value="PROTECTED">Protected</option>
                  </select>
                  <label>Password</label>
                  <input
                    type="text"
                    placeholder="Enter channel password"
                    value={newChannelPwd}
                    onChange={(e) => {
                      const newPwd = e.target.value.substring(0, 26);
                      setNewChannelPwd(newPwd);
                    }}
                  />
                </>
              )}

              <div style={{ maxHeight: "650px", overflowY: "auto" }}>
                <label>Membres :</label>
                {members.map((member, index) => {
                  const isOwner = owner === member.id;
                  const isAdmin = admins.includes(member.id);
                  const isMuted = muted.includes(member.id);
                  const isBanned = banned.includes(member.id);

                  const memberStatus = new MemberStatus(
                    isOwner,
                    isAdmin,
                    isMuted,
                    isBanned,
                  );

                  return (
                    <div key={index}>
                      <ChatMemberCell
                        member={member}
                        channel={focusedChat}
                        memberStatus={memberStatus}
                        userStatus={userStatus}
                      />
                    </div>
                  );
                })}

                {waintingUser.length > 0 && (
                  <div>
                    <label>Waiting request :</label>

                    {waintingUser.map((joinRequest, index) => {
                      const member = allUser.find(
                        (user) => user.id === joinRequest.userId,
                      );
                      if (member instanceof Member)
                        return (
                          <div key={index}>
                            <ChatWaitingCell
                              joinRequest={joinRequest}
                              member={member}
                            />
                          </div>
                        );
                      return <></>;
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={handleCloseChannelSetting}
              >
                Close
              </button>
              {userStatus === "owner" && focusedChat && (
                <button
                  className="btn-create button-red"
                  onClick={() => deleteChannel(focusedChat.id)}
                >
                  Delete channel
                </button>
              )}
              {focusedChat && (
                <button
                  className="btn-create button-red"
                  onClick={() => leaveChannel(focusedChat.id)}
                >
                  Leave
                </button>
              )}
              <button
                className="btn-create button-green"
                onClick={handleSaveChannel}
              >
                Save settings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatPage;
