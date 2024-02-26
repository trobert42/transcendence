import { useSocket } from "../context/SocketProvider";
import { ClientEvents } from "../shared/client/ClientEvents";
import { useEffect, useState } from "react";

export default function PlayingGame() {
  const socket = useSocket();

  return <button className="btn">On Lobby</button>;
}
