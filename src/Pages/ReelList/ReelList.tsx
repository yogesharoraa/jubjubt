import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import SearchBar from "../../Componets/SearchBar/SearchBar";
import Search from "/Images/search.png";
import Eye from "/Images/eye.png";
import Block from "/Images/report_action.png";

import WithoutSorttableHeader from "../../Componets/TableComponets/WithoutSorttableHeader";
import SortableHeader from "../../Componets/TableComponets/SortableHeader";
import StoryThumbnail from "../../Componets/TableComponets/StoryThumbnail";
import TableUserInfo from "../../Componets/TableComponets/TableUserInfo";
import TableDateTimeDisplay from "../../Componets/TableComponets/TableDateTimeDisplay";
import TableActionButtons from "../../Componets/TableComponets/TableActionButtons";

import useApiPost from "../../Hooks/PostData";
import { useAppDispatch, useAppSelector } from "../../Hooks/Hooks";
import ToggleSwitch from "../../Componets/ToggleSwitch";
import ReelListPagination from "../../Componets/PaginationComponets/ReelListPagination";
import { setPaginationReelList } from "../../Appstore/Slice/PaginationSlice/ReelListPaginationSlice";

function ReelList() {
    const isSidebarOpen = useSelector((state: any) => state.sidebar.isOpen);
    const [category, setCategory] = useState<string>("");
    const [order, setOrder] = useState<string>("");

    const { data, loading, error, postData } = useApiPost();
    const dispatch = useAppDispatch();
    const [reelList, setReelList] = useState<any[]>([]);

    const pagination = useAppSelector((state) => state.ReelListPaginationSlice);

    const { current_page, records_per_page } = pagination;


    useEffect(() => {
        const formData = new FormData();
        formData.append("social_type", "reel");
        formData.append("page", current_page.toString());
        formData.append("pageSize", records_per_page.toString());
        postData("/admin/get-social-admin", formData);
    }, [current_page, records_per_page]);




    useEffect(() => {
        if (data?.data?.Pagination) {
            dispatch(setPaginationReelList(data.data.Pagination));
        }
    }, [data, dispatch]);

    useEffect(() => {
        if (data?.data?.Records) {
            setReelList(data.data.Records);
        }
    }, [data]);

    const handleOpenStory = (user: any) => {
        // Story view logic
    };

    const handleUserClick = () => {
        alert("User clicked");
    };

    const handleView = () => {
        alert("View button clicked");
    };

    const handleBlock = () => {
        alert("Block button clicked");
    };

    const handleReelStatus = async (userId: number, currentStatus: boolean) => {
        const formData = new FormData();
        formData.append("user_id", String(userId));
        formData.append("status", currentStatus ? "inactive" : "active");

        try {
            await postData("/admin/toggle-reel-status", formData);
            // Optimistically update local state
            setReelList(prevList =>
                prevList.map(reel =>
                    reel.User.user_id === userId
                        ? { ...reel, is_active: !currentStatus }
                        : reel
                )
            );
        } catch (error) {
        }
    };

    return (
        <div className={`bg-primary ${isSidebarOpen ? "xl:pl-20" : "xl:pl-72"}`}>
            <SearchBar />
            <div className="px-4 pb-10 xl:px-6">
                {/* Header */}
                <div className="flex justify-between border-t-[#F2F2F2] py-3">
                    <h2 className="text-textcolor font-poppins text-xl font-semibold pt-3 ">Reel List</h2>
                    <div className="relative">
                        <div className="absolute flex items-center p-2 transform -translate-y-1/2 left-2 top-1/2">
                            <img src={Search} alt="Search" className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <input
                            type="text"
                            className="xl:placeholder:text-sm bg-[#00000005] border border-bordercolor  placeholder:dark:text-tableDarkLarge border-opacity-10 rounded-lg md:w-[250px] w-[180px] py-2 pl-10 placeholder:text-sm placeholder:text-textcolor0004F] focus:outline-none focus:ring-1 focus:ring-gray-600"
                            placeholder="Search by username..."
                        />
                    </div>
                </div>

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-4">
                    <Link to="/dashboard">
                        <h3 className="text-[#3A3A3A] font-poppins text-base font-semibold ">Dashboard</h3>
                    </Link>
                    <div className="w-1 h-1 rounded-full bg-[#E0E0E0]"></div>
                    <h3 className="text-[#858585] font-poppins text-base">Reel List</h3>
                </div>

                {/* Table */}
                <div className="border border-[#E3E3E3] rounded-lg mt-6 overflow-x-auto w-full">
                    <div className="min-w-[1200px]">
                        {/* Table Header */}
                        <div className="flex px-4 py-3 pl-4 text-left bg-[#D5D5D5] border-b border-b-[#E3E3E3] font-medium sm:pl-8">
                            <div className="w-[7%]"><WithoutSorttableHeader label="S.L" /></div>
                            <div className="w-[11%]"><WithoutSorttableHeader label="REEL IMAGE" /></div>
                            <div className="w-[25%]">
                                <SortableHeader title="USERNAME" category={category} order={order} setCategory={setCategory} setOrder={setOrder} />
                            </div>
                            <div className="w-[18%]">
                                <SortableHeader title="CREATED DATE/TIME" category={category} order={order} setCategory={setCategory} setOrder={setOrder} />
                            </div>
                            <div className="w-[10%]">
                                <SortableHeader title="LIKES" category={category} order={order} setCategory={setCategory} setOrder={setOrder} />
                            </div>
                            <div className="w-[12%]">
                                <SortableHeader title="COMMENTS" category={category} order={order} setCategory={setCategory} setOrder={setOrder} />
                            </div>
                            <div className="w-[10%]">
                                <SortableHeader title="VIEWS" category={category} order={order} setCategory={setCategory} setOrder={setOrder} />
                            </div>
                            <div className="w-[7%]"><WithoutSorttableHeader label="STATUS" /></div>
                            <div className="w-[10%]"><WithoutSorttableHeader label="ACTIONS" /></div>
                        </div>

                        {/* Table Rows */}
                        {reelList.length > 0 ? (
                            reelList.map((user: any, index: number) => (
                                <div
                                    key={user.social_id}
                                    className={`${index % 2 === 0 ? "bg-white" : "bg-[#00162e0a]"} flex items-center px-4 py-3 sm:pl-8 pl-4 border-b border-b-[#E5E7EB] last:border-0`}
                                >
                                    <div className="w-[7%] text-textcolor  font-poppins text-sm"> {(current_page - 1) * records_per_page + index + 1}</div>
                                    <div className="w-[11%]">
                                        <StoryThumbnail url={user.reel_thumbnail} storyId={user.social_id} onClick={() => handleOpenStory(user)} />
                                    </div>
                                    <div className="w-[25%]">
                                        <TableUserInfo
                                            profilePic={user.User.profile_pic}
                                            username={user.User.user_name || "N/A"}
                                            email={user.User.email || "N/A"}
                                            mobile={user.country_code ? `${user.country_code} ${user.mobile || ""}` : "N/A"}
                                            onClick={() => handleUserClick(user)}
                                        />
                                    </div>
                                    <div className="w-[18%]">
                                        <TableDateTimeDisplay dateString={user.updatedAt} />
                                    </div>
                                    <div className="w-[10%] text-[#3A3A3A] dark:text-tableDarkLarge font-poppins text-sm">
                                        {user.total_likes} {user.total_likes > 1 ? "Likes" : "Like"}
                                    </div>
                                    <div className="w-[12%] text-[#3A3A3A] dark:text-tableDarkLarge font-poppins text-sm">
                                        {user.total_comments} {user.total_comments > 1 ? "Comments" : "Comment"}
                                    </div>
                                    <div className="w-[10%] text-[#3A3A3A] dark:text-tableDarkLarge font-poppins text-sm">
                                        {user.total_views} {user.total_views > 1 ? "Views" : "View"}
                                    </div>
                                    <div className="w-[7%] text-sm font-poppins text-[#3A3A3A] dark:text-tableDarkLarge">
                                        <ToggleSwitch
                                            checked={user.is_active}
                                            onChange={() => handleReelStatus(user.User.user_id, user.is_active)}
                                            id={user.id}
                                        />

                                    </div>
                                    <div className="w-[10%]">
                                        <TableActionButtons
                                            viewButtonIcon={Eye}
                                            blockButtonIcon={Block}
                                            onViewClick={handleView}
                                            onBlockClick={handleBlock}
                                            viewButtonColor="#CCE1CD"
                                            blockButtonColor="#FDE4EA"
                                            borderColor="#01D312"
                                        />
                                    </div>
                                    <a href=""></a>
                                </div>
                            ))
                        ) : (
                            !loading && <div className="p-4 text-center text-sm text-gray-500">No records found.</div>
                        )}
                    </div>
                    {/* Show ReelListPagination only when reelList has 10 or more items */}
                    {/* {reelList.length >= 10 ? <ReelListPagination /> : null} */}
                    <ReelListPagination />
                </div>
            </div>
        </div>
    );
}

export default ReelList;
