import { Dialog, DialogPanel } from "@headlessui/react";
import { useAppDispatch, useAppSelector } from "../../Hooks/Hooks";
import { hideModal } from "../../Appstore/Slice/ModalSlice";
import { MdBlockFlipped } from "react-icons/md";
import useApiPost from "../../Hooks/PostData";
import toast from "react-hot-toast";
import { setTrue } from "../../Appstore/Slice/toggleSlice";

function Admin_Block_Modal() {
    const modalData = useAppSelector((state) => state.modals.Admin_Block_Modal);
    const dispatch = useAppDispatch();



    const user_idwithbloackstatus = useAppSelector((state) => state.UniqeUserDetail)
    const close = () => {
        dispatch(hideModal("Admin_Block_Modal"));
    };
    const { data, loading, error, postData } = useApiPost();





    const blocked_by_admin = user_idwithbloackstatus.blocked_by_admin;
    const user_id = user_idwithbloackstatus.User_id;

    const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';


    const handleUserDeactivate = async () => {
        if (IS_DEMO) {
            toast.error("This action is disabled in the demo version.");
            return;
        }
        const formData = new FormData();
        formData.append("user_id", user_id);
        formData.append("blocked_by_admin", (!blocked_by_admin).toString());

        try {
            const response = await postData("/admin/update-user", formData, "multipart/form-data");
            toast.success("Update status ")
            postData("/admin/get-user", {});
            close()
            dispatch(setTrue())
        } catch (error) {
        }
    };


    return (
        <Dialog open={modalData} onClose={close} as="div" className="z-50">
            <div className="fixed inset-0 z-10 overflow-y-auto bg-black/55 backdrop-blur-sm">
                <div className="flex min-h-full items-center justify-center">
                    <DialogPanel
                        className={`mx-auto h-fit p-6 w-[90%] rounded-2xl bg-primary  border border-bordercolor  shadow-lg backdrop-blur-2xl duration-300 ease-out sm:w-[60%] xl:w-[30%] 2xl:w-[28%]`}
                    >
                        {/* Icon Section */}
                        <div className="flex justify-center items-center">
                            <div className="flex justify-center p-4 rounded-full bggradient">
                                <MdBlockFlipped className="w-8 h-8 text-textcolor" />
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-xl font-poppins text-center text-textcolor mt-4">
                            {user_idwithbloackstatus?.blocked_by_admin == true
                                ? "Are you sure you want to activate?"
                                : "Are you sure you want to deactivate?"}
                        </h2>


                        {/* Buttons Section */}
                        <div className="flex justify-center gap-5 mt-6">
                            <button
                                onClick={close}
                                className="px-16 py-2 rounded-lg border  border-header text-[#3A3333] font-medium   cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUserDeactivate}
                                className="px-14 py-2 font-medium text-white rounded-lg bggradient  cursor-pointer"
                            >

                                {user_idwithbloackstatus?.blocked_by_admin == true
                                    ? "Activate"
                                    : "Deactivate"}

                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}

export default Admin_Block_Modal;
