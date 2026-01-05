import { useState } from "react";
import { useSelector } from "react-redux";
import SearchBar from "../../Componets/SearchBar/SearchBar";
import EditProfile from "./EditProfile";
import ChangePassword from "./ChangePassword";

function Profile() {
    const [selectedOption, setSelectedOption] = useState("edit");
    const isSidebarOpen = useSelector((state: { sidebar: { isOpen: boolean } }) => state.sidebar.isOpen);

    return (
        <div className={`mb-10 ${isSidebarOpen ? "xl:pl-20" : "xl:pl-72"}`}>
            <SearchBar />

            {/* Title */}
            <div className="flex justify-between border-t-bordercolor xl:py-8 px-6 py-3">
                <h2 className="text-textcolor font-poppins text-xl font-semibold xl:pt-3">My Profile</h2>
            </div>

            {/* Profile Details */}
            <div className="border border-bordercolor xl:mx-12 mx-6 rounded-lg   bg-primary">
                <div className="border-b border-bordercolor rounded-lg">
                    <button
                        onClick={() => setSelectedOption("edit")}
                        className={`${selectedOption === "edit" ? "active_btn_profile    text-color rounded-tl-lg" : "text-[#999999]"
                            } font-poppins text-left px-6 py-3  cursor-pointer`}
                    >
                        Edit Profile
                    </button>

                    <button
                        onClick={() => setSelectedOption("password")}
                        className={`${selectedOption === "password" ? "lightlogo text-color   " : "text-[#999999]"
                            } font-poppins text-left px-6 py-3  cursor-pointer`}
                    >
                        Change Password
                    </button>
                </div>

                <div className="flex justify-center    bg-primary ">
                    <div className="w-[1000px]">{selectedOption === "edit" ? <EditProfile /> : <ChangePassword />}</div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
