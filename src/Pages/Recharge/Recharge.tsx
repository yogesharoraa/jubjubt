import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "../../Componets/SearchBar/SearchBar";
import WithoutSorttableHeader from "../../Componets/TableComponets/WithoutSorttableHeader";
import useApiPost from "../../Hooks/PostData";
import { useAppDispatch, useAppSelector } from "../../Hooks/Hooks";
import RechargePagination from "../../Componets/PaginationComponets/RechargePagination";
import SimpletextTableBody from "../../Componets/TableComponets/SimpletextTableBody";
import notfound from "/Images/notfound.png"
import Loader from "/Images/Loader.gif"
import { setPaginationRechargelList } from "../../Appstore/Slice/PaginationSlice/RechargeListPaginationSlice";
import TableUserInfo from "../../Componets/TableComponets/TableUserInfo";

import TableDateTimeDisplay from "../../Componets/TableComponets/TableDateTimeDisplay";

function Recharge() {

        const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';

    const dispatch = useAppDispatch();
    const isSidebarOpen = useSelector((state: any) => state.sidebar.isOpen);
    const { data, loading, postData } = useApiPost();
    const pagination = useAppSelector((state) => state.RechargeListPaginationSlice);
    const { current_page, records_per_page } = pagination;

    useEffect(() => {
        const formData = new FormData();
        formData.append("transaction_table", "money");
        formData.append("transaction_type", "recharge")
        formData.append("page", current_page.toString());
        formData.append("pageSize", records_per_page.toString());
        formData.append("sort_order" , "DESC" )
        postData("/admin/transaction-history", formData);
    }, [current_page, records_per_page]);



    const TotalValues = data?.data?.Records;

    // Set Recharge List
    useEffect(() => {

        if (data?.data?.Pagination) {
            dispatch(setPaginationRechargelList(data.data.Pagination));
        }
    }, [data, dispatch]);


    const navigate = useNavigate()


    const handleOpenUserProfile = (user: string) => {
        navigate(`/user-list/user-profile`);
        sessionStorage.setItem("userIdProfileDetail", user?.User?.user_id);
    }



    const currencyvalues = sessionStorage.getItem("currency_symbol")

    return (
        <div className={`bg-primary ${isSidebarOpen ? "xl:pl-20" : "xl:pl-72"}`}>
            <SearchBar />

            <div className="px-4 pb-10 xl:px-6">
                {/* Header */}
                <div className="flex justify-between border-t-[#F2F2F2] py-3">
                    <h2 className="pt-3 text-xl font-semibold text-textcolor font-poppins">
                        Recharge List
                    </h2>

                    {/* <div className="relative">
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 p-2">
                            <img src={Search} alt="Search" className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search Recharge..."
                            className="w-[180px] md:w-[250px] pl-10 py-2 text-sm border border-bordercolor border-opacity-10 
                rounded-lg  bg-inputbgcolor placeholder:text-paginationtextcolor   text-textcolor                placeholder:dark:text-tableDarkLarge focus:outline-none focus:ring-1 focus:ring-gray-600"
                        />
                    </div> */}
                </div>

                {/* Breadcrumb */}
                <div className="mb-4 flex items-center justify-between gap-2">
                    <div className=" flex  items-center  gap-2">
                        <Link to="/dashboard">
                            <h3 className="text-base font-semibold text-[#3A3A3A]  font-poppins">
                                Dashboard
                            </h3>
                        </Link>
                        <div className="h-1 w-1 rounded-full bg-[#E0E0E0]"></div>
                        <h3 className="text-base text-[#858585] font-poppins">Recharge List</h3>
                    </div>


                    {/* <button
                        className="flex gap-1.5 mr-1 py-2 cursor-pointer place-items-center px-4 font-poppins font-medium text-white rounded-md bggradient"
                       onClick={handaladdrecharge}
                  >
                        <img src={Add} className="w-4 h-4" />
                        <p className="md:text-sm text-xs">Add Recharge</p>
                    </button> */}
                </div>

                {/* Table */}
                <div className="mt-6 w-full overflow-x-auto rounded-lg border border-bordercolor">
                    <div className="min-w-[1200px]">
                        {/* Table Header */}
                        <div className="flex  bg-headercolortable px-4 py-3 text-left font-medium border-b border-bordercolor sm:pl-8">
                            <div className="w-[10%]"><WithoutSorttableHeader label="S.L" /></div>
                            <div className="w-[20%]"><WithoutSorttableHeader label="USERNAME" /></div>
                            <div className="w-[15%]"><WithoutSorttableHeader label="CREATED DATE/TIME" /></div>
                            <div className="w-[10%]"><WithoutSorttableHeader label=" PALN NAME " /></div>
                            <div className="w-[10%]"><WithoutSorttableHeader label="COIN" /></div>
                            <div className="w-[10%]"><WithoutSorttableHeader label="AMOUNT" /></div>
                            <div className="w-[15%]"><WithoutSorttableHeader label="PAYMENT METHOD" /></div>
                            <div className="w-[15%]"><WithoutSorttableHeader label="STATUS" /></div>

                        </div>


                        {loading ? (
                            <div className="p-4 h-[38rem] flex justify-center items-center">
                                <div className="text-center">

                                    <img src={Loader} alt="loader" height={50} width={50} />
                                </div>
                            </div>
                        ) : TotalValues?.length > 0 ? (
                            TotalValues?.map((user: any, index: number) => (
                                <div
                                    key={user.transaction_id}
                                    className={`flex items-center px-4 py-3 border-b border-b-bordercolor    ${index % 2 === 0 ? 'bg-white dark:bg-primary' : 'bg-[#00162e0a] dark:bg-primary'
                                        }  sm:pl-8`}
                                >
                                    <div className="w-[10%] text-sm font-poppins text-textcolor">
                                        {(current_page - 1) * records_per_page + index + 1}
                                    </div>

                                    <div className=" w-[20%]">
                                        <TableUserInfo
                                            profilePic={user.User.profile_pic}
                                            username={user.User.user_name || "N/A"}
                                            email={user.User.email || "N/A"}
                                            mobile={user.User.country_code ? `${user.User.country_code} ${user.User.mobile || ""}` : "N/A"}
                                            onClick={() => handleOpenUserProfile(user)
                                            }
                                        />
                                    </div>

                                    <div className=" w-[15%]">
                                        <TableDateTimeDisplay dateString={user.createdAt} />

                                    </div>

                                    <div className=" w-[10%]">
                                        <SimpletextTableBody title={user?.Transaction_plan?.plan_name} />
                                    </div>


                                    <div className="w-[10%]  relative">
                                        <div className=" ">
                                            <SimpletextTableBody title={user.new_available_coin} />

                                        </div>
                                    </div>

                                    <div className="w-[10%] ">
                                        <SimpletextTableBody title={` ${currencyvalues} ${user.acutal_money} `} />
                                    </div>


                                    <div className="w-[15%]  relative ">
                                        <div
                                            className={`w-fit px-2  flex justify-center items-center relative left-[1rem] text-sm font-poppins text-center rounded-2xl  ${user.payment_method === "Google pay"
                                                ? "text-[#00008B] bg-[#BCD2E8] "
                                                : user.payment_method === "paypal"
                                                    ? "bg-[#F9CCB8] text-[#EC6C6A] "
                                                    : user.payment_method === "Stripe"
                                                        ? "text-gray-600 bg-gray-300"
                                                        : "text-gray-600 bg-gray-100"
                                                }`}
                                        >
                                            {user.payment_method}
                                        </div>

                                    </div>


                                    <div className="w-[15%]   ">


                                        <div
                                            className={`w-fit px-2  flex justify-center-safe  items-center  relative  left-[-1rem]  text-sm font-poppins text-center  rounded-2xl  border ${user.success === "success"
                                                ? "text-green-600 bg-green-100 border-green-300"
                                                : "text-red-600 bg-red-100 border-red-300"
                                                }`}
                                        >
                                            {user.success}
                                        </div>



                                    </div>







                                </div>
                            ))
                        ) : (
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
                        )}

                    </div>
                    <RechargePagination />
                </div>
            </div>
        </div>
    );
}

export default Recharge;
