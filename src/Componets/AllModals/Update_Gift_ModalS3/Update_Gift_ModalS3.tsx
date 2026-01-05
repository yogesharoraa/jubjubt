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
import { clearSelectedCategory } from "../../../Appstore/Slice/CategorySelectedIDandValues";
import useApiPost from "../../../Hooks/PostData";

function Update_Gift_ModalS3() {
    const modalData = useAppSelector((state) => state.modals.Update_Gift_ModalS3);
    const dispatch = useAppDispatch();
    const giftId = sessionStorage.getItem("giftId");

    const { postData } = useApiPost();

    const [uploading, setUploading] = useState(false);
    const IS_CLIENT = import.meta.env.VITE_IS_CLIENT === 'true';
    const CLIENT_URI = import.meta.env.VITE_CLIENT_URI;
    const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';

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
                setInitialGift(gift);
            } catch (err) {
                toast.error("Failed to load gift data");
            }
        };

        if (giftId) fetchData();
    }, [giftId]);

    const close = () => {
        dispatch(clearCoverImage());
        dispatch(clearSelectedCategory());
        dispatch(hideModal("Update_Gift_ModalS3"));
    };

    const uploadFileToS3 = async (file: File, prefix: string, sessionKeyPrefix: string): Promise<string | null> => {
    try {
        const timestamp = new Date().toISOString().replace(/[-:T]/g, "").split(".")[0];
        const fileExtension = file.name.split(".").pop();
        const s3Key = `${prefix}/${timestamp}.${fileExtension}`;

        const formdataS3 = new FormData();
        formdataS3.append("mimetype", file.type);
        formdataS3.append("originalname", s3Key);

        sessionStorage.setItem(`mimetype${sessionKeyPrefix}`, file.type);
        sessionStorage.setItem(`originalname${sessionKeyPrefix}`, s3Key);

        const response = await postData("/social/upload-media-in-s3", formdataS3, "multipart/form-data");
        
        const s3Url = response?.data?.url;

        if (!s3Url || typeof s3Url !== "string") {
            throw new Error("S3 signed URL is missing or invalid.");
        }

        const cleanUrl = s3Url.split("?")[0];

        const uploadRes = await fetch(s3Url, {
            method: "PUT",
            headers: { "Content-Type": file.type || "application/octet-stream" },
            body: file,
        });

        if (!uploadRes.ok) throw new Error(`Upload failed with status ${uploadRes.status}`);

        return cleanUrl;
    } catch (error: any) {
        toast.error(`S3 Upload Error: ${error.message}`);
        return null;
    }
};


    const handleUpdate = async () => {
        if (IS_DEMO) {
            toast.error("This action is disabled in the demo version.");
            return;
        }

        if (!giftName || !giftValue) {
            toast.error("Please provide all required fields.");
            return;
        }

        if (isNaN(Number(giftValue))) {
            toast.error("Gift value must be a valid number.");
            return;
        }

        if (!initialGift) {
            toast.error("Initial gift data not loaded.");
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("gift_id", giftId || "");

            let hasChanges = false;

            if (giftName !== initialGift.name) {
                formData.append("name", giftName);
                hasChanges = true;
            }

            if (giftValue !== String(initialGift.gift_value)) {
                formData.append("gift_value", giftValue);
                hasChanges = true;
            }

            if (gift_category_id && gift_category_id.id !== initialGift.gift_category_id) {
                formData.append("gift_category_id", gift_category_id.id);
                hasChanges = true;
            }

            if (storesliceImage) {
                const thumbnailUrl = await uploadFileToS3(storesliceImage[0], "reelboost/gift", "gift");
                if (!thumbnailUrl) {
                    setUploading(false);
                    return;
                }

                const fileKey = thumbnailUrl.split(".com/")[1];
                const finalUrl = IS_CLIENT ? thumbnailUrl : `${CLIENT_URI}${fileKey}`;
                formData.append("file_media_1", finalUrl);
                hasChanges = true;
            }

            if (!hasChanges) {
                toast("No changes detected");
                setUploading(false);
                return;
            }

            await makeRequest("/admin/gift", formData, "multipart/form-data", "PUT");
            toast.success("Gift updated successfully!");
            dispatch(hideModal("Update_Gift_ModalS3"));
            dispatch(setTrue());
        } catch (error) {
            toast.error("Failed to update gift.");
        } finally {
            setUploading(false);
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
                                    disabled={uploading}
                                    onClick={handleUpdate}
                                    className="px-10 py-2 cursor-pointer rounded-xl bggradient font-poppins text-white disabled:opacity-50"
                                > {uploading ? "Updateing..." : "Update"}
                                </button>
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}

export default Update_Gift_ModalS3;
