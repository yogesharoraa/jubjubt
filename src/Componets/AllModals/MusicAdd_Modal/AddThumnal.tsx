import React, { useRef, useState, useEffect } from "react";
import crossicon from "/Images/cross.png";
import uploadicon from "/Images/upload.png";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useAppSelector } from "../../../Hooks/Hooks";
import { updateMusicthumnalImage } from "../../../Appstore/Slice/AddMusicThumnalSlice";

function AddThumnal() {
    const giftImage = useAppSelector((state) => state.AddImageSlice.cover_image?.[0]);
    const dispatch = useDispatch();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        if (giftImage) {
            setPreviewImage(giftImage); // Show backend image when editing
        }
    }, [giftImage]);

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (!files || files.length === 0) return;

        if (files.length > 1) {
            toast.error("You can only upload one image at a time.");
            return;
        }

        const file = files[0];
        if (!file.type.startsWith("image")) {
            toast.error("Only image files are allowed.");
            return;
        }

        const previewURL = URL.createObjectURL(file);
        setPreviewImage(previewURL);
        dispatch(updateMusicthumnalImage([file]));
    };

    const handleRemoveFile = () => {
        setPreviewImage(null);
        dispatch(updateMusicthumnalImage([]));
    };

    return (
        <div className="overflow-hidden h-fit">
            <div>
                <label
                    htmlFor="giftImage"
                    className="font-poppins text-sm font-medium text-textcolor"
                >
                    Music Thumbnail
                    <span className="text-[#F21818] pl-[1px]">*</span>
                </label>

                <div
                    className="font-poppins mt-2 flex h-[6rem] w-full border border-[#6565657a] cursor-pointer items-center justify-center rounded-lg p-3 borderinputbox"
                    onClick={handleFileClick}
                >
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <div className="flex w-full flex-col items-center justify-center">
                        <img src={uploadicon} alt="upload icon" className="h-6 w-6 object-cover" />
                        <p className="font-poppins text-[#B4B4B4] font-medium text-sm text-center">
                            Drop your image here or click to browse
                        </p>
                    </div>
                </div>

                {previewImage && (
                    <div className="w-full h-fit mt-2 pt-4 flex flex-wrap gap-4">
                        <div className="relative flex items-center justify-center">
                            <div className="relative">
                                <img
                                    src={previewImage}
                                    alt="Uploaded preview"
                                    className="uploadimageborder rounded-md object-cover w-[80px] h-[80px]"
                                />
                                <button
                                    type="button"
                                    className="absolute right-[-0.2rem] top-0"
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
                    </div>
                )}
            </div>
        </div>
    );
}

export default AddThumnal;
