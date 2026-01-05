import React, { useEffect, useState } from 'react'
import Search from '/Images/search.png';
import { useSelector } from 'react-redux';
import SearchBar from '../../Componets/SearchBar/SearchBar';
import { Link, useNavigate } from 'react-router-dom';
import WithoutSorttableHeader from '../../Componets/TableComponets/WithoutSorttableHeader';
import SortableHeader from '../../Componets/TableComponets/SortableHeader';
import { useAppDispatch, useAppSelector } from '../../Hooks/Hooks';
import useApiPost from '../../Hooks/PostData';
import { setPaginationUserReportlList } from '../../Appstore/Slice/PaginationSlice/UserReportListPaginationSlice';
import TableDateTimeDisplay from '../../Componets/TableComponets/TableDateTimeDisplay';
import TableUserInfo from '../../Componets/TableComponets/TableUserInfo';
import TableStatusBadge from '../../Componets/TableComponets/TableStatusBadge';
import TableActionButtons from '../../Componets/TableComponets/TableActionButtons';
import Block from '/Images/report_action.png';
import { showModal } from '../../Appstore/Slice/ModalSlice';
import { reset } from '../../Appstore/Slice/toggleSlice';
import { setUserData } from '../../Appstore/Slice/UniqeUserDetail';
import UserReportListPagination from '../../Componets/PaginationComponets/UserReportListPagination';
import notfound from "/Images/notfound.png"

