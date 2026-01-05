import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../Hooks/Hooks";
import UserReelDetail from "./UserReelDetail";
import UserCoineDetail from "./UserCoineDetail";
import UserGiftDetail from "./UserGiftDetail";
import { showModal } from "../../Appstore/Slice/ModalSlice";

function ProfileDetailValues() {
    const [option, setOption] = useState("Reels");

    const UserDetails = useAppSelector((state) => state.user.user);

    const Rellslenth = useAppSelector((state) => state.ReelDetailSlice.reel)


    const dispatch = useAppDispatch();

    return (
        <div className=" w-full  flex flex-col  pt-3">
            <div className="relative bggradient h-[250px]">
                <div className=" px-[5.5rem] md:px-36">
                    <img src={UserDetails?.profile_pic} className="absolute rounded-full w-44 h-44 -bottom-20  border-[#FFFFFF] bg-white shadow-lg border-8 " />
                </div>
            </div>
            <div className="py-8 md:px-[350px] md:block  hidden">
                <div className="flex flex-col">
                    <h2 className="text-textcolor font-poppins font-semibold text-xl ">{UserDetails?.full_name}</h2>
                    <p className="text-base font-normal text-gray-500 font-poppins dark:text-tableDarkLarge">{UserDetails?.email}</p>
                </div>

                {/* Followers Following total */}
                <div className="flex gap-4 py-4">
                    <h2 className="text-textcolor dark:text-gray-500 font-semibold font-poppins text-base cursor-pointer" onClick={() => dispatch(showModal("Follower_Modal"))}>
                        {UserDetails?.followerCount} <span className="text-base font-medium text-sidebarText "> Followers</span>
                    </h2>
                    <h2 className="text-textcolor dark:text-gray-500 font-semibold font-poppins text-base cursor-pointer" onClick={() => dispatch(showModal("Following_Modal"))} >
                        {UserDetails?.followingCount} <span className="text-base font-medium text-sidebarText ">Following</span>
                    </h2>
                </div>
            </div>


            <div className=" w-full  relative  md:hidden">
                <div className="  px-[5rem]  mt-[5.5rem]  ">
                    <div className="flex flex-col">
                        <h2 className="text-textcolor font-poppins font-semibold text-xl ">{UserDetails?.full_name}</h2>
                        <p className="text-base font-normal text-gray-500 font-poppins dark:text-tableDarkLarge">{UserDetails?.email}</p>
                    </div>

                    {/* Followers Following total */}
                    <div className="flex gap-4 py-4">
                        <h2 className="text-textcolor dark:text-gray-500 font-semibold font-poppins text-base cursor-pointer" onClick={() => dispatch(showModal("Follower_Modal"))}>
                            {UserDetails?.followerCount} <span className="text-base font-medium text-sidebarText "> Followers</span>
                        </h2>
                        <h2 className="text-textcolor dark:text-gray-500 font-semibold font-poppins text-base cursor-pointer" onClick={() => dispatch(showModal("Following_Modal"))} >
                            {UserDetails?.followingCount} <span className="text-base font-medium text-sidebarText ">Following</span>
                        </h2>
                    </div>
                </div>
            </div>

            <div className="flex border   mt-[4rem]  md:mt-0 border-bordercolor rounded-lg  mx-auto  w-[90%]  md:w-[80%] ">
                {/* Reels button */}
                <button
                    className={`flex flex-1 gap-1 items-center justify-center py-2 w-fit font-poppins cursor-pointer text-base transition-all duration-200 ${option === "Reels" ? "bggradient text-sidebarText dark:text-white rounded-tl-lg rounded-bl-lg" : "bg-transparent text-textcolor dark:text-gray-500"}`}
                    onClick={() => setOption("Reels")}
                >
                    Reels
                    <p className={`font-poppins text-sm ${option === "Reels" ? "text-sidebarText dark:text-white" : "text-textcolor dark:text-gray-500"}`}>({Rellslenth})</p>
                </button>

                <div className="self-center h-10 border border-[#e5e7eb] dark:border-[#1F1F1F]" />


                {/* Coins button */}
                <button
                    className={`flex flex-1 gap-1 items-center justify-center py-2 cursor-pointer font-poppins text-base transition-all duration-200 ${option === "Coins" ? "bggradient text-sidebarText dark:text-white" : "bg-transparent text-textcolor dark:text-gray-500"}`}
                    onClick={() => setOption("Coins")}
                >
                    Money
                </button>
                <div className="self-center h-10 border border-[#e5e7eb] dark:border-[#1F1F1F]" />


                {/* Gift button */}
                <button
                    className={`flex flex-1 gap-1 items-center justify-center py-2 cursor-pointer font-poppins text-base transition-all duration-200 ${option === "Gift" ? "bggradient text-sidebarText dark:text-white rounded-tr-lg rounded-br-lg" : "bg-transparent text-textcolor dark:text-gray-500"}`}
                    onClick={() => setOption("Gift")}
                >
                    Gift
                </button>

            </div>


            {option === "Reels" && <UserReelDetail />}
            {option === "Coins" && <UserCoineDetail />}
            {option === "Gift" && <UserGiftDetail />}
        </div>
    );
}

export default ProfileDetailValues;
