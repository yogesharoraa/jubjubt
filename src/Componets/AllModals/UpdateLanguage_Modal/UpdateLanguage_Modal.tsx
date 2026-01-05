import { Dialog, DialogPanel } from "@headlessui/react";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../Hooks/Hooks";
import { hideModal } from "../../../Appstore/Slice/ModalSlice";
import { setTrue } from "../../../Appstore/Slice/toggleSlice";
import Arrow from "/Images/languageArrow.png";
import Apimethod from "../../../Hooks/Apimethod";

const UpdateLanguage_Modal = () => {
    const dispatch = useAppDispatch();
    const modalOpen = useAppSelector((state) => state.modals.UpdateLanguage_Modal);
    const { makeRequest, loading, data } = Apimethod();

    const language_id = sessionStorage.getItem("language_id");

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
        setFormData({ language: "", language_alignment: "" });
        setInitialFormData({ language: "", language_alignment: "" });
        setShowDropdown(false);
        dispatch(hideModal("UpdateLanguage_Modal"));
    };

    const handleSubmit = async () => {
        const form = new FormData();

        if (formData.language !== initialFormData.language) {
            form.append("language", formData.language);
        }

        if (formData.language_alignment !== initialFormData.language_alignment) {
            form.append("language_alignment", formData.language_alignment);
        }

        if (language_id) {
            form.append("language_id", language_id.toString());
        }

        if (Array.from(form.entries()).length <= 1) {
            toast("No changes detected");
            return;
        }

        try {
            await makeRequest("/Admin/update-language", form, "multipart/form-data", "PUT");
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

    useEffect(() => {
        if (language_id) {
            makeRequest("/Admin/update-language", { language_id }, "application/json", "PUT");
        }
    }, [language_id]);

    useEffect(() => {
        if (data?.data?.Records?.[0]) {
            const record = data.data.Records[0];
            const initial = {
                language: record.language || "",
                language_alignment: record.language_alignment || "",
            };
            setFormData(initial);
            setInitialFormData(initial);
        }
    }, [data]);

    return (
        <Dialog open={modalOpen} onClose={closeModal} as="div" className="z-50">
            <div className="fixed inset-0 z-10 overflow-y-auto bg-black/55 backdrop-blur-sm">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel className="mx-auto w-[90%] sm:w-[60%] xl:w-[30%] 2xl:w-[28%] rounded-2xl bg-white shadow-lg">
                        <div className="flex items-center justify-center p-4 deleteac">
                            <h3 className="font-poppins text-lg font-medium text-textcolor">Update Language</h3>
                        </div>
                        <div className="grid gap-4 p-6">
                            {/* Language Name */}
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-textcolor">Language Name</label>
                                <input
                                    type="text"
                                    value={formData.language}
                                    placeholder="Enter Language Name"
                                    className="w-full rounded-lg border border-bordercolor cursor-not-allowed px-4 py-2.5 placeholder:text-sm focus:outline-none focus:ring-1 focus:ring-header"
                                />
                            </div>

                            {/* Text Direction */}
                            <div>
                                <label className="text-sm font-medium text-textcolor">Text Direction</label>
                                <div className="relative z-50">
                                    <div
                                        className="w-full h-12 px-4 py-3 pr-10 my-1 text-sm bg-white border rounded-lg cursor-pointer border-gray-300"
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
                                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-md">
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

export default UpdateLanguage_Modal;
