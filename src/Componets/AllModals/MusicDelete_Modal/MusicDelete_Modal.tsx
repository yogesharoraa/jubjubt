import { Dialog, DialogPanel } from "@headlessui/react";
import { useAppDispatch, useAppSelector } from "../../../Hooks/Hooks";
import { hideModal } from "../../../Appstore/Slice/ModalSlice";
import useApiPost from "../../../Hooks/PostData";
import { toast } from "react-hot-toast";
import { setTrue } from "../../../Appstore/Slice/toggleSlice";

function MusicDelete_Modal() {
    const modalData = useAppSelector((state) => state.modals.MusicDelete_Modal);
    const dispatch = useAppDispatch();

    const close = () => {
        dispatch(hideModal("MusicDelete_Modal"));
    };


    const music_id = sessionStorage.getItem("Music_Id_Delete")

    const { data, loading, error, postData } = useApiPost();



    const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';



    const handleUserDeactivate = async () => {

        if (IS_DEMO) {
            toast.error("This action is disabled in the demo version.");
            return;
        }
        const formData = new FormData();
        formData.append("music_id", music_id || "");
        formData.append("admin_status", "false");

        try {
            const response = await postData("/admin/update-music", formData, "multipart/form-data");
            toast.success(" Deleted successfully");
            close()
            dispatch(setTrue())
        } catch (error) {
        }
    };



    return (
        <Dialog open={modalData} onClose={close} as="div" className="z-50">
            <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <DialogPanel className="w-[90%] max-w-md sm:max-w-lg  bg-white dark:bg-darkBg rounded-2xl p-6 shadow-xl">


                    {/* Heading */}
                    <h2 className="text-center text-xl font-normal text-textcolor  font-poppins mb-6">
                        Are you sure you want to delete this music?
                    </h2>


                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={close}
                            className="w-full sm:w-auto px-20 py-2 cursor-pointer  border border-header rounded-lg text-[#3A3333]  font-medium transition-colors hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            className="w-full sm:w-auto px-20 py-2 cursor-pointer rounded-lg text-white bggradient font-medium transition-colors hover:opacity-90"
                            onClick={handleUserDeactivate}
                            disabled={loading}
                        >
                            Delete
                        </button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}

export default MusicDelete_Modal;
// 