import { Dialog, DialogPanel } from "@headlessui/react";
import { useAppDispatch, useAppSelector } from "../../../Hooks/Hooks";
import { hideModal } from "../../../Appstore/Slice/ModalSlice";
import useApiPost from "../../../Hooks/PostData";
import { toast } from "react-hot-toast";
import { setTrue } from "../../../Appstore/Slice/toggleSlice";
import AddThumnal from "./AddThumnal";
import AddMusicInput from "./AddMusicInput";
import { useState } from "react";
import { RxCrossCircled } from "react-icons/rx";
import ModalHeader from "../ModalHeader";

function MusicAdd_Modal() {
    const modalData = useAppSelector((state) => state.modals.MusicAdd_Modal);
    const dispatch = useAppDispatch();
    const [musicName, setMusicName] = useState("");







    const { data, loading, error, postData } = useApiPost();

    const close = () => {
        dispatch(hideModal("MusicAdd_Modal"));
    };


    const musicFile = useAppSelector((state) => state.AddMusicSlice.cover_image);
    const musicThumbnail = useAppSelector((state) => state.AddMusicThumnalSlice.cover_image);


    const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';




    const handleUploadMusic = async () => {

        if (IS_DEMO) {
            toast.error("This action is disabled in the demo version.");
            return;
        }

        if (!musicName || !musicFile || !musicThumbnail) {
            toast.error("Please fill all required fields.");
            return;
        }

        const formData = new FormData();
        formData.append("music_title", musicName);
        formData.append("pictureType", "music");
        if (Array.isArray(musicThumbnail)) {
            formData.append("files", musicThumbnail[0]); // or use a loop to send multiple
        } else {
            formData.append("files", musicThumbnail);
        }

        if (Array.isArray(musicFile)) {
            formData.append("files", musicFile[0]); // or use a loop to send multiple
        } else {
            formData.append("files", musicFile);
        }

        try {
            const response = await postData("/admin/upload-music", formData, "multipart/form-data");
            toast.success("Music uploaded successfully!");
            close();
            dispatch(setTrue());
        } catch (err) {
            toast.error("Something went wrong while uploading.");
        }
    };


    return (
        <Dialog open={modalData} onClose={close} as="div" className="z-50">
            <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <DialogPanel className="w-[90%]  border border-bordercolor    max-w-md sm:max-w-lg bg-primary rounded-2xl shadow-xl">


                    <ModalHeader title="Add Music " onClose={close} />


                    <div className="w-full grid gap-3 px-4 pb-4 mt-8">
                        {/* Music Name Input */}
                        <div className="flex flex-col gap-2">
                            <label className="font-poppins text-sm font-medium text-textcolor">
                                Music Name  <span className="text-[#F21818]">*</span>
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
                                disabled={loading}
                                className="px-10 py-2 cursor-pointer rounded-xl bggradient font-poppins text-white disabled:opacity-50"
                                onClick={handleUploadMusic}
                            >
                                {loading ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}

export default MusicAdd_Modal;
