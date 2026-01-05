import { Dialog, DialogPanel } from "@headlessui/react";
import { useAppDispatch, useAppSelector } from "../../../Hooks/Hooks";
import { hideModal } from "../../../Appstore/Slice/ModalSlice";
import useApiPost from "../../../Hooks/PostData";
import { toast } from "react-hot-toast";
import { setTrue } from "../../../Appstore/Slice/toggleSlice";
import { useEffect, useState } from "react";
import ModalHeader from "../ModalHeader";

function AddNotificationModal() {
    const modalData = useAppSelector((state) => state.modals.AddNotificationModal);
    const dispatch = useAppDispatch();

    const [planName, setPlanName] = useState("");
    const [coins, setCoins] = useState("");

    const { data, loading, error, postData } = useApiPost();

    const close = () => {
        dispatch(hideModal("AddNotificationModal"));
    };

    const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';



    const handleSubmit = async () => {
        if (IS_DEMO) {
            toast.error("This action is disabled in the demo version.");
            return;
        }


        if (!planName || !coins) {
            toast.error("Please fill all required fields.");
            return;
        }

        const formData = new FormData();
        formData.append("title", planName);
        formData.append("message", coins);
        formData.append("body", "")

        try {
            const response = await postData("/admin/send-broadcast-notification", formData, "multipart/form-data");

            if (response?.message === "hashTags Already Exist") {
                toast.error("Plan already exists.");
                return;
            }

            if (response?.status) {
                toast.success(response.message || "Notification sent successfully");
                close();
                dispatch(setTrue());
            } else {
                toast.error("Something went wrong while uploading.");
            }
        } catch (err) {
            toast.error("Something went wrong while uploading.");
        }
    };

    const inputClass =
        "w-full rounded-lg border border-bordercolor bg-primary text-textcolor px-4 py-2.5 my-1 placeholder:text-sm focus:outline-none focus:ring-1 focus:ring-header";

    return (
        <Dialog open={modalData} onClose={close} as="div" className="z-50">
            <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <DialogPanel className="w-[90%] max-w-md sm:max-w-lg bg-primary border border-bordercolor rounded-2xl shadow-xl">
                    <ModalHeader title="Push Notification" onClose={close} />

                    <div className="w-full grid gap-3 px-4 pb-4 mt-8">
                        <div className="flex flex-col gap-2">
                            <label className="font-poppins text-sm font-medium text-textcolor">
                                Title  <span className="text-[#F21818]">*</span>
                            </label>
                            <input
                                type="text"
                                value={planName}
                                onChange={(e) => setPlanName(e.target.value)}
                                placeholder="Enter Title Name"
                                className={inputClass}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="font-poppins text-sm font-medium text-textcolor">
                                Message <span className="text-[#F21818]">*</span>
                            </label>
                            <textarea
                                value={coins}
                                onChange={(e) => setCoins(e.target.value)}
                                placeholder="Enter your message..."
                                rows={4} // You can adjust this
                                className={inputClass + " resize-none"} // Prevents manual resizing (optional)
                            />
                        </div>




                        <div className="flex justify-center items-center">
                            <button
                                disabled={loading}
                                onClick={handleSubmit}
                                className="px-10 py-2 rounded-xl bggradient cursor-pointer font-poppins text-white disabled:opacity-50"
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

export default AddNotificationModal;
