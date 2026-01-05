import { Dialog, DialogPanel } from "@headlessui/react";
import toast from "react-hot-toast";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../Hooks/Hooks";
import useApiPost from "../../../Hooks/PostData";
import { hideModal } from "../../../Appstore/Slice/ModalSlice";
import { setTrue } from "../../../Appstore/Slice/toggleSlice";
import { RxCrossCircled } from "react-icons/rx";
import ModalHeader from "../ModalHeader";

function AddGiftCategory() {
    const modalData = useAppSelector((state) => state.modals.AddGiftCategory);
    const dispatch = useAppDispatch();


    const [giftName, setGiftName] = useState("");

    const { postData, loading } = useApiPost();

    const close = () => {
        dispatch(hideModal("AddGiftCategory"));
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

        ;

        try {
            const response = await postData("/admin/gift-category", formData, true); // true = isFormData
            toast.success("Gift Category added successfully");
            close();
            dispatch(setTrue());
        } catch (error: any) {
            toast.error("Something went wrong");
        }
    };

    return (
        <Dialog open={modalData} onClose={close} as="div" className="z-50">
            <div className="fixed inset-0 z-10 overflow-y-auto bg-black/55 backdrop-blur-sm">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel className="mx-auto h-fit w-[90%]   border border-bordercolor rounded-2xl bg-primary shadow-lg backdrop-blur-2xl duration-300 ease-out sm:w-[60%] xl:w-[30%] 2xl:w-[28%]">

                        <ModalHeader title="Add Gift Category" onClose={close} />


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

export default AddGiftCategory;
