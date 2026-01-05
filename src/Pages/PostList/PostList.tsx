import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import SearchBar from '../../Componets/SearchBar/SearchBar';
import Search from '/Images/search.png';
import WithoutSorttableHeader from '../../Componets/TableComponets/WithoutSorttableHeader';
import SortableHeader from '../../Componets/TableComponets/SortableHeader';
import useApiPost from '../../Hooks/PostData';
import StoryThumbnail from '../../Componets/TableComponets/StoryThumbnail';
import TableUserInfo from '../../Componets/TableComponets/TableUserInfo';
import TableDateTimeDisplay from '../../Componets/TableComponets/TableDateTimeDisplay';
import Eye from '/Images/eye.png';
import DeleteIcon from '/Images/trash.png';
import TableActionButtons from '../../Componets/TableComponets/TableActionButtons';
import PostListPagination from '../../Componets/PaginationComponets/PostListPagination';
import { useAppDispatch, useAppSelector } from '../../Hooks/Hooks';
import { setPaginationPostlList } from '../../Appstore/Slice/PaginationSlice/PostListPaginationSlice';
import notfound from "/Images/notfound.png";
import Apimethod from '../../Hooks/Apimethod';
import toast from 'react-hot-toast';
import { showModal } from '../../Appstore/Slice/ModalSlice';
import SimpletextTableBody from '../../Componets/TableComponets/SimpletextTableBody';


