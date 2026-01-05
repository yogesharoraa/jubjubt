"use client";
import { useEffect } from "react";
import { socketInstance } from "./socket";
import { ChatListRes } from "../types/ChatListType";
import { useAppDispatch, useAppSelector } from "../utils/hooks";
import { updateChatList } from "../store/Slice/ChatListSlice";
import { MessageListRes } from "../types/MessageListType";
import { setMessageLoading } from "../store/Slice/setChatIdMessageLoading";
import { updateMessageList } from "../store/Slice/MessageListSlice";
import { MessagesSeenStatus, OnlineUsers } from "../types/OnlineUser";
import {
  addOnlineUser,
  removeOnlineUser,
  setOnlineUsers,
} from "../store/Slice/OnlineUserSlice";
import { updateTypingState } from "../store/Slice/SendMessageSlice";
import { updateMessageSeenStatus } from "../store/Slice/messageSeenStatusSlice";
import Cookies from "js-cookie";

export default function ListenAllEvents() {
  const dispatch = useAppDispatch();

  const page = 1;
  const pageSize = 1000;
  const currentChatId = useAppSelector((state) => state.selectedChat.chat_id);
  const myUserId = Cookies.get("Reelboost_user_id");

  useEffect(() => {
    const unlockAudio = () => {
      const a = new Audio();
      a.play().catch(() => {}); // unlock audio context silently
      document.removeEventListener("click", unlockAudio);
    };
    document.addEventListener("click", unlockAudio);
  }, []);

  useEffect(() => {
    function newMessageCommingSound() {
      const audio = new Audio("/audio/achive-sound-132273.mp3");
      audio.muted = false;
      audio
        .play()
    }

    const socket = socketInstance();
    if (!socket) return;

    // Emit to get chat list on mount
    socket.emit("chat_list", { page, pageSize });

    const chatListHandler = (res: ChatListRes) => {
      dispatch(updateChatList(res.Chats));
    };

    socket.on("chat_list", chatListHandler);

    socket.on("message_list", (res: MessageListRes) => {
      dispatch(updateMessageList(res.Records));
      dispatch(setMessageLoading(true));
    });

    // ✅ Handle new incoming message
    socket.on("recieve", (res: MessageListRes) => {
      if (Array.isArray(res.Records) && res.Records.length > 0) {
        dispatch(updateMessageList(res.Records));

        const latestMsg = res.Records[0];
        const myId = Number(myUserId);

        if (latestMsg?.sender_id !== myId) {
          newMessageCommingSound();
        }
      }
    });

    socket.on("initial_online_user", (onlineUsers: OnlineUsers[]) => {
      dispatch(setOnlineUsers(Array.isArray(onlineUsers) ? onlineUsers : []));
    });

    socket.on("online_user", (user: OnlineUsers) => {
      if (user) dispatch(addOnlineUser(user));
    });

    socket.on("offline_user", (data: { user_id: number }) => {
      if (data?.user_id) {
        dispatch(removeOnlineUser(data.user_id));
      }
    });

    socket.on("typing", (data: { chat_id: number; typing: boolean }) => {
      dispatch(updateTypingState(data));
    });

    socket.on("message_seen_status", (data: MessagesSeenStatus) => {
      
      if (data?.message_id && data.message_seen_status === "seen") {
        dispatch(
          updateMessageSeenStatus({
            message_id: data.message_id,
            message_seen_status: data.message_seen_status,
          })
        );
      }
    });

    return () => {
      socket.off("chat_list", chatListHandler);
      socket.off("message_list");
      socket.off("recieve");
      socket.off("initial_online_user");
      socket.off("online_user");
      socket.off("offline_user");
      socket.off("typing");
      socket.off("message_seen_status");
    };
  }, [page, pageSize, dispatch]);

  // Emit "message_list" whenever currentChatId changes
  useEffect(() => {
    const socket = socketInstance();
    if (!socket) return;

    if (!currentChatId) {
      // no chat selected yet, don't emit
      return;
    }

    dispatch(setMessageLoading(true));

    socket.emit("message_list", {
      chat_id: currentChatId,
      page,
      pageSize,
    });
  }, [currentChatId, page, pageSize, dispatch]);

  return null;
}
