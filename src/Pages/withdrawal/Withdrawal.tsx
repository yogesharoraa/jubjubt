import React, { useEffect, useState, Fragment } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "../../Componets/SearchBar/SearchBar";
import Search from "/Images/search.png";
import WithoutSorttableHeader from "../../Componets/TableComponets/WithoutSorttableHeader";
import useApiPost from "../../Hooks/PostData";
import { useAppDispatch, useAppSelector } from "../../Hooks/Hooks";
import SimpletextTableBody from "../../Componets/TableComponets/SimpletextTableBody";
import notfound from "/Images/notfound.png";
import Loader from "/Images/Loader.gif";
import WithdrawallPagination from "../../Componets/PaginationComponets/WithdrawallPagination";
import { setPaginationWithdrawallList } from "../../Appstore/Slice/PaginationSlice/WithdrawalPaginationSlice";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Listbox, Transition } from "@headlessui/react";
import toast from "react-hot-toast";
import { reset, setTrue } from "../../Appstore/Slice/toggleSlice";
import TableUserInfo from "../../Componets/TableComponets/TableUserInfo";
const statusOptions = ["Pending", "Completed", "Rejected"];

function Withdrawal() {

        const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';

    const dispatch = useAppDispatch();
    const isSidebarOpen = useSelector((state: any) => state.sidebar.isOpen);
    const { data, loading, postData } = useApiPost();
    const pagination = useAppSelector((state) => state.WithdrawalPaginationSlice);
    const { current_page, records_per_page } = pagination;

    const [statusMap, setStatusMap] = useState<{ [key: string]: string }>({});

    const TotalValues = data?.data?.Records;

    useEffect(() => {
        const formData = new FormData();
        formData.append("transaction_table", "money");
        formData.append("transaction_type", "withdrawal");
        formData.append("page", current_page.toString());
        formData.append("pageSize", records_per_page.toString());
          formData.append("sort_order" , "DESC" )
        postData("/admin/transaction-history", formData);
    }, [current_page, records_per_page]);

    useEffect(() => {
        if (data?.data?.Pagination) {
            dispatch(setPaginationWithdrawallList(data.data.Pagination));
        }
    }, [data, dispatch]);



    const isapicall = useAppSelector((state) => state.toggle.value)


    useEffect(() => {
        if (isapicall) {
            const formData = new FormData();
            formData.append("transaction_table", "money");
            formData.append("transaction_type", "withdrawal");
            postData("/admin/transaction-history", formData);
        }
    }, [isapicall])



    useEffect(() => {
        // Initialize status for each transaction
        if (TotalValues?.length) {
            const initialMap: { [key: string]: string } = {};
            TotalValues.forEach((user: any) => {
                initialMap[user.transaction_id] = user.success || "Pending";
            });
            setStatusMap(initialMap);
        }
    }, [TotalValues]);

    const handleUpdateStatus = async (user: any, newStatus: string) => {

         if (IS_DEMO) {
            toast.error("This action is disabled in the demo version.");
            return;
        }

        dispatch(reset())

        try {
            setStatusMap((prev) => ({
                ...prev,
                [user.transaction_id]: newStatus,
            }));


            const formdata = new FormData();
            formdata.append("transaction_id", String(user.transaction_id));
            formdata.append("user_id", String(user.user_id));
            formdata.append("success", newStatus.toLowerCase());

            const response = await postData("/admin/approve-transaction", formdata);

            if (response?.status) {
                toast.success(`Transaction updated to `);
                dispatch(setTrue())
            }
        } catch (error) {
            toast.error("An error occurred while updating the transaction.");
        }
    };



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
                <div className="flex justify-between border-t-[#F2F2F2] py-3">
                    <h2 className="pt-3 text-xl font-semibold text-textcolor font-poppins">
                        Withdrawal List
                    </h2>
                    {/* <div className="relative">
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 p-2">
                            <img src={Search} alt="Search" className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search Withdrawal..."
                            className="w-[180px] md:w-[250px] pl-10 py-2 text-sm border border-bordercolor border-opacity-10 
                  rounded-lg bg-inputbgcolor placeholder:text-paginationtextcolor text-textcolor 
                  focus:outline-none focus:ring-1 focus:ring-gray-600"
                        />
                    </div> */}
                </div>

                <div className="mb-4 flex items-center gap-2">
                    <Link to="/dashboard">
                        <h3 className="text-base font-semibold text-[#3A3A3A]  font-poppins">
                            Dashboard
                        </h3>
                    </Link>
                    <div className="h-1 w-1 rounded-full bg-[#E0E0E0]"></div>
                    <h3 className="text-base text-[#858585] font-poppins">Withdrawal List</h3>
                </div>

                <div className="mt-6 w-full overflow-x-auto rounded-lg border border-bordercolor">
                    <div className="min-w-[1200px]">
                        <div className="flex bg-headercolortable px-4 py-3 text-left font-medium border-b border-bordercolor sm:pl-8">
                            <div className="w-[10%]"><WithoutSorttableHeader label="S.L" /></div>
                            <div className="w-[20%]"><WithoutSorttableHeader label="USERNAME" /></div>
                            <div className="w-[20%]"><WithoutSorttableHeader label="PRICE / COIN" /></div>
                            <div className="w-[15%]"><WithoutSorttableHeader label="PAYMENT METHOD" /></div>
                            <div className="w-[10%]"><WithoutSorttableHeader label="STATUS" /></div>
                            <div className="w-[15%]"><WithoutSorttableHeader label="AMOUNT" /></div>
                            <div className="w-[10%]"><WithoutSorttableHeader label="TYPES" /></div>
                        </div>

                        {loading ? (
                            <div className="p-4 h-[38rem] flex justify-center items-center">
                                <img src={Loader} alt="loader" height={50} width={50} />
                            </div>
                        ) : TotalValues?.length > 0 ? (
                            TotalValues.map((user: any, index: number) => (
                                <div
                                    key={user.transaction_id}
                                    className={`flex items-center px-4 py-3 border-b border-b-bordercolor 
                    ${index % 2 === 0 ? "bg-white dark:bg-primary" : "bg-[#00162e0a] dark:bg-primary"} sm:pl-8`}
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
                                    <div className="w-[20%]  relative">
                                        <div className=" absolute   top-[-0.5rem] left-[7%]">
                                            <div className="w-full items-center text-sm font-poppins text-textcolor">
                                                {currencyvalues} {user.acutal_money} ({user.coin})
                                            </div>

                                        </div>

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


                                    <div className="   w-[10%]">

                                        <div
                                            className={`w-fit px-2 flex justify-center items-center relative left-[-1rem] text-sm font-poppins text-center rounded-2xl border ${user.success === "completed"
                                                ? "text-green-600 bg-green-100 border-green-300"
                                                : user.success === "rejected"
                                                    ? "text-red-600 bg-red-100 border-red-300"
                                                    : user.success === "pending"
                                                        ? "text-yellow-600 bg-yellow-100 border-yellow-300"
                                                        : "text-gray-600 bg-gray-100 border-gray-300" // fallback for unknown status
                                                }`}
                                        >
                                            {user.success}
                                        </div>

                                    </div>

                                    <div className=" w-[15%]  ">
                                        <div className=" ">
                                            <SimpletextTableBody title={user.acutal_money} />
                                        </div>
                                    </div>

                                    <div className="w-[10%]">
                                        <Listbox
                                            value={statusMap[user.transaction_id] || "Pending"}
                                            onChange={(value) => handleUpdateStatus(user, value)}
                                        >
                                            <div className="relative">
                                                <Listbox.Button className="relative left-[-1.4rem] w-full cursor-pointer rounded-md border border-bordercolor bg-primary py-2 pl-8 pr-10 text-left text-sm text-textcolor shadow-sm hover:border-gray-400 focus:outline-none focus:ring-1 transition">
                                                    <span>{statusMap[user.transaction_id] || "Pending"}</span>
                                                    <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                                                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                                    </span>
                                                </Listbox.Button>
                                                <Transition
                                                    as={Fragment}
                                                    leave="transition ease-in duration-100"
                                                    leaveFrom="opacity-100"
                                                    leaveTo="opacity-0"
                                                >
                                                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-hidden rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none">
                                                        {statusOptions.map((option) => (
                                                            <Listbox.Option
                                                                key={option}
                                                                className={({ active }) =>
                                                                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? "bg-blue-100 text-[#f9a866]" : "text-gray-900"
                                                                    }`
                                                                }
                                                                value={option}
                                                            >
                                                                {({ selected }) => (
                                                                    <>
                                                                        <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                                                                            {option}
                                                                        </span>
                                                                        {selected && (
                                                                            <span className="absolute inset-y-0 left-2 flex items-center text-[#f9a866]">
                                                                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                            </span>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </Listbox.Option>
                                                        ))}
                                                    </Listbox.Options>
                                                </Transition>
                                            </div>
                                        </Listbox>
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
                    <WithdrawallPagination />
                </div>
            </div>
        </div>
    );
}

export default Withdrawal;
