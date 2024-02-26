export enum ClientEvents {
  Error = "client_error",
  Ping = "client_ping",
  CreateLobby = "client_lobby_create",
  JoinLobby = "client_lobby_join",
  LeaveLobby = "client_lobby_leave",
  MoovePaddle = "client_game_paddle_moove",
  StartGame = "start_game",
  KeyEvent = "key_event",

  // CHAT
  createChannel = "createChannel",
  updateChannel = "updateChannel",
  joinChannel = "joinChannel",
  joinPrivateChat = "joinPrivateChat",
  channelMessage = "channelMessage",
  privateMessage = "privateMessage",
  deleteChannel = "deleteChannel",
  leaveChannel = "leaveChannel",
}
