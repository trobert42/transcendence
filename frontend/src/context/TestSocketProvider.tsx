import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { axiosPrivate } from "../utils/api";

interface SocketProviderProps {
  children: ReactNode;
}

let toLimitRefect: number = 0;

const TestSocketContext = createContext<Socket | null>(null);

export function useTestSocket(): Socket | null {
  return useContext(TestSocketContext);
}

export function TestSocketProvider({
  children,
}: SocketProviderProps): JSX.Element {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const openWebsocketWithServer = async () => {
      let socketTmp = socket;
      try {
        if (!socketTmp && toLimitRefect === 0 && !socket) {
          toLimitRefect = 1;
          const { data } = await axiosPrivate.get("/auth/myToken");
          const data2 = await axiosPrivate.get("/users/me");
          const username = data2.data.username;
          const userId: number = data2.data.id;
          socketTmp = await io(process.env.REACT_APP_SITE_URL + ":3333", {
            withCredentials: true,
            transports: ["websocket"],
            auth: { token: data.accessToken },
            query: {
              username: username,
              userId: userId,
            },
          });
          setSocket((prevArgs: any) => {
            return socketTmp;
          });
          socketTmp.on("connect", () => {
            setSocket((prevArgs: any) => {
              return socketTmp;
            });
            console.log("websocket with server opened.");
          });

          socketTmp.on("disconnect", () => {
            console.log("websocket with server closed.");
          });
        }
      } catch (error) {
        console.error("Erreur socket ou reponse serveur (axios) : ", error);
      }
    };

    openWebsocketWithServer();
    return () => {
      toLimitRefect = 0;
      if (socket)
        socket?.disconnect();
    };
  }, [socket]);

  return (
    <TestSocketContext.Provider value={socket}>
      {children}
    </TestSocketContext.Provider>
  );
}