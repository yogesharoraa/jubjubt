import React, { useRef, useState, useEffect } from "react";
import crossicon from "/Images/cross.png";
import uploadicon from "/Images/upload.png";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useAppSelector } from "../../../Hooks/Hooks";
import { updateMusic } from "../../../Appstore/Slice/AddMusicSlice";

function AddMusicInput() {
    const giftImage = useAppSelector((state) => state.AddImageSlice.cover_image?.[0]);
    const dispatch = useDispatch();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [audioFileName, setAudioFileName] = useState<string | null>(null);

    useEffect(() => {
        if (giftImage && giftImage.type?.startsWith("image")) {
            const imageUrl = typeof giftImage === "string" ? giftImage : URL.createObjectURL(giftImage);
            setPreviewImage(imageUrl);
        }
    }, [giftImage]);

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
        const isImage = file.type.startsWith("image");
        const isAudio = file.type.startsWith("audio");

        if (!isImage && !isAudio) {
            toast.error("Only image or audio files are allowed.");
            return;
        }

        if (isImage) {
            const previewURL = URL.createObjectURL(file);
            setPreviewImage(previewURL);
            setAudioFileName(null);
        } else if (isAudio) {
            setAudioFileName(file.name);
            setPreviewImage(null);
        }

        dispatch(updateMusic([file]));
    };

    const handleRemoveFile = () => {
        setPreviewImage(null);
        setAudioFileName(null);
        dispatch(updateMusic([]));
    };

    return (
        <div className="overflow-hidden h-fit">
            <div>
                <label htmlFor="giftImage" className="font-poppins text-sm font-medium text-textcolor">
                    Upload  Music <span className="text-[#F21818] pl-[1px]">*</span>
                </label>

                <div
                    className="font-poppins mt-2 flex h-[6rem] w-full border border-[#6565657a] cursor-pointer items-center justify-center rounded-lg p-3 borderinputbox"
                    onClick={handleFileClick}
                >
                    <input
                        type="file"
                        accept="audio/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <div className="flex w-full flex-col items-center justify-center">
                        <img src={uploadicon} alt="upload icon" className="h-6 w-6 object-cover" />
                        <p className="font-poppins text-[#B4B4B4] font-medium text-sm text-center">
                            Drop your image or music file here or click to browse
                        </p>
                    </div>
                </div>

                {(previewImage || audioFileName) && (
                    <div className="w-full h-fit mt-2 pt-4 flex flex-wrap gap-4">
                        <div className="relative flex items-center justify-center">
                            <div className="relative">
                                {previewImage ? (
                                    <img
                                        src={previewImage}
                                        alt="Uploaded preview"
                                        className="uploadimageborder rounded-md object-cover w-[80px] h-[80px]"
                                    />
                                ) : (
                                    <div className="w-fit  overflow-hidden h-[50px]  bg-primary text-sm text-textcolor flex items-center justify-center rounded-md border border-bordercolor px-3">
                                        🎵 {audioFileName}
                                    </div>
                                )}
                                <button
                                    type="button"
                                    className="absolute right-[-0.2rem] top-0"
                                    onClick={handleRemoveFile}
                                >
                                    <div className="flex h-6   cursor-pointer w-6 items-center justify-center rounded-full bg-[#BABABA]">
                                        <img
                                            src={crossicon}
                                            alt="cross icon"
                                            className="h-4 w-4 object-cover"
                                        />
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AddMusicInput;
