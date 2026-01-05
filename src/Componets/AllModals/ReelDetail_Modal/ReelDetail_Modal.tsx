import { Dialog, DialogPanel } from "@headlessui/react";
import { hideModal } from "../../../Appstore/Slice/ModalSlice";
import { useAppDispatch, useAppSelector } from "../../../Hooks/Hooks";
import useApiPost from "../../../Hooks/PostData";
import { useEffect, useRef, useState } from "react";
import Muted from "/Images/muted.png";
import Unmute from "/Images/unmuted.png";
import Play from "/Images/play.png";
import Pause from "/Images/pause.png";
import Like from "/Images/Like.png";
import Comment from "/Images/Comment.png";
import Bookmark from "/Images/Bookmark.png";
import Like1 from "/Images/Like1.png";
import Comment1 from "/Images/Comment1.png";
import Bookmark1 from "/Images/Bookmark1.png";
import borderImage from "/Images/Border.png";
import LikeDetail from "./LikeDetail";
import CommentDetail from "./CommentDetail";
import BookmarksDetail from "./BookmarksDetail";
import { RxCrossCircled } from "react-icons/rx";

// Helper function
const formatDate = (isoDate?: string): string => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

// Types
interface User {
    user_name: string;
    profile_pic: string;
    full_name: string;
    country: string;
}

interface Media {
    media_location: string;
}

interface ReelRecord {
    reel_thumbnail: string;
    social_desc: string;
    location: string;
    country: string;
    hashtag: string[];
    createdAt: string;
    Media: Media[];
    User: User;
}

interface ApiResponse {
    status: boolean;
    data: {
        Records: ReelRecord[];
    };
}

