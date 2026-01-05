import React, { Fragment } from 'react';
import { UsegetAdminDetail } from '../../Appstore/Api/Admin_profile/UsegetAdminDetail';
import { useAppDispatch, useAppSelector } from '../../Hooks/Hooks';
import { useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { showModal } from '../../Appstore/Slice/ModalSlice';

function AdminProfile() {
    const { data } = UsegetAdminDetail();
    const profile_pic = useAppSelector((state) => state.admin.profile_pic);


    const dispatch = useAppDispatch()

    const handleLogout = () => {
        dispatch(showModal("Log_Out_Modal"))
    };


    const navigate = useNavigate()


    const handalNaviagate = () => [
        navigate("/profile")
    ]

    const user = data?.data;

    return (
        <div className="relative w-fit text-right">
            <Menu as="div" className="relative inline-block text-left">
                <div>
                    <Menu.Button className="flex items-center  rounded-full cursor-pointer transition duration-200">
                        <img
                            src={profile_pic || user?.profile_pic || '/default-avatar.png'}
                            className="w-[34px] h-[34px] rounded-full object-cover"
                            alt="Profile"
                        />
                    </Menu.Button>
                </div>

                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 scale-95 -translate-y-1"
                    enterTo="opacity-100 scale-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 scale-100 translate-y-0"
                    leaveTo="opacity-0 scale-95 -translate-y-1"
                >
                    <Menu.Items className="absolute right-0 mt-2 w-[18rem] origin-top-right rounded-lg bg-primary  dark:border  dark:border-bordercolor  shadow-xl ring-1 ring-black/10 focus:outline-none z-50">
                        <div className="p-4 border-b border-bordercolor cursor-pointer"  >
                            <div className="flex items-center gap-3"  >
                                <img
                                    src={profile_pic || user?.profile_pic || '/default-avatar.png'}
                                    className="w-10 h-10 rounded-full object-cover"
                                    alt="Profile"
                                />
                                <div className="flex flex-col">
                                    <h3 className="font-semibold text-sm  text-textcolor">{user?.full_name || 'Admin'}</h3>
                                    <p className="text-xs text-gray-500">{user?.email || 'admin@example.com'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="py-1 cursor-pointer   border-b border-bordercolor" onClick={handalNaviagate} >
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        className={`w-full text-left  cursor-pointer px-4 py-2 text-sm rounded-md ${active ? 'bg-gray-100' : ' text-textcolor'
                                            }`}
                                    >
                                        My Profile
                                    </button>
                                )}
                            </Menu.Item>
                        </div>

                        <div className="py-1 cursor-pointer">
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={handleLogout}
                                        className={`w-full text-left  cursor-pointer px-4 py-2 text-sm rounded-md ${active ? 'bg-gray-100 text-red-600' : 'text-red-600'
                                            }`}
                                    >
                                        Logout
                                    </button>
                                )}
                            </Menu.Item>
                        </div>
                    </Menu.Items>
                </Transition>
            </Menu>
        </div>
    );
}

export default AdminProfile;
