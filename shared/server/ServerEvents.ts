export enum ServerEvents {
  Pong = "server_pong",
  LobbyState = "server_lobby_state",
  LobbyPlayerJoined = "server_lobby_player_joined",
  LobbyPlayerLeft = "server_lobby_player_left",
  LobbyPlayerReady = "server_lobby_player_ready",
  LobbyPlayerNotReady = "server_lobby_player_notready",
  LobbyGameStarted = "server_lobby_game_started",
  LobbyGameEnded = "server_lobby_game_ended",
  LobbyGameError = "server_lobby_game_error",
  LobbyGamePlayerMove = "server_lobby_game_player_turn",
  LobbyGameMessage = "server_game_message",
  LobbyGameCountdown = "server_lobby_game_countdown",
  LobbyGameWinner = "server_lobby_game_winner",


  // CHAT
  newMessageInChat = "newMessage",

  channelJoinAccepted = "channelJoinAccepted",
  channelJoinDeclined = "channelJoinDeclined",
  channelJoinStandby = "channelJoinStandby",
  newChannel = "newChannel",
  channelUpdated = "channelUpdated",
  channelDeleted = "channelDeleted",
  newChannelMember = "newChannelMember",
  deletedChannelMember = "deletedChannelMember",
  kicked = "kicked",
  banned = "banned",
  unbanned = "unbanned",
  muted = "muted",
  unmuted = "unmuted",
  promoted = "promoted",
  demoted = "demoted",
  channelOwnerChanged = "channelOwnerChanged",

  privateChatJoinAccepted = "privateChatJoinAccepted",
  privateChatJoinDeclined = "privateChatJoinDeclined",
  newPrivateChat = "newPrivateChat",
}