function ReelDetail_Modal() {
    const modalData = useAppSelector((state) => state.modals.ReelDetail_Modal);
    const dispatch = useAppDispatch();
    const { data, loading, postData } = useApiPost<ApiResponse>();
    const [postDetails, setPostDetails] = useState<ReelRecord | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const [muted, setMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const [showControls, setShowControls] = useState(false);
    const [option, setOption] = useState("Like");

    const close = () => {
        dispatch(hideModal("ReelDetail_Modal"));
    };

    const fetchData = () => {
        const formData = new FormData();
        const reelId = sessionStorage.getItem("reelId");
        formData.append("social_type", "reel");
        formData.append("social_id", reelId || "");
        postData("/admin/get-social-admin", formData);
    };

    useEffect(() => {
        if (modalData) fetchData();
    }, [modalData]);

    useEffect(() => {
        if (data?.status && data.data.Records.length > 0) {
            setPostDetails(data.data.Records[0]);
        }
    }, [data]);

    const handleVideoClick = () => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play();
            setIsPlaying(true);
            setShowControls(false);
        } else {
            video.pause();
            setIsPlaying(false);
            setShowControls(true);
        }
    };

    const handleMuteToggle = () => {
        const video = videoRef.current;
        if (video) {
            video.muted = !muted;
            video.volume = muted ? 1.0 : 0.0;
            setMuted(!muted);
        }
    };

    return (
        <Dialog open={modalData} onClose={close} as="div" className="z-50">
            <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <DialogPanel className="w-[90%] 2xl:w-[60%]  bg-primary  rounded-lg shadow-xl">
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 ">
                        {/* LEFT - Video */}
                        <div className="relative  h-fit md:h-[90vh] flex items-center justify-center bg-black">
                            {postDetails?.Media?.[0]?.media_location && (
                                <video
                                    autoPlay
                                    playsInline
                                    ref={videoRef}
                                    onClick={handleVideoClick}
                                    muted={muted}
                                    src={postDetails.Media[0].media_location}
                                    className="object-contain w-full h-full rounded-lg"
                                />
                            )}

                            {/* Mute/Unmute */}
                            <div className="absolute flex gap-4 bottom-6 right-6">
                                <button
                                    className="bg-black bg-opacity-[22%] backdrop-blur-md rounded-full p-2"
                                    onClick={handleMuteToggle}
                                >
                                    <img
                                        src={muted ? Muted : Unmute}
                                        alt="mute toggle"
                                        width={20}
                                        height={20}
                                    />
                                </button>
                            </div>

                            {/* Play/Pause Overlay */}
                            {!isPlaying && showControls && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <button
                                        onClick={handleVideoClick}
                                        className="p-4 bg-black bg-opacity-50 rounded-full backdrop-blur-md"
                                    >
                                        <img
                                            src={isPlaying ? Pause : Play}
                                            alt="play/pause"
                                            width={20}
                                            height={20}
                                        />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* RIGHT - Info */}
                        <div className="flex flex-col  h-fit md:h-[90vh] bg-primary w-full  border border-bordercolor  rounded-lg">
                            <div className="flex items-center px-4 py-3 shadow-md w-full  relative ">
                                <div className="relative w-[60px] h-[60px] flex justify-center items-center">
                                    <img src={borderImage} alt="Border" />
                                    <img
                                        src={postDetails?.User.profile_pic}
                                        alt="User"
                                        className="absolute inset-0 rounded-full m-auto h-[50px] w-[50px]"
                                    />
                                </div>
                                <div className="px-2">
                                    <h2 className="font-gilroy_semibold text-textcolor font-semibold text-base ">
                                        {postDetails?.User.user_name} 
                                    </h2>
                                    <p className="font-gilroy_md text-sm text-Relldetailscrencolor">
                                        {postDetails?.location}
                                    </p>
                                </div>

                                  <div className="absolute right-4 cursor-pointer" onClick={close}>
                                        <RxCrossCircled className="text-lg text-textcolor" />
                                      </div>
                            </div>

                            <div className="flex items-start gap-3 px-4 py-4">
                                <div className="flex-1 space-y-3">
                                    <p className="text-Relldetailscrencolordate font-poppins text-xs">
                                        {formatDate(postDetails?.createdAt)}
                                    </p>
                                    <p className="text-paginationtextcolor text-sm" >
                                        {postDetails?.social_desc}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-between md:justify-around  mx-1 md:mx-4 border border-bordercolor rounded-lg">
                                {/* Like */}
                                <button
                                    className={`flex flex-1 gap-1 items-center cursor-pointer justify-center py-2 font-poppins text-base transition-all duration-200 ${option === "Like" ? " bggradient  text-white rounded-tl-lg rounded-bl-lg" : "bg-transparent text-textcolor dark:text-gray-500"}`}
                                    onClick={() => setOption("Like")}
                                >
                                    <img src={option === "Like" ? Like1 : Like} className="w-5 h-5" />
                                    Like
                                </button>

                                <div className="self-center h-10 border border-bordercolor" />

                                {/* Comment */}
                                <button
                                    className={`flex flex-1 gap-1 items-center justify-center py-2 cursor-pointer font-poppins text-base transition-all duration-200 ${option === "Comment" ? "bggradient text-white" : "bg-transparent text-textcolor dark:text-gray-500"}`}
                                    onClick={() => setOption("Comment")}
                                >
                                    <img src={option === "Comment" ? Comment : Comment1} className="w-5 h-5" />
                                    Comment
                                </button>

                                <div className="self-center h-10 border border-bordercolor" />

                                {/* Bookmark */}
                                <button
                                    className={`flex flex-1 gap-1 items-center justify-center py-2 cursor-pointer font-poppins text-base transition-all duration-200 ${option === "Bookmark" ? "bggradient text-white rounded-tr-lg rounded-br-lg" : "bg-transparent text-textcolor dark:text-gray-500"}`}
                                    onClick={() => setOption("Bookmark")}
                                >
                                    <img src={option === "Bookmark" ? Bookmark1 : Bookmark} className="w-5 h-5" />
                                    Bookmark
                                </button>
                            </div>
                            {option === "Like" && <LikeDetail />}
                            {option === "Comment" && <CommentDetail />}
                            {option === "Bookmark" && <BookmarksDetail />}
                        </div>


                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}

export default ReelDetail_Modal;
