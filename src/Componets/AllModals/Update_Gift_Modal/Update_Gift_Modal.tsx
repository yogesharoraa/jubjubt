import { Dialog, DialogPanel } from "@headlessui/react";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../Hooks/Hooks";
import { hideModal } from "../../../Appstore/Slice/ModalSlice";
import { setTrue } from "../../../Appstore/Slice/toggleSlice";
import UploadGift from "../UploadGift";
import GiftCategoryDropdwon from "../GiftCategoryDropdwon";
import Apimethod from "../../../Hooks/Apimethod";
import { setGift } from "../../../Appstore/Slice/giftUpdateSlice";
import { clearCoverImage } from "../../../Appstore/Slice/AddImageSlice";
import ModalHeader from "../ModalHeader";

function Update_Gift_Modal() {
    const modalData = useAppSelector((state) => state.modals.Update_Gift_Modal);
    const dispatch = useAppDispatch();
    const giftId = sessionStorage.getItem("giftId");

    const giftUpdate = useAppSelector((state) => state.giftUpdate);
    const gift_category_id = useAppSelector((state) => state.category.selectedCategory) as { id: string } | null;
    const storesliceImage = useAppSelector((state) => state.AddImageSlice.cover_image);

    const [giftName, setGiftName] = useState("");
    const [giftValue, setGiftValue] = useState("");
    const [initialGift, setInitialGift] = useState<any>(null);

    const { loading, error, data, makeRequest } = Apimethod();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await makeRequest("/admin/gift", { gift_id: giftId }, "application/json", "PUT");
                const gift = res.data.Records[0];
                dispatch(setGift(gift));
                setGiftName(gift.name);
                setGiftValue(String(gift.gift_value));
                setInitialGift(gift); // Store original for comparison
            } catch (err) {
            }
        };

        fetchData();
    }, []);

    const close = () => {
        dispatch(hideModal("Update_Gift_Modal"));
        clearCoverImage();
    };


    const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';


    const handleUpdate = async () => {
        if (IS_DEMO) {
            toast.error("This action is disabled in the demo version.");
            return;
        }

        if (!initialGift) return;

        try {
            const formData = new FormData();
            formData.append("gift_id", giftId || "");

            if (giftName !== initialGift.name) {
                formData.append("name", giftName);
            }

            if (giftValue !== String(initialGift.gift_value)) {
                formData.append("gift_value", giftValue);
            }

            if (
                gift_category_id &&
                gift_category_id.id !== initialGift.gift_category_id
            ) {
                formData.append("gift_category_id", gift_category_id.id);
            }

            // Append only if image was newly selected
            if (Array.isArray(storesliceImage) && storesliceImage[0]) {
                formData.append("files", storesliceImage[0]);
            } else if (storesliceImage) {
                formData.append("files", storesliceImage);
            }

            if ([...formData.keys()].length <= 1) {
                toast("No changes detected");
                return;
            }

            await makeRequest("/admin/gift", formData, "multipart/form-data", "PUT");
            toast.success("Gift updated successfully!");
            dispatch(hideModal("Update_Gift_Modal"));
            dispatch(setTrue());
        } catch (error) {
            toast.error("Failed to update gift.");
        }
    };

    return (
        <Dialog open={modalData} onClose={close} as="div" className="z-50">
            <div className="fixed inset-0 z-10 overflow-y-auto bg-black/55 backdrop-blur-sm">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel className="mx-auto h-fit w-[90%] rounded-2xl bg-primary  border border-bordercolor  shadow-lg backdrop-blur-2xl duration-300 ease-out sm:w-[60%] xl:w-[30%] 2xl:w-[28%]">
                        <ModalHeader title="Update Gift" onClose={close} />


                        <div className="w-full grid gap-3 px-4 pb-4 mt-[2rem]">
                            <UploadGift />

                            <div className="flex flex-col gap-2">
                                <label className="font-poppins text-sm font-medium text-textcolor">
                                    Gift Name<span className="text-[#F21818] pl-[1px]">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={giftName}
                                    onChange={(e) => setGiftName(e.target.value)}
                                    placeholder="Enter Gift Name"
                                    className="w-full rounded-lg border border-bordercolor  bg-primary  text-textcolor px-4 py-2.5 my-1 placeholder:text-sm focus:outline-none focus:ring-1 focus:ring-header"

                                />
                            </div>

                            <GiftCategoryDropdwon />

                            <div className="flex flex-col gap-2">
                                <label className="font-poppins text-sm font-medium text-textcolor">
                                    Coins Values<span className="text-[#F21818] pl-[1px]">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={giftValue}
                                    onChange={(e) => setGiftValue(e.target.value)}
                                    placeholder="Enter Gift Values"
                                    className="w-full rounded-lg border border-bordercolor  bg-primary  text-textcolor px-4 py-2.5 my-1 placeholder:text-sm focus:outline-none focus:ring-1 focus:ring-header"

                                />
                            </div>

                            <div className="flex justify-center items-center">
                                <button
                                    disabled={loading}
                                    onClick={handleUpdate}
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

export default Update_Gift_Modal;