function User_ReportList() {
    const isSidebarOpen = useSelector((state: any) => state.sidebar.isOpen);
    const [category, setCategory] = useState<string>('');
    const [order, setOrder] = useState<string>('');
    const [search, setSearch] = useState("")


    const { data, loading, postData } = useApiPost();

    const dispatch = useAppDispatch();


    const pagination = useAppSelector((state) => state.UserReportListPaginationSlice);

    const { current_page, records_per_page } = pagination;


    // Fetch post data on load



    useEffect(() => {
        const params = {
            page: current_page,
            pageSize: records_per_page,
            ...(category && { sortBy: "createdAt" }),
            ...(order !== null && order !== undefined && {
                orderBy: order === "0" ?  "ASC" : "DESC", 
            }),
            ...(search && { user_name: search }),

        };
        postData("/admin/reported-user-list", params);
    }, [current_page, records_per_page, category, order, search]);




    useEffect(() => {
        if (data?.data?.Pagination) {
            dispatch(setPaginationUserReportlList(data.data.Pagination));
        }
    }, [data, dispatch]);

    




    const handleBlock = () => {
        dispatch(showModal("Admin_Block_Modal"));
        dispatch(reset())
    };




    const sliceValues = useAppSelector((state) => state.toggle.value)

    useEffect(() => {
        if (sliceValues) {
            postData("/admin/reported-user-list", {});
        }
    }, [sliceValues]);



    const navigate =  useNavigate()

    const handleUserClick = (userId) => {
        navigate(`/user-list/user-profile`);
        sessionStorage.setItem("userIdProfileDetail", userId.reported.user_id);
    };

    const handleUserClick1 = (userId) => {
        navigate(`/user-list/user-profile`);
        sessionStorage.setItem("userIdProfileDetail", userId.reporter?.user_id);
    };

    return (
        <div className={`bg-primary ${isSidebarOpen ? 'xl:pl-20' : 'xl:pl-72'}`}>
            <SearchBar />

            <div className="px-4 pb-10 xl:px-6">
                {/* Header */}
                <div className="flex justify-between border-t-[#F2F2F2] py-3">
                    <h2 className="text-textcolor font-poppins text-xl font-semibold pt-3 ">
                        User Report List
                    </h2>
                    <div className="relative">
                        <div className="absolute left-2 top-1/2 flex transform -translate-y-1/2 items-center p-2">
                            <img src={Search} alt="Search" className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by username..."
                            className="w-[180px] md:w-[250px]  text-textcolor pl-10 py-2 text-sm placeholder:text-paginationtextcolor 
              border border-bordercolor border-opacity-10 rounded-lg bg-[#00000005] 
              focus:outline-none focus:ring-1 focus:ring-gray-600 
              placeholder:dark:text-tableDarkLarge "
                            onChange={(e) => setSearch(e.target.value)}
                            value={search}
                        />
                    </div>
                </div>

                {/* Breadcrumb */}
                <div className="mb-4 flex items-center gap-2">
                    <Link to="/dashboard">
                        <h3 className="text-base font-semibold text-[#3A3A3A]  font-poppins">Dashboard</h3>
                    </Link>
                    <div className="h-1 w-1 rounded-full bg-[#E0E0E0]"></div>
                    <h3 className="text-base text-[#858585] font-poppins">Report List</h3>
                </div>

                {/* Table */}
                <div className="w-full overflow-x-auto rounded-lg border border-bordercolor mt-6">
                    <div className="min-w-[1200px]">
                        {/* Table Header */}
                        <div className="flex bg-headercolortable px-4 py-3 text-left font-medium border-b border-b-bordercolor sm:pl-8">
                            <div className="w-[8%]"><WithoutSorttableHeader label="S.L" /></div>
                            <div className=' w-[20%]'>
                                <SortableHeader
                                    title="CREATED DATE/TIME"
                                    category={category}
                                    order={order}
                                    setCategory={setCategory}
                                    setOrder={setOrder}
                                />
                            </div>

                            <div className=' w-[23%]'>
                                <WithoutSorttableHeader label="REPORTED USER NAME" />
                            </div>
                            <div className="w-[25%]"><WithoutSorttableHeader label="REASON" /></div>

                            <div className=' w-[23%]'>
                                <WithoutSorttableHeader label="REPORTED BY" />
                            </div>

                            <div className="w-[18%]"><WithoutSorttableHeader label="ACCOUNT STATUS" /></div>

                            <div className="w-[15%]"><WithoutSorttableHeader label="ACCOUNT STATUS" /></div>
                        </div>

                        {/* Table Rows */}
                        {data?.data.Records?.length > 0 ? (
                            data?.data?.Records.map((user: any, index: number) => (
                                <div
                                    key={user.report_id}
                                    className={`flex items-center px-4 py-3 border-b border-b-bordercolor      ${index % 2 === 0 ? 'bg-white dark:bg-primary' : 'bg-[#00162e0a] dark:bg-primary'
                                        } sm:pl-8`}
                                >
                                    <div className="w-[8%] text-sm font-poppins text-textcolor ">{index + 1}</div>

                                    <div className=' w-[20%]'>
                                        <TableDateTimeDisplay dateString={user.createdAt} />
                                    </div>

                                    <div className=' w-[23%]'>
                                        <TableUserInfo
                                            profilePic={user.reported.profile_pic}
                                            username={user.reported.user_name || 'N/A'}
                                            email={user.reported.email || 'N/A'}
                                            mobile={user.country_code ? `${user.country_code} ${user.mobile || ''}` : 'N/A'}
                                            onClick={() => handleUserClick(user)}
                                        />
                                    </div>
                                    <div className="w-[25%] text-[#939393] font-poppins text-sm">{user.Report_type.report_text}</div>


                                    <div className=' w-[23%]'>
                                        <TableUserInfo
                                            profilePic={user.reporter.profile_pic}
                                            username={user.reporter.user_name || 'N/A'}
                                            email={user.reporter.email || 'N/A'}
                                            mobile={user.country_code ? `${user.country_code} ${user.mobile || ''}` : 'N/A'}
                                            onClick={() => handleUserClick1(user)}
                                        />
                                    </div>

                                    <div className=' w-[18%]'>
                                        <TableStatusBadge
                                            key={user.reported.user_id}
                                            status={user.reported.blocked_by_admin ? "0" : "1"}
                                            activeText="Active"
                                            deactiveText="Deactive"
                                            activeColor="#64A555"
                                            activeBg="#D1EADB"
                                            deactiveColor="#EF4444"
                                            deactiveBg="#FDE4EA"
                                        />{" "}
                                    </div>


                                    <div className=' w-[15%]   flex  justify-center  items-center  pl-8'>
                                        <TableActionButtons
                                            blockButtonIcon={Block}
                                            onBlockClick={() => {
                                                dispatch(setUserData({
                                                    User_id: user.report_to,
                                                    blocked_by_admin: user.reported.blocked_by_admin
                                                }));
                                                handleBlock(user.user_id);
                                            }}
                                            blockButtonColor="#FDE4EA"
                                            borderColor="#01D312"
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
                                        <h2 className="font-poppins text-lg text-textcolor mt-4">
                                            Don't have any data to show
                                        </h2>
                                    </div>
                                </div>
                            )
                        )}
                    </div>




                    <UserReportListPagination />

                </div>


            </div>

        </div>
    )
}

export default User_ReportList
