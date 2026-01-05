import { Dialog, DialogPanel } from "@headlessui/react";
import { useAppDispatch, useAppSelector } from "../../../Hooks/Hooks";
import { hideModal } from "../../../Appstore/Slice/ModalSlice";
import { toast } from "react-hot-toast";
import { setTrue } from "../../../Appstore/Slice/toggleSlice";
import { useState } from "react";
import AddThumnal from "../MusicAdd_Modal/AddThumnal";
import AddMusicInput from "../MusicAdd_Modal/AddMusicInput";
import useApiPost from "../../../Hooks/PostData";
import { RxCrossCircled } from "react-icons/rx";
import ModalHeader from "../ModalHeader";

function UploadMusicModalWithS3() {
    const dispatch = useAppDispatch();
    const modalData = useAppSelector((state) => state.modals.UploadMusicModalWithS3);
    const musicFile = useAppSelector((state) => state.AddMusicSlice.cover_image);
    const musicThumbnail = useAppSelector((state) => state.AddMusicThumnalSlice.cover_image);
    const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';
    const IS_CLIENT = import.meta.env.VITE_IS_CLIENT === 'true';
    const CLIENT_URI = import.meta.env.VITE_CLIENT_URI

    const [musicName, setMusicName] = useState("");
    const [uploading, setUploading] = useState(false);
    const { postData } = useApiPost();

    const close = () => {
        dispatch(hideModal("UploadMusicModalWithS3"));
    };

    const uploadFileToS3 = async (file: File, prefix: string, sessionKeyPrefix: string): Promise<string | null> => {
        const timestamp = new Date().toISOString().replace(/[-:T]/g, "").split(".")[0];
        const fileExtension = file.name.split(".").pop();
        const s3Key = `${prefix}/${timestamp}.${fileExtension}`;
        const formdataS3 = new FormData();

        formdataS3.append("mimetype", file.type);
        formdataS3.append("originalname", s3Key);
        sessionStorage.setItem(`mimetype${sessionKeyPrefix}`, file.type);
        sessionStorage.setItem(`originalname${sessionKeyPrefix}`, s3Key);

        try {
            const response = await postData("/social/upload-media-in-s3", formdataS3, "multipart/form-data");
            const s3Url = response?.data?.url;
            const cleanUrl = s3Url?.split("?")[0];

            if (!s3Url || !cleanUrl) throw new Error("Invalid signed URL response.");

            const uploadRes = await fetch(s3Url, {
                method: "PUT",
                headers: { "Content-Type": file.type || "application/octet-stream" },
                body: file,
            });

            if (!uploadRes.ok) throw new Error(`Upload failed with status ${uploadRes.status}`);

            return cleanUrl;
        } catch (error: any) {
            toast.error(`Upload error: ${error.message}`);
            return null;
        }
    };

    const handleUpload = async () => {
        if (IS_DEMO) {
            toast.error("This action is disabled in the demo version.");
            return;
        }

        if (!musicName || !musicFile || !musicThumbnail) {
            toast.error("Please fill all required fields.");
            return;
        }

        setUploading(true);

        const thumbnailUrl = await uploadFileToS3(musicThumbnail[0], "reelboost/music", "Thumbnail");
        const musicUrl = await uploadFileToS3(musicFile[0], "reelboost/music", "Music");

        if (!thumbnailUrl || !musicUrl) {
            setUploading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append("music_title", musicName);


            const fileKey = thumbnailUrl.split(".com/")[1];

            // Build CloudFront URL
            const cloudfrontUrl = `${CLIENT_URI}${fileKey}`;


            if (IS_CLIENT) {
                formData.append("file_media_1", thumbnailUrl);
            }
            else {
                formData.append("file_media_1", cloudfrontUrl);
            }

            const fileKey1 = musicUrl.split(".com/")[1];

            // Build CloudFront URL
            const cloudfrontUrl1 = `${CLIENT_URI}${fileKey1}`;

            if (IS_CLIENT) {
                formData.append("file_media_2", musicUrl);
            }
            else {
                formData.append("file_media_2", cloudfrontUrl1);
            }
            await postData("/admin/upload-music", formData, "multipart/form-data");
            toast.success("Music uploaded successfully!");
            dispatch(setTrue());
            close();
        } catch (err) {
            toast.error("Something went wrong while uploading.");
        } finally {
            setUploading(false);
        }
    };


    return (
        <Dialog open={modalData} onClose={close} as="div" className="z-50">
            <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <DialogPanel className="w-[90%]  border border-bordercolor  max-w-md sm:max-w-lg relative bg-primary rounded-2xl shadow-xl">

                    <ModalHeader title="Add Music " onClose={close} />


                    <div className="w-full grid gap-3 px-4 pb-4 mt-8">
                        <div className="flex flex-col gap-2">
                            <label className="font-poppins text-sm font-medium text-textcolor">
                                Music Name <span className="text-[#F21818]">*</span>
                            </label>
                            <input
                                type="text"
                                value={musicName}
                                onChange={(e) => setMusicName(e.target.value)}
                                placeholder="Enter Music Name"
                                className="w-full rounded-lg border border-bordercolor  bg-primary  text-textcolor px-4 py-2.5 my-1 placeholder:text-sm focus:outline-none focus:ring-1 focus:ring-header"
                            />
                        </div>

                        {/* File Inputs */}
                        <AddThumnal />
                        <AddMusicInput />

                        {/* Submit Button */}
                        <div className="flex justify-center items-center">
                            <button
                                disabled={uploading}
                                className="px-10 py-2 cursor-pointer rounded-xl bggradient font-poppins text-white disabled:opacity-50"
                                onClick={handleUpload}
                            >
                                {uploading ? "Uploading..." : "Submit"}
                            </button>
                        </div>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}

export default UploadMusicModalWithS3;
