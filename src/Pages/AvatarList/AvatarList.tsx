import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../Hooks/Hooks";
import useApiPost from "../../Hooks/PostData";

// Components
import SearchBar from "../../Componets/SearchBar/SearchBar";
import WithoutSorttableHeader from "../../Componets/TableComponets/WithoutSorttableHeader";
import SimpletextTableBody from "../../Componets/TableComponets/SimpletextTableBody";
import TableActionButtons from "../../Componets/TableComponets/TableActionButtons";
import AvatarListPagination from "../../Componets/PaginationComponets/AvatarListPagination";

// Assets
import notfound from "/Images/notfound.png";
import Loader from "/Images/Loader.gif";
import AddIcon from "/Images/add.png";
import EditIcon from "/Images/edit.png";
import BlockIcon from "/Images/deleteicon.png";

// Redux
import { setPaginationAvatarlList } from "../../Appstore/Slice/PaginationSlice/AvatarListPaginationSlice";
import { showModal } from "../../Appstore/Slice/ModalSlice";
import { reset } from "../../Appstore/Slice/toggleSlice";
import toast from "react-hot-toast";

function AvatarList() {
    const dispatch = useAppDispatch();

        const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';


    const isSidebarOpen = useSelector((state: any) => state.sidebar.isOpen);
    const pagination = useAppSelector((state) => state.AvatarListPaginationSlice);
    const IsAvatar = useAppSelector((state) => state.toggle.value);
    const { current_page, records_per_page } = pagination;

    const { loading, data, postData } = useApiPost();

    // Fetch avatar list with pagination
    useEffect(() => {
        const formData = new FormData();
        formData.append("page", current_page.toString());
        formData.append("pageSize", records_per_page.toString());
          formData.append("sort_order" , "DESC" )
        postData("/avatar/show-avatars", formData);
    }, [current_page, records_per_page]);

    // Fetch avatar list on toggle change
    useEffect(() => {
        if (IsAvatar) postData("/avatar/show-avatars", {});
    }, [IsAvatar]);

    // Set pagination data from API
    useEffect(() => {
        if (data?.data?.Pagination) {
            dispatch(setPaginationAvatarlList(data.data.Pagination));
        }
    }, [data, dispatch]);

    const handleUpdateAvatar = (avatarId: number) => {
       
        sessionStorage.setItem("AvatarId", avatarId.toString())
        dispatch(showModal("AvatarUpdate_Modal"))
    };

    const handleBlock = (userId: number) => {
       
        dispatch(showModal("AvataDeleteModal"))
        sessionStorage.setItem("avatarId", userId.toString())
        dispatch(reset())
    };

    const handleUploadAvatar = () => {
        
        dispatch(showModal("AvatarUpload_Modal"));
        dispatch(reset())
    };

    return (
        <div className={`bg-primary ${isSidebarOpen ? "xl:pl-20" : "xl:pl-72"}`}>
            <SearchBar />

            <div className="px-4 pb-10 xl:px-6">
                {/* Page Header */}
                <div className="flex justify-between py-3">
                    <h2 className="text-textcolor font-poppins text-xl font-semibold pt-3">Avatar List</h2>
                </div>

                {/* Breadcrumb and Add Button */}
                <div className="w-full flex flex-col md:flex-row justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                        <Link to="/dashboard">
                            <h3 className="text-base font-semibold text-[#3A3A3A]  font-poppins">Dashboard</h3>
                        </Link>
                        <div className="h-1 w-1 rounded-full bg-[#E0E0E0]"></div>
                        <h3 className="text-base text-[#858585] font-poppins">Avatar List</h3>
                    </div>
                    <button
                        onClick={handleUploadAvatar}
                        className="flex items-center gap-1.5 mb-2 mr-1 py-2 px-4   cursor-pointer rounded-md font-poppins text-white font-medium bggradient"
                    >
                        <img src={AddIcon} className="w-4 h-4" alt="Add" />
                        <span className="text-xs md:text-sm">Add Avatar</span>
                    </button>
                </div>

                {/* Table */}
                <div className="w-full overflow-x-auto     rounded-lg border border-bordercolor mt-6">
                    <div className="min-w-[1200px]">
                        {/* Table Header */}
                        <div className="flex  bg-headercolortable px-4 py-3 text-left font-medium border-b border-bordercolor sm:pl-8">
                            {["S.L", "AVATAR IMAGE", "AVATAR NAME", "AVATAR GENDER", "ACTIONS"].map((label, idx) => (
                                <div key={idx} className={["w-[15%]", "w-[25%]", "w-[25%]", "w-[25%]", "w-[13%]"][idx]}>
                                    <WithoutSorttableHeader label={label} />
                                </div>
                            ))}
                        </div>

                        {/* Table Body */}
                        {loading ? (
                            <div className="p-4 h-[20rem] flex justify-center items-center">
                                <img src={Loader} alt="Loading..." className="w-12 h-12" />
                            </div>
                        ) : data?.data?.Records?.length > 0 ? (
                            data.data.Records.map((user: any, index: number) => (
                                <div
                                    key={user.avatar_id}
                                    className={`flex items-center px-4 py-3 border-b border-bordercolor   ${index % 2 === 0 ? 'bg-white dark:bg-primary' : 'bg-[#00162e0a] dark:bg-primary'
                                        }  sm:pl-8`}
                                >
                                    <div className="w-[15%] text-sm font-poppins text-textcolor">
                                        {(current_page - 1) * records_per_page + index + 1}
                                    </div>
                                    <div className="w-[25%]">
                                        <img
                                            src={user.avatar_media}
                                            alt={user.name}
                                            className="h-16 w-16 object-cover rounded-full border"
                                        />
                                    </div>
                                    <div className="w-[25%]">
                                        <SimpletextTableBody title={user.name} />
                                    </div>
                                    <div className="w-[25%]">
                                        <SimpletextTableBody title={user.avatar_gender} />
                                    </div>
                                    <div className="w-[13%] flex items-center gap-2">
                                        <button
                                            className="px-[10px] py-[9px] cursor-pointer bg-[#D0CCE1]/60 rounded-full"
                                            onClick={() => handleUpdateAvatar(user.avatar_id)}
                                        >
                                            <img src={EditIcon} alt="Edit" className="w-5 h-4" />
                                        </button>
                                        <TableActionButtons
                                            blockButtonIcon={BlockIcon}
                                            onBlockClick={() => handleBlock(user.avatar_id)}
                                            viewButtonColor="#CCE1CD"
                                            blockButtonColor="#FDE4EA"
                                            borderColor="#01D312"
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 h-[38rem] flex justify-center items-center">
                                <div className="flex flex-col items-center w-full h-full justify-center">
                                    <img src={notfound} alt="Not Found" className="w-1/2 max-h-[40vh] object-contain" />
                                    <h2 className="font-poppins text-lg text-textcolor  mt-4">
                                        Don't have any data to show
                                    </h2>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    <AvatarListPagination />
                </div>
            </div>
        </div>
    );
}

export default AvatarList;
