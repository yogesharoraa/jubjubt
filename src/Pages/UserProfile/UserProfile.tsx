import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SearchBar from '../../Componets/SearchBar/SearchBar';
import useApiPost from '../../Hooks/PostData';
import { useAppDispatch } from '../../Hooks/Hooks';
import { setUser } from '../../Appstore/Slice/userSlice';
import ProfileDetailValues from './ProfileDetailValues';

function UserProfile() {
    const isSidebarOpen = useSelector((state: any) => state.sidebar.isOpen);
    const navigate = useNavigate()


    const { loading, error, data, postData } = useApiPost()


    const dispatch = useAppDispatch()

    const user_id = sessionStorage.getItem("userIdProfileDetail")

    useEffect(() => {
        const formData = new FormData();
        formData.append("user_id", user_id ?? "");
        postData("/admin/get-user", formData);
    }, []);


    const UserDetails = data?.data?.Records[0];
    // Update postList when data changes
    useEffect(() => {
        if (data?.data?.Records) {
            dispatch(setUser(data?.data?.Records[0]))
        }
    }, [data]);



    const location = useLocation();


    const currentPath = location.pathname.split("/"); // get last path segment
    const currentLabel = currentPath[1]
    const sourcePage = currentLabel || "user-list";

    return (
        <div className={`bg-primary ${isSidebarOpen ? 'xl:pl-20' : 'xl:pl-72'}`}>
            <SearchBar />
            <div className="flex justify-between border-t-[#F2F2F2] py-3 px-6">
                <h2 className="text-textcolor font-poppins text-xl font-semibold pt-3 ">User Profile</h2>
            </div>
            <div className="flex items-center justify-between px-6 ">


                <div className="flex items-center gap-2">
                    <h3 className="text-[#3A3A3A] font-poppins text-base font-semibold cursor-pointer " onClick={() => navigate('/dashboard')}>Dashboard</h3>
                    <div className="rounded-full w-1 h-1 bg-[#808080]"></div>

                    {/* Go back to previous page */}
                    <button
                        className="text-[#3A3A3A]  font-poppins font-semibold text-base cursor-pointer"
                        onClick={() => navigate(`/${sourcePage}`)}
                    >
                        {sourcePage
                            .split("-")                      // split by hyphen
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // capitalize each word
                            .join(" ")}
                    </button>


                    <div className="rounded-full w-1 h-1 bg-[#808080]"></div>
                    <h5 className='text-[#858585] font-poppins text-sm'>{UserDetails?.user_name ? UserDetails.user_name[0].toUpperCase() + UserDetails.user_name.slice(1) : ""}
                    </h5>

                </div>
            </div>
            <ProfileDetailValues />
        </div>
    )
}

export default UserProfile
