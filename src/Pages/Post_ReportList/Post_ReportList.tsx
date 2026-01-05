import React, { useEffect, useState } from "react";
import Search from "/Images/search.png";
import { useSelector } from "react-redux";
import SearchBar from "../../Componets/SearchBar/SearchBar";
import { Link } from "react-router-dom";
import WithoutSorttableHeader from "../../Componets/TableComponets/WithoutSorttableHeader";
import SortableHeader from "../../Componets/TableComponets/SortableHeader";
import { useAppDispatch, useAppSelector } from "../../Hooks/Hooks";
import useApiPost from "../../Hooks/PostData";
import { setPaginationUserReportlList } from "../../Appstore/Slice/PaginationSlice/UserReportListPaginationSlice";
import TableDateTimeDisplay from "../../Componets/TableComponets/TableDateTimeDisplay";
import TableUserInfo from "../../Componets/TableComponets/TableUserInfo";
import TableStatusBadge from "../../Componets/TableComponets/TableStatusBadge";
import TableActionButtons from "../../Componets/TableComponets/TableActionButtons";
import Eye from "/Images/eye.png";
import Block from "/Images/report_action.png";
function Post_ReportList() {
    const isSidebarOpen = useSelector((state: any) => state.sidebar.isOpen);
    const [category, setCategory] = useState<string>('');
    const [order, setOrder] = useState<string>('');
    return (
        <div className={`bg-primary ${isSidebarOpen ? "xl:pl-20" : "xl:pl-72"}`}>
            <SearchBar />

            <div className="px-4 pb-10 xl:px-6">
                {/* Header */}
                <div className="flex justify-between border-t-[#F2F2F2] py-3">
                    <h2 className="text-textcolor font-poppins text-xl font-semibold pt-3 ">Post 12 Report List</h2>
                    <div className="relative">
                        <div className="absolute left-2 top-1/2 flex transform -translate-y-1/2 items-center p-2">
                            <img src={Search} alt="Search" className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by username..."
                            className="w-[180px] md:w-[250px] pl-10 py-2 text-sm placeholder:text-textcolor0004F] 
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
                    <h3 className="text-base text-[#858585] font-poppins">Post Report List</h3>
                </div>

                <div className="w-full overflow-x-auto rounded-lg border border-[#E3E3E3] mt-6">
                    <div className="min-w-[1200px]">
                        <div className="flex bg-[#D5D5D5] px-4 py-3 text-left font-medium border-b border-b-[#E3E3E3] sm:pl-8">
                            <div className="w-[10%]">
                                <WithoutSorttableHeader label="S.L" />
                            </div>

                            <div className=" w-[20%]">
                                <SortableHeader title="CREATED DATE/TIME" category={category} order={order} setCategory={setCategory} setOrder={setOrder} />
                            </div>

                            <div className="w-[15%]">
                                <WithoutSorttableHeader label="POST IMAGE" />
                            </div>

                            <div className=" w-[25%]">
                                <SortableHeader title="REPORTED USER NAME" category={category} order={order} setCategory={setCategory} setOrder={setOrder} />
                            </div>
                            <div className="w-[25%]">
                                <WithoutSorttableHeader label="REASON" />
                            </div>

                            <div className=" w-[25%]">
                                <SortableHeader title="REPORTED BY" category={category} order={order} setCategory={setCategory} setOrder={setOrder} />
                            </div>

                            <div className="w-[18%]">
                                <WithoutSorttableHeader label="STATUS" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Post_ReportList;
