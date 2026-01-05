import { useSelector } from "react-redux";
import Search from "/Images/search.png";
import { Link, useNavigate } from "react-router-dom";
import SortableHeader from "../../Componets/TableComponets/SortableHeader";
import { useEffect, useState } from "react";
import WithoutSorttableHeader from "../../Componets/TableComponets/WithoutSorttableHeader";
import useApiPost from "../../Hooks/PostData";
import TableUserInfo from "../../Componets/TableComponets/TableUserInfo";
import TableDateTimeDisplay from "../../Componets/TableComponets/TableDateTimeDisplay";
import TableLoginTypeBadge from "../../Componets/TableComponets/TableLoginTypeBadge";
import TableReportCount from "../../Componets/TableComponets/TableReportCount";
import TableStatusBadge from "../../Componets/TableComponets/TableStatusBadge";
import TableActionButtons from "../../Componets/TableComponets/TableActionButtons";
import Eye from "/Images/eye.png";
import Block from "/Images/report_action.png";
import Delete from "/Images/deleteicon.png"
import { useAppDispatch, useAppSelector } from "../../Hooks/Hooks";
import { showModal } from "../../Appstore/Slice/ModalSlice";
import Pagination from "./Pagination";
import { setPagination } from "../../Appstore/Slice/paginationSlice";
import { setUserData } from "../../Appstore/Slice/UniqeUserDetail";
import SearchBar from "../../Componets/SearchBar/SearchBar";
import { reset } from "../../Appstore/Slice/toggleSlice";
import notfound from "/Images/notfound.png"
import toast from "react-hot-toast";
import Add from "../../../public/Images/add.png"
import { resetall } from "../../Appstore/Slice/addVendorSlice";

