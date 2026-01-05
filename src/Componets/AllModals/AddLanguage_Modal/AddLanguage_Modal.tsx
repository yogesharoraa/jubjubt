import { Dialog, DialogPanel } from "@headlessui/react";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../Hooks/Hooks";
import { hideModal } from "../../../Appstore/Slice/ModalSlice";
import { setTrue } from "../../../Appstore/Slice/toggleSlice";
import Arrow from "/Images/languageArrow.png";
import Apimethod from "../../../Hooks/Apimethod";
import ModalHeader from "../ModalHeader";

const AddLanguage_Modal = () => {
    const dispatch = useAppDispatch();
    const modalOpen = useAppSelector((state) => state.modals.AddLanguage_Modal);
    const { makeRequest, loading, data } = Apimethod();


    const [formData, setFormData] = useState({
        language: "",
        language_alignment: "",
    });

    const [initialFormData, setInitialFormData] = useState({
        language: "",
        language_alignment: "",
    });

    const [showDropdown, setShowDropdown] = useState(false);

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const closeModal = () => {
        setFormData({ language: "", language_alignment: "", });
        setInitialFormData({ language: "", language_alignment: "", });
        setShowDropdown(false);
        dispatch(hideModal("AddLanguage_Modal"));
    };


    const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';


    const handleSubmit = async () => {


        if (IS_DEMO) {
            toast.error("This action is disabled in the demo version.");
            return;
        }
        const form = new FormData();

        if (formData.language !== initialFormData.language) {
            form.append("language", formData.language);
        }

        if (formData.language_alignment !== initialFormData.language_alignment) {
            form.append("language_alignment", formData.language_alignment);
        }





        try {
            await makeRequest("/Admin/add-language", form, "multipart/form-data", "POST");
            toast.success("Language updated successfully");
            dispatch(setTrue());
            closeModal();
        } catch {
            toast.error("Something went wrong");
        }
    };

    const handleSelectAlignment = (value: string) => {
        handleChange("language_alignment", value);
        setShowDropdown(false);
    };

    const toggleDropdown = () => {
        setShowDropdown((prev) => !prev);
    };

    return (
        <Dialog open={modalOpen} onClose={closeModal} as="div" className="z-50">
            <div className="fixed inset-0 z-10 overflow-y-auto bg-black/55 backdrop-blur-sm">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel className="mx-auto w-[90%]  border border-bordercolor  sm:w-[60%] xl:w-[30%] 2xl:w-[28%] rounded-2xl  bg-primary shadow-lg">

                        <ModalHeader title="Add Language" onClose={closeModal} />


                        <div className="grid gap-4 p-6">
                            {/* Language Name */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-textcolor">Language Name</label>
                                <input
                                    type="text"
                                    value={formData.language}
                                    onChange={(e) => handleChange("language", e.target.value)}
                                    placeholder="Enter Language Name"
                                    className="w-full rounded-lg border border-bordercolor px-4 py-2.5 placeholder:text-sm focus:outline-none focus:ring-1   text-textcolor  placeholder:text-placeholdercolor"
                                />
                            </div>



                            {/* Text Direction */}
                            <div>
                                <label className="text-sm font-medium text-textcolor">Text Direction</label>
                                <div className="relative z-50">
                                    <div
                                        className="w-full h-12 px-4 py-3 pr-10 my-1 text-sm bg-primary border  text-textcolor rounded-lg cursor-pointer border-bordercolor"
                                        onClick={toggleDropdown}
                                    >
                                        {formData.language_alignment || "Select Direction"}
                                    </div>
                                    <img
                                        src={Arrow}
                                        alt="arrow"
                                        className="absolute w-3 h-3 transform -translate-y-1/2 cursor-pointer right-4 top-1/2"
                                        onClick={toggleDropdown}
                                    />
                                    {showDropdown && (
                                        <div className="absolute z-50 w-full mt-1 bg-primary  text-textcolor border border-bordercolor rounded-lg shadow-md">
                                            <div
                                                className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleSelectAlignment("LTR")}
                                            >
                                                Left to Right (LTR)
                                            </div>
                                            <div
                                                className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleSelectAlignment("RTL")}
                                            >
                                                Right to Left (RTL)
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-center">
                                <button
                                    disabled={loading}
                                    onClick={handleSubmit}
                                    className="px-14 py-2 rounded-xl bggradient text-white cursor-pointer disabled:opacity-50"
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
};

export default AddLanguage_Modal;
