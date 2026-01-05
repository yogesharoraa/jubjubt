import { Dialog, DialogPanel } from "@headlessui/react";
import { useAppDispatch, useAppSelector } from "../../Hooks/Hooks";
import { hideModal } from "../../Appstore/Slice/ModalSlice";
import { RxCrossCircled } from "react-icons/rx";

function Gift_Image_Modal() {
  const modalData = useAppSelector((state) => state.modals.Gift_Image_Modal);
  const dispatch = useAppDispatch();

  const user_idwithbloackstatus = useAppSelector((state) => state.UniqeUserDetail);

  const close = () => {
    dispatch(hideModal("Gift_Image_Modal"));
  };

  const selectedGiftThumbnail = sessionStorage.getItem("selectedGiftThumbnail");

  return (
    <Dialog open={modalData} onClose={close} as="div" className="z-50">
      <div className="fixed inset-0 z-10 overflow-y-auto bg-black/55 backdrop-blur-sm">
        <div className="flex min-h-full items-center justify-center ">
          <DialogPanel
            className="mx-auto h-fit  w-[90%] rounded-2xl bg-white shadow-lg backdrop-blur-2xl duration-300 ease-out sm:w-[60%] xl:w-[35%] "
          >
            <div className="absolute right-4 top-2 cursor-pointer" onClick={close}>
              <RxCrossCircled className="text-lg text-textcolor" />
            </div>
            {selectedGiftThumbnail ? (
              <div
                className="w-full h-[42rem] rounded-xl bg-center  bg-no-repeat bg-cover"
                style={{
                  backgroundImage: `url(${selectedGiftThumbnail})`,
                }}
              />
            ) : (
              <div className="w-full h-[15rem] flex items-center justify-center text-gray-500">
                No image selected
              </div>
            )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

export default Gift_Image_Modal;
