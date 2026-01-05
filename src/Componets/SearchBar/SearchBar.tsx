import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Search1 from "/Images/search.png";
import Logo from "../../../public/Images/reelbostlogo1.png";
import { FaBars } from "react-icons/fa6";
import Sidebar from "../Sidebar/Sidebar";
import AdminProfile from "./AdminProfile";
import { useTheme } from "../../Context/ThemeContext";
import mode from "/Images/mode.png"
import Moon from "/Images/moon.png"

const searchOptions = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "User List", path: "/user-list" },
    { name: "Post List", path: "/post-list" },
    { name: "Reel List", path: "/reel-list" },
    { name: "User Report List", path: "/user-report-list" },
    { name: "Post Report List", path: "/post-report-list" },
    { name: "Reel Report List", path: "/reel-report-list" },
    { name: "Profile", path: "/profile" },
    { name: "Stories List", path: "/stories-list" },
    { name: "Push Notification", path: "/push-notification" },
    { name: "Hashtag List", path: "/hashtag-list" },
    { name: "Language List", path: "/language-list" },
    { name: "Music List", path: "/music-list" },
    { name: "Block List", path: "/block-list" },
    { name: "Avtar List", path: "/avtar-list" },
    { name: "Withdrawal List", path: "/withrawal-list" },
    { name: "Recharge List", path: "/recharge-list" },
    { name: "Live List", path: "/live-list" },
    { name: "Setting", path: "/settings" },
  { name: "CMS Pages", path: "/cms" },




];

function SearchBar() {
    const [search, setSearch] = useState("");
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [open, setOpen] = useState(false);

    const filteredOptions = search
        ? searchOptions.filter((option) =>
            option.name.toLowerCase().includes(search.toLowerCase())
        )
        : [];


    const handleOpen = () => {
        setOpen(true);
    };






    // For Theme Toggle 
    const { theme, toggleTheme } = useTheme();


    return (
        <>
            <div className="flex justify-between px-4 relative py-4 border-b border-bordercolortop xl:px-6 2xl:px-6 bg-primary  ">
                {/* Left Section */}
                <div className="flex gap-3">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <FaBars className="w-5 h-5 text-textcolor xl:hidden" />
                    </button>

                    {sidebarOpen && (
                        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                    )}

                   

                    {/* Search Bar */}
                    <div className="sm:relative">
                        <div
                            className="flex items-center py-2 sm:p-2 sm:transform sm:-translate-y-1/2 sm:absolute sm:left-2 sm:top-1/2"
                            onClick={handleOpen}
                        >
                            <img src={Search1} alt="Search" className="w-5 h-5" />
                        </div>

                        <input
                            type="text"
                            className="   border border-bordercolor bg-[#00000005] text-textcolor  rounded-lg w-[350px] py-2 pl-12 placeholder:text-sm placeholder:text-placeholdercolor  xl:block hidden"
                            placeholder="Search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        {search && filteredOptions.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 border border-bordercolor   bg-primary   text-textcolor rounded-lg shadow-md">
                                {filteredOptions.map((option) => (
                                    <p
                                        key={option.name}
                                        onClick={() => navigate(option.path)}
                                        className="px-4 py-2 text-sm cursor-pointer text-textcolor hover:bg-gray-100   dark:hover:text-black"
                                    >
                                        {option.name}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex gap-4 items-center">

                    <button className="flex items-center  cursor-pointer  p-2 mb-1   lightlogo  rounded-full" onClick={toggleTheme}>
                        {theme === "light" ? (
                            <img className="h-[20px] w-[20px] colorchange " src={mode} alt="" />
                        ) : (
                            <img className="h-[20px]  w-[20px] colorchange" src={Moon} alt="" />
                        )}
                    </button>

                    <AdminProfile />
                </div>
            </div>
        </>
    );
}

export default SearchBar;