function PostList() {
    const isSidebarOpen = useSelector((state: any) => state.sidebar.isOpen);
    const [category, setCategory] = useState<string>('');
    const [order, setOrder] = useState<string>('');
    const { data, loading, postData } = useApiPost();
    const [postList, setPostList] = useState<any[]>([]);
    const dispatch = useAppDispatch();
    const pagination = useAppSelector((state) => state.PostListPaginationSlice);
    const [search, setSearch] = useState("")





    const { current_page, records_per_page } = pagination;

    const fetchData = () => {
        const formData = new FormData();
        formData.append("social_type", "reel");
        formData.append("page", current_page.toString());
        formData.append("pageSize", records_per_page.toString());
        if (search.trim() !== "") {
            formData.append("user_name", search.trim());
        }



        //     cheack categoty name values

        if (category === "CREATED DATE/TIME") {
            formData.append("sort_by", "createdAt");
        }


        if (category === "TOTAL VIEWS") {
            formData.append("sort_by", "total_views");
        }

        // Convert order value: 0 -> DESC, 1 -> ASC
        if (order !== null && order !== undefined) {
            const sortOrder = order === "0" ? "ASC" : "DESC";
            formData.append("sort_order", sortOrder);
        }
        postData("/admin/get-social-admin", formData);
    };

    useEffect(() => {
        fetchData();
    }, [current_page, records_per_page, search, category, order]);

    // Update postList when data changes
    useEffect(() => {
        if (data?.data?.Records) {
            setPostList(data.data.Records);
        }
    }, [data]);

    // Update pagination state when data changes
    useEffect(() => {
        if (data?.data?.Pagination) {
            dispatch(setPaginationPostlList(data.data.Pagination));
        }
    }, [data, dispatch]);

    // Action handlers
    const handleOpenStory = (user: any) => {
        sessionStorage.setItem("reelId", user.social_id);
        dispatch(showModal("ReelDetail_Modal"));
    };
    const handleUserClick = () => { };


    const handleBlock = () => alert('Block button clicked');



    const [toggleStates, setToggleStates] = useState<{ [key: number]: boolean }>({});


    useEffect(() => {
        if (data?.data?.Records) {
            const toggles = data.data.Records.reduce((acc, gift) => {
                acc[gift.social_id] = gift.status;
                return acc;
            }, {} as { [key: number]: boolean });
            setToggleStates(toggles);
        }
    }, [data]);


    const { makeRequest } = Apimethod()


    const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';

    const handleToggleStatus = async (giftId: number) => {
        if (IS_DEMO) {
            toast.error("This action is disabled in the demo version.");
            return;
        }

        const newStatus = !toggleStates[giftId];
        try {
            await makeRequest(
                "/admin/update-social-admin",
                {
                    social_id: giftId,
                    status: newStatus,
                },
                "application/json",
                "POST"
            );
            setToggleStates((prev) => ({
                ...prev,
                [giftId]: newStatus,
            }));
            toast.success("Reel status updated");
        } catch (err) {
            toast.error("Failed to update status");
        }
    };
const handleDelete = async (socialId: number) => {

    const confirmed = window.confirm(
        "Are you sure you want to delete this reel? This action cannot be undone."
      );
    
      if (!confirmed) return; // ❌ User canceled
    
  setPostList(prev => prev.filter(item => item.social_id !== socialId));
  try {
    const response = await makeRequest(
      "/social/delete-social",          // 👈 backend route
      { social_id: socialId },
      "application/json",
      "POST"
    );

    // generalResponse usually: { success, message, data }
    if (!response?.success) {
        fetchData();
      toast.error(response?.message || "Failed to delete reel");
      return;
    }

    // UI se row hata do
  

    setToggleStates(prev => {
      const updated = { ...prev };
      delete updated[socialId];
      return updated;
    });
    fetchData();
   toast.success(response?.message || "Reel deleted successfully");
  } catch (err) {
    console.error("Delete error:", err);
    toast.error("Failed to delete reel");
  }
};





   console.log("postListpostList@@@@" ,postList)


    return (
        <div className={`bg-primary ${isSidebarOpen ? 'xl:pl-20' : 'xl:pl-72'}`}>
            <SearchBar />

            <div className="px-4 pb-10 xl:px-6">
                {/* Header */}
                <div className="flex justify-between border-t-[#F2F2F2] py-3">
                    <h2 className="text-textcolor font-poppins text-xl font-semibold pt-3 ">
                        Reel List
                    </h2>
                    <div className="relative">
                        <div className="absolute left-2 top-1/2 flex transform -translate-y-1/2 items-center p-2">
                            <img src={Search} alt="Search" className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <div className=' w-full'>
                            <input
                                type="text"
                                placeholder="Search by username..."
                                className="w-[180px] md:w-[250px] pl-10 py-2 text-sm placeholder:text-placeholdercolor
              border border-bordercolor border-opacity-10 rounded-lg bg-[#00000005] 
              focus:outline-none focus:ring-1 focus:ring-gray-600 
              placeholder:dark:text-tableDarkLarge "

                                onChange={(e) => setSearch(e.target.value)}
                                value={search}
                            />
                        </div>
                    </div>
                </div>

                {/* Breadcrumb */}
                <div className="mb-4 flex items-center gap-2">
                    <Link to="/dashboard">
                        <h3 className="text-base font-semibold text-[#3A3A3A]  font-poppins">Dashboard</h3>
                    </Link>
                    <div className="h-1 w-1 rounded-full bg-[#E0E0E0]"></div>
                    <h3 className="text-base text-[#858585] font-poppins">Reel List</h3>
                </div>

                {/* Table */}
                <div className="w-full overflow-x-auto rounded-lg border border-bordercolor mt-6">
                    <div className="min-w-[1200px]">
                        {/* Table Header */}
                        <div className="flex bg-headercolortable px-4 py-3 text-left font-medium border-b border-b-bordercolor sm:pl-8">
                            <div className="w-[8%]"><WithoutSorttableHeader label="S.L" /></div>
                            <div className="w-[13%]"><WithoutSorttableHeader label="REEL VIDEO" /></div>
                            <div className="w-[22%]">
                                <WithoutSorttableHeader label="USERNAME" />
                            </div>
                            <div className="w-[18%]">
                                <SortableHeader
                                    title="CREATED DATE/TIME"
                                    category={category}
                                    order={order}
                                    setCategory={setCategory}
                                    setOrder={setOrder}
                                />
                            </div>
                            <div className="w-[18%]">
                                <SortableHeader
                                    title="TOTAL VIEWS"
                                    category={category}
                                    order={order}
                                    setCategory={setCategory}
                                    setOrder={setOrder}
                                />
                            </div>
                            <div className="w-[12%]">
                                <WithoutSorttableHeader label="LIKES" />
                            </div>
                            <div className="w-[13%]">
                                <WithoutSorttableHeader label="COMMENTS" />
                            </div>
                            <div className="w-[10%]">
                                <SortableHeader
                                    title="STATUS"
                                    category={category}
                                    order={order}
                                    setCategory={setCategory}
                                    setOrder={setOrder}
                                />
                            </div>

                            <div className="w-[10%]"><WithoutSorttableHeader label="ACTIONS" /></div>
                        </div>

                        {/* Table Rows */}
                        {postList.length > 0 ? (
                            postList.map((user: any, index: number) => (
                                <div
                                    key={user.social_id}
                                    className={`flex items-center px-4 py-3 border-b border-b-bordercolor  ${index % 2 === 0 ? 'bg-white dark:bg-primary' : 'bg-[#00162e0a] dark:bg-primary'
                                        }    sm:pl-8`}
                                >
                                    {/* <div className="w-[8%] text-sm font-poppins text-textcolor"> {(current_page - 1) * records_per_page + index + 1}</div> */}

                                    <div className="w-[8%] text-sm font-poppins text-textcolor">{user.social_id}</div>

                                    <div className="w-[13%]">
                                        <StoryThumbnail
                                            url={user.reel_thumbnail}
                                            storyId={user.social_id}
                                            onClick={() => handleOpenStory(user)}
                                        />
                                    </div>

                                    <div className="w-[22%]">
                                       <TableUserInfo
                                            profilePic={user.User.profile_pic}
                                            username={user.User.user_name || 'N/A'}
                                            email={(user.User.login_type === 'email' || user.User.login_type === 'social') ? user.User.email || '' : ''}
                                            mobile={user.User.login_type === 'phone' ? `${user.User.country_code || ''} ${user.User.mobile_num || ''}`.trim() : ''}
                                            onClick={() => handleUserClick(user)}
                                            loginType={user.User.login_type as 'email' | 'phone' | 'social'}
                                        />

                                        
                                    </div>

                                    <div className="w-[18%]">
                                        <TableDateTimeDisplay dateString={user.updatedAt} />
                                    </div>
                                    <div className="w-[18%]   relative">
                                        <div className=' absolute top-[-0.7rem] left-[14%]'>
                                            <SimpletextTableBody title={user.total_views} />
                                        </div>
                                    </div>

                                    <div className="w-[12%] text-sm font-poppins text-[#3A3A3A] dark:text-tableDarkLarge">
                                        {user.total_likes} {user.total_likes > 1 ? 'Likes' : 'Like'}
                                    </div>

                                    <div className="w-[13%] text-sm font-poppins text-[#3A3A3A] dark:text-tableDarkLarge">
                                        {user.total_comments} {user.total_comments > 1 ? 'Comments' : 'Comment'}
                                    </div>

                                    <div className="w-[10%]">


                                        <label className="flex items-center cursor-pointer select-none">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={toggleStates[user.social_id] || false}
                                                    onChange={() => handleToggleStatus(user.social_id)}
                                                    className="sr-only"
                                                />
                                                <div className={`block h-6 w-10 rounded-full border transition duration-300 ${toggleStates[user.social_id] ? " border-toggalbtcolorborder bggradient" : "bg-transparent  border  border-toggalbtcolorborder"}`}></div>
                                                <div className={`absolute top-1 h-4 w-4 rounded-full transition duration-300 ${toggleStates[user.social_id] ? "right-1 bg-white" : "left-1 bggradient"}`}></div>
                                            </div>
                                        </label>
                                    </div>

                                <div className="w-[10%] pl-5">
  <TableActionButtons
    viewButtonIcon={Eye}
    onViewClick={() => handleOpenStory(user)}
    onBlockClick={handleBlock}
    viewButtonColor="#CCE1CD"
    borderColor="#01D312"
    deleteButtonIcon={DeleteIcon}
    onDeleteClick={() => handleDelete(user.social_id)}
  />
</div>

                                </div>
                            ))
                        ) : (
                            !loading && (
                                <div className="p-4 h-[38rem] flex justify-center items-center">
                                    <div className="w-full flex flex-col items-center h-full justify-center">
                                        <img
                                            src={notfound}
                                            alt="Not Found"
                                            className="w-1/2 max-h-[40vh] object-contain"
                                        />
                                        <h2 className="font-poppins text-lg text-textcolor  mt-4">
                                            Don't have any data to show
                                        </h2>
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                    <PostListPagination />

                </div>
            </div>
        </div>
    );
}

export default PostList;
