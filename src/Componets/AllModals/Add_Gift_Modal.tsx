import { Dialog, DialogPanel } from "@headlessui/react";
import { useAppDispatch, useAppSelector } from "../../Hooks/Hooks";
import { hideModal } from "../../Appstore/Slice/ModalSlice";
import useApiPost from "../../Hooks/PostData";
import toast from "react-hot-toast";
import { useState } from "react";
import { setTrue } from "../../Appstore/Slice/toggleSlice";
import { clearCoverImage } from "../../Appstore/Slice/AddImageSlice";
import { clearSelectedCategory } from "../../Appstore/Slice/CategorySelectedIDandValues";
import ModalHeader from "./ModalHeader";
import GiftAddImage from "./GiftAddImage";
import GiftCategoryDropDwon from "./Add_Gift_ModalUploadS3/GiftCategoryDropDwon";

function Add_Gift_Modal() {
  const modalData = useAppSelector((state) => state.modals.Add_Gift_Modal);
  const dispatch = useAppDispatch();
  const [giftName, setGiftName] = useState("");
  const [giftValue, setGiftValue] = useState("");



  const selectedCategories = useAppSelector(
    (state) => state.AddGiftCategorySlice.selectedCategory
  );


  const { postData, loading } = useApiPost();

  const close = () => {
    dispatch(hideModal("Add_Gift_Modal"));
  };



  const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';


  const coverImage = useAppSelector((state) => state.AddImageSliceGift.cover_image);




  const handleSubmit = async () => {

    if (IS_DEMO) {
      toast.error("This action is disabled in the demo version.");
      return;
    }

    if (!giftName || !giftValue || !selectedCategories || !coverImage) {
      toast.error("Please fill all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("name", giftName);
    formData.append("gift_value", giftValue);

    if (selectedCategories?.id) {
      formData.append("gift_category_id", selectedCategories.id.toString());
    }

    formData.append("pictureType", "gift")

    // Append file(s) properly
    if (Array.isArray(coverImage)) {
      formData.append("files", coverImage); // or use a loop to send multiple
    } else {
      formData.append("files", coverImage);
    }

    // Debug: check file object before sending

    try {
      const response = await postData("/admin/gift", formData, true); // true = isFormData
      toast.success("Gift added successfully");
      close();
      dispatch(setTrue());
      clearCoverImage()
      clearSelectedCategory()
    } catch (error: any) {
      toast.error("Something went wrong");
    }
  };

  return (
    <Dialog open={modalData} onClose={close} as="div" className="z-50">
      <div className="fixed inset-0 z-10 overflow-y-auto bg-black/55 backdrop-blur-sm  ">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel className="mx-auto h-fit w-[90%] rounded-2xl border border-bordercolor   bg-primary shadow-lg backdrop-blur-2xl duration-300 ease-out sm:w-[60%] xl:w-[30%] 2xl:w-[28%]">




            <ModalHeader title=" Add Gift " onClose={close} />


            <div className="w-full grid gap-3 px-4 pb-4 mt-[2rem]">
              {/* Upload Gift Image */}
              <GiftAddImage />

              {/* Gift Name */}
              <div className="flex flex-col gap-2">
                <label className="font-poppins text-sm font-medium text-textcolor   ">
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

              {/* Gift Category Dropdown */}
              <GiftCategoryDropDwon />

              {/* Gift Value */}
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

export default Add_Gift_Modal;
