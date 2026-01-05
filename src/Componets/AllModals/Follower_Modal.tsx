import { Dialog, DialogPanel } from "@headlessui/react";
import { useAppDispatch, useAppSelector } from "../../Hooks/Hooks";
import { hideModal } from "../../Appstore/Slice/ModalSlice";
import { useEffect } from "react";
import useApiPost from "../../Hooks/PostData";
import Empty from "/Images/empty.png";

function Follower_Modal() {
    const modalData = useAppSelector((state) => state.modals.Follower_Modal);
    const dispatch = useAppDispatch();


    const { data, loading, error, postData } = useApiPost();




    useEffect(() => {
        const user_id = sessionStorage.getItem("userIdProfileDetail")
        const formData = new FormData();
        formData.append("user_id", user_id ?? "");
        formData.append("type", "follower");
        postData("/admin/follow-following-list", formData);
    }, []);


    const close = () => {
        dispatch(hideModal("Follower_Modal"));
    };



    return (
        <Dialog open={modalData} onClose={close} as="div" className="z-50">
            <div className="fixed inset-0 z-10 flex items-center   justify-center bg-black/50 backdrop-blur-sm">
                <DialogPanel className="w-[90%] max-w-md sm:max-w-lg  bg-white dark:bg-darkBg rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between  bg-primary">
                        <h2 className="text-textcolor font-medium text-xl font-poppins ">Followers</h2>
                        <button onClick={close} className="text-2xl text-gray-600 dark:text-white cursor-pointer hover:text-gray-800 dark:hover:text-gray-200">
                            ×
                        </button>
                    </div>


                    {data?.data?.Records?.length > 0 ?
                        (<>
                            <div className='overflow-y-auto '>
                                {data?.data?.Records?.map((follower) => (
                                    <>
                                        <div className="flex items-center border-b border-[#EFEFEF] dark:border-[#1f1f1f] justify-between p-2 rounded-md cursor-pointer light:hover:bg-gray-100">
                                            <div className='flex'>
                                                <img src={follower?.follower?.profile_pic || "/assets/default_user.png"} alt={follower?.follower?.user_name} className="w-12 h-12 mr-3 rounded-full" />
                                                <div className='flex flex-col py-2 '>
                                                    <p className='font-poppins text-textcolor text-sm text-left font-semibold '> {follower?.follower?.full_name}</p>
                                                    <p className="text-[#747474] font-poppins text-xs text-left">{follower?.follower?.user_name}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ))}
                            </div>
                        </>) : (<>
                            <div className='flex flex-col justify-center place-items-center min-h-[400px] bg-primary'>
                                <img src={Empty} className='w-16 h-16 ' />
                                <p className='text-textcolor text-opacity-[59%] font-poppins flex justify-center '>No Followers found</p>
                            </div>
                        </>)}
                </DialogPanel>
            </div>
        </Dialog>
    );
}

export default Follower_Modal;
