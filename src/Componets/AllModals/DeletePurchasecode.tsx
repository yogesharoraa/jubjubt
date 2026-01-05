import { Dialog, DialogPanel } from "@headlessui/react";
import { useAppDispatch, useAppSelector } from "../../Hooks/Hooks";
import { hideModal } from "../../Appstore/Slice/ModalSlice";
import Logout from "/Images/deleteicon.png";
import Cookies from "js-cookie";
import useApiPost from "../../Hooks/PostData";

function DeletePurchasecode() {
    const modalData = useAppSelector((state) => state.modals.DeletePurchasecode);
    const dispatch = useAppDispatch();

    const close = () => {
        dispatch(hideModal("DeletePurchasecode"));
    };

    const { data, loading, postData } = useApiPost();



    const handleDeactivateCode = async () => {
        const formData = new FormData();

        try {
            const res = await postData("/admin/deactivate", formData);
            console.log("My delete API response", res);

            if (res?.status === true) {
                Cookies.remove("token")
                // Use window.location.href for external redirect
                window.location.reload()
            }
        } catch (error) {
            console.error("Deactivation failed:", error);
        }
    };

    return (
        <Dialog open={modalData} onClose={close} as="div" className="z-50">
            <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <DialogPanel className="w-[90%] max-w-md sm:max-w-lg  bg-primary border border-bordercolor rounded-2xl p-6 shadow-xl">
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                        <div className="p-4 rounded-full active_btn_profile">
                            <img src={Logout} alt="logout icon" className="w-10 h-10 object-contain" />
                        </div>
                    </div>

                    {/* Heading */}
                    <h2 className="text-center text-xl font-medium text-textcolor  mb-6">
                        Are you sure you want to Deactivate ?
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
                            onClick={handleDeactivateCode}
                            className="w-full sm:w-auto px-20 py-2 cursor-pointer rounded-lg text-white bggradient font-medium transition-colors hover:opacity-90"
                        >
                            Delete
                        </button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}

export default DeletePurchasecode;
