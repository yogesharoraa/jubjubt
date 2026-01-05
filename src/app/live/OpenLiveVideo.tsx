// OpenLiveVideo.tsx
import { useAppDispatch, useAppSelector } from "../utils/hooks";
import {
  clearLiveEvents,
  clearSelectedLive,
  setJoinLiveResponse,
} from "../store/Slice/LiveSlice";
import { Dialog } from "@mui/material";
import { hideModal } from "../store/Slice/ModalsSlice";
import VideoPlayer from "../components/VideoPlayer";
import LiveLikeComment from "./LiveLikeComment";
import { useEffect } from "react";
import { socketInstance } from "../socket/socket";
import usePeerId from "../hooks/usePeerId";
import Cookies from "js-cookie";
import { IoIosArrowBack } from "react-icons/io";
import Image from "next/image";
import { AiOutlineEye } from "react-icons/ai";
import { JoinLive } from "../types/LiveReels";

function OpenLiveVideo() {
  const open = useAppSelector((state) => state.modals.LivePopup);
  const selectedLive = useAppSelector((state) => state.live.selectedLive);
  const dispatch = useAppDispatch();
  const socket_room_id = useAppSelector((state) => state.live.socket_room_id);
  const user_id = useAppSelector((state) => state.live.user_id);
  const liveUser = useAppSelector((state) => state.live.joinLiveResponse);
  const activeResponse = useAppSelector((state) => state.live.liveEvents);
  const socket = socketInstance();
const peerId = usePeerId();
  const MyUserId = Cookies.get("Reelboost_user_id");
 

  //  useEffect(() => {
  //     socket.on("activity_on_live");

  //     return () => {
  //       socket.off("activity_on_live");
  //     };
  //   }, [selectedLive, socket_room_id, dispatch]);

  useEffect(() => {
    if (!open || !selectedLive || !socket_room_id) return;

    // join live event
    socket.emit("join_live", {
      socket_room_id: socket_room_id,
      user_id: MyUserId,
      peer_id: peerId,
    });
    socket.on("join_live", (data:JoinLive) => {
      // update Redux with confirmed response
      dispatch(setJoinLiveResponse(data));
    });
  }, [open, selectedLive, socket_room_id, user_id, socket]);

  return (
    <Dialog
      open={open}
      onClose={() => {
        dispatch(hideModal("LivePopup"));
        dispatch(clearSelectedLive());
        dispatch(clearLiveEvents());
      }}
      fullWidth
      PaperProps={{
        sx: {
          p: 0,
          overflow: "visible",
          borderRadius: 3,
          width: "500px",
          maxWidth: "100%",
          maxHeight:"700px"
        },
      }}
      BackdropProps={{ sx: { background: "#000000BD" } }}
    >
      <div className="h-[700px] bg-dark sm:block hidden relative rounded-lg">
        {selectedLive ? (
          <VideoPlayer
            src={selectedLive.Live_hosts[0].peer_id}
            autoPlay
            height="h-[700px]"
          />
        ) : (
          <p className="text-primary p-4">No live selected</p>
        )}
        {/* live user details */}
        <div className="absolute top-3 flex justify-between w-full">
          <div className="p-2 flex gap-3 place-items-center">
            {/* back button */}
            <IoIosArrowBack
              className="text-primary text-lg drop-shadow-[0_1px_2px_rgba(0,0,0,3)]"
              onClick={() => {
                dispatch(dispatch(hideModal("LivePopup")));
                dispatch(clearLiveEvents());
              }}
            />

            {/* username and profile */}
            <div className="flex gap-2 place-items-center">
              {/* profile */}
              <div className="w-8 h-8 rounded-full">
                <Image
                  src={liveUser?.peer_id[0].User.profile_pic || ""}
                  alt=""
                  width={50}
                  height={50}
                  className="w-8 h-8 rounded-full"
                />
              </div>
              <p className="text-sm text-primary inline-block drop-shadow-[0_1px_2px_rgba(0,0,0,3)]">
                {liveUser?.peer_id[0].User.user_name}
              </p>
            </div>
          </div>

          {/* TOTAL VIEWERS AND LIKES */}
          <div className="flex gap-2 rounded-l-md py-1 px-2 absolute top-2 right-0 bg-dark/70 z-20">
            <div className="flex gap-1 items-center">
              <Image
                src="/SidebarIcons/heart.png"
                alt="heart"
                width={12}
                height={12}
              />
              <p className="font-medium text-primary text-[10px]">
                {activeResponse &&
                activeResponse.length > 0 &&
                activeResponse[activeResponse.length - 1].like
                  ? activeResponse[activeResponse.length - 1].current_like
                  : liveUser?.likes}
              </p>
            </div>
            <div className="flex gap-1 items-center">
              <AiOutlineEye className="w-4 h-4 text-primary" />
              <p className="font-medium text-primary text-[10px]">
                {liveUser?.total_viewers}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0">
        <LiveLikeComment />
      </div>
    </Dialog>
  );
}

export default OpenLiveVideo;
