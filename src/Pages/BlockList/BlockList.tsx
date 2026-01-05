import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '../../Componets/SearchBar/SearchBar';
import Search from '/Images/search.png';
import WithoutSorttableHeader from '../../Componets/TableComponets/WithoutSorttableHeader';
import SortableHeader from '../../Componets/TableComponets/SortableHeader';
import useApiPost from '../../Hooks/PostData';
import { useAppDispatch, useAppSelector } from '../../Hooks/Hooks';
import notfound from '/Images/notfound.png';
import TableDateTimeDisplay from '../../Componets/TableComponets/TableDateTimeDisplay';
import TableUserInfo from '../../Componets/TableComponets/TableUserInfo';
import BloclListPagination from '../../Componets/PaginationComponets/BloclListPagination';
import { setPaginationBlocklList } from '../../Appstore/Slice/PaginationSlice/BlockListPaginationSlice';


function BlockList() {
    const isSidebarOpen = useSelector((state: any) => state.sidebar.isOpen);
    const [search, setSearch] = useState("")
    const [category, setCategory] = useState<string>('');
    const [order, setOrder] = useState<string>('');
    const { data, loading, postData } = useApiPost();

    const dispatch = useAppDispatch();


    const pagination = useAppSelector((state) => state.BlockListPaginationSlice);
    const { current_page, records_per_page } = pagination;

    const fetchData = () => {
        const formData = new FormData();
        formData.append("social_type", "reel");
        formData.append("page", current_page.toString());
        formData.append("pageSize", records_per_page.toString());
        if (search.trim() !== "") {
            formData.append("user_name", search.trim());
        }

        if (category === "DATE/TIME") {
            formData.append("sort_by", "createdAt");
        }
        if (order !== null && order !== undefined) {
            const sortOrder = order === "0" ?  "ASC" : "DESC";
            formData.append("sort_order", sortOrder);
        }

        postData("/admin/block-list", formData);
    };

    useEffect(() => {
        fetchData();
    }, [current_page, records_per_page, search, category, order]);


    // Update pagination state when data changes
    useEffect(() => {
        if (data?.data?.Pagination) {
            dispatch(setPaginationBlocklList(data.data.Pagination));
        }
    }, [data, dispatch]);

    const navigate = useNavigate()



    const handleUserClick = (userId) => {
        sessionStorage.setItem("userIdProfileDetail", userId);
        const currentPath = location.pathname.split("/")[1]; // gets 'reel-list', 'user-list', etc.
        navigate(`/${currentPath}/user-profile`);
    };




    return (
        <div className={`bg-primary ${isSidebarOpen ? 'xl:pl-20' : 'xl:pl-72'}`}>
            <SearchBar />

            <div className="px-4 pb-10 xl:px-6">
                {/* Header */}
                <div className="flex justify-between border-t-[#F2F2F2] py-3">
                    <h2 className="text-textcolor font-poppins text-xl font-semibold pt-3 ">
                        Block List
                    </h2>
                    <div className="relative">
                        <div className="absolute left-2 top-1/2 flex transform -translate-y-1/2 items-center p-2">
                            <img src={Search} alt="Search" className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <div className=' w-full'>
                            <input
                                type="text"
                                placeholder="Search by username..."
                                className="w-[180px] md:w-[250px] pl-10 py-2 text-sm placeholder:text-placeholdercolor  text-textcolor
              border border-bordercolor border-opacity-10 rounded-lg bg-inputbgcolor
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
                    <h3 className="text-base text-[#858585] font-poppins">Block List</h3>
                </div>


                <div className="w-full overflow-x-auto rounded-lg border border-bordercolor mt-6">
                    <div className="min-w-[1200px]">
                        {/* Table Header */}
                        <div className="flex bg-headercolortable px-4 py-3 text-left font-medium border-b border-b-bordercolor sm:pl-8">
                            <div className="w-[20%]"><WithoutSorttableHeader label="S.L" /></div>
                            <div className=' w-[30%]'>
                                <SortableHeader
                                    title="DATE/TIME"
                                    category={category}
                                    order={order}
                                    setCategory={setCategory}
                                    setOrder={setOrder}
                                />
                            </div>
                            <div className=' w-[30%]'>


                                <WithoutSorttableHeader label="BLOCKED TO" />
                            </div>
                            <div className=' w-[30%]'>
                                <WithoutSorttableHeader label="BLOCKED BY" />
                            </div>

                        </div>


                        {/* Table Rows */}
                        {data?.data?.Records.length > 0 ? (
                            data?.data?.Records.map((user: any, index: number) => (
                                <div
                                    key={user.social_id}
                                    className={`flex items-center px-4 py-3 border-b border-b-bordercolor     ${index % 2 === 0 ? 'bg-white dark:bg-primary' : 'bg-[#00162e0a] dark:bg-primary'
                                        }  sm:pl-8`}
                                >
                                    <div className="w-[20%] text-sm font-poppins text-textcolor"> {(current_page - 1) * records_per_page + index + 1}</div>

                                    <div className=' w-[30%]'>
                                        <TableDateTimeDisplay dateString={user.updatedAt} />
                                    </div>

                                    <div className=' w-[30%]'>
                                        <TableUserInfo
                                            profilePic={user.blocked.profile_pic}
                                            username={user.blocked.user_name || 'N/A'}
                                            email={user.blocked.email || 'N/A'}
                                            mobile={user.country_code ? `${user.country_code} ${user.mobile || ''}` : 'N/A'}
                                            onClick={() => handleUserClick(user.blocked.user_id)}
                                        />
                                    </div>
                                    <div className=' w-[30%]'>
                                        <TableUserInfo
                                            profilePic={user.blocker.profile_pic}
                                            username={user.blocker.user_name || 'N/A'}
                                            email={user.blocker.email || 'N/A'}
                                            mobile={user.country_code ? `${user.country_code} ${user.mobile || ''}` : 'N/A'}
                                            onClick={() => handleUserClick(user.blocker.user_id)}
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
                    <BloclListPagination />
                </div>

            </div>
        </div>
    )
}

export default BlockList
