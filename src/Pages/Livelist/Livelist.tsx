import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "../../Componets/SearchBar/SearchBar";
import Search from "/Images/search.png";
import WithoutSorttableHeader from "../../Componets/TableComponets/WithoutSorttableHeader";
import SortableHeader from "../../Componets/TableComponets/SortableHeader";
import useApiPost from "../../Hooks/PostData";
import { useAppDispatch, useAppSelector } from "../../Hooks/Hooks";
import TableUserInfo from "../../Componets/TableComponets/TableUserInfo";
import SimpletextTableBody from "../../Componets/TableComponets/SimpletextTableBody";
import LIveListePagination from "../../Componets/PaginationComponets/LIveListePagination";
import { setPaginationLiveList } from "../../Appstore/Slice/PaginationSlice/LiveListPaginationSlice";
import TableDateTimeDisplay from "../../Componets/TableComponets/TableDateTimeDisplay";

function Livelist() {
    const dispatch = useAppDispatch();
    const isSidebarOpen = useSelector((state: any) => state.sidebar.isOpen);
    const { data, loading, postData } = useApiPost();

    const [category, setCategory] = useState<string>("");
    const [order, setOrder] = useState<string>("");
    const [liveList, setLiveList] = useState<any[]>([]);




    console.log("liveListliveListUser", liveList)

    const pagination = useAppSelector((state) => state.LiveListPaginationSlice);
    const { current_page, records_per_page } = pagination;

    // Fetch Recharge Data
    useEffect(() => {
        const formData = new FormData();
        formData.append("transaction_type", "withdrawal");
        formData.append("page", current_page.toString());
        formData.append("pageSize", records_per_page.toString());
        formData.append("sort_order", "ASC")
        formData.append("sorted_by", "live_status")
        postData("/admin/live-list", formData);
    }, [current_page, records_per_page]);

    // Set Recharge List
    useEffect(() => {
        if (data?.data?.Records) {
            setLiveList(data.data.Records);
        }
        if (data?.data?.Pagination) {
            dispatch(setPaginationLiveList(data.data.Pagination));
        }
    }, [data, dispatch]);


    const navigate = useNavigate()

    const handleUserClick = (live: string) => {
        console.log(" my servifsdfksdfsdfksdjfsdfsfsdfsfd", live?.User?.user_id)
        navigate(`/user-list/user-profile`);
        sessionStorage.setItem("userIdProfileDetail", live?.User?.user_id);
    };

    return (
        <div className={`bg-primary ${isSidebarOpen ? "xl:pl-20" : "xl:pl-72"}`}>
            <SearchBar />

            <div className="px-4 pb-10 xl:px-6">
                {/* Header */}
                <div className="flex justify-between border-t-[#F2F2F2] py-3">
                    <h2 className="pt-3 text-xl font-semibold text-textcolor  font-poppins">
                        Live List
                    </h2>

                    <div className="relative">
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 p-2">
                            <img src={Search} alt="Search" className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search Live..."
                            className="w-[180px] md:w-[250px] pl-10 py-2 text-sm border border-bordercolor border-opacity-10 
                rounded-lg  bg-inputbgcolor placeholder:text-paginationtextcolor text-textcolor 
                placeholder:dark:text-tableDarkLarge focus:outline-none focus:ring-1 focus:ring-gray-600"
                        />
                    </div>
                </div>

                {/* Breadcrumb */}
                <div className="mb-4 flex items-center gap-2">
                    <Link to="/dashboard">
                        <h3 className="text-base font-semibold text-[#3A3A3A]  font-poppins">
                            Dashboard
                        </h3>
                    </Link>
                    <div className="h-1 w-1 rounded-full bg-[#E0E0E0]"></div>
                    <h3 className="text-base text-[#858585] font-poppins">Live List</h3>
                </div>

                {/* Table */}
                <div className="mt-6 w-full overflow-x-auto rounded-lg border border-bordercolor">
                    <div className="min-w-[1200px]">
                        {/* Table Header */}
                        <div className="flex bg-headercolortable px-4 py-3 text-left font-medium border-b border-bordercolor sm:pl-8">
                            <div className="w-[10%]"><WithoutSorttableHeader label="S.L" /></div>
                            <div className="w-[21%]">

                                <WithoutSorttableHeader label="USERNAME" />
                            </div>
                            <div className="w-[21%]">

                                <WithoutSorttableHeader label="VIEWS" />
                            </div>
                            <div className="w-[21%]">
                                <WithoutSorttableHeader label="COMMENTS" />

                            </div>


                            <div className=" w-[20%]">
                                <WithoutSorttableHeader label="CREATED DATE/TIME" />
                            </div>
                            <div className="w-[6%]"><WithoutSorttableHeader label="STATUS" /></div>


                        </div>

                        {/* Table Rows */}
                        {liveList.length > 0 ? (
                            liveList.map((live: any, index: number) => {
                                const mainHost = live.Live_hosts?.find((host: any) => host.is_main_host);

                                if (!mainHost || !mainHost.User) return null; // Skip rows without a main host or user

                                return (
                                    <div
                                        key={live.live_id}
                                        className={`flex items-center px-4 py-3 border-b border-bordercolor
          ${index % 2 === 0 ? 'bg-white dark:bg-primary' : 'bg-[#00162e0a] dark:bg-primary'} sm:pl-8`}
                                    >
                                        <div className="w-[10%] text-sm font-poppins text-textcolor">
                                            {(current_page - 1) * records_per_page + index + 1}
                                        </div>

                                        <div className="w-[21%]">
                                            {/* <TableUserInfo
                                                profilePic={mainHost.User.profile_pic}
                                                username={mainHost.User.user_name || "N/A"}
                                                email={mainHost.User.email || "N/A"}
                                                mobile={
                                                    mainHost.User.country_code
                                                        ? `${mainHost.User.country_code} ${mainHost.User.mobile || ""}`
                                                        : "N/A"
                                                }
                                                onClick={() => { }}
                                            /> */}

                                            <TableUserInfo
                                                profilePic={mainHost.User.profile_pic}
                                                username={mainHost.User.user_name || 'N/A'}
                                                email={(mainHost.User.login_type === 'email' || mainHost.User.login_type === 'social') ? mainHost.User.email || '' : ''}
                                                mobile={mainHost.User.login_type === 'phone' ? `${mainHost.User.country_code || ''} ${mainHost.User.mobile_num || ''}`.trim() : ''}
                                                onClick={() => { }}
                                                loginType={mainHost.User.login_type as 'email' | 'phone' | 'social'}
                                            />
                                        </div>

                                        <div className="w-[21%] relative">
                                            <div className="absolute top-[-0.8rem] left-[6%]">
                                                <SimpletextTableBody title={live.likes} />
                                            </div>
                                        </div>

                                        <div className="w-[21%] relative">
                                            <div className="absolute left-[10%] top-[-0.6rem] ">
                                                <SimpletextTableBody title={live.comments} />
                                            </div>
                                        </div>

                                        <div className=" w-[20%]">
                                            <TableDateTimeDisplay dateString={live.createdAt} />
                                        </div>

                                        <div className="w-[6%] ml-2">
                                            <h1 className={`text-sm font-poppins ${live.live_status === "live" ? "text-green-500" : "text-red-500"}`}>
                                                {live.live_status}
                                            </h1>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            !loading && (
                                <div className="p-4 text-center text-sm text-gray-500">
                                    No records found.
                                </div>
                            )
                        )}



                    </div>
                    <LIveListePagination />
                </div>
            </div>
        </div>
    );
}

export default Livelist;
