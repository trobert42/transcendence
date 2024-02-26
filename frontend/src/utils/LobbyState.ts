import { atom } from "recoil";
import { ServerPayload } from "../shared/server/ServerPayload";
import { ServerEvents } from "../shared/server/ServerEvents";

export const CurrentLobbyState = atom<
  ServerPayload[ServerEvents.LobbyState] | null
>({
  key: "CurrentLobbyState",
  default: null,
});
