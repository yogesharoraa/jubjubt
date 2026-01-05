import React, { useRef, useState, useEffect } from "react";
import crossicon from "/Images/cross.png";
import uploadicon from "/Images/upload.png";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useAppSelector } from "../../../Hooks/Hooks";
import { updateMusicthumnalImageFile } from "../../../Appstore/Slice/MusicUpdateFileSlice";

function MusicFileUpdate() {
    const giftAudio = useAppSelector((state) => state.music.data.Records[0]?.music_url);
    const dispatch = useDispatch();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [audioFileName, setAudioFileName] = useState<string | null>(null);
    const [audioFileUrl, setAudioFileUrl] = useState<string | null>(null);

    useEffect(() => {
        if (giftAudio && typeof giftAudio === "string" && giftAudio.endsWith(".mp3")) {
            // Extract file name from URL
            const parts = giftAudio.split("/");
            const name = parts[parts.length - 1];
            setAudioFileName(name);
            setAudioFileUrl(giftAudio);
        }
    }, [giftAudio]);

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (files.length > 1) {
            toast.error("You can only upload one file at a time.");
            return;
        }

        const file = files[0];
        const isAudio = file.type.startsWith("audio");

        if (!isAudio) {
            toast.error("Only audio files are allowed.");
            return;
        }

        // Show filename and URL for preview
        setAudioFileName(file.name);
        const previewURL = URL.createObjectURL(file);
        setAudioFileUrl(previewURL);

        // Update the Redux store
        dispatch(updateMusicthumnalImageFile([file]));
    };

    const handleRemoveFile = () => {
        setAudioFileName(null);
        setAudioFileUrl(null);
        dispatch(updateMusicthumnalImageFile([]));
    };

    return (
        <div className="overflow-hidden h-fit  cursor-not-allowed  disabled:not-only:">
            <div>
                <label htmlFor="giftAudio" className="font-poppins text-sm font-medium text-textcolor">
                    Upload Music <span className="text-[#F21818] pl-[1px]">*</span>
                </label>

                <div
                    className="font-poppins mt-2 flex h-[6rem] w-full border border-[#6565657a] cursor-pointer items-center justify-center rounded-lg p-3 borderinputbox"
                >
                    <input
                        type="file"
                        accept="audio/*"
                        ref={fileInputRef}
                        className="hidden"
                    />
                    <div className="flex w-full flex-col items-center justify-center">
                        <img src={uploadicon} alt="upload icon" className="h-6 w-6 object-cover" />
                        <p className="font-poppins text-[#B4B4B4] font-medium text-sm text-center">
                            Drop your music file here or click to browse
                        </p>
                    </div>
                </div>

                {audioFileName && (
                    <div className="w-full h-fit mt-2 pt-4 flex flex-wrap gap-4">
                        <div className="relative flex items-center justify-center">
                            <div className="w-fit overflow-hidden h-[50px] bg-gray-100 text-sm text-gray-700 flex items-center justify-center rounded-md border border-gray-300 px-3">
                                🎵 {audioFileName}
                            </div>
                            <button
                                type="button"
                                className="absolute right-[-0.6rem] top-[-0.6rem]"
                                onClick={handleRemoveFile}
                            >
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#BABABA]">
                                    <img
                                        src={crossicon}
                                        alt="cross icon"
                                        className="h-4 w-4 object-cover"
                                    />
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MusicFileUpdate;
