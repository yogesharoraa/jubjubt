"use client";
import { hideModal, showModal } from "@/app/store/Slice/ModalsSlice";
import { useAppDispatch, useAppSelector } from "@/app/utils/hooks";
import {
  clearSelectedMusic,
  setTrimmedVideo,
} from "@/app/store/Slice/MediaSlice";
import { DialogContent } from "@mui/material";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { IoMdClose } from "react-icons/io";
import useFFmpegVideo from "@/app/hooks/useFFmpegVideo";
import VideoTrimmer from "./VideoTrimmer";
import { toast } from "react-toastify";
import CustomDialog from "@/app/components/CustomDialog";

function TrimVideo() {
  const open = useAppSelector((state) => state.modals.TrimVideo);
  const dispatch = useAppDispatch();
  const selectedVideos = useAppSelector((state) => state.media.selectedVideos);
  const selectedMusic = useAppSelector((state) => state.media.selectedMusic);
  
  const videoFile = selectedVideos;
  const videoRefTop = useRef<HTMLVideoElement | null>(null);

  // --- Added: selected duration mode (30 or 60 sec) ---
  const [selectedDuration, setSelectedDuration] = useState(30);

  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(30);
  const [isMuted, setIsMuted] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // ✅ only from hook
  const { ready, processVideo } = useFFmpegVideo();

  // preload video + detect audio
  useEffect(() => {
    if (!videoFile) return;
    const url = URL.createObjectURL(videoFile);
    setVideoUrl(url);

    const tempVideo = document.createElement("video");
    tempVideo.src = url;
    tempVideo.onloadedmetadata = () => {
      setDuration(tempVideo.duration);

      // --- Updated: Set end based on selected duration and video length ---
      const initialEnd = Math.min(selectedDuration, tempVideo.duration);
      setEnd(initialEnd);
      setStart(0);

      if (videoRefTop.current) {
        videoRefTop.current.currentTime = 0;
        videoRefTop.current.play().catch(() => {});
      }
    };

    const detectAudio = async () => {
      const audioCtx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          await audioCtx.decodeAudioData(e.target!.result as ArrayBuffer);
          setHasAudio(true);
        } catch {
          setHasAudio(false);
        }
      };
      reader.readAsArrayBuffer(videoFile);
    };
    detectAudio();

    return () => {
      URL.revokeObjectURL(url);
      setVideoUrl(null);
    };
  }, [videoFile, selectedDuration]);

  useEffect(() => {
    if (videoRefTop.current && !isDragging) {
      requestAnimationFrame(() => {
        if (videoRefTop.current) {
          videoRefTop.current.currentTime = start;
          videoRefTop.current.play().catch(() => {});
        }
      });
    }
  }, [start, isDragging]);

  // --- Handle trim processing ---
  const handleTrim = async () => {
    if (!videoFile || !ready) return;
    const maxAllowed = Math.min(selectedDuration, duration);
    //if (maxAllowed > 32) {
     // toast.error("Upload max 30 seconds video only");
     // return;
    //}
    setLoading(true);
    try {
      const file = await processVideo({
        videoFile,
        start,
        end,
        mute: isMuted,
        musicUrl: selectedMusic?.music_url,
      });
      if (!file) return;

      const url = URL.createObjectURL(file);
      dispatch(setTrimmedVideo({ url, file }));
      dispatch(hideModal("TrimVideo"));
      dispatch(showModal("UploadReel"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Handle Duration Button Change ---
  const handleDurationSelect = (sec: number) => {
    setSelectedDuration(sec);
    if (!videoFile) return;
    const maxSelectable = Math.min(sec, duration);
    setStart(0);
    setEnd(maxSelectable);
  };

  return (
    <CustomDialog
      open={open}
      onClose={() => dispatch(hideModal("TrimVideo"))}
      title="Trim Video"
      fullWidth
      width="500px"
    >
      <DialogContent sx={{ p: 0 }} className="overflow-hidden rounded-lg h-[500px] sm:h-auto">
        <div className="flex flex-col h-full bg-primary">
          {/* --- Duration Selection Buttons --- */}
          <div className="flex gap-4 px-6 py-4">
            <button
              className={`py-2 px-4 rounded-lg font-medium ${
                selectedDuration === 30 ? "bg-main-green text-primary" : "bg-dark text-primary"
              }`}
              onClick={() => handleDurationSelect(30)}
            >
              30 sec
            </button>
            <button
              className={`py-2 px-4 rounded-lg font-medium ${
                selectedDuration === 60 ? "bg-main-green text-primary" : "bg-dark text-primary"
              }`}
              onClick={() => handleDurationSelect(60)}
            >
              60 sec
            </button>
          </div>

          {/* Video Preview */}
          {videoFile && videoUrl && (
            <div className="relative w-full sm:h-[650px] h-[420px] flex items-center justify-center sm:px-10 px-6 py-6 ">
              <video
                ref={videoRefTop}
                src={videoUrl}
                className="w-full h-full object-cover rounded-lg"
                autoPlay={!isDragging}
                loop
                muted={isMuted || !!selectedMusic}
              />

              <div className="flex flex-col absolute top-10 right-12 gap-3">
                {hasAudio && !selectedMusic && (
                  <button
                    className="bg-dark/50 text-primary p-2 rounded-full cursor-pointer"
                    onClick={() => setIsMuted((prev) => !prev)}
                  >
                    <Image
                      src={isMuted ? "/home/muted.png" : "/home/unmuted.png"}
                      alt={isMuted ? "muted" : "unmuted"}
                      height={18}
                      width={18}
                    />
                  </button>
                )}

                <button
                  className="bg-dark/50 text-primary p-2 rounded-full cursor-pointer"
                  onClick={() => dispatch(showModal("MusicList"))}
                >
                  <Image
                    src="/ReelBoost/AddMusic.png"
                    alt="addMusic"
                    width={18}
                    height={18}
                  />
                </button>
              </div>

              {selectedMusic && (
                <div className="absolute bottom-28 flex items-center gap-3 p-2 rounded-lg">
                  <div className="relative">
                    <Image
                      src={selectedMusic.music_thumbnail}
                      height={50}
                      width={50}
                      alt="music"
                      className="rounded-lg"
                    />
                    <button
                      className="absolute -top-2 -right-2 bg-dark/70 text-primary rounded-full p-1"
                      onClick={() => dispatch(clearSelectedMusic())}
                    >
                      <IoMdClose size={14} />
                    </button>
                  </div>
                  <p className="text-primary text-xs">{selectedMusic.music_title}</p>
                  <audio src={selectedMusic.music_url} autoPlay loop />
                </div>
              )}

              {/* Video Trimmer */}
              <div className="absolute bottom-2 px-4 w-full">
                <VideoTrimmer
                  duration={duration}
                  start={start}
                  end={end}
                  fixedLength={Math.min(selectedDuration, duration)} // --- Added fixedLength prop ---
                  onStartChange={(newStart) => {
                    // --- Keep trimmer length constant ---
                    const newEnd = Math.min(newStart + Math.min(selectedDuration, duration), duration);
                    setStart(newStart);
                    setEnd(newEnd);
                    setIsDragging(true);
                  }}
                  onEndChange={(newEnd) => {
                    const newStart = Math.max(newEnd - Math.min(selectedDuration, duration), 0);
                    setStart(newStart);
                    setEnd(newEnd);
                    setIsDragging(true);
                  }}
                  onDragEnd={() => setIsDragging(false)}
                  videoFile={videoFile}
                />
              </div>
            </div>
          )}

          <div className="px-10 pb-4">
            <button
              className="bg-main-green text-primary w-full py-3 rounded-xl text-sm font-medium"
              onClick={handleTrim}
              disabled={loading}
            >
              {loading ? "Processing..." : "Next"}
            </button>
          </div>
        </div>
      </DialogContent>
    </CustomDialog>
  );
}

export default TrimVideo;