const UserList = () => {
    interface RootState {
        sidebar: {
            isOpen: boolean,
        };
    }


    const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';


    const isSidebarOpen = useSelector((state: RootState) => state.sidebar.isOpen);

    const [category, setCategory] = useState<string>("");
    const [order, setOrder] = useState<string>("");
    const { data, loading, error, postData } = useApiPost();
    const dispatch = useAppDispatch();
    const [search, setSearch] = useState("")


    const pagination = useAppSelector((state) => state.pagination);
    const { current_page, records_per_page } = pagination;

    const user_idwithbloackstatus = useAppSelector((state) => state.UniqeUserDetail.User_id)


    const sliceValues = useAppSelector((state) => state.toggle.value)


    // 1st Effect: Fetch users when pagination changes
    useEffect(() => {
        const formData = new FormData();
        formData.append("page", current_page.toString());
        formData.append("pageSize", records_per_page.toString());

        if (category === "USERNAME") {
            formData.append("sort_by", "user_name");
        } else if (category === "CREATED DATE/TIME") {
            formData.append("sort_by", "createdAt");
        }
        else if (category === "LOGIN TYPE") {
            formData.append("sort_by", "login_type");
        }

        // Convert order value: 0 -> DESC, 1 -> ASC
        if (order !== null && order !== undefined) {
            const sortOrder = order === "0" ? "ASC" : "DESC";
            formData.append("sort_order", sortOrder);
        }


        if (search.trim() !== "") {
            formData.append("user_name", search)
        }

        postData("/admin/get-user", formData);
    }, [current_page, records_per_page, category, order, search]);

    useEffect(() => {
        if (data?.data?.Pagination) {
            dispatch(setPagination(data.data.Pagination));
        }
    }, [data, dispatch]);






    useEffect(() => {
        if (sliceValues) {
            postData("/admin/get-user", {});
        }
    }, [current_page, records_per_page, category, order, sliceValues]);


    // Example handler functions
    const handleView = () => {
        alert("View button clicked");
    };

    const handleBlock = () => {

        dispatch(showModal("Admin_Block_Modal"));
        dispatch(reset())
    };


// Import toast and useApiPost if not already
// import toast from "react-hot-toast";
const { postData: postDelete } = useApiPost();

const handleDelete = async (userId: string) => {
  if (!userId) return;

  const confirmDelete = window.confirm("Are you sure you want to delete this user?");
  if (!confirmDelete) return;

  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("delete", '1');

  try {
    const res = await postDelete("/admin/delete-user", formData);

    if (res?.status || res?.success) {
      toast.success("User deleted successfully ✅");

      // Re-fetch user list after delete
      const reloadFD = new FormData();
      reloadFD.append("page", current_page.toString());
      reloadFD.append("pageSize", records_per_page.toString());
      if (search.trim() !== "") reloadFD.append("user_name", search);

      postData("/admin/get-user", reloadFD);
    } else {
      toast.error(res?.message || "Failed to delete user ❌");
    }

  } catch (error) {
    toast.error("Error deleting user");
  }
};





    const navigate = useNavigate();


    const handleOpenUserProfile = (userId) => {
        const currentPath = location.pathname.split("/")[1]; // gets 'reel-list', 'user-list', etc.
        navigate(`/${currentPath}/user-profile`);
        sessionStorage.setItem("userIdProfileDetail", userId);
    };



    return (
        <div className={`bg-primary ${isSidebarOpen ? "xl:pl-20" : "xl:pl-72"}`}>
            <SearchBar />

            <div className="px-4 pb-10 xl:px-6 ">
                <div className="flex justify-between border-t-[#F2F2F2] py-3">
                    <h2 className="text-textcolor font-poppins text-xl font-semibold pt-3">User List</h2>
                    <div className="relative">
                        <div className="absolute flex items-center p-2 transform -translate-y-1/2 left-2 top-1/2">
                            <img src={Search} alt="Search" className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <input
                            type="text"
                            className=" xl:placeholder:text-sm bg-inputbgcolor border border-bordercolor  text-textcolor placeholder:dark:text-tableDarkLarge border-opacity-10 rounded-lg md:w-[250px] w-[180px] py-2 pl-10 placeholder:text-sm placeholder:text-placeholdercolor     focus:outline-none focus:ring-1 focus:ring-gray-600"
                            placeholder="Search by username..."
                            onChange={(e) => setSearch(e.target.value)}
                            value={search}
                        />
                    </div>
                </div>

                {/* Navigation Path */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link to="/dashboard">
                            <h3 className="text-[#3A3A3A] font-poppins text-base  font-semibold">Dashboard</h3>
                        </Link>
                        <div className="rounded-full w-1 h-1 bg-[#E0E0E0]"></div>
                        <h3 className="text-[#858585] font-poppins text-base">User List</h3>
                    </div>

                    <button
                        className="flex gap-1.5 mr-1 py-2 cursor-pointer place-items-center px-4 font-poppins font-medium text-white rounded-md bggradient"

                        onClick={() => {
                            dispatch(resetall())
                            dispatch(reset())
                            dispatch(showModal("Add_user"))
                        }}
                    >
                        <img src={Add} className="w-4 h-4" />
                        <p className="md:text-sm text-xs">Add User</p>
                    </button>
                </div>

                <div className="border border-bordercolor rounded-lg mt-8 mx-4 sm:mx-0 overflow-x-auto w-full">
                    <div className="xl:overflow-x-auto lg:overflow-x-auto 2xl:overflow-hidden min-w-[1200px]">
                        <div className="min-w-max">
                            {/*  table header */}
                            <div className="flex px-4 py-3 pl-4 text-left border-b   bg-headercolortable border-b-bordercolor  sm:pl-8">
                                <div className=" w-[15%] ">
                                    <WithoutSorttableHeader label="S.L" />
                                </div>
                                <div className=" w-[80%] ">
                                    <SortableHeader title="USERNAME" category={category} order={order} setCategory={setCategory} setOrder={setOrder} />
                                </div>

                                <div className=" w-[55%]">
                                    <SortableHeader title="CREATED DATE/TIME" category={category} order={order} setCategory={setCategory} setOrder={setOrder} />
                                </div>

                                <div className=" w-[50%]">
                                    <SortableHeader title="LOGIN TYPE" category={category} order={order} setCategory={setCategory} setOrder={setOrder} />
                                </div>

                                <div className=" w-[40%] ">
                                    <WithoutSorttableHeader label="PLATFORM TYPE" />
                                </div>

                                <div className=" w-[45%]">
                                    <WithoutSorttableHeader label="ACCOUNT STATUS" />
                                </div>

                                <div className=" w-[45%]">
                                    <WithoutSorttableHeader label="TOTAL REPORTS" />
                                </div>

                                <div className=" w-[30%] ">
                                    <WithoutSorttableHeader label="ACTIONS" />
                                </div>
                            </div>

                            {/* Listing */}
                            {data?.data?.Records?.length > 0
                                ? data.data.Records.map((user: any, index: number) => (
                                    <div key={user.user_id} className={`   ${index % 2 === 0 ? 'bg-white dark:bg-primary' : 'bg-[#00162e0a] dark:bg-primary'
                                        } flex items-center px-4 py-3 sm:pl-8 pl-4 border-b border-b-bordercolor last:border-0`}>
                                        {/* Serial Number */}
                                        <div className="w-[15%]  text-textcolor font-poppins text-sm"> {(current_page - 1) * records_per_page + index + 1}</div>

                                        {/* User Info */}
                                        <div className="w-[80%]">
                                            <TableUserInfo
                                                profilePic={user.profile_pic}
                                                username={user.user_name || "N/A"}
                                                email={user.email || ""}
                                                mobile={`${user.country_code || ""} ${user.mobile_num || ""}`.trim()}
                                                loginType={user.login_type as 'email' | 'phone' | 'social'}
                                                onClick={() => handleOpenUserProfile(user.user_id)}
                                            />



                                        </div>

                                        <div className=" w-[55%]">
                                            <TableDateTimeDisplay dateString={user.createdAt} />
                                        </div>

                                        {/*  login type */}
                                        <div className=" w-[50%]">
                                            <TableLoginTypeBadge loginType={user.login_type} />
                                        </div>

                                        <div className="  w-[40%]">
                                            <h2 className="font-poppins  text-textcolor text-sm">Mobile App</h2>
                                        </div>

                                        <div className=" w-[45%]">
                                            <TableStatusBadge
                                                key={user.user_id}
                                                status={user.blocked_by_admin ? "0" : "1"}
                                                activeText="Active"
                                                deactiveText="Deactive"
                                                activeColor="#64A555"
                                                activeBg="#D1EADB"
                                                deactiveColor="#EF4444"
                                                deactiveBg="#FDE4EA"
                                            />{" "}
                                        </div>

                                        <div className=" w-[45%] relative">
                                            <div className=" absolute top-[-1rem] left-[10%]">
                                                <TableReportCount count={user.reportCounts} />

                                            </div>
                                        </div>

                                        <div className="  w-[30%]">
                                            <TableActionButtons
                                                viewButtonIcon={Eye}
                                                blockButtonIcon={Block}
                                                deleteButtonIcon={Delete}
                                                onViewClick={() => {
                                                    handleOpenUserProfile(user.user_id)
                                                }}
                                                onBlockClick={() => {
                                                    dispatch(setUserData({
                                                        User_id: user.user_id,
                                                        blocked_by_admin: user.blocked_by_admin
                                                    }));
                                                    handleBlock(user.user_id);
                                                }}
                                                onDeleteClick={() => handleDelete(user.user_id)}
                                                viewButtonColor="#CCE1CD"
                                                blockButtonColor="#FDE4EA"
                                                borderColor="#01D312"
                                            />
                                        </div>
                                    </div>
                                ))
                                : !loading && <div className="p-4 h-[38rem] flex justify-center items-center">
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
                                </div>}
                        </div>
                    </div>
                    <Pagination />
                </div>


            </div>
        </div>
    );
};

export default UserList;
