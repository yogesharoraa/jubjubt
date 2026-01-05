import { Dialog, DialogPanel } from "@headlessui/react";
import { useAppDispatch, useAppSelector } from "../../../Hooks/Hooks";
import { hideModal } from "../../../Appstore/Slice/ModalSlice";
import useApiPost from "../../../Hooks/PostData";
import { toast } from "react-hot-toast";
import { setTrue } from "../../../Appstore/Slice/toggleSlice";
import { useEffect, useState } from "react";
import { setMusicData } from "../../../Appstore/Slice/musicSlice";
import UpdateMuscithumnal from "./UpdateMuscithumnal";
import MusicFileUpdate from "./MusicFileUpdate";
import ModalHeader from "../ModalHeader";

function MusicUpdate_Modal() {
    const modalOpen = useAppSelector((state) => state.modals.MusicUpdate_Modal);
    const dispatch = useAppDispatch();
    const [musicId] = useState(() => sessionStorage.getItem("Music_Id_Update"));
    const [musicName, setMusicName] = useState("");

    const { data, loading, error, postData } = useApiPost();
    const musicData = useAppSelector((state) => state.music.data);
    const MusicTitle = musicData?.Records?.[0]?.music_title;

    const musicFile = useAppSelector((state) => state.MusicUpdateFileSlice.cover_image);
    const musicThumbnail = useAppSelector((state) => state.MusicUpdateThumnalSlice.cover_image);

    const closeModal = () => dispatch(hideModal("MusicUpdate_Modal"));

    // Fetch music details on mount
    useEffect(() => {
        if (!musicId) return;

        const formdata = new FormData();
        formdata.append("music_id", musicId);

        postData("/admin/update-music", formdata)
            .then((res) => {
                if (res?.status) {
                    dispatch(setMusicData(res));
                } else {
                    toast.error("Failed to fetch music data.");
                }
            })
            .catch((err) => {
                toast.error("Something went wrong while fetching music data.");
            });
    }, [musicId]);

    // Sync music name from Redux into local state
    useEffect(() => {
        if (MusicTitle) {
            setMusicName(MusicTitle);
        }
    }, [MusicTitle]);

        const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';


    const handleUploadMusic = async () => {

         if (IS_DEMO) {
            toast.error("This action is disabled in the demo version.");
            return;
        }
        const original = musicData?.Records?.[0];
        if (!original) {
            toast.error("Music data not available.");
            return;
        }

        const formData = new FormData();
        formData.append("music_id", musicId ?? "");

        let hasChanges = false;

        // Check if music name changed
        if (musicName && musicName !== original.music_title) {
            formData.append("music_title", musicName);
            hasChanges = true;
        }

        // Check if thumbnail changed
        if (musicThumbnail && typeof musicThumbnail !== "string") {
            if (Array.isArray(musicThumbnail)) {
                formData.append("files", musicThumbnail[0]);
            } else {
                formData.append("files", musicThumbnail);
            }
            hasChanges = true;
        }

        // Check if music file changed
        if (musicFile && typeof musicFile !== "string") {
            if (Array.isArray(musicFile)) {
                formData.append("files", musicFile[0]);
            } else {
                formData.append("files", musicFile);
            }
            hasChanges = true;
        }

        if (!hasChanges) {
            toast("No changes to update.");
            return;
        }

        try {
            const res = await postData("/admin/update-music", formData, "multipart/form-data");
            if (res?.status) {
                toast.success("Music updated successfully!");
                closeModal();
                dispatch(setTrue());
            } else {
                toast.error("Update failed.");
            }
        } catch (err) {
            toast.error("Something went wrong while updating.");
        }
    };

    return (
        <Dialog open={modalOpen} onClose={closeModal} as="div" className="z-50">
            <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <DialogPanel className="w-[90%] max-w-md sm:max-w-lg bg-primary rounded-2xl shadow-xl">


                    <ModalHeader title="Update Music " onClose={closeModal} />


                    <div className="w-full grid gap-3 px-4 pb-4 mt-8">
                        {/* Music Name Input */}
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

                        {/* File Upload Components */}
                        <UpdateMuscithumnal />
                        {/* <MusicFileUpdate /> */}

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

export default MusicUpdate_Modal;
