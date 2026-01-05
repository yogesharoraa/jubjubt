import React, { useEffect, useState } from "react";
import Search from "/Images/search.png";
import { useSelector } from "react-redux";
import SearchBar from "../../Componets/SearchBar/SearchBar";
import { Link, useNavigate } from "react-router-dom";
import WithoutSorttableHeader from "../../Componets/TableComponets/WithoutSorttableHeader";
import SortableHeader from "../../Componets/TableComponets/SortableHeader";
import { useAppDispatch, useAppSelector } from "../../Hooks/Hooks";
import useApiPost from "../../Hooks/PostData";
import TableDateTimeDisplay from "../../Componets/TableComponets/TableDateTimeDisplay";
import TableUserInfo from "../../Componets/TableComponets/TableUserInfo";
import StoryThumbnail from "../../Componets/TableComponets/StoryThumbnail";
import { showModal } from "../../Appstore/Slice/ModalSlice";
import Apimethod from "../../Hooks/Apimethod";
import { toast } from "react-hot-toast";
import { setPaginationRellReportlList } from "../../Appstore/Slice/PaginationSlice/RellReportListPaginationSlice";
import ReelReportPagination from "../../Componets/PaginationComponets/ReelReportPagination";
import notfound from "/Images/notfound.png"

function ReelReportList() {
    const isSidebarOpen = useSelector((state: any) => state.sidebar.isOpen);
    const [category, setCategory] = useState<string>('');
    const [order, setOrder] = useState<string>('');
    const { data, loading, error, postData } = useApiPost();
    const pagination = useAppSelector((state) => state.RellReportListPaginationSlice);
    const { current_page, records_per_page } = pagination;
    const [toggleStates, setToggleStates] = useState<{ [key: number]: boolean }>({});
    const [search, setSearch] = useState("")




    const dispatch = useAppDispatch();

    useEffect(() => {
        const formData = new FormData();
        formData.append("social_type", "reel");
        formData.append("page", current_page.toString());
        formData.append("pageSize", records_per_page.toString());
        //   serach values only pass when values  exit else not pass 

        if (search.trim() !== "") {
            formData.append("user_name", search)
        }

        if (category === "CREATED DATE/TIME") {
            formData.append("sort_by", "createdAt");
        }

        formData.append("sort_order", order === "0" ? "ASC" : "DESC");

        postData("/admin/reported-social-list", formData);
    }, [
        current_page,
        records_per_page,
        search,
        category ?? "",
        order ?? "",
        search
    ]);





    const handleOpenStory = (user: any) => {
        sessionStorage.setItem("reelId", user.social_id);
        dispatch(showModal("ReelDetail_Modal"));
    };

    const navigate = useNavigate()

    const handleUserClick = (userId) => {
        navigate(`/user-list/user-profile`);
        sessionStorage.setItem("userIdProfileDetail", userId?.User?.user_id);
    };


    const handleUserClick1 = (user: any) => {
        navigate(`/user-list/user-profile`);
        sessionStorage.setItem("userIdProfileDetail", user?.Social?.User?.user_id);
    };



    useEffect(() => {
        if (data?.data?.Pagination) {
            dispatch(setPaginationRellReportlList(data.data.Pagination));
        }
    }, [data, dispatch]);



    useEffect(() => {
        if (data?.data?.Records) {
            const toggles = data.data.Records.reduce((acc, record) => {
                acc[record.Social.social_id] = record.Social.status ?? false;
                return acc;
            }, {} as { [key: number]: boolean });
            setToggleStates(toggles);
        }
    }, [data]);



    const { makeRequest } = Apimethod()


    const handleToggleStatus = async (socialId: number) => {
        const newStatus = !toggleStates[socialId];
        try {
            await makeRequest(
                "/admin/update-social-admin",
                {
                    social_id: socialId,
                    status: newStatus,
                },
                "application/json",
                "POST"
            );
            setToggleStates((prev) => ({
                ...prev,
                [socialId]: newStatus,
            }));
            toast.success("Reel status updated");
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className={`bg-primary ${isSidebarOpen ? "xl:pl-20" : "xl:pl-72"}`}>
            <SearchBar />
            <div className="px-4 pb-10 xl:px-6">
                {/* Header */}
                <div className="flex justify-between items-center border-t-[#F2F2F2] py-3">
                    <h2 className="text-xl font-semibold text-textcolor font-poppins  pt-3">
                        Reel Report List
                    </h2>
                    <div className="relative">
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center p-2">
                            <img src={Search} alt="Search" className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by username..."
                            className="w-[180px] md:w-[250px] pl-10 py-2 text-sm rounded-lg bg-inputbgcolor border border-bordercolor border-opacity-10 placeholder:text-placeholdercolor  text-textcolor focus:outline-none focus:ring-1 focus:ring-gray-600  placeholder:dark:text-tableDarkLarge"

                            onChange={(e) => setSearch(e.target.value)}
                            value={search}
                        />
                    </div>
                </div>

                {/* Breadcrumb */}
                <div className="mb-4 flex items-center gap-2">
                    <Link to="/dashboard">
                        <h3 className="text-base font-semibold text-[#3A3A3A] font-poppins ">
                            Dashboard
                        </h3>
                    </Link>
                    <div className="h-1 w-1 rounded-full bg-[#E0E0E0]" />
                    <h3 className="text-base text-[#858585] font-poppins">Reel Report List</h3>
                </div>

                {/* Table */}
                <div className="w-full overflow-x-auto rounded-lg border border-bordercolor mt-6">
                    <div className="min-w-[1400px]">
                        {/* Table Header */}
                        <div className="flex bg-headercolortable text-left font-medium px-4 py-3 border-b border-bordercolor">
                            <div className="w-[8%]"><WithoutSorttableHeader label="S.L" /></div>
                            <div className="w-[18%]"><SortableHeader title="CREATED DATE/TIME" {...{ category, order, setCategory, setOrder }} /></div>
                            <div className="w-[12%]"><WithoutSorttableHeader label="REEL IMAGE" /></div>
                            <div className="w-[17%]"> <WithoutSorttableHeader label="REPORTED USER NAME" /></div>
                            <div className="w-[13%]"><WithoutSorttableHeader label="REASON" /></div>
                            <div className="w-[17%]"> <WithoutSorttableHeader label="REPORTED BY" /></div>
                            <div className="w-[13%]"><WithoutSorttableHeader label="STATUS" /></div>
                        </div>

                        {/* Table Rows */}
                        {data?.data?.Records?.length > 0 ? (
                            data.data.Records.map((user: any, index: number) => (
                                <div
                                    key={user.report_id}
                                    className={` ${index % 2 === 0 ? 'bg-white dark:bg-primary' : 'bg-[#00162e0a] dark:bg-primary'
                                        } flex px-4 py-3 border-b border-bordercolor`}
                                >
                                    <div className="w-[8%] text-sm font-poppins text-textcolor">
                                        {(current_page - 1) * records_per_page + index + 1}
                                    </div>
                                    <div className="w-[18%]">
                                        <TableDateTimeDisplay dateString={user.updatedAt} />
                                    </div>
                                    <div className="w-[12%]">
                                        <StoryThumbnail
                                            url={user.Social.reel_thumbnail}
                                            storyId={user.social_id}
                                            onClick={() => handleOpenStory(user)}
                                        />
                                    </div>
                                    <div className="w-[17%]">
                                        <TableUserInfo
                                            profilePic={user.User.profile_pic}
                                            username={user.User.user_name || 'N/A'}
                                            email={user.User.email || 'N/A'}
                                            mobile={user.country_code ? `${user.country_code} ${user.mobile || ''}` : 'N/A'}
                                            onClick={() => handleUserClick(user)}
                                        />
                                    </div>
                                    <div className="w-[13%] flex items-center text-sm text-textcolor  font-poppins">
                                        {user.Report_type.report_text}
                                    </div>
                                    <div className="w-[17%]">
                                        <TableUserInfo
                                            profilePic={user.Social.User.profile_pic}
                                            username={user.Social.User.user_name || 'N/A'}
                                            email={user.Social.User.email || 'N/A'}
                                            mobile={user.country_code ? `${user.country_code} ${user.mobile || ''}` : 'N/A'}
                                            onClick={() => handleUserClick1(user)}
                                        />
                                    </div>
                                    <div className="w-[13%] ml-1" >
                                        <label className="flex items-center cursor-pointer select-none">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={toggleStates[user.Social.social_id] || false}
                                                    onChange={() => handleToggleStatus(user.Social.social_id)}
                                                    className="sr-only"
                                                />
                                                <div className={`block h-6 w-10 rounded-full border transition duration-300 ${toggleStates[user.Social.social_id] ? " border-toggalbtcolorborder bggradient" : "bg-transparent  border  border-toggalbtcolorborder"}`}></div>
                                                <div className={`absolute top-1 h-4 w-4 rounded-full transition duration-300 ${toggleStates[user.Social.social_id] ? "right-1 bg-white" : "left-1 bggradient"}`}></div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            ))
                        ) : !loading ? (
                            <div className="p-4 h-[38rem] flex justify-center items-center">
                                <div className="w-full flex flex-col items-center h-full justify-center">
                                    <img
                                        src={notfound}
                                        alt="Not Found"
                                        className="w-1/2 max-h-[40vh] object-contain"
                                    />
                                    <h2 className="font-poppins text-lg text-textcolor mt-4">
                                        Don't have any data to show
                                    </h2>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <ReelReportPagination />
                </div>
            </div>
        </div>
    );
}

export default ReelReportList;
