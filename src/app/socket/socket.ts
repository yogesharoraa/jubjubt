// @ts-nocheck
import Cookies from "js-cookie";
import { io } from "socket.io-client";

let socket: SocketIOClient;
export const socketInstance = () => {
    const token = Cookies.get("Reelboost_auth_token")
   
    
  if (!socket) {
    const token = Cookies.get("Reelboost_auth_token");
    socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
      path: "/socket",
      transports: ["websocket"],
      auth: { token },
    });

     socket.on("connect", () => {
      if (socket) {
        Cookies.set("socketId", socket.id);
      }
    });

    socket.on("connect_error", (err) => {
      // console.error("❌ Socket connection error:", err.message);
    });
  }
  return socket;
};


