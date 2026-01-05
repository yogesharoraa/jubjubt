import { Dialog, DialogPanel } from "@headlessui/react";
import toast from "react-hot-toast";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../Hooks/Hooks";
import useApiPost from "../../../Hooks/PostData";
import { hideModal } from "../../../Appstore/Slice/ModalSlice";
import { setTrue } from "../../../Appstore/Slice/toggleSlice";
import { RxCrossCircled } from "react-icons/rx";
import ModalHeader from "../ModalHeader";
import Apimethod from "../../../Hooks/Apimethod";

function AddGiftCategoryUpdateModal() {
    const modalData = useAppSelector((state) => state.modals.AddGiftCategoryUpdateModal);
    const dispatch = useAppDispatch();


    const gift_category_id = sessionStorage.getItem("gift_category_id")
    const name = sessionStorage.getItem("giftcname")



    const [giftName, setGiftName] = useState(name);


    const { makeRequest, loading } = Apimethod()


    const close = () => {
        dispatch(hideModal("AddGiftCategoryUpdateModal"));

    };

    const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';


    const handleSubmit = async () => {
        if (IS_DEMO) {
            toast.error("This action is disabled in the demo version.");
            return;
        }

        if (!giftName) {
            toast.error("Please fill all required fields");
            return;
        }

        const formData = new FormData();
        formData.append("name", giftName);
        formData.append("gift_category_id", gift_category_id?.toString() || "")
        try {
            const response = await makeRequest("/admin/gift-category", formData, "multipart/form-data",
                "PUT");
            toast.success("Gift Category added successfully");
            close();
            dispatch(setTrue());
            sessionStorage.removeItem("gift_category_id")
            sessionStorage.removeItem("giftcname")
        } catch (error: any) {
            toast.error("Something went wrong");
        }
    };

    return (
        <Dialog open={modalData} onClose={close} as="div" className="z-50">
            <div className="fixed inset-0 z-10 overflow-y-auto bg-black/55 backdrop-blur-sm">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel className="mx-auto h-fit w-[90%]   border border-bordercolor rounded-2xl bg-primary shadow-lg backdrop-blur-2xl duration-300 ease-out sm:w-[60%] xl:w-[30%] 2xl:w-[28%]">

                        <ModalHeader title="Update Gift Category" onClose={close} />


                        <div className="w-full grid gap-3 px-4 pb-4 mt-[2rem]">

                            {/* Gift Name */}
                            <div className="flex flex-col gap-2">
                                <label className="font-poppins text-sm font-medium text-textcolor">
                                    Gift Category Name<span className="text-[#F21818] pl-[1px]">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={giftName}
                                    onChange={(e) => setGiftName(e.target.value)}
                                    placeholder="Enter Gift Category Name"
                                    className="w-full rounded-lg border border-bordercolor  text-textcolor bg-primary px-4 py-2.5 my-1  placeholder:text-placeholdercolor placeholder:text-sm focus:outline-none focus:ring-1 focus:ring-header"
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-center items-center">
                                <button
                                    disabled={loading}
                                    onClick={handleSubmit}
                                    className="px-10 py-2 cursor-pointer rounded-xl bggradient font-poppins text-white disabled:opacity-50"
                                >
                                    {loading ? "Submitting..." : "Submit"}
                                </button>
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}

export default AddGiftCategoryUpdateModal;
